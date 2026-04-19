import React, { useState } from 'react';
import {
  Button,
  Table,
  Upload,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from 'antd';
import {
  UploadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import Papa from 'papaparse';
import { useLocation, history } from 'umi';
import styles from './selectStudent.module.less';
import BackButton from '../components/BackButton/BackButton';

const SelectStudent = observer(() => {
  const { studentStore } = useStores();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isFromManage = params.get('fromManage') === 'true';

  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      // TODO
    }
  }, [location.search]);

  const props = {
    beforeUpload: (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            let addedCount = 0;
            let skippedMissingCount = 0;
            let skippedInvalidEmailCount = 0;

            results.data.forEach((row) => {
              const studentId = String(row.studentId || '').trim();
              const email = String(row.email || '').trim();
              const firstName = String(row.firstName || '').trim();
              const surname = String(row.surname || '').trim();

              if (!studentId || !email || !firstName || !surname) {
                skippedMissingCount += 1;
                return;
              }

              if (!isValidEmail(email)) {
                skippedInvalidEmailCount += 1;
                return;
              }

              studentStore.addStudent({
                ...row,
                studentId,
                email,
                firstName,
                surname,
              });
              addedCount += 1;
            });

            if (addedCount > 0) {
              message.success(`Imported ${addedCount} student(s)`);
            }
            if (skippedMissingCount > 0 || skippedInvalidEmailCount > 0) {
              message.warning(
                `Skipped ${skippedMissingCount} row(s) with missing fields, ${skippedInvalidEmailCount} row(s) with invalid email`
              );
            }
          },
        });
      };
      reader.readAsText(file);
      return false;
    },
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      studentStore.addStudent(values);
      form.resetFields();
      setIsModalOpen(false);
      message.success('success');
    });
  };

  const handleConfirm = () => {
    const fromCreate = params.get('fromCreate');
    const fromManage = params.get('fromManage');
    const subjectId = params.get('id');

    if (fromCreate === 'true') {
      // Return to create subject page (student data is in studentStore)
      history.push('/createSubject');
      return;
    }

    if (fromManage === 'true' && subjectId) {
      history.push(`/manageSubject/${subjectId}?fromSelection=1`);
    }
  };

  const columns = [
    { title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Surname', dataIndex: 'surname', key: 'surname' },
    !isFromManage && {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Are you sure to delete?"
          onConfirm={() => studentStore.deleteStudent(record.studentId)}
        >
          <Button danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      ),
    },
  ].filter(Boolean);

  return (
    <div>
      <div className={styles.header}>
        <BackButton/>
      </div>
      <h2>Select Students</h2>

      <div className={styles.buttonGroup}>
        {!isFromManage && (
          <Upload {...props} accept=".csv" showUploadList={false} maxCount={1}>
            <Button icon={<UploadOutlined />}>Import Files</Button>
          </Upload>
        )}
        {!isFromManage && (
          <Button icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Add Student
          </Button>
        )}
        <Button danger onClick={() => studentStore.clearStudents()}>
          Clear
        </Button>
      </div>

      <Table
        dataSource={studentStore.students.slice()}
        columns={columns}
        rowKey="studentId"
      />

      <Button
        type="primary"
        onClick={handleConfirm}
        className={styles.confirmButton}
      >
        Confirm
      </Button>

      <Modal
        title="Add Student"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="studentId"
            label="Student ID"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="surname"
            label="Surname"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
});

export default SelectStudent;
