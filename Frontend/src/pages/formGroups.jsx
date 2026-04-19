import React, { useState, useEffect } from 'react';
import {
  Button,
  Upload,
  Modal,
  message,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import Papa from 'papaparse';
import { history, useParams } from 'umi';
import styles from './formGroups.module.less';
import { getStudentListBySubject } from '../apis/getStudents';

/***
 * @typedef {object} uploadedList
 * @property {string} studentId
 * @property {string} name
 * @property {string} [group]
 * @property {string} [groupName]
 *
 */
const FormGroups = observer(() => {
  const { subjectId } = useParams();
  const { studentStore } = useStores();
  const [groups, setGroups] = useState([]);
  const [studentsLoaded, setStudentsLoaded] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStudentsLoaded(false);
    (async () => {
      studentStore.clearSubjectStudents();
      try {
        const res = await getStudentListBySubject(subjectId);
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (!cancelled) {
          studentStore.addAllStudents(list);
        }
      } catch {
        if (!cancelled) {
          message.error('Failed to load students for this subject.');
        }
      } finally {
        if (!cancelled) {
          setStudentsLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [subjectId]);

  // Restore groups from studentStore when returning to edit (e.g. Form Groups -> Confirm -> Create Project -> Form Groups again)
  useEffect(() => {
    if (studentStore.groupStudentsList?.length > 0) {
      const restored = studentStore.groupStudentsList;
      setGroups(restored);
    }
  }, []);

  /** Validate required columns first, then duplicate/enrollment checks. */
  function validateUploadedCsv(studentList, results) {
    const fields = Array.isArray(results?.meta?.fields)
      ? results.meta.fields.map((f) => String(f || '').trim().toUpperCase())
      : [];
    const hasGroupColumn = fields.includes('GROUP') || fields.includes('GROUPNAME');
    const hasStudentIdColumn = fields.includes('STUDENTID');
    if (!hasGroupColumn || !hasStudentIdColumn) {
      return {
        ok: false,
        message:
          'CSV must include columns: groupName (or group), and studentID (or studentId).',
      };
    }

    const raw = results.data || [];
    const getStudentId = (row) => String(row?.studentId ?? '').trim();
    const uploadedList = raw.filter(
      (row) => row && getStudentId(row) !== ''
    );
    if (uploadedList.length === 0) {
      return {
        ok: false,
        message: 'The file has no rows with a student ID.',
      };
    }
    const seen = new Set();
    for (const row of uploadedList) {
      const id = getStudentId(row);
      if (seen.has(id)) {
        return {
          ok: false,
          message: `Duplicate student ID in file: ${id}`,
        };
      }
      seen.add(id);
    }
    const groupLabel = (row) =>
      String(row.groupName ?? row.group ?? '').trim();
    const missingGroup = uploadedList.some((row) => !groupLabel(row));
    if (missingGroup) {
      return {
        ok: false,
        message:
          'Each row must include a group name (CSV column group or groupName).',
      };
    }
    const invalid = uploadedList.filter(
      (item) =>
        !studentList.some(
          (student) => String(student.studentId) === getStudentId(item)
        )
    );
    if (invalid.length > 0) {
      return {
        ok: false,
        message:
          'Some student IDs are not enrolled in this subject. Check the file and try again.',
      };
    }
    return { ok: true };
  }

  const uploadDisabled =
    !studentsLoaded || studentStore.subjectStudentsList.length === 0;

  const props = {
    beforeUpload: (file) => {
      if (!studentsLoaded) {
        message.warning(
          'Please wait until the student list has finished loading.'
        );
        return false;
      }
      if (studentStore.subjectStudentsList.length === 0) {
        message.warning(
          'There are no students enrolled in this subject yet.'
        );
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => {
            const normalized = String(header).trim().toUpperCase();
            if (normalized === 'GROUP' || normalized === 'GROUPNAME') return 'groupName';
            if (normalized === 'STUDENTID') return 'studentId';
            if (normalized === 'STUDENTNAME') return 'studentName';
            return String(header).trim();
          },
          complete: (results) => {
            const validation = validateUploadedCsv(
              studentStore.subjectStudentsList,
              results
            );

            if (!validation.ok) {
              setValidationMessage(validation.message);
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

  const renderStudentCard = (student, index, { onRemove } = {}) => (
    <div key={student.studentId ?? index} className={styles.studentCard}>
      <div>
        <div className={styles.studentId}>{student.studentId}</div>
        <div className={styles.studentName}>{student.studentName}</div>
      </div>
      {onRemove ? (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(student.studentId)}
          aria-label="Remove from group"
        />
      ) : null}
    </div>
  );

  const renderGroupCard = (group, groupIndex) => (
    <div key={`${group.groupName}-${groupIndex}`} className={styles.groupCard}>
      <div className={styles.groupHeader}>
        <div className={styles.groupTitleRow}>
          <h3 className={styles.groupName}>{group.groupName}</h3>
        </div>
        <span className={styles.studentCount}>
          {(group.students || []).length} students
        </span>
      </div>
      <div className={styles.studentsContainer}>
        {group.students.map((student, index) =>
          renderStudentCard(student, index)
        )}
      </div>
    </div>
  );


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
        <div className={styles.importActions}>
          <Upload
            {...props}
            accept=".csv"
            showUploadList={false}
            maxCount={1}
            disabled={uploadDisabled}
          >
            <Button icon={<UploadOutlined />} disabled={uploadDisabled}>
              Import Files
            </Button>
          </Upload>

        </div>
        <Button
        danger
        onClick={() => {
          setGroups([]);
        }}
        className={styles.clearButton}
      >
        Clear
      </Button>
      </div>


      <div className={styles.groupsContainer}>
        {groups.map((group, i) => (
          <React.Fragment key={group.groupName || i}>
            {renderGroupCard(group, i)}
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
