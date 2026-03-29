package com.unimelb.swen90017.rfo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.unimelb.swen90017.rfo.common.Result;
import com.unimelb.swen90017.rfo.pojo.po.SubjectPO;
import com.unimelb.swen90017.rfo.pojo.vo.StudentResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectResponseVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.StudentRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectStudentRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.SubjectUserRequestVO;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectDetailVO;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectWholeDetailVO;
import com.unimelb.swen90017.rfo.pojo.vo.request.UserRequestVO;
import net.sf.jsqlparser.statement.create.function.CreateFunction;
import com.unimelb.swen90017.rfo.pojo.vo.request.*;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectDetailVO;
import com.unimelb.swen90017.rfo.pojo.vo.SubjectResponseVO;
import java.util.List;
import java.util.List;

/**
 * Subject service interface
 */
public interface SubjectService extends IService<SubjectPO> {
    /**
     * Save subject
     */
   public void save(SubjectRequestVO subjectRequestVO, Long userId);

    /**
     * select student in a specific subject
     */
   List<StudentResponseVO> getStudentList(StudentRequestVO studentRequestVO) throws Exception;
   List<Long> getSubjectIds(UserRequestVO requestVO) throws Exception;
   List<SubjectDetailVO> getSubjectList(UserRequestVO requestVO) throws Exception;
   SubjectWholeDetailVO getSubjectsDetail(Long subjectId) throws Exception;
   void updateSubjectsDetail(SubjectRequestVO subjectRequestVO, Long userId) throws Exception;
}
