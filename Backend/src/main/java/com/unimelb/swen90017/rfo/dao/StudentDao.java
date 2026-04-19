package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.StudentPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

/**
 * Student data access interface
 */
@Mapper
public interface StudentDao extends BaseMapper<StudentPO> {

    /**
     * Check if a student exists by student ID
     * @param studentId The student ID to check
     * @return The student if exists, null otherwise
     */
    @Select("SELECT * FROM student WHERE student_id = #{studentId} AND delete_status = 0 LIMIT 1")
    StudentPO findByStudentId(@Param("studentId") Long studentId);

    /**
     * Find a student by primary key (student.id).
     * Use this when looking up by the PK stored in mark_record.student_id / group_student.student_id,
     * not by the business student number (student.student_id).
     */
    @Select("SELECT * FROM student WHERE id = #{id} AND delete_status = 0 LIMIT 1")
    StudentPO findById(@Param("id") Long id);
}

