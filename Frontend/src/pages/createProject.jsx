import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  InputNumber,
  message,
  Tag,
  Empty,
} from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
  UsergroupAddOutlined,
  SettingOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { history, useLocation, useParams } from 'umi';
import { observer } from 'mobx-react-lite';
import { useStores } from '@/stores';
import { createProject } from '@/apis/projects';
import styles from './createProject.module.less';

const { Title, Text } = Typography;

const CreateProject = observer(() => {
  const { subjectId } = useParams();
  const [form] = Form.useForm();
  const { studentStore, markerStore, assessmentStore, projectStore } = useStores();
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [projectType, setProjectType] = useState('individual'); // 'individual' or 'group'

  // Restore form data from store (in-memory only, cleared on refresh)
  useEffect(() => {
    const savedFormData = projectStore.createProjectFormData;
    if (savedFormData) {
      form.setFieldsValue(savedFormData);
      setFormValues(savedFormData);
      if (savedFormData.projectType) {
        setProjectType(savedFormData.projectType);
      }
    }
  }, [form]);

  // Handle projectType change from individual to group
  const handleProjectTypeChange = (e) => {
    const newProjectType = e.target.value;
    setProjectType(newProjectType);

    const values = form.getFieldsValue();
    const dataToSave = { ...values, projectType: newProjectType };
    projectStore.setCreateProjectFormData(dataToSave);
  };


  const onFinish = (values) => {
    // Validate assessment elements from store
    if (!assessmentStore.hasElements) {
      message.warning('Please configure assessment criteria first');
      return;
    }

    // Save form data
    const updatedValues = { ...values, projectType };
    setFormValues(updatedValues);

    // Collect all data for project creation based on project type
    // countdown: ms (convert from timer in minutes)
    const baseProjectData = {
      name: values.name,
      elements: assessmentStore.elementList,  // Get elements from store
      countdown: values.timer ? values.timer * 60 * 1000 : null,
      projectType: projectType,
      markerList: markerStore.selectedMarkerIds.slice(),
      subjectId: subjectId,
    };

    // Add type-specific data
    let projectData;
    if (projectType === 'individual') {
      projectData = {
        ...baseProjectData,
      };
    } else {
      // For group projects, add groups
      projectData = {
        ...baseProjectData,
        groups: studentStore.groups || [],
      };
    }

    console.log('Project Data to Submit:', projectData);

    // Validate necessary data
    if (!projectData.subjectId) {
      return message.warning('Subject ID is missing');
    }

    // Validate based on project type
    if (projectType === 'group') {
      if (!projectData.groups || projectData.groups.length === 0) {
        return message.warning('Please form at least one group');
      }
      // Check if all groups have students
      const hasEmptyGroup = projectData.groups.some(
        (group) => !group.studentIds || group.studentIds.length === 0
      );
      if (hasEmptyGroup) {
        return message.warning('All groups must have at least one student');
      }
    }

    if (projectData.markerList.length === 0) {
      return message.warning('Please assign at least one marker');
    }

    // Set submitting state
    setSubmitting(true);

    // Call create project API
    createProject(projectData)
      .then((res) => {
        if (res.code === 200) {
          message.success('Project created successfully');

          // Clear all data after successful creation
          clearAllData();
          history.push(`/subjectDetails/${subjectId}`);
        } else {
          message.error(res.msg || 'Failed to create project');
        }
      })
      .catch((err) => {
        console.error('Create project error:', err);
        message.error('Request failed. Please try again later.');
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const handleBack = () => {
    // Confirm if you want to give up the current edit
    if (Object.keys(formValues).length > 0 || assessmentStore.hasElements) {
      if (
        window.confirm(
          'Are you sure you want to go back? All unsaved data will be lost.'
        )
      ) {
        // Clear all data
        clearAllData();
        history.push(`/subjectDetails/${subjectId}`);
      }
    } else {
      history.push(`/subjectDetails/${subjectId}`);
    }
  };

  // Clear all form and store data
  const clearAllData = () => {
    form.resetFields();
    setFormValues({});
    setProjectType('individual');

    projectStore.clearCreateProjectFormData();
    studentStore.clearGroupStudents();
    studentStore.clearGroups();
    studentStore.clearSubjectStudents();
    markerStore.clearSelected();
    assessmentStore.clearElements();
  };

  // Save form data to store before navigating (in-memory only)
  const saveFormData = () => {
    const values = form.getFieldsValue();
    const dataToSave = { ...values, projectType };
    projectStore.setCreateProjectFormData(dataToSave);
  };


  return (
    <div>
      {/* Title and back button */}
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
          Create New Project
        </Title>
      </div>

      <Card className={styles.formCard}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className={styles.form}
        >
          {/* Project name */}
          <Form.Item
            name="name"
            label="Project Name"
            rules={[
              { required: true, message: 'Please enter project name' },
              { min: 2, message: 'Project name must be at least 2 characters' },
            ]}
          >
            <Input placeholder="Enter project name" size="large" />
          </Form.Item>

          {/* Assessment Criteria */}
          <Form.Item label="Assessment Criteria" required>
            <Card className={styles.assessmentCard}>
              <div className={styles.assessmentHeader}>
                <div className={styles.assessmentTitle}>
                  <SettingOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                  <Text strong>Configured Criteria</Text>
                  {assessmentStore.hasElements && (
                    <Tag color="success" style={{ marginLeft: 8 }}>
                      <CheckCircleOutlined /> {assessmentStore.elementCount} criteria
                    </Tag>
                  )}
                </div>
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  onClick={() => {
                    saveFormData();
                    history.push('/criteriaEditor');
                  }}
                >
                  Configure
                </Button>
              </div>

              {assessmentStore.hasElements ? (
                <div className={styles.criteriaListContainer}>
                  <div className={styles.criteriaList}>
                    {assessmentStore.elementList.map((element, index) => (
                      <div key={element.elementId} className={styles.criterionItem}>
                        <div className={styles.criterionName}>
                          <Text strong>{element.Name}</Text>
                        </div>
                        <div className={styles.criterionDetails}>
                          <Tag color="blue">{element.weighting}%</Tag>
                          <Tag color="green">Max: {element.maximumMark}</Tag>
                          <Tag color="orange">+{element.markIncrements}</Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <Empty
                  description="No assessment criteria configured. Click 'Configure' button above."
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '20px 0' }}
                />
              )}
            </Card>
            {!assessmentStore.hasElements && (
              <div style={{ color: '#ff4d4f', marginTop: 8, fontSize: 14 }}>
                Please configure at least one assessment criterion
              </div>
            )}
          </Form.Item>

          {/* Timer (presentation duration) */}
          <Form.Item
            name="timer"
            label="Presentation Duration (minutes)"
            rules={[
              { required: true, message: 'Please enter presentation duration' },
              {
                type: 'number',
                min: 1,
                message: 'Duration must be at least 1 minute',
              },
            ]}
          >
            <InputNumber
              placeholder="Enter duration in minutes"
              size="large"
              min={1}
              style={{ width: '100%' }}
              prefix={<ClockCircleOutlined style={{ color: '#bfbfbf' }} />}
            />
          </Form.Item>

          {/* Project Type Selection */}
          <Form.Item label="Project Type" required>
            <div className={styles.projectTypeSelection}>
              <Card
                className={`${styles.typeCard} ${projectType === 'individual' ? styles.selected : ''}`}
                onClick={() =>
                  handleProjectTypeChange({ target: { value: 'individual' } })
                }
                hoverable
              >
                <div className={styles.typeCardContent}>
                  <UserOutlined className={styles.typeIcon} />
                  <div>
                    <div className={styles.typeTitle}>Individual Project</div>
                    <div className={styles.typeDescription}>
                      Each student works independently
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                className={`${styles.typeCard} ${projectType === 'group' ? styles.selected : ''}`}
                onClick={() =>
                  handleProjectTypeChange({ target: { value: 'group' } })
                }
                hoverable
              >
                <div className={styles.typeCardContent}>
                  <TeamOutlined className={styles.typeIcon} />
                  <div>
                    <div className={styles.typeTitle}>Group Project</div>
                    <div className={styles.typeDescription}>
                      Students work in teams
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </Form.Item>

          {/* Group Information Display - Only for group projects */}
          {projectType === 'group' && (
            <Form.Item label="Groups Formed">
              <div className={styles.groupsInfo}>
                {studentStore.groupStudentsList && studentStore.groupStudentsList.length > 0 ? (
                  <div className={styles.groupsList}>
                    {studentStore.groupStudentsList.map((group, index) => (
                      <Card
                        key={group.groupName || index}
                        size="small"
                        className={styles.groupCard}
                      >
                        <div className={styles.groupHeader}>
                          <TeamOutlined />
                          <span className={styles.groupName}>
                            {group.groupName }
                          </span>
                          <span className={styles.memberCount}>
                            ({group.studentIds ? group.studentIds.length : 0}{' '}
                            members)
                          </span>
                        </div>
                        {group.students && group.students.length > 0 && (
                          <div className={styles.groupMembers}>
                            {group.students.map((student) => (
                              <span
                                key={student.studentId}
                                className={styles.memberTag}
                              >
                                {`${student.studentName} `}
                              </span>
                            ))}
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noGroups}>
                    <UsergroupAddOutlined
                      style={{ fontSize: '24px', color: '#ccc' }}
                    />
                    <span>
                      No groups formed yet. Click "Form Groups" to create
                      groups.
                    </span>
                  </div>
                )}
              </div>
            </Form.Item>
          )}

          {/* Action buttons area */}
          <div className={styles.actionButtons}>
            {/* Only show Form Groups button for group projects */}
            {projectType === 'group' && (
              <Button
                icon={<UsergroupAddOutlined />}
                size="large"
                className={styles.actionButton}
                onClick={() => {
                  // Save current form data
                  saveFormData();
                  // Navigate to group formation page
                  history.push(`/${subjectId}/formGroups`);
                }}
              >
                Form Groups
              </Button>
            )}

            <Button
              icon={<TeamOutlined />}
              size="large"
              className={styles.actionButton}
              onClick={() => {
                // Save current form data
                saveFormData();
                // Navigate to marker selection page
                history.push('/selectMarker');
              }}
            >
              Assign Markers
            </Button>
          </div>

          {/* Submit button */}
          <div className={styles.submitSection}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.submitButton}
              loading={submitting}
            >
              Create Project
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
});

export default CreateProject;
