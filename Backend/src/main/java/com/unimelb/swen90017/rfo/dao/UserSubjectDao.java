package com.unimelb.swen90017.rfo.dao;

import com.unimelb.swen90017.rfo.pojo.vo.SubjectDetailVO;
import com.unimelb.swen90017.rfo.pojo.dto.SubjectDTO;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;

import java.util.List;

@Mapper
public interface UserSubjectDao {

    @Select("""
        SELECT DISTINCT us.subject_id
        FROM user_subject us
        WHERE us.user_id = #{userId}
    """)
    List<Long> selectSubjectIdsByUserId(@Param("userId") Long userId);

    @Select("""
        SELECT DISTINCT s.id AS id, s.name AS name, s.description AS description
        FROM user_subject us
        JOIN subject s ON s.id = us.subject_id
        WHERE us.user_id = #{userId}
        ORDER BY s.id
    """)
    List<SubjectDetailVO> selectSubjectDetailsByUserId(@Param("userId") Long userId);

    /**
     * Insert user-subject associations
     */
    @Insert("""
        <script>
        INSERT INTO user_subject (user_id, subject_id) VALUES
        <foreach collection="userIds" item="userId" separator=",">
            (#{userId}, #{subjectId})
        </foreach>
        </script>
    """)
    int insertUserFromSubject(@Param("subjectId") Long subjectId, @Param("userIds") List<Long> userIds);

    /**
     * Query all user ids under a subject
     */
    @Select("""
        SELECT user_id
        FROM user_subject
        WHERE subject_id = #{subjectId}
    """)
    List<Long> selectUserIdsBySubjectId(@Param("subjectId") Long subjectId);

    /**
     * Insert one user-subject association
     */
    @Insert("""
        INSERT INTO user_subject (user_id, subject_id)
        VALUES (#{userId}, #{subjectId})
    """)
    int insertOne(@Param("userId") Long userId, @Param("subjectId") Long subjectId);

    /**
     * Delete one user-subject association
     */
    @Delete("""
        DELETE FROM user_subject
        WHERE user_id = #{userId}
          AND subject_id = #{subjectId}
    """)
    int deleteOne(@Param("userId") Long userId, @Param("subjectId") Long subjectId);
}