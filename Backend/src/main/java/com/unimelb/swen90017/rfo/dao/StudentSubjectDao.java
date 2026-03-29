package com.unimelb.swen90017.rfo.dao;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Select;
import java.util.List;

/**
 * Student-Subject association DAO
 */
@Mapper
public interface StudentSubjectDao {

    /**
     * Insert student-subject associations
     */
    @Insert("""
        <script>
        INSERT IGNORE INTO student_subject (student_id, subject_id) VALUES
        <foreach collection="studentIds" item="studentId" separator=",">
            (#{studentId}, #{subjectId})
        </foreach>
        </script>
    """)
    int insertStudentFromSubject(@Param("subjectId") Long subjectId, @Param("studentIds") List<Long> studentIds);

    /**
     * Query all student ids under a subject
     */
    @Select("""
        SELECT student_id
        FROM student_subject
        WHERE subject_id = #{subjectId}
    """)
    List<Long> selectStudentIdsBySubjectId(@Param("subjectId") Long subjectId);

    /**
     * Insert one student-subject association
     */
    @Insert("""
        INSERT IGNORE INTO student_subject (student_id, subject_id)
        VALUES (#{studentId}, #{subjectId})
    """)
    int insertOne(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);

    /**
     * Delete one student-subject association
     */
    @Delete("""
        DELETE FROM student_subject
        WHERE student_id = #{studentId}
          AND subject_id = #{subjectId}
    """)
    int deleteOne(@Param("studentId") Long studentId, @Param("subjectId") Long subjectId);
}