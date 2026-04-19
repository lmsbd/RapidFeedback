import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
  Select,
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
import { history, useParams } from 'umi';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores';
import { createProject } from '../apis/projects';
import { getStudentListBySubject } from '../apis/getStudents';
import { getAllMarkers } from '../apis/getAllMarkers';
import MarkerAssignmentPanel from '../components/MarkerAssignmentPanel/MarkerAssignmentPanel';
import styles from './createProject.module.less';

const { Title, Text } = Typography;

function normalizeId(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function normalizeIdList(values) {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.map((v) => normalizeId(v))));
}

function getStudentDisplayName(student) {
  if (student?.studentName) return student.studentName;
  if (student?.name) return student.name;
  return `${student?.firstName || ''} ${student?.surname || ''}`.trim();
}

function arrayEquals(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const CreateProject = observer(() => {
  const { subjectId } = useParams();
  const [form] = Form.useForm();
  const { studentStore, markerStore, assessmentStore, projectStore } = useStores();
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [projectType, setProjectType] = useState('individual'); // 'individual' or 'group'
  const [assignmentMap, setAssignmentMap] = useState({});
  const [selectedAssignmentRowKeys, setSelectedAssignmentRowKeys] = useState([]);
  const [bulkMarkerIds, setBulkMarkerIds] = useState([]);
  const [markerDirectory, setMarkerDirectory] = useState([]);

  const selectedMarkerPool = useMemo(
    () => normalizeIdList(markerStore.selectedMarkerIds),
    [markerStore.selectedMarkerIds]
  );

  const sanitizeMarkerIds = useCallback(
    (ids) => {
      const allowed = new Set(selectedMarkerPool);
      return normalizeIdList(ids).filter((id) => allowed.has(id));
    },
    [selectedMarkerPool]
  );

  const individualRows = useMemo(
    () =>
      (studentStore.subjectStudentsList || []).map((student) => ({
        ...student,
        __rowKey: String(student.studentId),
      })),
    [studentStore.subjectStudentsList]
  );

  const groupRows = useMemo(
    () =>
      (studentStore.groupStudentsList || []).map((group, index) => ({
        ...group,
        __rowKey: String(group.groupName || `group-${index + 1}`),
      })),
    [studentStore.groupStudentsList]
  );

  const assignmentRows = projectType === 'group' ? groupRows : individualRows;

  const markerOptions = useMemo(() => {
    const markerMap = new Map(
      (markerDirectory || []).map((m) => [normalizeId(m.userId ?? m.id), m])
    );
    return selectedMarkerPool.map((id) => {
      const marker = markerMap.get(id);
      return {
        value: id,
        label: marker
          ? `${marker.userName || marker.name || `Marker ${id}`} (#${id})`
          : `Marker #${id}`,
      };
    });
  }, [markerDirectory, selectedMarkerPool]);

  const rowSelection = {
    selectedRowKeys: selectedAssignmentRowKeys,
    onChange: (keys) => setSelectedAssignmentRowKeys(keys),
  };

  const individualColumns = useMemo(
    () => [
      { title: 'Student ID', dataIndex: 'studentId', width: 140 },
      {
        title: 'Name',
        key: 'name',
        render: (_, row) => getStudentDisplayName(row) || '-',
      },
      {
        title: 'Assigned Markers',
        key: 'markers',
        width: 460,
        render: (_, row) => (
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="Select markers"
            value={assignmentMap[row.__rowKey] || []}
            options={markerOptions}
            onChange={(ids) => {
              const next = sanitizeMarkerIds(ids);
              setAssignmentMap((prev) => {
                const updated = { ...prev, [row.__rowKey]: next };
                projectStore.setCreateProjectAssignments(projectType, updated);
                return updated;
              });
            }}
            style={{ width: '100%' }}
            disabled={markerOptions.length === 0}
          />
        ),
      },
    ],
    [assignmentMap, markerOptions, projectStore, projectType, sanitizeMarkerIds]
  );

  const groupColumns = useMemo(
    () => [
      {
        title: 'Group Name',
        dataIndex: 'groupName',
        render: (v) => v || '-',
      },
      {
        title: 'Members',
        key: 'members',
        width: 120,
        render: (_, row) => (Array.isArray(row.students) ? row.students.length : 0),
      },
      {
        title: 'Assigned Markers',
        key: 'markers',
        width: 460,
        render: (_, row) => (
          <Select
            mode="multiple"
            allowClear
            showSearch
            placeholder="Select markers"
            value={assignmentMap[row.__rowKey] || []}
            options={markerOptions}
            onChange={(ids) => {
              const next = sanitizeMarkerIds(ids);
              setAssignmentMap((prev) => {
                const updated = { ...prev, [row.__rowKey]: next };
                projectStore.setCreateProjectAssignments(projectType, updated);
                return updated;
              });
            }}
            style={{ width: '100%' }}
            disabled={markerOptions.length === 0}
          />
        ),
      },
    ],
    [assignmentMap, markerOptions, projectStore, projectType, sanitizeMarkerIds]
  );

  // Restore form data from store (in-memory only, cleared on refresh)
  useEffect(() => {
    const savedFormData = projectStore.createProjectFormData;
    if (savedFormData) {
      form.setFieldsValue(savedFormData);
      setFormValues(savedFormData);
      if (savedFormData.projectType) {
        const savedType = savedFormData.projectType;
        setProjectType(savedType);
        setAssignmentMap(projectStore.createProjectAssignments?.[savedType] || {});
      }
    }
  }, [form, projectStore]);

  useEffect(() => {
    let cancelled = false;
    const fetchStudents = async () => {
      try {
        studentStore.clearSubjectStudents();
        const res = await getStudentListBySubject(subjectId);
        const list = Array.isArray(res) ? res : res?.data || [];
        if (!cancelled) {
          studentStore.addAllStudents(list);
        }
      } catch (error) {
        console.error(error);
        message.error('Failed to load students for assignment');
      }
    };
    fetchStudents();
    return () => {
      cancelled = true;
    };
  }, [studentStore, subjectId]);

  useEffect(() => {
    let cancelled = false;
    const fetchMarkers = async () => {
      try {
        const res = await getAllMarkers();
        if (!cancelled && res?.code === 200) {
          setMarkerDirectory(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchMarkers();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setAssignmentMap((prev) => {
      const next = {};
      assignmentRows.forEach((row) => {
        next[row.__rowKey] = sanitizeMarkerIds(prev[row.__rowKey] || []);
      });

      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      const sameSize = prevKeys.length === nextKeys.length;
      const sameValues = sameSize
        ? nextKeys.every((k) => arrayEquals(prev[k] || [], next[k] || []))
        : false;

      if (sameValues) return prev;
      projectStore.setCreateProjectAssignments(projectType, next);
      return next;
    });

    setSelectedAssignmentRowKeys((prev) => {
      const validKeySet = new Set(assignmentRows.map((r) => r.__rowKey));
      return prev.filter((k) => validKeySet.has(k));
    });
  }, [assignmentRows, projectStore, projectType, sanitizeMarkerIds]);

  // Handle projectType change from individual to group
  const handleProjectTypeChange = (e) => {
    projectStore.setCreateProjectAssignments(projectType, assignmentMap);
    const newProjectType = e.target.value;
    setProjectType(newProjectType);
    setAssignmentMap(projectStore.createProjectAssignments?.[newProjectType] || {});
    setSelectedAssignmentRowKeys([]);
    setBulkMarkerIds([]);

    const values = form.getFieldsValue();
    const dataToSave = { ...values, projectType: newProjectType };
    projectStore.setCreateProjectFormData(dataToSave);
  };

  const applyBulkAssignment = (mode) => {
    if (!selectedAssignmentRowKeys.length) {
      message.warning('Please select at least one row');
      return;
    }

    if (mode !== 'clear' && !bulkMarkerIds.length) {
      message.warning('Please choose marker(s) for the batch action');
      return;
    }

    const sanitizedBulk = sanitizeMarkerIds(bulkMarkerIds);
    setAssignmentMap((prev) => {
      const next = { ...prev };
      selectedAssignmentRowKeys.forEach((key) => {
        const current = prev[key] || [];
        if (mode === 'append') {
          next[key] = normalizeIdList([...current, ...sanitizedBulk]);
        } else if (mode === 'replace') {
          next[key] = sanitizedBulk;
        } else if (mode === 'remove') {
          const removeSet = new Set(sanitizedBulk);
          next[key] = current.filter((id) => !removeSet.has(id));
        } else {
          next[key] = [];
        }
      });
      projectStore.setCreateProjectAssignments(projectType, next);
      return next;
    });
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
    const markerList = normalizeIdList(markerStore.selectedMarkerIds);

    if (markerList.length === 0) {
      message.warning('Please assign at least one marker');
      return;
    }

    if (assignmentRows.length === 0) {
      message.warning(
        projectType === 'group'
          ? 'Please form groups before assigning markers'
          : 'No students found for assignment'
      );
      return;
    }

    const missingAssignments = assignmentRows.filter(
      (row) => !sanitizeMarkerIds(assignmentMap[row.__rowKey]).length
    );
    if (missingAssignments.length > 0) {
      message.warning(
        `${missingAssignments.length} ${
          projectType === 'group' ? 'group(s)' : 'student(s)'
        } have no marker assigned`
      );
      return;
    }

    const baseProjectData = {
      name: values.name,
      elements: assessmentStore.elementList,  // Get elements from store
      countdown: values.timer ? values.timer * 60 * 1000 : null,
      projectType: projectType,
      markerList,
      subjectId: subjectId,
    };

    // Add type-specific data
    let projectData;
    if (projectType === 'individual') {
      const markerStudents = individualRows.map((student) => ({
        studentId: normalizeId(student.studentId),
        markerIds: sanitizeMarkerIds(assignmentMap[student.__rowKey] || []),
      }));

      projectData = {
        ...baseProjectData,
        markerStudents,
        groups: [],
      };
    } else {
      // For group projects, add groups
      const groupKeyMap = new Map(groupRows.map((group) => [group.groupName, group.__rowKey]));
      const groupsWithMarkers = (studentStore.groups || []).map((group) => {
        const key = groupKeyMap.get(group.groupName);
        return {
          ...group,
          markerIds: sanitizeMarkerIds(assignmentMap[key] || []),
        };
      });

      projectData = {
        ...baseProjectData,
        markerStudents: [],
        groups: groupsWithMarkers,
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

      const hasUnassignedMarkerGroup = projectData.groups.some(
        (group) => !Array.isArray(group.markerIds) || group.markerIds.length === 0
      );
      if (hasUnassignedMarkerGroup) {
        return message.warning('All groups must have at least one marker');
      }
    } else {
      const hasUnassignedMarkerStudent = projectData.markerStudents.some(
        (item) => !Array.isArray(item.markerIds) || item.markerIds.length === 0
      );
      if (hasUnassignedMarkerStudent) {
        return message.warning('All students must have at least one marker');
      }
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
    projectStore.clearCreateProjectAssignments();
    studentStore.clearGroupStudents();
    studentStore.clearGroups();
    studentStore.clearSubjectStudents();
    markerStore.clearSelected();
    assessmentStore.clearElements();
    setAssignmentMap({});
    setSelectedAssignmentRowKeys([]);
    setBulkMarkerIds([]);
  };

  // Save form data to store before navigating (in-memory only)
  const saveFormData = () => {
    const values = form.getFieldsValue();
    const dataToSave = { ...values, projectType };
    projectStore.setCreateProjectFormData(dataToSave);
    projectStore.setCreateProjectAssignments(projectType, assignmentMap);
  };

  const unassignedCount = useMemo(
    () =>
      assignmentRows.filter((row) => !(assignmentMap[row.__rowKey] || []).length)
        .length,
    [assignmentMap, assignmentRows]
  );

  const groupMemberColumns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'studentId',
        width: 120,
      },
      {
        title: 'Name',
        key: 'name',
        render: (_, s) => s?.studentName || '-',
      },
    ],
    []
  );


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
                    {assessmentStore.elementList.map((element) => (
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
                Select Markers
            </Button>
          </div>

          <Form.Item label="Marker Assignment" required>
            <MarkerAssignmentPanel
              projectType={projectType}
              assignmentRows={assignmentRows}
              unassignedCount={unassignedCount}
              selectedMarkerPoolCount={selectedMarkerPool.length}
              markerOptions={markerOptions}
              bulkMarkerIds={bulkMarkerIds}
              onBulkMarkerIdsChange={(ids) => setBulkMarkerIds(sanitizeMarkerIds(ids))}
              onApplyBulkAssignment={applyBulkAssignment}
              rowSelection={rowSelection}
              individualColumns={individualColumns}
              groupColumns={groupColumns}
              groupMemberColumns={groupMemberColumns}
              pageSize={8}
            />
          </Form.Item>

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
