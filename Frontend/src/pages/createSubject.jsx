import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Table,
  message,
} from 'antd';
import { UserAddOutlined, TagsOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { createSubject } from '@/apis/createSubject';
import styles from './createSubject.module.less';

const { TextArea } = Input;
const { Title } = Typography;

const CreateSubject = observer(() => {
  const [form] = Form.useForm();
  const { studentStore, markerStore } = useStores();
  const [formValues, setFormValues] = useState({});

  const [submitting, setSubmitting] = useState(false);

  // restore form data from local storage
  useEffect(() => {
    const savedFormData = localStorage.getItem('createSubjectFormData');
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      form.setFieldsValue(parsedData);
      setFormValues(parsedData);
    } else {
      // Fresh create flow should not inherit transient selections from other pages.
      studentStore.clearStudents();
      markerStore.clearSelected();
    }
  }, [form, markerStore, studentStore]);

  const onFinish = (values) => {
    // save form data
    setFormValues(values);

    // collect all data: subject info, students and markers
    const subjectData = {
      ...values,
      students: studentStore.students.slice(),
      markerIds: markerStore.selectedMarkerIds.slice(),
    };

    console.log('Subject Data to Submit:', subjectData);

    // validate necessary data
    if (subjectData.students.length === 0) {
      return message.warning('Please add at least one student');
    }

    if (subjectData.markerIds.length === 0) {
      return message.warning('Please assign at least one marker');
    }

    // set submitting state
    setSubmitting(true);

    // call create subject API
    createSubject(subjectData)
      .then((res) => {
        if (res.code === 200) {
          message.success('Subject created successfully');

          // clear students and markers
          studentStore.clearStudents();
          markerStore.clearSelected();
          form.resetFields();
          localStorage.removeItem('createSubjectFormData');

          // back to subject list
          history.push('/subject');
        } else {
          message.error(res.msg || 'Failed to create subject');
        }
      })
      .catch((err) => {
        console.error('Create subject error:', err);
        message.error('Request failed. Please try again later.');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleBack = () => {
    // confirm if you want to give up the current edit
    if (
      Object.keys(formValues).length > 0 ||
      studentStore.students.length > 0 ||
      markerStore.selectedMarkerIds.length > 0
    ) {
      if (
        window.confirm(
          'Are you sure you want to go back? All unsaved data will be lost.'
        )
      ) {
        // clear all data
        localStorage.removeItem('createSubjectFormData');
        studentStore.clearStudents();
        markerStore.clearSelected();
        history.push('/subject');
      }
    } else {
      // ensure no residual data is kept
      localStorage.removeItem('createSubjectFormData');
      studentStore.clearStudents();
      markerStore.clearSelected();
      history.push('/subject');
    }
  };

  return (
    <div>
      {/* title and back button */}
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          className={styles.backButton}
          size="large"
        >
          Back
        </Button>
        <Title level={2} className={styles.pageTitle}>
          Create New Subject
        </Title>
      </div>

      <Card className={styles.formCard}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.form}
        >
          {/* subject name */}
          <Form.Item
            name="name"
            label="Subject Name"
            rules={[
              { required: true, message: 'Please enter subject name' },
              { min: 2, message: 'Subject name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter subject name" size="large" />
          </Form.Item>

          {/* subject description */}
          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: 'Description cannot exceed 500 characters' },
            ]}
          >
            <TextArea
              placeholder="Enter description (optional)"
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* action buttons area */}
          <div className={styles.actionButtons}>
            <Button
              icon={<UserAddOutlined />}
              size="large"
              className={styles.actionButton}
              onClick={() => {
                // save current form data
                const values = form.getFieldsValue();
                localStorage.setItem(
                  'createSubjectFormData',
                  JSON.stringify(values)
                );
                // navigate to student selection page
                history.push('/selectStudent?fromCreate=true');
              }}
            >
              Add Students
            </Button>

            <Button
              icon={<TagsOutlined />}
              size="large"
              className={styles.actionButton}
              onClick={() => {
                // save current form data
                const values = form.getFieldsValue();
                localStorage.setItem(
                  'createSubjectFormData',
                  JSON.stringify(values)
                );
                // navigate to marker selection page
                history.push('/selectMarker');
              }}
            >
              Assign Markers
            </Button>
          </div>

          {/* submit button */}
          <div className={styles.submitSection}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.submitButton}
              loading={submitting}
            >
              Create Subject
            </Button>
          </div>
        </Form>
      </Card>

      {/* display selected students list */}
      {studentStore.students.length > 0 && (
        <Card className={styles.formCard} style={{ marginTop: '20px' }}>
          <Typography.Title level={4}>
            Selected Students ({studentStore.students.length})
          </Typography.Title>
          <Table
            dataSource={studentStore.students.slice()}
            columns={[
              { title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
              { title: 'Email', dataIndex: 'email', key: 'email' },
              { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
              { title: 'Surname', dataIndex: 'surname', key: 'surname' },
            ]}
            rowKey="studentId"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}

      {/* display selected markers list */}
      {markerStore.selectedMarkerIds.length > 0 && (
        <Card className={styles.formCard} style={{ marginTop: '20px' }}>
          <Typography.Title level={4}>
            Selected Markers ({markerStore.selectedMarkerIds.length})
          </Typography.Title>
          <Table
            dataSource={markerStore.selectedMarkerIds.map((id) => ({ id }))}
            columns={[{ title: 'Marker ID', dataIndex: 'id', key: 'id' }]}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      )}
    </div>
  );
});

export default CreateSubject;
