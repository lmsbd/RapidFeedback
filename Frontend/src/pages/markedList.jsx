import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, history, useLocation } from 'umi';
import { Button, Card, Table, Typography, message, Empty } from 'antd';
import { EditOutlined, EyeOutlined, AuditOutlined } from '@ant-design/icons';
import BackButton from '../components/BackButton/BackButton';
import styles from './markedList.module.less';

import {
  getMarkedGroupList,
  getUnmarkedStudentList,
  getMarkedStudentList,
  getUnmarkedGroupList,
} from '../apis/getStudents';
import { getProjectDetail } from '../apis/getProjectDetail';
import subjectStore from '../stores/subjectStore';
import userStore from '../stores/userStore';

const { Title, Text } = Typography;

function getStudentName(student) {
  return `${student?.firstName ?? ''} ${student?.surname ?? ''}`.trim();
}

function getProjectType(rawType) {
  const type = String(rawType || '').toLowerCase();
  if (type.includes('group') || type.includes('team')) return 'group';
  return 'individual';
}

function toScoreText(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : '-';
}

export default function MarkedList() {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [unmarked, setUnmarked] = useState([]);
  const [marked, setMarked] = useState([]);
  const [projectType, setProjectType] = useState('individual');
  const [projectInfo, setProjectInfo] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const location = useLocation();
  const routeProjectName = location.state?.projectName || '';
  const routeProjectType = location.state?.projectType || '';
  const routeSubjectName = location.state?.subjectName || '';
  const routeSubjectId = location.state?.subjectId;
  const subjectIdCacheKey = `markedList:subjectIdByProject:${String(projectId)}`;
  const [subjectId, setSubjectId] = useState(() => {
    if (routeSubjectId) return String(routeSubjectId);
    try {
      const cached = sessionStorage.getItem(subjectIdCacheKey);
      return cached ? String(cached) : null;
    } catch (e) {
      return null;
    }
  });
  const isGroupProject = projectType === 'group';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const detail = await getProjectDetail(projectId);
      const detailSubjectId =
        detail?.subjectId ?? detail?.subjectID ?? detail?.subject?.id;
      if (detailSubjectId) {
        const nextId = String(detailSubjectId);
        setSubjectId(nextId);
        try {
          sessionStorage.setItem(subjectIdCacheKey, nextId);
        } catch (e) {}
      }
      const nextProjectType = getProjectType(
        detail?.projectType || routeProjectType
      );
      setProjectType(nextProjectType);
      setProjectInfo({
        name: routeProjectName || detail?.projectName || 'Project',
      });

      const [resUnmarked, resMarked] =
        nextProjectType === 'group'
          ? await Promise.all([
              getUnmarkedGroupList(projectId),
              getMarkedGroupList(projectId),
            ])
          : await Promise.all([
              getUnmarkedStudentList(projectId),
              getMarkedStudentList(projectId),
            ]);

      if (nextProjectType === 'group') {
        const teams = Array.isArray(detail?.teams) ? detail.teams : [];
        const teamById = new Map(teams.map((team) => [String(team?.id), team]));
        const enrichGroups = (groups) =>
          (groups || []).map((group) => {
            const team = teamById.get(String(group?.id));
            return {
              ...group,
              students: Array.isArray(team?.students) ? team.students : [],
            };
          });

        setUnmarked(enrichGroups(resUnmarked));
        setMarked(enrichGroups(resMarked));
      } else {
        setUnmarked(resUnmarked || []);
        setMarked(resMarked || []);
      }
    } catch (e) {
      console.error(e);
      message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [projectId, routeProjectName, routeProjectType, subjectIdCacheKey]);

  useEffect(() => {
    if (routeSubjectId) {
      const nextId = String(routeSubjectId);
      setSubjectId(nextId);
      try {
        sessionStorage.setItem(subjectIdCacheKey, nextId);
      } catch (e) {}
    }
  }, [routeSubjectId, subjectIdCacheKey]);

  useEffect(() => {
    if (routeSubjectName) {
      setSubjectName(routeSubjectName);
      return;
    }

    const effectiveSubjectId = routeSubjectId || subjectId;
    if (effectiveSubjectId) {
      const name = subjectStore.getSubjectNameFromSession(effectiveSubjectId);
      setSubjectName(name || '');
    }
  }, [routeSubjectName, routeSubjectId, subjectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenMarkPage = useCallback(
    (record, mode) => {
      if (isGroupProject) {
        const params = new URLSearchParams({
          projectId: String(projectId),
          groupId: String(record.id),
          groupName: record.name || 'Group',
          type: mode,
        });
        history.push(`/groupMark?${params.toString()}`);
      } else {
        const params = new URLSearchParams({
          projectId: String(projectId),
          individualId: String(record.id),
          studentName: getStudentName(record) || 'Student',
          type: mode,
        });
        history.push(`/mark?${params.toString()}`);
      }
    },
    [isGroupProject, projectId]
  );

  const studentColumnsUnmarked = useMemo(
    () => [
      {
        title: 'Student ID',
        dataIndex: 'studentId',
        width: 140,
      },
      {
        title: 'Name',
        key: 'name',
        render: (_, r) => getStudentName(r),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        ellipsis: true,
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        render: (_, record) => (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenMarkPage(record, 'mark')}
            className={styles.actionButton}
          >
            Mark
          </Button>
        ),
      },
    ],
    [handleOpenMarkPage]
  );

  const studentColumnsMarked = useMemo(
    () => [
      {
        title: 'Student ID',
        dataIndex: 'studentId',
        width: 140,
      },
      {
        title: 'Name',
        key: 'name',
        render: (_, r) => getStudentName(r),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        ellipsis: true,
      },
      {
        title: 'Total Score',
        dataIndex: 'totalScore',
        width: 120,
        render: (v) => toScoreText(v),
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        render: (_, record) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleOpenMarkPage(record, 'review')}
            className={styles.actionButton}
          >
            Review
          </Button>
        ),
      },
    ],
    [handleOpenMarkPage]
  );

  const groupColumnsUnmarked = useMemo(
    () => [
      {
        title: 'Group ID',
        dataIndex: 'id',
        width: 140,
      },
      {
        title: 'Group Name',
        dataIndex: 'name',
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        render: (_, record) => (
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleOpenMarkPage(record, 'mark')}
            className={styles.actionButton}
          >
            Mark
          </Button>
        ),
      },
    ],
    [handleOpenMarkPage]
  );

  const groupColumnsMarked = useMemo(
    () => [
      {
        title: 'Group ID',
        dataIndex: 'id',
        width: 140,
      },
      {
        title: 'Group Name',
        dataIndex: 'name',
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        render: (_, record) => (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleOpenMarkPage(record, 'review')}
            className={styles.actionButton}
          >
            Review
          </Button>
        ),
      },
    ],
    [handleOpenMarkPage]
  );

  const teamStudentColumns = useMemo(
    () => [
      {
        title: 'ID',
        dataIndex: 'studentId',
        width: 120,
        render: (v, r) => v ?? r?.id ?? '-',
      },
      {
        title: 'Name',
        key: 'name',
        render: (_, r) => getStudentName(r),
      },
      {
        title: 'Email',
        dataIndex: 'email',
        ellipsis: true,
      },
    ],
    []
  );

  const groupExpandable = useMemo(
    () => ({
      expandedRowRender: (group) => {
        const members = Array.isArray(group?.students) ? group.students : [];
        if (!members.length) {
          return (
            <Empty
              description="No students"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          );
        }

        return (
          <Table
            rowKey={(record) => String(record.id ?? record.studentId)}
            size="small"
            dataSource={members}
            columns={teamStudentColumns}
            scroll={{ x: 'max-content' }}
            pagination={false}
          />
        );
      },
      rowExpandable: (group) =>
        Array.isArray(group?.students) && group.students.length > 0,
    }),
    [teamStudentColumns]
  );

  const activeUnmarkedColumns = isGroupProject
    ? groupColumnsUnmarked
    : studentColumnsUnmarked;
  const activeMarkedColumns = isGroupProject
    ? groupColumnsMarked
    : studentColumnsMarked;
  const unmarkedTitle = isGroupProject
    ? 'Unmarked Groups'
    : 'Unmarked Students';
  const markedTitle = isGroupProject ? 'Marked Groups' : 'Marked Students';
  const emptyUnmarked = isGroupProject
    ? 'No unmarked groups'
    : 'No unmarked students';
  const emptyMarked = isGroupProject
    ? 'No marked groups'
    : 'No marked students';

  return (
    <div className={styles.detailsPage}>
      <div className={styles.header}>
        <BackButton
          customPath={subjectId ? `/subjectDetails/${subjectId}` : undefined}
        />
        <Title level={2} className={styles.pageTitle}>
          {subjectName && projectInfo?.name
            ? `${subjectName} - ${projectInfo.name}`
            : 'Marked List'}
        </Title>
        {String(userStore.role) === '1' && (
          <Button
            type="primary"
            icon={<AuditOutlined />}
            className={styles.saveButton}
            onClick={() =>
              history.push(`/finalMark/${projectId}`, {
                projectName: projectInfo?.name || '',
                projectType,
                subjectName,
              })
            }
          >
            Final Mark
          </Button>
        )}
      </div>

      <div className={styles.mainContent}>
        <Card
          className={styles.projectSection}
          title={<Text strong>{unmarkedTitle}</Text>}
          bordered
        >
          {unmarked.length > 0 ? (
            <Table
              rowKey={(record) => String(record.id ?? record.studentId)}
              size="middle"
              dataSource={unmarked}
              columns={activeUnmarkedColumns}
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 8 }}
              loading={loading}
              expandable={isGroupProject ? groupExpandable : undefined}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyUnmarked}
            />
          )}
        </Card>

        <Card
          className={styles.projectSection}
          title={<Text strong>{markedTitle}</Text>}
          bordered
        >
          {marked.length > 0 ? (
            <Table
              rowKey={(record) => String(record.id ?? record.studentId)}
              size="middle"
              dataSource={marked}
              columns={activeMarkedColumns}
              scroll={{ x: 'max-content' }}
              pagination={{ pageSize: 8 }}
              loading={loading}
              expandable={isGroupProject ? groupExpandable : undefined}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={emptyMarked}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
