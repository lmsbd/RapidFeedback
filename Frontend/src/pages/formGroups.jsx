import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Button,
  Table,
  Upload,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  InputNumber,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import Papa from 'papaparse';
import { useLocation, history, useParams } from 'umi';
import styles from './formGroups.module.less';
import { getStudentListBySubject } from '../apis/getStudents';
/***
 * @typedef {object} uploadedList
 * @property {string} studentId
 * @property {string} name
 * @property {string} group
 *
 */
const FormGroups = observer(() => {
  const { subjectId } = useParams();
  const { studentStore } = useStores();
  const [groups, setGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [form] = Form.useForm();
  const location = useLocation();
  const [size, setSize] = useState();

  useEffect(() => {
    (async () => {
      studentStore.clearSubjectStudents();
      const res = await getStudentListBySubject(subjectId);
      const list = Array.isArray(res) ? res : (res?.data || []);
      studentStore.addAllStudents(list);
    })();
  }, [subjectId]);

  // Restore groups from studentStore when returning to edit (e.g. Form Groups -> Confirm -> Create Project -> Form Groups again)
  useEffect(() => {
    if (studentStore.groupStudentsList?.length > 0) {
      setGroups(studentStore.groupStudentsList);
    }
  }, []);

  function verifyFile(studentList, results) {
    const uploadedList = results.data || [];
    if (uploadedList.length > studentList.length) {
      return false;
    }
    const res = studentList.filter(
      (student) =>
        !uploadedList.some((item) => item.studentId == student.studentId)
    );
    if (res.length === 0) {
      return true;
    }
    return false;
  }
  const props = {
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.data.length !== studentStore.subjectStudentsList.length) {
              setValidationMessage(
                'Please check the number of students in the file.'
              );
              setIsValidationModalOpen(true);
              return;
            }
            const res = verifyFile(studentStore.subjectStudentsList, results);

            if (!res) {
              setValidationMessage(
                'The student ID or group Information is incorrect.'
              );
              setIsValidationModalOpen(true);
            } else {
              message.success('File is uploaded successfully！');
              const parsedGroups = studentStore.createGroupList(results.data);
              setGroups(parsedGroups);
            }
          },
        });
      };
      reader.readAsText(file);
      return false;
    },
  };

  const handleConfirm = () => {
    if (groups.length === 0) {
      message.warning('Please form at least one group');
      return;
    }
    // Prepare group data and save to studentStore
    const groupsData = groups.map(group => ({
      groupName: group.groupName,
      studentIds: group.studentIds
    }));

    studentStore.setGroups(groupsData);
    studentStore.setGroupStudents(groups);

    history.back();
  };

  const handleBack = () => {
    if (groups.length > 0) {
      if (
        window.confirm(
          'Are you sure you want to go back? All unsaved data will be lost.'
        )
      ) {
        history.back();
      }
    } else {
      history.back();
    }
  };

  const renderStudentCard = (student, index) => (
    <div key={index} className={styles.studentCard}>
      <div className={styles.studentId}>{student.studentId}</div>
      <div className={styles.studentName}>{student.studentName}</div>
    </div>
  );

  const renderGroupCard = (group) => (
    <div key={group.groupName} className={styles.groupCard}>
      <div className={styles.groupHeader}>
        <h3 className={styles.groupName}>{group.groupName}</h3>
        <span className={styles.studentCount}>{group.students.length} students</span>
      </div>
      <div className={styles.studentsContainer}>
        {group.students.map((student, index) => renderStudentCard(student, index))}
      </div>
    </div>
  );
  function adjustSizeForBalancedGroups(n, s, min = 2) {
    s = Math.max(min, Math.min(s, n));
    let g = Math.round(n / s);
    g = Math.max(1, Math.min(g, n));

    const sDown = Math.floor(n / g);
    const sUp = Math.ceil(n / g);
    const cand = [sDown, sUp].filter((v) => v >= min && v <= n);

    let sPrime = cand.reduce((a, b) =>
      Math.abs(a - s) <= Math.abs(b - s) ? a : b
    );

    sPrime = Math.max(min, Math.min(sPrime, n));
    return sPrime;
  }

  const handleRandomClick = () => {
    if (!size) {
      message.warning('Please input a number');
      return;
    }
    
    let correctedSize = size;
    const max = studentStore.subjectStudentsList.length;
    
    if (size < 2 || size > max) {
      message.warning(
        'The input is illegal and has been corrected to a reasonable size.'
      );
      correctedSize = size < 2 ? 2 : max;
      setSize(correctedSize);
    }
    
    if (max % correctedSize !== 0 && correctedSize - (max % correctedSize) > 1) {
      message.warning(
        'The input is not reasonable and has been corrected to a reasonable range.'
      );
      const sPrime = adjustSizeForBalancedGroups(max, correctedSize);
      correctedSize = sPrime;
      setSize(correctedSize);
    }
    
    const randomGroups = studentStore.randomFormGroup(correctedSize);
    setGroups(randomGroups);
  };

  return (
    <div>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className={styles.backButton}
          size="large"
        >
          Back
        </Button>
        <h1>Form Groups</h1>
      </div>

      <div className={styles.buttonGroup}>
        <Upload {...props} accept=".csv" showUploadList={false} maxCount={1}>
          <Button icon={<UploadOutlined />}>Import Files</Button>
        </Upload>
        <div className={styles.groupSizeContainer}>
          <p>Size of Each Group:</p>
          <InputNumber
            placeholder="size"
            value={size}
            onChange={(v) => setSize(v)}
          />
          <Button onClick={handleRandomClick} className={styles.randomButton}>
            random create
          </Button>
        </div>
      </div>
      <Button
        danger
        onClick={() => setGroups([])}
        className={styles.clearButton}
      >
        Clear
      </Button>

      <div className={styles.groupsContainer}>
        {groups.map((group, i) => (
          <React.Fragment key={group.groupName || i}>
            {renderGroupCard(group)}
          </React.Fragment>
        ))}
      </div>

      <Button
        type="primary"
        onClick={handleConfirm}
        className={styles.confirmButton}
      >
        Confirm
      </Button>

      <Modal
        title="File verify failed"
        open={isValidationModalOpen}
        onOk={() => setIsValidationModalOpen(false)}
        onCancel={() => setIsValidationModalOpen(false)}
        okText="confirm"
        cancelText="cancel"
        centered
      >
        <p>{validationMessage}</p>
      </Modal>
    </div>
  );
});

export default FormGroups;
