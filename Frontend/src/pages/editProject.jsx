import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, history } from 'umi';
import { observer } from 'mobx-react-lite';
import {
  Card,
  Empty,
  Table,
  Typography,
  message,
  Form,
  Input,
  InputNumber,
  Button,
  Modal,
  Select,
} from 'antd';
import {
  EditOutlined,
  ArrowLeftOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { getProjectDetail } from '../apis/getProjectDetail';
import { hasMarkingStarted, saveProject } from '../apis/projects';
import MarkerAssignmentPanel from '../components/MarkerAssignmentPanel/MarkerAssignmentPanel';
import { useStores } from '@/stores';
import userStore from '@/stores/userStore';
import styles from './editProject.module.less';

const { Title, Text } = Typography;

function getStudentName(s) {
  if (!s) return '';
  const name =
    s?.studentName ??
    s?.name ??
    `${s?.firstName ?? s?.firstname ?? ''} ${s?.surname ?? ''}`.trim();
  return name || String(s?.studentId ?? s?.id ?? '');
}

function normalizeId(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function normalizeIdList(values) {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.map((v) => normalizeId(v))));
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

function assignmentMapEquals(a, b) {
  const aKeys = Object.keys(a || {});
  const bKeys = Object.keys(b || {});
  if (aKeys.length !== bKeys.length) return false;
  return bKeys.every((key) => arrayEquals(a?.[key] || [], b?.[key] || []));
}

function extractMarkerIds(list) {
  if (!Array.isArray(list)) return [];
  return normalizeIdList(
    list.map((item) =>
      typeof item === 'object' ? (item?.id ?? item?.userId) : item
    )
  );
}

/**
 * Convert API assessment item to assessmentStore element format
 */
function assessmentToElement(a) {
  return {
    elementId: a?.elementId,
    Name: a?.name ?? a?.Name ?? '',
    weighting: a?.weighting ?? 0,
    maximumMark: a?.maxMark ?? a?.maximumMark ?? 10,
    markIncrements: a?.markIncrements ?? 0.5,
  };
}

/**
 * Convert assessmentStore element to API elements format
 */
function elementToApi(el) {
  return {
    elementId: el.elementId,
    name: el.Name ?? el.name ?? '',
    weighting: el.weighting,
    maximumMark: el.maximumMark,
    markIncrements: el.markIncrements,
  };
}

/**
 * Convert project teams to studentStore group format
 */
function teamsToGroupStudents(teams) {
  if (!Array.isArray(teams)) return [];
  return teams.map((team) => {
    const students = Array.isArray(team.students) ? team.students : [];
    const g = {
      groupName: team.name ?? '',
      markerIds: extractMarkerIds(team.markers),
      studentIds: students.map((s) => s.studentId),
      students: students.map((s) => ({
        ...s,
        studentName: `${s?.firstName ?? ''} ${s?.surname ?? ''}`.trim(),
      })),
    };
    if (team.id != null) g.groupId = team.id;
    return g;
  });
}

const EditProject = observer(() => {
  const { projectId, subjectId } = useParams();
  const [form] = Form.useForm();
  const { assessmentStore, markerStore, studentStore, projectStore } =
    useStores();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [assignmentMap, setAssignmentMap] = useState({});
  const [selectedAssignmentRowKeys, setSelectedAssignmentRowKeys] = useState(
    []
  );
  const [bulkMarkerIds, setBulkMarkerIds] = useState([]);
  const [isMarking, setIsMarking] = useState(false);

  const isMarker = String(userStore.role) === '2';

  useEffect(() => {
    if (!isMarker) return;
    message.error('Only admin can access Edit Project');
    history.replace(subjectId ? `/subjectDetails/${subjectId}` : '/subject');
  }, [isMarker, subjectId]);

  if (isMarker) {
    return (
      <div className={styles.detailsPage}>
        <Empty description="Permission denied" />
      </div>
    );
  }

  const isIndividual =
    (detail?.projectType ?? 'individual').toLowerCase() === 'individual';

  useEffect(() => {
    let cancelled = false;
    hasMarkingStarted(projectId)
      .then((res) => {
        if (cancelled) return;
        setIsMarking(Boolean(res?.data));
      })
      .catch(() => {
        if (cancelled) return;
        setIsMarking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const firstDescription =
    Array.isArray(detail?.description) && detail.description[0]
      ? detail.description[0]
      : null;
  const rawAssessment = Array.isArray(firstDescription?.assessment)
    ? firstDescription.assessment
    : [];

  /** Students from getProjectDetail: individual => data.students; group => flattened from teams */
  const studentsFromDetail = useMemo(() => {
    if (!detail) return [];
    const pt = (detail.projectType || '').toLowerCase();
    if (pt === 'individual') {
      return Array.isArray(detail.students) ? detail.students : [];
    }
    if (pt === 'group') {
      const teams = Array.isArray(detail.teams) ? detail.teams : [];
      return teams.flatMap((t) => t.students || []);
    }
    return Array.isArray(detail.students) ? detail.students : [];
  }, [detail]);

  const selectedMarkerPool = normalizeIdList(
    Array.from(markerStore.selectedMarkerIds || [])
  );
  const selectedMarkerPoolSignature = selectedMarkerPool.join('|');
  const selectedMarkerPoolSet = useMemo(
    () => new Set(selectedMarkerPool),
    [selectedMarkerPoolSignature]
  );

  const sanitizeMarkerIds = useCallback(
    (ids) => {
      return normalizeIdList(ids).filter((id) => selectedMarkerPoolSet.has(id));
    },
    [selectedMarkerPoolSet]
  );

  useEffect(() => {
    const applyDetail = (res) => {
      if (!res || typeof res !== 'object') return;
      setDetail(res);
      form.setFieldsValue({
        name: res.projectName ?? res.name ?? '',
        timer: (() => {
          const rawCountdown = Number(res.description?.[0]?.countdown);
          if (!Number.isFinite(rawCountdown)) return null;
          // Backend gives ms; local cache stores minutes.
          return rawCountdown > 1000
            ? Math.max(0, Math.floor(rawCountdown / (60 * 1000)))
            : Math.max(0, Math.floor(rawCountdown));
        })(),
      });
      const elements = (
        Array.isArray(res.description?.[0]?.assessment)
          ? res.description[0].assessment
          : []
      ).map(assessmentToElement);
      if (elements.length > 0) assessmentStore.setElements(elements);
      else assessmentStore.clearElements();

      const markers = Array.isArray(res.markers) ? res.markers : [];
      if (markers.length > 0 && markerStore.selectedMarkerIds.length === 0) {
        markerStore.setSelectedWithDetails(markers);
      }

      if ((res.projectType || '').toLowerCase() === 'group') {
        const teams = Array.isArray(res.teams) ? res.teams : [];
        const groupStudents = teamsToGroupStudents(teams);
        if (
          groupStudents.length > 0 &&
          !studentStore.groupStudentsList?.length
        ) {
          studentStore.setGroupStudents(groupStudents);
          studentStore.setGroups(
            groupStudents.map((g) => ({
              groupName: g.groupName,
              studentIds: g.studentIds,
            }))
          );
        }
      }
    };

    const cached = projectStore.getEditProjectDetail(projectId);
    if (cached) {
      applyDetail(cached);
      return;
    }

    // Fresh entry to edit page: clear stale cross-project draft state in stores.
    assessmentStore.clearElements();
    markerStore.clearSelected();
    studentStore.clearGroupStudents();
    studentStore.clearGroups();

    let cancelled = false;
    setLoading(true);
    getProjectDetail(projectId)
      .then((res) => {
        if (cancelled) return;
        if (!res) {
          message.error('Failed to load project detail');
          return;
        }
        projectStore.setEditProjectDetail(projectId, res);
        applyDetail(res);
      })
      .catch((e) => {
        if (!cancelled) {
          console.error(e);
          message.error('Failed to load project detail');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleBack = () => {
    Modal.confirm({
      title: 'Leave without saving?',
      content:
        'All changes will not be saved. Are you sure you want to leave this page?',
      okText: 'Leave',
      okType: 'danger',
      cancelText: 'Stay',
      onOk: () => {
        assessmentStore.clearElements();
        studentStore.clearGroupStudents();
        studentStore.clearGroups();
        markerStore.clearSelected();
        projectStore.clearEditProjectDetail(projectId);
        history.go(-1);
      },
    });
  };

  const handleSave = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      const name = values.name?.trim();
      if (!name) return message.warning('Project name cannot be empty');
      let payload = {
        projectId: Number(projectId),
        name,
      };

      if (!isMarking) {
        if (!assessmentStore.hasElements) {
          return message.warning(
            'Please configure at least one assessment criterion'
          );
        }
        if (markerStore.selectedMarkerIds.length === 0) {
          return message.warning('Please assign at least one marker');
        }

        const timerNum = Number(values.timer);
        const countdown = Number.isFinite(timerNum)
          ? Math.max(0, Math.floor(timerNum)) * 60 * 1000
          : null;
        if (countdown == null || countdown <= 0) {
          return message.warning(
            'Time (countdown) cannot be empty and must be greater than 0'
          );
        }

        const pt = (detail?.projectType ?? 'individual').toLowerCase();
        if (assignmentRows.length === 0) {
          return message.warning(
            pt === 'group'
              ? 'Please form groups before assigning markers'
              : 'No students found for assignment'
          );
        }

        const missingAssignments = assignmentRows.filter(
          (row) => !sanitizeMarkerIds(assignmentMap[row.__rowKey]).length
        );
        if (missingAssignments.length > 0) {
          return message.warning(
            `${missingAssignments.length} ${
              pt === 'group' ? 'group(s)' : 'student(s)'
            } have no marker assigned`
          );
        }

        const markerStudents =
          pt === 'individual'
            ? individualAssignmentRows.map((student) => ({
                studentId: normalizeId(student.studentId),
                markerIds: sanitizeMarkerIds(
                  assignmentMap[student.__rowKey] || []
                ),
              }))
            : [];
        const groupList = studentStore.groupStudentsList ?? [];
        if (pt === 'group' && groupList.length === 0) {
          return message.warning('Please form at least one group');
        }
        const groups =
          pt === 'group'
            ? groupList.map((g) => {
                const rowKey = String(g.groupId ?? g.id ?? g.groupName);
                const apiGroup = {
                  groupName: g.groupName,
                  studentIds: g.studentIds ?? [],
                  markerIds: sanitizeMarkerIds(assignmentMap[rowKey] || []),
                };
                if (g.groupId != null) apiGroup.groupId = g.groupId;
                return apiGroup;
              })
            : [];

        const elements = assessmentStore.elementList.map(elementToApi);
        if (elements.some((item) => item.elementId == null)) {
          return message.warning(
            'Invalid assessment criteria: missing elementId.'
          );
        }
        payload = {
          ...payload,
          countdown,
          markerList: markerStore.selectedMarkerIds.slice(),
          elements,
          markerStudents,
          groups,
        };
      }

      setSaving(true);
      const res = await saveProject(payload);

      if (res?.code === 200) {
        message.success('Project saved successfully');
        assessmentStore.clearElements();
        markerStore.clearSelected();
        studentStore.clearGroupStudents();
        studentStore.clearGroups();
        projectStore.clearEditProjectDetail(projectId);
        history.go(-1);
      } else {
        message.error(res?.message || res?.msg || 'Failed to save project');
      }
    } catch (err) {
      if (err?.errorFields) return;
      message.error(err?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const persistFormToCache = () => {
    const values = form.getFieldsValue();
    const cached = projectStore.getEditProjectDetail(projectId);
    if (!cached) return;

    const countdownMinutes = Number.isFinite(Number(values.timer))
      ? Math.max(0, Math.floor(Number(values.timer)))
      : null;
    const baseDescription =
      Array.isArray(cached.description) && cached.description[0]
        ? cached.description[0]
        : {};
    let description = [
      {
        ...baseDescription,
        ...(countdownMinutes != null && { countdown: countdownMinutes }),
      },
    ];

    if (assessmentStore.hasElements) {
      description[0].assessment = assessmentStore.elementList.map((el) => ({
        elementId: el.elementId,
        name: el.Name ?? el.name ?? '',
        weighting: el.weighting,
        maxMark: el.maximumMark,
        markIncrements: el.markIncrements,
      }));
    }

    const projectType = (cached.projectType || '').toLowerCase();
    const mergeMarkers = (items) =>
      (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        markers: sanitizeMarkerIds(assignmentMap[String(item.id)] || []),
      }));

    projectStore.setEditProjectDetail(projectId, {
      ...cached,
      projectName: values.name ?? cached.projectName ?? cached.name,
      name: values.name ?? cached.name ?? cached.projectName,
      description,
      ...(projectType === 'individual'
        ? { students: mergeMarkers(cached.students) }
        : { teams: mergeMarkers(cached.teams) }),
    });
  };

  const handleConfigureCriteria = () => {
    persistFormToCache();
    history.push(`/criteriaEditor?fromEditProject=${projectId}`);
  };

  const handleFormGroups = () => {
    persistFormToCache();
    const teams = Array.isArray(detail?.teams) ? detail.teams : [];
    const groupStudents = teamsToGroupStudents(teams);
    if (groupStudents.length > 0) {
      studentStore.setGroupStudents(groupStudents);
      studentStore.setGroups(
        groupStudents.map((g) => ({
          groupName: g.groupName,
          studentIds: g.studentIds,
        }))
      );
    }
    history.push(`/${subjectId}/formGroups?fromEditProject=${projectId}`);
  };

  const handleEditMarkers = () => {
    persistFormToCache();
    history.push(`/selectMarker?fromEditProject=${projectId}`);
  };

  const teams = useMemo(() => {
    if (studentStore.groupStudentsList?.length > 0) {
      return studentStore.groupStudentsList.map((group) => ({
        id: group.groupId ?? group.id,
        name: group.groupName,
        markerIds: group.markerIds || [],
        students: group.students || [],
      }));
    }

    if (Array.isArray(detail?.teams)) {
      return detail.teams.map((team) => ({
        ...team,
        markerIds: extractMarkerIds(team.markers),
      }));
    }

    return [];
  }, [detail?.teams, studentStore.groupStudentsList]);

  const markerOptions = markerStore.selectedMarkers.map((marker) => {
    const id = Number(marker.id);
    return {
      value: id,
      label: `${marker.name ?? `Marker ${id}`} (#${id})`,
    };
  });

  const individualAssignmentRows = useMemo(
    () =>
      studentsFromDetail.map((student) => ({
        ...student,
        __rowKey: String(student.id),
      })),
    [studentsFromDetail]
  );

  const groupAssignmentRows = useMemo(
    () =>
      teams.map((team, index) => ({
        ...team,
        groupName: team.name ?? team.groupName ?? `Group ${index + 1}`,
        __rowKey: String(
          team.groupId ??
            team.id ??
            team.name ??
            team.groupName ??
            `group-${index + 1}`
        ),
      })),
    [teams]
  );

  const assignmentRows = isIndividual
    ? individualAssignmentRows
    : groupAssignmentRows;

  const rowSelection = {
    selectedRowKeys: selectedAssignmentRowKeys,
    onChange: (keys) => setSelectedAssignmentRowKeys(keys),
  };

  // Prioritize assessmentStore (user edits from criteriaEditor), fallback to rawAssessment from API
  const assessmentDisplay = assessmentStore.hasElements
    ? assessmentStore.elementList.map((el) => ({
        name: el.Name ?? el.name,
        weighting: el.weighting,
        maxMark: el.maximumMark,
        markIncrements: el.markIncrements,
      }))
    : rawAssessment.map((a) => ({
        name: a.name,
        weighting: a.weighting,
        maxMark: a.maxMark,
        markIncrements: a.markIncrements,
      }));

  const normalizeAssignmentMap = useCallback(
    (sourceMap = {}) => {
      const normalizedMap = {};
      assignmentRows.forEach((row) => {
        normalizedMap[row.__rowKey] = sanitizeMarkerIds(
          sourceMap[row.__rowKey] || []
        );
      });
      return normalizedMap;
    },
    [assignmentRows, sanitizeMarkerIds]
  );

  useEffect(() => {
    if (!detail) return;

    const sourceMap = {};

    if ((detail?.projectType ?? 'individual').toLowerCase() === 'individual') {
      const students = Array.isArray(detail?.students) ? detail.students : [];
      students.forEach((student) => {
        sourceMap[String(student.id)] = extractMarkerIds(student.markers);
      });
    } else {
      const teams = Array.isArray(detail?.teams) ? detail.teams : [];
      teams.forEach((team) => {
        sourceMap[String(team.id)] = extractMarkerIds(team.markers);
      });
    }

    const nextMap = normalizeAssignmentMap(sourceMap);
    setAssignmentMap((prev) =>
      assignmentMapEquals(prev, nextMap) ? prev : nextMap
    );
    setSelectedAssignmentRowKeys([]);
    setBulkMarkerIds([]);
  }, [detail, normalizeAssignmentMap]);

  useEffect(() => {
    setAssignmentMap((prev) => {
      const next = normalizeAssignmentMap(prev);
      if (assignmentMapEquals(prev, next)) return prev;
      return next;
    });

    setSelectedAssignmentRowKeys((prev) => {
      const keySet = new Set(assignmentRows.map((row) => row.__rowKey));
      const filtered = prev.filter((key) => keySet.has(key));
      if (
        filtered.length === prev.length &&
        filtered.every((key, i) => key === prev[i])
      ) {
        return prev;
      }
      return filtered;
    });
  }, [assignmentRows, normalizeAssignmentMap]);

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
      return next;
    });
  };

  const unassignedCount = useMemo(
    () =>
      assignmentRows.filter(
        (row) => !(assignmentMap[row.__rowKey] || []).length
      ).length,
    [assignmentMap, assignmentRows]
  );

  const studentColumns = useMemo(
    () => [
      {
        title: 'Student ID',
        dataIndex: 'studentId',
        width: 120,
        render: (_, r) => r.studentId ?? r.id ?? '-',
      },
      { title: 'Name', key: 'name', render: (_, r) => getStudentName(r) },
      { title: 'Email', dataIndex: 'email', ellipsis: true },
    ],
    []
  );
  const markerColumns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 120,
        render: (v, r) => v ?? r.userId,
      },
      {
        title: 'Name',
        key: 'name',
        render: (_, r) => r.name ?? r.userName ?? '-',
      },
    ],
    []
  );
  const assessmentColumns = useMemo(
    () => [
      { title: 'Name', dataIndex: 'name' },
      {
        title: 'Weighting',
        dataIndex: 'weighting',
        width: 140,
        render: (v) => (v == null ? '-' : `${v}%`),
      },
      { title: 'Max Mark', dataIndex: 'maxMark', width: 120 },
      { title: 'Mark Increments', dataIndex: 'markIncrements', width: 160 },
    ],
    []
  );
  const teamColumns = useMemo(
    () => [
      { title: 'Team Name', dataIndex: 'name' },
      {
        title: 'Students',
        key: 'studentsCount',
        width: 140,
        render: (_, r) =>
          Array.isArray(r.students)
            ? r.students.length
            : (r.studentIds?.length ?? 0),
      },
    ],
    []
  );

  const renderMarkerSelector = useCallback(
    (rowKey) => (
      <Select
        mode="multiple"
        allowClear
        showSearch
        placeholder="Select markers"
        value={assignmentMap[rowKey] || []}
        options={markerOptions}
        onChange={(ids) => {
          const next = sanitizeMarkerIds(ids);
          setAssignmentMap((prev) => ({ ...prev, [rowKey]: next }));
        }}
        style={{ width: '100%' }}
        disabled={markerOptions.length === 0}
      />
    ),
    [assignmentMap, markerOptions, sanitizeMarkerIds]
  );

  const assignedMarkersColumn = useMemo(
    () => ({
      title: 'Assigned Markers',
      key: 'markers',
      width: 460,
      render: (_, row) => renderMarkerSelector(row.__rowKey),
    }),
    [renderMarkerSelector]
  );

  const individualAssignmentColumns = useMemo(
    () => [
      { title: 'Student ID', dataIndex: 'studentId', width: 140 },
      {
        title: 'Name',
        key: 'name',
        render: (_, row) => getStudentName(row) || '-',
      },
      assignedMarkersColumn,
    ],
    [assignedMarkersColumn]
  );

  const groupAssignmentColumns = useMemo(
    () => [
      { title: 'Group Name', dataIndex: 'groupName', render: (v) => v || '-' },
      {
        title: 'Members',
        key: 'members',
        width: 120,
        render: (_, row) =>
          Array.isArray(row.students) ? row.students.length : 0,
      },
      assignedMarkersColumn,
    ],
    [assignedMarkersColumn]
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
        render: (_, row) => getStudentName(row) || row?.studentName || '-',
      },
    ],
    []
  );

  return (
    <div className={styles.detailsPage}>
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
          {detail?.projectName
            ? `Edit Project - ${detail.projectName}`
            : 'Edit Project'}
        </Title>
      </div>
      {isMarking && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          You can only edit the project after the marking has started.
        </div>
      )}
      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <Card
            className={styles.projectSection}
            title={<Text strong>Project Details</Text>}
            loading={loading && !detail}
          >
            {detail && (
              <Form form={form} layout="vertical">
                <Form.Item label="Project ID">
                  <Input value={detail.projectId ?? projectId} disabled />
                </Form.Item>
                <Form.Item label="Project Type">
                  <Input
                    value={isIndividual ? 'Individual' : 'Group'}
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="Project Name"
                  rules={[
                    { required: true, message: 'Project name cannot be empty' },
                    { min: 1, message: 'Project name cannot be empty' },
                  ]}
                >
                  <Input placeholder="Enter project name" />
                </Form.Item>
                <Form.Item
                  name="timer"
                  label="Time (minutes)"
                  rules={
                    isMarking
                      ? []
                      : [
                          { required: true, message: 'Time cannot be empty' },
                          {
                            type: 'number',
                            min: 1,
                            message: 'Time must be at least 1 minute',
                          },
                        ]
                  }
                >
                  <InputNumber
                    min={1}
                    placeholder="Minutes"
                    style={{ width: '100%' }}
                    disabled={isMarking}
                  />
                </Form.Item>
              </Form>
            )}
            {!detail && !loading && <Empty description="No project detail" />}
          </Card>

          {detail && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Assessment Criteria</Text>}
              extra={
                !isMarking ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleConfigureCriteria}
                  >
                    Configure
                  </Button>
                ) : null
              }
            >
              {assessmentDisplay.length > 0 ? (
                <Table
                  rowKey={(_, idx) => `assessment-${idx}`}
                  size="middle"
                  dataSource={assessmentDisplay}
                  columns={assessmentColumns}
                  pagination={false}
                />
              ) : (
                <Empty description="No assessment criteria. Click Configure." />
              )}
            </Card>
          )}

          {detail && isIndividual && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Students</Text>}
            >
              {studentsFromDetail.length > 0 ? (
                <Table
                  rowKey={(r) => String(r.id)}
                  size="middle"
                  dataSource={studentsFromDetail}
                  columns={studentColumns}
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No students" />
              )}
              <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                Students cannot be changed for individual projects.
              </Text>
            </Card>
          )}

          {detail && !isIndividual && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Teams</Text>}
              extra={
                !isMarking ? (
                  <Button
                    type="primary"
                    icon={<UsergroupAddOutlined />}
                    onClick={handleFormGroups}
                  >
                    Form Groups
                  </Button>
                ) : null
              }
            >
              {teams.length > 0 ? (
                <Table
                  rowKey={(r) => String(r.id ?? r.groupId ?? r.name ?? '')}
                  size="middle"
                  dataSource={teams}
                  columns={teamColumns}
                  pagination={{ pageSize: 10 }}
                  expandable={{
                    expandedRowRender: (team) => {
                      const teamStudents = Array.isArray(team.students)
                        ? team.students
                        : [];
                      return teamStudents.length ? (
                        <Table
                          rowKey={(r) => String(r.studentId)}
                          size="small"
                          dataSource={teamStudents}
                          columns={studentColumns}
                          pagination={false}
                        />
                      ) : (
                        <Empty description="No students" />
                      );
                    },
                    rowExpandable: (team) =>
                      Array.isArray(team.students) && team.students.length > 0,
                  }}
                />
              ) : (
                <Empty description="No teams. Click Form Groups to configure." />
              )}
            </Card>
          )}

          {detail && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Markers</Text>}
              extra={
                !isMarking ? (
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleEditMarkers}
                  >
                    Edit
                  </Button>
                ) : null
              }
            >
              {markerStore.selectedMarkers.length > 0 ? (
                <Table
                  rowKey={(r) => String(r.id ?? r.userId)}
                  size="middle"
                  dataSource={markerStore.selectedMarkers}
                  columns={markerColumns}
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No markers. Click Edit to assign." />
              )}
            </Card>
          )}

          {detail && !isMarking && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Marker Assignments</Text>}
              loading={loading}
            >
              <MarkerAssignmentPanel
                projectType={isIndividual ? 'individual' : 'group'}
                assignmentRows={assignmentRows}
                unassignedCount={unassignedCount}
                selectedMarkerPoolCount={selectedMarkerPool.length}
                markerOptions={markerOptions}
                bulkMarkerIds={bulkMarkerIds}
                onBulkMarkerIdsChange={(ids) =>
                  setBulkMarkerIds(sanitizeMarkerIds(ids))
                }
                onApplyBulkAssignment={applyBulkAssignment}
                rowSelection={rowSelection}
                individualColumns={individualAssignmentColumns}
                groupColumns={groupAssignmentColumns}
                groupMemberColumns={groupMemberColumns}
                pageSize={10}
                markerPoolEmptyDescription="Please assign markers first (Edit button above)."
                groupRowsEmptyDescription="No groups available. Please form groups first."
                individualRowsEmptyDescription="No students available."
              />
            </Card>
          )}

          {detail && (
            <div className={styles.footerButtons}>
              <Button onClick={handleBack}>Cancel</Button>
              <Button
                type="primary"
                onClick={handleSave}
                loading={saving}
                className={styles.saveButton}
              >
                SAVE
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default EditProject;
