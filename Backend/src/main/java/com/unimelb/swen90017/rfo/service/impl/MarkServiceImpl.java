package com.unimelb.swen90017.rfo.service.impl;

import com.unimelb.swen90017.rfo.dao.GroupMarkDetailDao;
import com.unimelb.swen90017.rfo.dao.GroupMarkRecordDao;
import com.unimelb.swen90017.rfo.dao.MarkDetailDao;
import com.unimelb.swen90017.rfo.dao.MarkRecordDao;
import com.unimelb.swen90017.rfo.dao.ProjectDao;
import com.unimelb.swen90017.rfo.pojo.dto.MarkDetailDTO;
import com.unimelb.swen90017.rfo.pojo.po.GroupMarkDetailPO;
import com.unimelb.swen90017.rfo.pojo.po.GroupMarkRecordPO;
import com.unimelb.swen90017.rfo.pojo.po.MarkDetailPO;
import com.unimelb.swen90017.rfo.pojo.po.MarkRecordPO;
import com.unimelb.swen90017.rfo.pojo.po.StudentPO;
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
import java.math.RoundingMode;
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

    @Autowired
    private GroupMarkDetailDao groupMarkDetailDao;

    @Autowired
    private ProjectDao projectDao;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveMark(SaveMarkRequestVO request) {
        // 1. Get markerId from JWT (current authenticated user)
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        Long markerId = currentUser.getUserId();

        // 2. Check if a mark_record already exists for this (projectId, studentId)
        MarkRecordPO existing = markRecordDao.getByProjectAndStudent(
                request.getProjectId(), request.getStudentId());

        // 3. Validate each score does not exceed the criteria's maximum_mark
        for (MarkDetailDTO detail : request.getDetails()) {
            if (detail.getScore() == null) continue;
            Integer maxMark = markRecordDao.getMaximumMarkByCriteriaId(detail.getCriteriaId());
            if (maxMark != null && detail.getScore().compareTo(BigDecimal.valueOf(maxMark)) > 0) {
                throw new IllegalArgumentException(
                        "Score " + detail.getScore() + " exceeds maximum mark " + maxMark
                        + " for criteria id=" + detail.getCriteriaId());
            }
        }

        Long markRecordId;

        if (existing != null) {
            markRecordId = existing.getId();
        } else {
            MarkRecordPO newRecord = MarkRecordPO.builder()
                    .projectId(request.getProjectId())
                    .studentId(request.getStudentId())
                    .markerId(markerId)
                    .build();
            markRecordDao.insert(newRecord);
            markRecordId = newRecord.getId();
        }

        // 4. Upsert mark_detail rows
        for (MarkDetailDTO detail : request.getDetails()) {
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

        // 5. Recalculate total_score from ALL mark_details in DB (not just this request)
        BigDecimal totalScore = calcTotalScoreFromDetails(markDetailDao.getByMarkRecordId(markRecordId));
        MarkRecordPO toUpdate = markRecordDao.selectById(markRecordId);
        toUpdate.setTotalScore(totalScore);
        markRecordDao.updateById(toUpdate);

        log.info("Saved mark record id={}, total_score={}", markRecordId, totalScore);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveGroupMark(SaveGroupMarkRequestVO request) {
        CustomUserDetails currentUser = (CustomUserDetails) SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        Long markerId = currentUser.getUserId();

        // 1. Validate each score does not exceed the criteria's maximum_mark
        for (MarkDetailDTO detail : request.getDetails()) {
            if (detail.getScore() == null) continue;
            Integer maxMark = markRecordDao.getMaximumMarkByCriteriaId(detail.getCriteriaId());
            if (maxMark != null && detail.getScore().compareTo(BigDecimal.valueOf(maxMark)) > 0) {
                throw new IllegalArgumentException(
                        "Score " + detail.getScore() + " exceeds maximum mark " + maxMark
                        + " for criteria id=" + detail.getCriteriaId());
            }
        }

        // 2. Upsert group_mark_record
        GroupMarkRecordPO existingGroupRecord = groupMarkRecordDao.getByProjectAndGroup(
                request.getProjectId(), request.getGroupId());

        Long groupMarkRecordId;
        if (existingGroupRecord != null) {
            groupMarkRecordId = existingGroupRecord.getId();
        } else {
            GroupMarkRecordPO newGroupRecord = GroupMarkRecordPO.builder()
                    .projectId(request.getProjectId())
                    .groupId(request.getGroupId())
                    .markerId(markerId)
                    .build();
            groupMarkRecordDao.insert(newGroupRecord);
            groupMarkRecordId = newGroupRecord.getId();
        }

        // 3. Upsert group_mark_detail
        for (MarkDetailDTO detail : request.getDetails()) {
            GroupMarkDetailPO existingDetail = groupMarkDetailDao.getByCriteriaId(
                    groupMarkRecordId, detail.getCriteriaId());
            if (existingDetail != null) {
                GroupMarkDetailPO updated = GroupMarkDetailPO.builder()
                        .groupMarkRecordId(groupMarkRecordId)
                        .criteriaId(detail.getCriteriaId())
                        .score(detail.getScore())
                        .comment(detail.getComment())
                        .status(1)
                        .build();
                groupMarkDetailDao.updateGroupMarkDetail(updated);
            } else {
                GroupMarkDetailPO inserted = GroupMarkDetailPO.builder()
                        .groupMarkRecordId(groupMarkRecordId)
                        .criteriaId(detail.getCriteriaId())
                        .score(detail.getScore())
                        .comment(detail.getComment())
                        .status(0)
                        .build();
                groupMarkDetailDao.insertGroupMarkDetail(inserted);
            }
        }

        // 4. Recalculate total_score from ALL group_mark_details in DB
        BigDecimal totalScore = calcTotalScoreFromGroupDetails(
                groupMarkDetailDao.getByGroupMarkRecordId(groupMarkRecordId));
        GroupMarkRecordPO groupToUpdate = groupMarkRecordDao.selectById(groupMarkRecordId);
        groupToUpdate.setTotalScore(totalScore);
        groupMarkRecordDao.updateById(groupToUpdate);

        // 5. Distribute scores to each student in the group
        List<StudentPO> students = projectDao.selectStudentsByGroupIdInProject(request.getGroupId());
        for (StudentPO student : students) {
            Long studentId = student.getId();

            // Upsert mark_record for this student
            MarkRecordPO existingRecord = markRecordDao.getByProjectAndStudent(
                    request.getProjectId(), studentId);
            Long markRecordId;
            if (existingRecord != null) {
                markRecordId = existingRecord.getId();
            } else {
                MarkRecordPO newRecord = MarkRecordPO.builder()
                        .projectId(request.getProjectId())
                        .studentId(studentId)
                        .markerId(markerId)
                        .build();
                markRecordDao.insert(newRecord);
                markRecordId = newRecord.getId();
            }

            // Upsert mark_detail for this student
            for (MarkDetailDTO detail : request.getDetails()) {
                MarkDetailPO existingDetail = markDetailDao.getByCriteriaId(
                        markRecordId, detail.getCriteriaId());
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

            // Recalculate total_score from ALL mark_details in DB for this student
            BigDecimal studentTotalScore = calcTotalScoreFromDetails(
                    markDetailDao.getByMarkRecordId(markRecordId));
            MarkRecordPO studentToUpdate = markRecordDao.selectById(markRecordId);
            studentToUpdate.setTotalScore(studentTotalScore);
            markRecordDao.updateById(studentToUpdate);
        }

        log.info("Saved group mark record id={}, total_score={}, distributed to {} students",
                groupMarkRecordId, totalScore, students.size());
    }

    private BigDecimal calcTotalScoreFromDetails(List<MarkDetailPO> details) {
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

    private BigDecimal calcTotalScoreFromGroupDetails(List<GroupMarkDetailPO> details) {
        BigDecimal total = BigDecimal.ZERO;
        for (GroupMarkDetailPO detail : details) {
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
}