import { useEffect, useMemo, useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Table,
  message,
  Popconfirm,
  Modal,
  Select,
} from 'antd';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  UserAddOutlined,
  TagsOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { history, useLocation, useParams } from 'umi';
import { observer } from 'mobx-react-lite';
import { getSubjectsDetail } from '../apis/getSubject';
import { getAllMarkers } from '../apis/getAllMarkers';
import { updateSubject } from '../apis/updateSubject';
import { useStores } from '../stores';
import subjectStore from '../stores/subjectStore';
import styles from './manageSubject.module.less';

const { Title } = Typography;
const { TextArea } = Input;

const ManageSubject = observer(() => {
  const [form] = Form.useForm();
  const { id } = useParams();
  const location = useLocation();
  const { studentStore, markerStore } = useStores();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allMarkers, setAllMarkers] = useState([]);
  const [initialMarkers, setInitialMarkers] = useState([]);
  const [addMarkerOpen, setAddMarkerOpen] = useState(false);
  const [pendingMarkerIds, setPendingMarkerIds] = useState([]);

  const selectionDraftKey = useMemo(
    () => `manageSubjectSelectionDraft_${id}`,
    [id]
  );
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );
  const debugApi = searchParams.get('debugApi') === '1';
  const fromSelection = searchParams.get('fromSelection') === '1';
  const selectionSource = searchParams.get('source');

  const saveSelectionDraft = (next = {}) => {
    const values = form.getFieldsValue();
    const draft = {
      name: values.name || '',
      description: values.description || '',
      students: studentStore.students.slice(),
      markerIds: markerStore.selectedMarkerIds.slice(),
      ...next,
    };
    sessionStorage.setItem(selectionDraftKey, JSON.stringify(draft));
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        if (!id || Number.isNaN(Number(id))) {
          message.error(`Invalid subject id: ${id}`);
          return;
        }

        const rawSelectionDraft = sessionStorage.getItem(selectionDraftKey);
        const selectionDraft = rawSelectionDraft
          ? JSON.parse(rawSelectionDraft)
          : null;

        if (fromSelection && selectionDraft) {
          const safeDraft = selectionDraft;
          form.setFieldsValue({
            name: safeDraft.name || '',
            description: safeDraft.description || '',
          });
          const shouldSyncStudents =
            !selectionSource || selectionSource === 'students';
          const shouldSyncMarkers = !selectionSource || selectionSource === 'markers';

          if (shouldSyncStudents) {
            studentStore.clearStudents();
            (safeDraft.students || []).forEach((stu) => studentStore.addStudent(stu));
          }
          if (shouldSyncMarkers) {
            markerStore.setSelected((safeDraft.markerIds || []).map((m) => Number(m)));
          }
        } else {
          sessionStorage.removeItem(selectionDraftKey);
          const subjectRes = await getSubjectsDetail(id);
          if (debugApi) {
            console.log(
              '[manageSubject] getSubjectsDetail raw response:',
              subjectRes
            );
          }
          if (subjectRes?.code && Number(subjectRes.code) !== 200) {
            message.error(
              subjectRes.message || 'Failed to get subject details'
            );
            return;
          }

          const detailData = Array.isArray(subjectRes?.data)
            ? subjectRes.data[0]
            : subjectRes?.data;
          const subjectData = detailData || {};
          const subjectName = subjectData.name || '';

          if (debugApi) {
            console.log(
              '[manageSubject] normalized subject data:',
              subjectData
            );
          }

          form.setFieldsValue({
            name: subjectName,
            description: subjectData.description || '',
          });

          const studentList = Array.isArray(subjectData.students)
            ? subjectData.students
            : [];
          studentStore.clearStudents();
          studentList.forEach((stu) => studentStore.addStudent(stu));

          const markers = Array.isArray(subjectData.markers)
            ? subjectData.markers
            : [];

          if (debugApi) {
            console.log('[manageSubject] students/markers count:', {
              students: studentList.length,
              markers: markers.length,
            });
          }
          setInitialMarkers(markers);
          const markerIds = markers.map((m) => Number(m.userId || m.id));
          markerStore.setSelected((markerIds || []).map((m) => Number(m)));
        }

        const markerRes = await getAllMarkers();
        setAllMarkers(Array.isArray(markerRes?.data) ? markerRes.data : []);
      } catch (error) {
        const backendMsg =
          error?.response?.data?.message ||
          error?.response?.data?.msg ||
          error?.response?.data?.error;
        console.error('Failed to load subject details:', {
          subjectId: id,
          status: error?.response?.status,
          backend: error?.response?.data,
          error,
        });
        message.error(
          backendMsg ||
            `Failed to load subject data (status ${
              error?.response?.status || 'unknown'
            })`
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [
    debugApi,
    form,
    fromSelection,
    id,
    markerStore,
    selectionSource,
    selectionDraftKey,
    studentStore,
  ]);

  const handleBack = () => {
    sessionStorage.removeItem(selectionDraftKey);
    studentStore.clearStudents();
    markerStore.clearSelected();
    history.push(`/subjectDetails/${id}`);
  };

  const handleRemoveStudent = (studentId) => {
    studentStore.deleteStudent(studentId);
  };

  const handleRemoveMarker = (markerId) => {
    const next = markerStore.selectedMarkerIds.filter(
      (idItem) => Number(idItem) !== Number(markerId)
    );
    markerStore.setSelected(next);
  };

  const availableMarkerOptions = useMemo(() => {
    const selectedSet = new Set(
      (markerStore.selectedMarkerIds || [])
        .map((v) => markerStore.normalizeId(v))
        .filter((v) => v != null)
    );

    return (Array.isArray(allMarkers) ? allMarkers : [])
      .map((m) => {
        const idValue = markerStore.normalizeId(m?.userId ?? m?.id);
        if (idValue == null || selectedSet.has(idValue)) return null;
        const roleText = m?.role === 1 ? 'Admin' : m?.role === 2 ? 'Marker' : '';
        const label = `${m?.userName || m?.name || `Marker ${idValue}`}${
          roleText ? ` (${roleText})` : ''
        }`;
        return { value: String(idValue), label };
      })
      .filter(Boolean);
  }, [allMarkers, markerStore, markerStore.selectedMarkerIds]);

  const handleAddMarkers = () => {
    const normalizedToAdd = (Array.isArray(pendingMarkerIds) ? pendingMarkerIds : [])
      .map((v) => markerStore.normalizeId(v))
      .filter((v) => v != null);
    if (normalizedToAdd.length === 0) {
      message.warning('Please choose at least one marker');
      return;
    }

    const existing = (markerStore.selectedMarkerIds || [])
      .map((v) => markerStore.normalizeId(v))
      .filter((v) => v != null);
    const next = [];
    const seen = new Set();
    existing.forEach((v) => {
      if (seen.has(v)) return;
      seen.add(v);
      next.push(v);
    });
    normalizedToAdd.forEach((v) => {
      if (seen.has(v)) return;
      seen.add(v);
      next.push(v);
    });

    const pickedRows = normalizedToAdd
      .map((idValue) =>
        (Array.isArray(allMarkers) ? allMarkers : []).find(
          (m) => markerStore.normalizeId(m?.userId ?? m?.id) === idValue
        )
      )
      .filter(Boolean);

    markerStore.setSelected(next);
    if (pickedRows.length > 0) {
      markerStore.upsertSelectedMarkers(pickedRows);
    }

    setAddMarkerOpen(false);
    setPendingMarkerIds([]);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        id: Number(id),
        name: values.name,
        description: values.description,
        students: studentStore.students.slice().map((student) => ({
          id: student.id,
          studentId: Number(student.studentId),
          email: student.email,
          firstName: student.firstName,
          surname: student.surname,
        })),
        markerIds: markerStore.selectedMarkerIds.map((markerId) =>
          Number(markerId)
        ),
      };

      if (payload.students.length === 0) {
        message.warning('Please add at least one student');
        return;
      }
      if (payload.markerIds.length === 0) {
        message.warning('Please assign at least one marker');
        return;
      }

      setSaving(true);
      const res = await updateSubject(payload);
      if (res.code === 200) {
        subjectStore.upsertSubjectCache({
          id: Number(id),
          name: values.name,
          description: values.description,
        });
        message.success('Subject updated successfully');
        sessionStorage.removeItem(selectionDraftKey);
        studentStore.clearStudents();
        markerStore.clearSelected();
        history.push(`/subjectDetails/${id}`);
      } else {
        message.error(res.message || res.msg || 'Failed to update subject');

        const subjectRes = await getSubjectsDetail(id);
        if (subjectRes?.code && Number(subjectRes.code) !== 200) {
          message.error(
            subjectRes.message || 'Failed to get subject details'
          );
          return;
        }

        const detailData = Array.isArray(subjectRes?.data)
          ? subjectRes.data[0]
          : subjectRes?.data;
        const subjectData = detailData || {};

        const studentList = Array.isArray(subjectData.students)
          ? subjectData.students
          : [];
        studentStore.clearStudents();
        studentList.forEach((stu) => studentStore.addStudent(stu));

      }
    } catch (error) {
      if (error?.errorFields) {
        return;
      }
      const backendMsg =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        error?.response?.data?.error;
      console.error('Save subject failed:', {
        payloadPreview: {
          id: Number(id),
          students: studentStore.students.length,
          markerIds: markerStore.selectedMarkerIds.slice(),
        },
        status: error?.response?.status,
        backend: error?.response?.data,
        error,
      });
      message.error(backendMsg || 'Request failed. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const markerRows = markerStore.selectedMarkerIds
    .map((markerId) => {
      const found = allMarkers.find(
        (marker) => Number(marker.userId) === Number(markerId)
      );
      const fallback = initialMarkers.find(
        (marker) => Number(marker.userId || marker.id) === Number(markerId)
      );
      return {
        userId: markerId,
        userName:
          found?.userName ||
          fallback?.userName ||
          fallback?.name ||
          `Marker ${markerId}`,
        role: found?.role ?? fallback?.role,
      };
    })
    .filter(Boolean);

  const studentColumns = [
    { title: 'Student ID', dataIndex: 'studentId', key: 'studentId' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'First Name', dataIndex: 'firstName', key: 'firstName' },
    { title: 'Surname', dataIndex: 'surname', key: 'surname' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Delete this student?"
          onConfirm={() => handleRemoveStudent(record.studentId)}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  const markerColumns = [
    { title: 'Marker ID', dataIndex: 'userId', key: 'userId' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (role === 1 ? 'Admin' : role === 2 ? 'Marker' : '-'),
    },
    { title: 'Name', dataIndex: 'userName', key: 'userName' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Delete this marker?"
          onConfirm={() => handleRemoveMarker(record.userId)}
        >
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          className={styles.backButton}
          onClick={handleBack}
        >
          Back
        </Button>
        <Title level={2} className={styles.pageTitle}>
          Manage Subject
        </Title>
        <Button
          className={styles.saveButton}
          onClick={handleSave}
          loading={saving}
          icon={<SaveOutlined />}
        >
          Save
        </Button>
      </div>

      <Card className={styles.formCard} loading={loading}>
        <Form form={form} layout="vertical" className={styles.form}>
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

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { max: 500, message: 'Description cannot exceed 500 characters' },
            ]}
          >
            <TextArea
              placeholder="Enter description"
              rows={4}
              showCount
              maxLength={500}
            />
          </Form.Item>

          <div className={styles.actionButtons}>
            <Button
              icon={<UserAddOutlined />}
              size="large"
              className={styles.actionButton}
              onClick={() => {
                saveSelectionDraft();
                history.push(`/selectStudent?fromManage=true&id=${id}&source=students`);
              }}
            >
              Manage Students
            </Button>
            <Button
              icon={<TagsOutlined />}
              size="large"
              className={styles.actionButton}
              onClick={() => {
                saveSelectionDraft();
                history.push(`/selectMarker?fromManage=true&id=${id}&source=markers`);
              }}
            >
              Assign Markers
            </Button>
          </div>
        </Form>
      </Card>

      <Card className={styles.tableCard}>
        <Typography.Title level={4}>
          Selected Students ({studentStore.students.length})
        </Typography.Title>
        <Table
          dataSource={studentStore.students.slice()}
          columns={studentColumns}
          rowKey="studentId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card className={styles.tableCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Typography.Title level={4} style={{ marginBottom: 0, flex: 1 }}>
            Selected Markers ({markerRows.length})
          </Typography.Title>
          <Button
            icon={<TagsOutlined />}
            onClick={() => setAddMarkerOpen(true)}
            disabled={availableMarkerOptions.length === 0}
          >
            Add Marker
          </Button>
        </div>
        <Table
          dataSource={markerRows}
          columns={markerColumns}
          rowKey="userId"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Modal
        title="Add marker"
        open={addMarkerOpen}
        onCancel={() => {
          setAddMarkerOpen(false);
          setPendingMarkerIds([]);
        }}
        onOk={handleAddMarkers}
        okText="Add"
        destroyOnClose
      >
        <Select
          mode="multiple"
          allowClear
          showSearch
          placeholder="Search and select markers"
          options={availableMarkerOptions}
          value={pendingMarkerIds}
          onChange={setPendingMarkerIds}
          style={{ width: '100%' }}
          filterOption={(input, option) =>
            String(option?.label || '')
              .toLowerCase()
              .includes(String(input || '').toLowerCase())
          }
        />
      </Modal>
    </div>
  );
});

export default ManageSubject;
