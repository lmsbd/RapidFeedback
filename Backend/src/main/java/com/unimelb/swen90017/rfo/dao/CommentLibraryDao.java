package com.unimelb.swen90017.rfo.dao;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.unimelb.swen90017.rfo.pojo.po.CommentLibraryPO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CommentLibraryDao extends BaseMapper<CommentLibraryPO> {

    /**
     * select comment by templateElementId
     * @param templateElementId
     * @return list
     */
    @Select("SELECT * FROM comment_library WHERE template_element_id = #{templateElementId} AND delete_status = 0")
    List<CommentLibraryPO> findByTemplateElementId(@Param("templateElementId") Long templateElementId);

    /**
     * select comment by criteriaId
     * @param criteriaId
     * @return list
     */
    @Select("SELECT c.* FROM comment_library a left join comment_library c  on a.template_element_id = c.template_element_id" +
            " WHERE a.id = #{criteriaId} AND c.delete_status = 0")
    List<CommentLibraryPO> findByCriteriaId(@Param("criteriaId") Long criteriaId);

}
