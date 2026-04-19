import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, history } from 'umi';
import {Card, Descriptions, Empty, Table, Typography, message, Tag, Space, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import BackButton from '../components/BackButton/BackButton';
import { getProjectDetail } from '../apis/getProjectDetail';
import userStore from '@/stores/userStore';
import styles from './viewProject.module.less';

const { Title, Text } = Typography;

function getStudentName(s) {
  const first = s?.firstName ?? s?.firstname ?? '';
  const sur = s?.surname ?? '';
  return `${first} ${sur}`.trim();
}

function normalizeId(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

function extractMarkerIds(markers) {
  if (!Array.isArray(markers)) return [];
  return markers
    .map((marker) => normalizeId(marker?.id ?? marker?.userId))
    .filter((id) => id !== undefined && id !== null);
}

function normalizeDurationMs(ms) {
  const num = Number(ms);
  if (!Number.isFinite(num)) return null;
  return Math.max(0, Math.floor(num));
}

function toTotalSeconds(ms) {
  if (!Number.isFinite(ms)) return null;
  return Math.max(0, Math.floor(ms / 1000));
}

function formatMinutesSeconds(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return '-';
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

function formatMMSS(totalSeconds) {
  if (!Number.isFinite(totalSeconds)) return '-';
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

export default function ViewProject() {
  const { projectId, subjectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const isMarker = String(userStore.role) === '2';

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await getProjectDetail(projectId);
        if (!cancelled && res !== null) setDetail(res);
      } catch (e) {
        console.error(e);
        message.error('Failed to load project detail');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const projectType = (detail?.projectType || '').toLowerCase();
  const isIndividual = projectType === 'individual';
  const isTeam = projectType === 'team' || projectType === 'group';

  const studentColumns = useMemo(
    () => [
      { title: 'Student ID', dataIndex: 'studentId', width: 120 },
      { title: 'Name', key: 'name', render: (_, r) => getStudentName(r) },
      { title: 'Email', dataIndex: 'email', ellipsis: true },
    ],
    []
  );

  const markerColumns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 120 },
      { title: 'Name', dataIndex: 'name' },
      { title: 'Email', dataIndex: 'email', ellipsis: true },
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
        render: (v) => (v === null || v === undefined ? '-' : `${v}%`),
      },
      { title: 'Max Mark', dataIndex: 'maxMark', width: 120 },
      { title: 'Mark Increments', dataIndex: 'markIncrements', width: 160 },
    ],
    []
  );

  const teamColumns = useMemo(
    () => [
      { title: 'ID', dataIndex: 'id', width: 120 },
      { title: 'Team Name', dataIndex: 'name' },
      {
        title: 'Students',
        key: 'studentsCount',
        width: 140,
        render: (_, r) => (Array.isArray(r.students) ? r.students.length : 0),
      },
    ],
    []
  );

  const teams = Array.isArray(detail?.teams) ? detail.teams : [];
  const students = Array.isArray(detail?.students) ? detail.students : [];
  const markers = Array.isArray(detail?.markers) ? detail.markers : [];
  const markerNameMap = useMemo(() => {
    return new Map(
      markers.map((m) => [
        normalizeId(m?.id ?? m?.userId),
        m?.name || m?.userName || `Marker #${m?.id ?? m?.userId}`,
      ])
    );
  }, [markers]);

  const renderMarkerIds = useCallback(
    (ids) => {
      const list = Array.isArray(ids) ? ids : [];
      if (!list.length) return '-';
      return (
        <Space wrap>
          {list.map((id) => {
            const normalized = normalizeId(id);
            const label = markerNameMap.get(normalized) || `Marker #${normalized}`;
            return <Tag key={`${normalized}`}>{label}</Tag>;
          })}
        </Space>
      );
    },
    [markerNameMap]
  );

  const individualAssignmentRows = useMemo(() => {
    return students.map((student) => ({
      ...student,
      id: student?.id ?? student?.studentId,
      studentId: student?.studentId ?? student?.id,
      markerIds: extractMarkerIds(student?.markers),
    }));
  }, [students]);

  const groupAssignmentRows = useMemo(() => {
    return teams.map((team, index) => ({
      ...team,
      id: String(team?.id ?? index),
      groupName: team?.groupName || team?.name || `Group ${index + 1}`,
      students: Array.isArray(team?.students) ? team.students : [],
      markerIds: extractMarkerIds(team?.markers),
    }));
  }, [teams]);

  const individualAssignmentColumns = useMemo(
    () => [
      { title: 'Student ID', dataIndex: 'studentId', width: 140 },
      {
        title: 'Name',
        key: 'name',
        render: (_, r) => getStudentName(r) || r?.studentName || '-',
      },
      {
        title: 'Assigned Markers',
        key: 'markerIds',
        render: (_, r) => renderMarkerIds(r?.markerIds),
      },
    ],
    [renderMarkerIds]
  );

  const groupAssignmentColumns = useMemo(
    () => [
      { title: 'Group Name', dataIndex: 'groupName' },
      {
        title: 'Members',
        key: 'members',
        width: 120,
        render: (_, r) => (Array.isArray(r?.students) ? r.students.length : 0),
      },
      {
        title: 'Assigned Markers',
        key: 'markerIds',
        render: (_, r) => renderMarkerIds(r?.markerIds),
      },
    ],
    [renderMarkerIds]
  );

  const assignmentStudentColumns = useMemo(
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
        render: (_, r) => getStudentName(r) || r?.studentName || '-',
      },
      { title: 'Email', dataIndex: 'email', ellipsis: true },
    ],
    []
  );

  const groupAssignmentExpandable = useMemo(
    () => ({
      expandedRowRender: (group) => {
        const members = Array.isArray(group?.students) ? group.students : [];
        if (!members.length) {
          return <Empty description="No students" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
        }

        return (
          <Table
            rowKey={(record) => String(record.id ?? record.studentId)}
            size="small"
            dataSource={members}
            columns={assignmentStudentColumns}
            pagination={false}
          />
        );
      },
      rowExpandable: (group) =>
        Array.isArray(group?.students) && group.students.length > 0,
    }),
    [assignmentStudentColumns]
  );

  const descriptionArr = Array.isArray(detail?.description)
    ? detail.description
    : [];
  const firstDescription =
    descriptionArr.length && descriptionArr[0] ? descriptionArr[0] : null;
  const countdownMs = normalizeDurationMs(firstDescription?.countdown);
  const countdownSeconds = toTotalSeconds(countdownMs);
  const assessment = Array.isArray(firstDescription?.assessment)
    ? firstDescription.assessment
    : [];
  const legacyDescriptionText =
    typeof detail?.description === 'string' ? detail.description : '';

  const mainTitle = detail?.projectName
    ? `View Project - ${detail.projectName}`
    : 'View Project';

  return (
    <div className={styles.detailsPage}>
      <div className={styles.header}>
        <BackButton />
        <Title level={2} className={styles.pageTitle}>
          {mainTitle}
        </Title>
        {!isMarker && (
          <div className={styles.editButtonContainer}>
            <Button
              type="primary"
              icon={<EditOutlined className="editIcon" />}
              onClick={() => {
                history.push(`/${subjectId}/editProject/${projectId}`);
              }}
              className={styles.editButton}
            >
              Edit
            </Button>
          </div>
        )}
        
      </div>

      <div className={styles.mainContent}>
        <div className={styles.contentWrapper}>
          <Card
            className={styles.projectSection}
            title={<Text strong>Project Details</Text>}
            loading={loading && !detail}
          >
            {detail ? (
              <Descriptions bordered size="middle" column={1}>
                <Descriptions.Item label="Project ID">
                  {detail.projectId ?? projectId}
                </Descriptions.Item>
                <Descriptions.Item label="Project Type">
                  {detail.projectType || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Project Name">
                  {detail.projectName || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Time">
                  {countdownSeconds === null ? (
                    '-'
                  ) : (
                    <div className={styles.countdownValue}>
                      <Text>{formatMinutesSeconds(countdownSeconds)}</Text>
                      <Text type="secondary">
                        {formatMMSS(countdownSeconds)}
                      </Text>
                    </div>
                  )}
                </Descriptions.Item>
                {!!legacyDescriptionText && (
                  <Descriptions.Item label="Description">
                    {legacyDescriptionText}
                  </Descriptions.Item>
                )}
              </Descriptions>
            ) : (
              <Empty description="No project detail" />
            )}
          </Card>

          {detail && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Assessment Criteria</Text>}
              loading={loading && !assessment.length}
            >
              {assessment.length ? (
                <Table
                  rowKey={(r, idx) => `${r?.name || 'assessment'}-${idx}`}
                  size="middle"
                  dataSource={assessment}
                  columns={assessmentColumns}
                  pagination={false}
                />
              ) : (
                <Empty description="No assessment criteria" />
              )}
            </Card>
          )}

          {detail && isIndividual && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Students</Text>}
              loading={loading && !students.length}
            >
              {students.length ? (
                <Table
                  rowKey={(r) => String(r.id)}
                  size="middle"
                  dataSource={students}
                  columns={studentColumns}
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No students" />
              )}
            </Card>
          )}

          {detail && isTeam && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Teams</Text>}
              loading={loading && !teams.length}
            >
              {teams.length ? (
                <Table
                  rowKey={(r) => String(r.id)}
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
                          rowKey={(r) => String(r.id)}
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
                <Empty description="No teams" />
              )}
            </Card>
          )}

          {detail && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Marker Assignments</Text>}
              loading={loading}
            >
              {isTeam ? (
                groupAssignmentRows.length ? (
                  <Table
                    rowKey={(r) => String(r.id)}
                    size="middle"
                    dataSource={groupAssignmentRows}
                    columns={groupAssignmentColumns}
                    pagination={{ pageSize: 10 }}
                    expandable={groupAssignmentExpandable}
                  />
                ) : (
                  <Empty description="No group marker assignments" />
                )
              ) : individualAssignmentRows.length ? (
                <Table
                  rowKey={(r) => String(r.id ?? r.studentId)}
                  size="middle"
                  dataSource={individualAssignmentRows}
                  columns={individualAssignmentColumns}
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No student marker assignments" />
              )}
            </Card>
          )}

          {detail && (
            <Card
              className={styles.projectSection}
              title={<Text strong>Markers</Text>}
              loading={loading && !markers.length}
            >
              {markers.length ? (
                <Table
                  rowKey={(r) => String(r.id)}
                  size="middle"
                  dataSource={markers}
                  columns={markerColumns}
                  pagination={{ pageSize: 10 }}
                />
              ) : (
                <Empty description="No markers" />
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
