package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.dto.StudentDTO;
import com.unimelb.swen90017.rfo.pojo.dto.SubjectDTO;
import com.unimelb.swen90017.rfo.pojo.po.SubjectPO;
import com.unimelb.swen90017.rfo.pojo.vo.UserResponseVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * Subject data access interface
 */
@Mapper
public interface SubjectDao extends BaseMapper<SubjectPO> {
    List<StudentDTO> getStudentsBySubjectId(@Param("subjectId") Long subjectId);
    List<UserResponseVO> getMarkersBySubjectId(@Param("subjectId") Long subjectId);
    @Select("SELECT student_id FROM student_subject WHERE subject_id = #{subjectId}")
    List<Long> getStudentIdsBySubjectId(@Param("subjectId") Long subjectId);   
}
