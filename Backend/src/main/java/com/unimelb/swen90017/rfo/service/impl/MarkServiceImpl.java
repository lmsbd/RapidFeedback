package com.unimelb.swen90017.rfo.service.impl;

import com.unimelb.swen90017.rfo.dao.GroupMarkRecordDao;
import com.unimelb.swen90017.rfo.dao.MarkDetailDao;
import com.unimelb.swen90017.rfo.dao.MarkRecordDao;
import com.unimelb.swen90017.rfo.pojo.dto.GroupStudentMarkDTO;
import com.unimelb.swen90017.rfo.pojo.dto.MarkDetailDTO;
import com.unimelb.swen90017.rfo.pojo.po.GroupMarkRecordPO;
import com.unimelb.swen90017.rfo.pojo.po.MarkDetailPO;
import com.unimelb.swen90017.rfo.pojo.po.MarkRecordPO;
import com.unimelb.swen90017.rfo.pojo.vo.GroupMarkResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveGroupMarkRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveMarkRequestVO;
import com.unimelb.swen90017.rfo.security.CustomUserDetails;
import com.unimelb.swen90017.rfo.service.MarkService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode; // still used by calcTotalScore
import java.time.LocalDateTime;
import java.util.List;


/**
 * Mark service implementation
 */
@Slf4j
@Service
public class MarkServiceImpl implements MarkService {

    @Autowired
    private MarkRecordDao markRecordDao;

    @Autowired
    private MarkDetailDao markDetailDao;

    @Autowired
    private GroupMarkRecordDao groupMarkRecordDao;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveMark(SaveMarkRequestVO request) {
        Long markerId = getCurrentMarkerId();

        saveStudentMark(request.getProjectId(), request.getStudentId(), markerId, request.getDetails());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveGroupMark(SaveGroupMarkRequestVO request) {
        Long markerId = getCurrentMarkerId();

        // Validate: every studentId in the request must belong to this group
        List<Long> groupMemberIds = groupMarkRecordDao.getStudentIdsByGroupId(request.getGroupId());
        for (GroupStudentMarkDTO student : request.getStudents()) {
            if (!groupMemberIds.contains(student.getStudentId())) {
                throw new IllegalArgumentException(
                        "Student id=" + student.getStudentId()
                        + " is not a member of group id=" + request.getGroupId());
            }
        }

        // Save each student's group_score into mark_record
        for (GroupStudentMarkDTO student : request.getStudents()) {
            saveStudentGroupScore(request.getProjectId(), student.getStudentId(), markerId, student.getGroupScore());
        }

        // Save group comment into group_mark_record (per-marker row)
        saveGroupComment(request.getProjectId(), request.getGroupId(), markerId, request.getComment());

        log.info("saveGroupMark complete: projectId={}, groupId={}, studentCount={}",
                request.getProjectId(), request.getGroupId(), request.getStudents().size());
    }

    // -------------------------------------------------------------------------
    @Override
    public GroupMarkResponseVO getGroupMark(Long projectId, Long groupId) {
        Long markerId = getCurrentMarkerId();
        GroupMarkRecordPO groupMarkRecord = groupMarkRecordDao.getByProjectGroupAndMarker(projectId, groupId, markerId);
        String comment = groupMarkRecord != null ? groupMarkRecord.getComment() : null;

        List<GroupStudentMarkDTO> students = groupMarkRecordDao.getStudentGroupScores(projectId, groupId, markerId);

        return GroupMarkResponseVO.builder()
                .projectId(projectId)
                .groupId(groupId)
                .comment(comment)
                .students(students)
                .build();
    }

    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Save or update mark record and details for a single student.
     * Calculates and persists the student's total_score.
     * Does NOT trigger group average recalculation (caller is responsible).
     */
    private void saveStudentMark(Long projectId, Long studentId, Long markerId, List<MarkDetailDTO> details) {
        // 1. Validate: each score must not exceed the criteria's maximum_mark
        for (MarkDetailDTO detail : details) {
            if (detail.getScore() == null) continue;
            Integer maxMark = markRecordDao.getMaximumMarkByCriteriaId(detail.getCriteriaId());
            if (maxMark != null && detail.getScore().compareTo(BigDecimal.valueOf(maxMark)) > 0) {
                throw new IllegalArgumentException(
                        "Score " + detail.getScore() + " exceeds maximum mark " + maxMark
                        + " for criteria id=" + detail.getCriteriaId());
            }
        }

        // 2. Upsert mark_record — scoped to this marker to avoid overwriting other markers' records
        MarkRecordPO existing = markRecordDao.getByProjectAndStudentAndMarker(projectId, studentId, markerId);
        Long markRecordId;
        if (existing != null) {
            markRecordId = existing.getId();
        } else {
            MarkRecordPO newRecord = MarkRecordPO.builder()
                    .projectId(projectId)
                    .studentId(studentId)
                    .markerId(markerId)
                    .build();
            markRecordDao.insert(newRecord);
            markRecordId = newRecord.getId();
        }

        // 3. Upsert mark_detail rows (by criteriaId — supports partial/incremental saves)
        for (MarkDetailDTO detail : details) {
            MarkDetailPO existingDetail = markDetailDao.getByCriteriaId(markRecordId, detail.getCriteriaId());
            if (existingDetail != null) {
                MarkDetailPO updated = MarkDetailPO.builder()
                        .markRecordId(markRecordId)
                        .criteriaId(detail.getCriteriaId())
                        .score(detail.getScore())
                        .comment(detail.getComment())
                        .status(1)
                        .build();
                markDetailDao.updateMarkDetail(updated);
            } else {
                MarkDetailPO inserted = MarkDetailPO.builder()
                        .markRecordId(markRecordId)
                        .criteriaId(detail.getCriteriaId())
                        .score(detail.getScore())
                        .comment(detail.getComment())
                        .status(0)
                        .build();
                markDetailDao.insertMarkDetail(inserted);
            }
        }

        // 4. Recalculate student total_score from all stored details (not just this batch)
        BigDecimal totalScore = calcTotalScore(markDetailDao.getByMarkRecordId(markRecordId));
        MarkRecordPO toUpdate = markRecordDao.selectById(markRecordId);
        toUpdate.setTotalScore(totalScore);
        toUpdate.setMarkTime(LocalDateTime.now());
        markRecordDao.updateById(toUpdate);

        log.info("Saved student mark: projectId={}, studentId={}, markerId={}, total_score={}",
                projectId, studentId, markerId, totalScore);
    }

    /**
     * Save or update group_score in mark_record for a single student.
     * Does NOT touch total_score or mark_detail rows.
     */
    private void saveStudentGroupScore(Long projectId, Long studentId, Long markerId, BigDecimal groupScore) {
        // Scoped to this marker to avoid overwriting other markers' records
        MarkRecordPO existing = markRecordDao.getByProjectAndStudentAndMarker(projectId, studentId, markerId);
        if (existing != null) {
            existing.setGroupScore(groupScore);
            existing.setMarkTime(LocalDateTime.now());
            markRecordDao.updateById(existing);
        } else {
            MarkRecordPO newRecord = MarkRecordPO.builder()
                    .projectId(projectId)
                    .studentId(studentId)
                    .markerId(markerId)
                    .groupScore(groupScore)
                    .markTime(LocalDateTime.now())
                    .build();
            markRecordDao.insert(newRecord);
        }

        log.info("Saved group score: projectId={}, studentId={}, groupScore={}", projectId, studentId, groupScore);
    }

    /**
     * Save or update this marker's group-level comment in group_mark_record.
     * One row per (projectId, groupId, markerId); does NOT touch total_score.
     */
    private void saveGroupComment(Long projectId, Long groupId, Long markerId, String comment) {
        GroupMarkRecordPO existing = groupMarkRecordDao.getByProjectGroupAndMarker(projectId, groupId, markerId);
        if (existing != null) {
            existing.setComment(comment);
            existing.setMarkTime(LocalDateTime.now());
            groupMarkRecordDao.updateById(existing);
        } else {
            GroupMarkRecordPO newGroupRecord = GroupMarkRecordPO.builder()
                    .projectId(projectId)
                    .groupId(groupId)
                    .markerId(markerId)
                    .comment(comment)
                    .markTime(LocalDateTime.now())
                    .build();
            groupMarkRecordDao.insert(newGroupRecord);
        }

        log.info("Saved group comment: projectId={}, groupId={}, markerId={}", projectId, groupId, markerId);
    }

    /**
     * Calculate weighted total score from all mark_detail rows for a student.
     * Formula: total = Σ(score × weighting / 100)
     */
    private BigDecimal calcTotalScore(List<MarkDetailPO> details) {
        BigDecimal total = BigDecimal.ZERO;
        for (MarkDetailPO detail : details) {
            if (detail.getScore() == null) continue;
            Integer weighting = markRecordDao.getWeightingByCriteriaId(detail.getCriteriaId());
            if (weighting != null) {
                total = total.add(detail.getScore()
                        .multiply(BigDecimal.valueOf(weighting))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP));
            }
        }
        return total;
    }

    /**
     * Extract markerId from the current JWT-authenticated user.
     */
    private Long getCurrentMarkerId() {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        return currentUser.getUserId();
    }
}
