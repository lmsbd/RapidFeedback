package com.unimelb.swen90017.rfo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.unimelb.swen90017.rfo.dao.SubjectDao;
import com.unimelb.swen90017.rfo.dao.StudentDao;
import com.unimelb.swen90017.rfo.dao.StudentSubjectDao;
import com.unimelb.swen90017.rfo.dao.StudentProjectDao;
import com.unimelb.swen90017.rfo.dao.UserSubjectDao;
import com.unimelb.swen90017.rfo.dao.UserProjectDao;
import com.unimelb.swen90017.rfo.dao.UserDao;
import com.unimelb.swen90017.rfo.pojo.dto.StudentDTO;
import com.unimelb.swen90017.rfo.pojo.po.StudentPO;
import com.unimelb.swen90017.rfo.pojo.po.UserPO;
import com.unimelb.swen90017.rfo.pojo.po.SubjectPO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectDetailVO;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectWholeDetailVO;
import com.unimelb.swen90017.rfo.pojo.vo.UserResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.UserRequestVO;
import com.unimelb.swen90017.rfo.service.SubjectService;
import com.unimelb.swen90017.rfo.pojo.vo.request.StudentRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectStudentRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectUserRequestVO;
import org.springframework.beans.BeanUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Subject service implementation
 */
@Slf4j
@Service
public class SubjectServiceImpl extends ServiceImpl<SubjectDao, SubjectPO> implements SubjectService {

    @Autowired
    private SubjectDao subjectDao;
    
    @Autowired
    private StudentDao studentDao;
    
    @Autowired
    private StudentSubjectDao studentSubjectDao;
    
    @Autowired
    private UserSubjectDao userSubjectDao;
    @Autowired
    private StudentProjectDao studentProjectDao;

    @Autowired
    private UserProjectDao userProjectDao;

    @Autowired
    private UserDao userDao;
    @Override
    @Transactional
    public void save(SubjectRequestVO subjectRequestVO, Long userId){
        SubjectPO subjectPO = new SubjectPO();
        BeanUtils.copyProperties(subjectRequestVO, subjectPO);
        try {
            // Insert the subject
            subjectDao.insert(subjectPO);

            // Get the generated subject ID and associate it with the current user
            Long subjectId = subjectPO.getId();
            if (userId != null && subjectId != null) {
                userSubjectDao.insertUserFromSubject(subjectId, List.of(userId));
                log.info("Subject {} created and associated with user {}", subjectId, userId);
            }
            List<StudentResponseVO> studentList = subjectRequestVO.getStudents();
            List<Long> studentDatabaseIds = new ArrayList<>();
            for(StudentResponseVO student : studentList){
                StudentPO existingStudent = studentDao.findByStudentId(student.getStudentId());
                if (existingStudent != null) {
                    // Student exists, use existing database ID
                    studentDatabaseIds.add(existingStudent.getId());
                } else {
                    // Student doesn't exist, create new student
                    StudentPO newStudent = StudentPO.builder()
                            .studentId(student.getStudentId())
                            .email(student.getEmail())
                            .firstName(student.getFirstName())
                            .surname(student.getSurname())
                            .deleteStatus("0")
                            .build();
                    studentDao.insert(newStudent);
                    studentDatabaseIds.add(newStudent.getId());
                }

            }
            // Assign students to subject
            if (!studentDatabaseIds.isEmpty()) {
                studentSubjectDao.insertStudentFromSubject(subjectId, studentDatabaseIds);
                log.info("Successfully assigned {} students to subject {}", studentDatabaseIds.size(), subjectId);
            } else {
                log.warn("No students to assign to subject {}", subjectId);
            }
            List<Long> markerList = subjectRequestVO.getMarkerIds();
            //List<Long> markerDatabaseIds = new ArrayList<>();
/*            for(Long marker : markerList){
                markerDatabaseIds.add(marker.getUserId());
            }*/
            if (!markerList.isEmpty()) {
                userSubjectDao.insertUserFromSubject(subjectId, markerList);
                log.info("Successfully assigned {} markers to subject {}", markerList.size(), subjectId);
            } else {
                log.info("No markers to assign to subject {}", subjectId);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<StudentResponseVO> getStudentList(StudentRequestVO studentRequestVO) throws Exception {
        if (studentRequestVO == null || studentRequestVO.getSubjectId() == null) {
            throw new Exception("Subject Id is null");
        }
        try {
            List<StudentDTO> studentList = subjectDao.getStudentsBySubjectId(studentRequestVO.getSubjectId());
            List<StudentResponseVO> studentResponseVOList = new ArrayList<>();

            // convert from List<StudentDTO> to List<StudentResponseVO>
            for (StudentDTO studentDTO : studentList) {
                StudentResponseVO studentResponseVO = new StudentResponseVO();
                BeanUtils.copyProperties(studentDTO, studentResponseVO);
                studentResponseVOList.add(studentResponseVO);
            }
            return studentResponseVOList;
        } catch (Exception e) {
            throw new Exception("Failed to get student list: " + e.getMessage(), e);
        }
    }
    @Override
    public List<Long> getSubjectIds(UserRequestVO requestVO) throws Exception {
        if (requestVO == null || requestVO.getUserId() == null) {
            throw new Exception("User Id is null");
        }
        Long userId = requestVO.getUserId();
        try {
            List<Long> ids = userSubjectDao.selectSubjectIdsByUserId(userId);
            return (ids == null) ? java.util.Collections.emptyList() : ids;
        } catch (Exception e) {
            log.error("selectSubjectIdsByUserId failed, userId={}", userId, e);
            throw new Exception("Failed to get subject ids: " + e.getMessage(), e);
        }
    }

    @Override
    public List<SubjectDetailVO> getSubjectList(UserRequestVO requestVO) throws Exception {
        if (requestVO == null || requestVO.getUserId() == null) {
            throw new Exception("User Id is null");
        }
        Long userId = requestVO.getUserId();
        try {
            List<SubjectDetailVO> list = userSubjectDao.selectSubjectDetailsByUserId(userId);
            return (list == null) ? java.util.Collections.emptyList() : list;
        } catch (Exception e) {
            log.error("selectSubjectDetailsByUserId failed, userId={}", userId, e);
            throw new Exception("Failed to get subject list: " + e.getMessage(), e);
        }
    }
    @Override
    public SubjectWholeDetailVO getSubjectsDetail(Long subjectId) throws Exception {
        if (subjectId == null) {
            throw new Exception("Subject Id is null");
        }

        try {
            SubjectPO subjectPO = subjectDao.selectById(subjectId);
            if (subjectPO == null) {
                throw new Exception("Subject not found");
            }

            SubjectWholeDetailVO vo = new SubjectWholeDetailVO();
            vo.setId(subjectPO.getId());
            vo.setName(subjectPO.getName());
            vo.setDescription(subjectPO.getDescription());
            List<StudentDTO> studentDTOList = subjectDao.getStudentsBySubjectId(subjectId);
            List<StudentResponseVO> students = new ArrayList<>();

            if (studentDTOList != null) {
                for (StudentDTO dto : studentDTOList) {
                    StudentResponseVO studentVO = new StudentResponseVO();
                    BeanUtils.copyProperties(dto, studentVO);
                    students.add(studentVO);
                }
            }
            vo.setStudents(students);
            List<UserResponseVO> markers = subjectDao.getMarkersBySubjectId(subjectId);
            vo.setMarkers(markers == null ? new ArrayList<>() : markers);

            return vo;

        } catch (Exception e) {
            log.error("Failed to get subject detail, subjectId={}", subjectId, e);
            throw new Exception("Failed to get subject detail: " + e.getMessage(), e);
        }
    }
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateSubjectsDetail(SubjectRequestVO subjectRequestVO, Long userId) throws Exception {
        if (subjectRequestVO == null || subjectRequestVO.getId() == null) {
            throw new Exception("Subject id cannot be null");
        }

        Long subjectId = subjectRequestVO.getId();
        SubjectPO subjectPO = subjectDao.selectById(subjectId);
        if (subjectPO == null) {
            throw new Exception("Subject not found");
        }

        // Build a map of request students keyed by business student number
        List<StudentResponseVO> requestStudents = subjectRequestVO.getStudents() == null
                ? new ArrayList<>() : subjectRequestVO.getStudents();
        Map<Long, StudentResponseVO> requestStudentMap = new HashMap<>();
        for (StudentResponseVO s : requestStudents) {
            if (s.getStudentId() != null) {
                requestStudentMap.put(s.getStudentId(), s);
            }
        }
        Set<Long> requestStudentNumbers = requestStudentMap.keySet();

        // Load current subject students and build bidirectional maps
        List<Long> dbStudentPks = studentSubjectDao.selectStudentIdsBySubjectId(subjectId);
        if (dbStudentPks == null) dbStudentPks = new ArrayList<>();

        Map<Long, Long> dbNumberToPk = new HashMap<>();  // business number → DB PK
        for (Long pk : dbStudentPks) {
            StudentPO s = studentDao.selectById(pk);
            if (s != null && s.getStudentId() != null) {
                dbNumberToPk.put(s.getStudentId(), pk);
            }
        }
        Set<Long> dbStudentNumbers = dbNumberToPk.keySet();

        // Diff by business student number
        Set<Long> addStudentNumbers = new HashSet<>(requestStudentNumbers);
        addStudentNumbers.removeAll(dbStudentNumbers);

        Set<Long> removeStudentNumbers = new HashSet<>(dbStudentNumbers);
        removeStudentNumbers.removeAll(requestStudentNumbers);

        List<Long> requestMarkerIds = subjectRequestVO.getMarkerIds() == null
                ? new ArrayList<>()
                : subjectRequestVO.getMarkerIds().stream().distinct().toList();

        List<Long> dbUserIds = userSubjectDao.selectUserIdsBySubjectId(subjectId);
        if (dbUserIds == null) {
            dbUserIds = new ArrayList<>();
        }

        List<Long> dbMarkerIds = new ArrayList<>();
        for (Long dbUserId : dbUserIds) {
            UserPO user = userDao.selectById(dbUserId);
            if (user != null && Integer.valueOf(2).equals(user.getRole())) {
                dbMarkerIds.add(dbUserId);
            }
        }

        // 6. 计算 add/remove markers
        List<Long> addMarkerIds = new ArrayList<>(requestMarkerIds);
        addMarkerIds.removeAll(dbMarkerIds);

        List<Long> removeMarkerIds = new ArrayList<>(dbMarkerIds);
        removeMarkerIds.removeAll(requestMarkerIds);

        // ===== 先校验 =====

        // Validate students to remove (look up by DB PK)
        for (Long studentNumber : removeStudentNumbers) {
            Long studentPk = dbNumberToPk.get(studentNumber);
            if (studentPk == null) continue;
            int count = studentProjectDao.countBySubjectIdAndStudentId(subjectId, studentPk);
            if (count > 0) {
                throw new Exception("Student " + studentNumber + " is already assigned to a project under this subject and cannot be removed");
            }
        }

        for (Long markerId : addMarkerIds) {
            UserPO marker = userDao.selectById(markerId);
            if (marker == null) {
                throw new Exception("Marker does not exist, userId=" + marker.getUsername());
            }
            if (!Integer.valueOf(2).equals(marker.getRole())) {
                throw new Exception("User " + markerId + " is not a marker");
            }
        }

        for (Long markerId : removeMarkerIds) {
            UserPO marker = userDao.selectById(markerId);
            int count = userProjectDao.countBySubjectIdAndUserId(subjectId, markerId);
            if (count > 0) {
                throw new Exception("Marker " + marker.getUsername() + " is already assigned to a project under this subject and cannot be removed");
            }
        }

        // ===== 再更新 =====

        subjectPO.setName(subjectRequestVO.getName());
        subjectPO.setDescription(subjectRequestVO.getDescription());
        subjectDao.updateById(subjectPO);

        // Add students: find-or-create, then link to subject
        for (Long studentNumber : addStudentNumbers) {
            StudentPO existing = studentDao.findByStudentId(studentNumber);
            Long studentPk;
            if (existing != null) {
                studentPk = existing.getId();
            } else {
                StudentResponseVO req = requestStudentMap.get(studentNumber);
                StudentPO newStudent = StudentPO.builder()
                        .studentId(studentNumber)
                        .email(req.getEmail())
                        .firstName(req.getFirstName())
                        .surname(req.getSurname())
                        .deleteStatus("0")
                        .build();
                studentDao.insert(newStudent);
                studentPk = newStudent.getId();
                log.info("Created new student: studentId={}, name={} {}", studentNumber, req.getFirstName(), req.getSurname());
            }
            studentSubjectDao.insertOne(studentPk, subjectId);
        }

        // Remove students from subject
        for (Long studentNumber : removeStudentNumbers) {
            Long studentPk = dbNumberToPk.get(studentNumber);
            if (studentPk != null) {
                studentSubjectDao.deleteOne(studentPk, subjectId);
            }
        }

        for (Long markerId : addMarkerIds) {
            userSubjectDao.insertOne(markerId, subjectId);
        }

        for (Long markerId : removeMarkerIds) {
            userSubjectDao.deleteOne(markerId, subjectId);
        }
    }
}
