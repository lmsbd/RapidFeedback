package com.unimelb.swen90017.rfo.dao;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.StudentProjectPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
@Mapper
public interface StudentProjectDao extends BaseMapper<StudentProjectPO> {
    @Select("""
        SELECT COUNT(1)
        FROM student_project
        WHERE subject_id = #{subjectId}
          AND student_id = #{studentId}
    """)
    int countBySubjectIdAndStudentId(@Param("subjectId") Long subjectId,
                                     @Param("studentId") Long studentId);
}
