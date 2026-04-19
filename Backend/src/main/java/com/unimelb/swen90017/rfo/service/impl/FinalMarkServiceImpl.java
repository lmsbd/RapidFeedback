package com.unimelb.swen90017.rfo.service.impl;

import com.unimelb.swen90017.rfo.dao.FinalMarkDao;
import com.unimelb.swen90017.rfo.dao.ProjectDao;
import com.unimelb.swen90017.rfo.dao.StudentDao;
import com.unimelb.swen90017.rfo.pojo.po.FinalMarkPO;
import com.unimelb.swen90017.rfo.pojo.po.ProjectGroupPO;
import com.unimelb.swen90017.rfo.pojo.po.ProjectPO;
import com.unimelb.swen90017.rfo.pojo.po.StudentPO;
import com.unimelb.swen90017.rfo.pojo.vo.FinalMarkItemVO;
import com.unimelb.swen90017.rfo.pojo.vo.FinalMarkListResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.MarkerScoreVO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.LockFinalMarkRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SaveFinalMarkRequestVO;
import com.unimelb.swen90017.rfo.service.FinalMarkService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Final mark service implementation
 */
@Slf4j
@Service
public class FinalMarkServiceImpl implements FinalMarkService {

    @Autowired
    private ProjectDao projectDao;

    @Autowired
    private FinalMarkDao finalMarkDao;

    @Autowired
    private StudentDao studentDao;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Override
    public FinalMarkListResponseVO getFinalMarkList(Long projectId) {
        ProjectPO project = projectDao.selectById(projectId);
        if (project == null) {
            throw new IllegalArgumentException("Project not found: " + projectId);
        }

        List<FinalMarkItemVO> items = new ArrayList<>();

        if ("group".equals(project.getProjectType())) {
            List<ProjectGroupPO> groups = projectDao.getProjectGroupByProjectId(projectId);
            for (ProjectGroupPO group : groups) {
                List<MarkerScoreVO> markerScores =
                        projectDao.getMarkerScoresByProjectAndGroup(projectId, group.getId());
                BigDecimal averageScore = calcAverage(markerScores);

                FinalMarkPO finalMark = finalMarkDao.getByProjectAndGroup(projectId, group.getId());
                BigDecimal finalScore = finalMark != null ? finalMark.getFinalScore() : null;
                Boolean isLocked = finalMark != null && Boolean.TRUE.equals(finalMark.getIsLocked());

                int completedMarkers = finalMarkDao.countCompletedMarkersForGroup(projectId, group.getId());
                int totalAssignedMarkers = finalMarkDao.countAssignedMarkersForGroup(projectId, group.getId());

                List<StudentPO> students = projectDao.selectStudentsByGroupIdInProject(group.getId());
                for (StudentPO student : students) {
                    items.add(FinalMarkItemVO.builder()
                            .studentId(student.getStudentId())
                            .firstName(student.getFirstName())
                            .surname(student.getSurname())
                            .email(student.getEmail())
                            .groupId(group.getId())
                            .groupName(group.getGroupName())
                            .markerScores(markerScores)
                            .averageScore(averageScore)
                            .finalScore(finalScore)
                            .isLocked(isLocked)
                            .completedMarkers(completedMarkers)
                            .totalAssignedMarkers(totalAssignedMarkers)
                            .build());
                }
            }
        } else {
            List<StudentResponseVO> students = projectDao.getStudentsByProjectId(projectId);
            for (StudentResponseVO student : students) {
                Long studentDbId = student.getId();
                List<MarkerScoreVO> markerScores =
                        projectDao.getMarkerScoresByProjectAndStudent(projectId, studentDbId);
                BigDecimal averageScore = calcAverage(markerScores);

                FinalMarkPO finalMark = finalMarkDao.getByProjectAndStudent(projectId, studentDbId);
                BigDecimal finalScore = finalMark != null ? finalMark.getFinalScore() : null;
                Boolean isLocked = finalMark != null && Boolean.TRUE.equals(finalMark.getIsLocked());

                int completedMarkers = finalMarkDao.countCompletedMarkersForStudent(projectId, studentDbId);
                int totalAssignedMarkers = finalMarkDao.countAssignedMarkersForStudent(projectId, studentDbId);

                items.add(FinalMarkItemVO.builder()
                        .studentId(student.getStudentId())
                        .firstName(student.getFirstName())
                        .surname(student.getSurname())
                        .email(student.getEmail())
                        .groupId(null)
                        .groupName(null)
                        .markerScores(markerScores)
                        .averageScore(averageScore)
                        .finalScore(finalScore)
                        .isLocked(isLocked)
                        .completedMarkers(completedMarkers)
                        .totalAssignedMarkers(totalAssignedMarkers)
                        .build());
            }
        }

        return FinalMarkListResponseVO.builder()
                .items(items)
                .projectType(project.getProjectType())
                .projectName(project.getName())
                .build();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void saveFinalMark(SaveFinalMarkRequestVO request) {
        if (request.getStudentId() != null) {
            StudentPO student = studentDao.findByStudentId(request.getStudentId());
            if (student == null) {
                throw new IllegalArgumentException("Student not found: " + request.getStudentId());
            }
            Long studentDbId = student.getId();
            FinalMarkPO existing = finalMarkDao.getByProjectAndStudent(
                    request.getProjectId(), studentDbId);
            if (existing != null) {
                if (Boolean.TRUE.equals(existing.getIsLocked())) {
                    throw new IllegalStateException("Final score is locked and cannot be modified.");
                }
                existing.setFinalScore(request.getFinalScore());
                finalMarkDao.updateById(existing);
            } else {
                finalMarkDao.insert(FinalMarkPO.builder()
                        .projectId(request.getProjectId())
                        .studentId(studentDbId)
                        .finalScore(request.getFinalScore())
                        .isLocked(false)
                        .build());
            }
            log.info("saveFinalMark: projectId={}, studentId={}, finalScore={}",
                    request.getProjectId(), studentDbId, request.getFinalScore());

        } else if (request.getGroupId() != null) {
            FinalMarkPO existing = finalMarkDao.getByProjectAndGroup(
                    request.getProjectId(), request.getGroupId());
            if (existing != null) {
                if (Boolean.TRUE.equals(existing.getIsLocked())) {
                    throw new IllegalStateException("Final score is locked and cannot be modified.");
                }
                existing.setFinalScore(request.getFinalScore());
                finalMarkDao.updateById(existing);
            } else {
                finalMarkDao.insert(FinalMarkPO.builder()
                        .projectId(request.getProjectId())
                        .groupId(request.getGroupId())
                        .finalScore(request.getFinalScore())
                        .isLocked(false)
                        .build());
            }
            log.info("saveFinalMark: projectId={}, groupId={}, finalScore={}",
                    request.getProjectId(), request.getGroupId(), request.getFinalScore());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void lockFinalMark(LockFinalMarkRequestVO request) {
        if (request.getStudentId() != null) {
            StudentPO student = studentDao.findByStudentId(request.getStudentId());
            if (student == null) {
                throw new IllegalArgumentException("Student not found: " + request.getStudentId());
            }
            Long studentDbId = student.getId();
            FinalMarkPO existing = finalMarkDao.getByProjectAndStudent(
                    request.getProjectId(), studentDbId);
            if (existing != null) {
                existing.setIsLocked(request.getIsLocked());
                finalMarkDao.updateById(existing);
            } else {
                finalMarkDao.insert(FinalMarkPO.builder()
                        .projectId(request.getProjectId())
                        .studentId(studentDbId)
                        .isLocked(request.getIsLocked())
                        .build());
            }
            log.info("lockFinalMark: projectId={}, studentId={}, isLocked={}",
                    request.getProjectId(), studentDbId, request.getIsLocked());

        } else if (request.getGroupId() != null) {
            FinalMarkPO existing = finalMarkDao.getByProjectAndGroup(
                    request.getProjectId(), request.getGroupId());
            if (existing != null) {
                existing.setIsLocked(request.getIsLocked());
                finalMarkDao.updateById(existing);
            } else {
                finalMarkDao.insert(FinalMarkPO.builder()
                        .projectId(request.getProjectId())
                        .groupId(request.getGroupId())
                        .isLocked(request.getIsLocked())
                        .build());
            }
            log.info("lockFinalMark: projectId={}, groupId={}, isLocked={}",
                    request.getProjectId(), request.getGroupId(), request.getIsLocked());
        }
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private BigDecimal calcAverage(List<MarkerScoreVO> markerScores) {
        if (markerScores == null || markerScores.isEmpty()) return null;
        BigDecimal sum = BigDecimal.ZERO;
        int count = 0;
        for (MarkerScoreVO ms : markerScores) {
            if (ms.getScore() != null) {
                sum = sum.add(ms.getScore());
                count++;
            }
        }
        if (count == 0) return null;
        return sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
    }
}
