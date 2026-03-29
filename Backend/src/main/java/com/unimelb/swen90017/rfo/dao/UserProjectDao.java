package com.unimelb.swen90017.rfo.dao;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
@Mapper
public interface UserProjectDao {

    @Select("""
        SELECT COUNT(1)
        FROM user_project
        WHERE subject_id = #{subjectId}
          AND user_id = #{userId}
    """)
    int countBySubjectIdAndUserId(@Param("subjectId") Long subjectId,
                                  @Param("userId") Long userId);
}