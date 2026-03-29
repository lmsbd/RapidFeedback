import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'umi';
import { Card, Descriptions, Empty, Table, Typography, message } from 'antd';
import BackButton from '../components/BackButton/BackButton';
import {
  getProjectDetail,
  getProjectDetailReal,
} from '../apis/getProjectDetail';
import styles from './viewProject.module.less';

const { Title, Text } = Typography;

function getStudentName(s) {
  const first = s?.firstName ?? s?.firstname ?? '';
  const sur = s?.surname ?? '';
  return `${first} ${sur}`.trim();
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
  const { projectId } = useParams();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const mock = await getProjectDetail(projectId);
        if (!cancelled) setDetail(mock || null);
      } catch (e) {
        console.error(e);
        message.error('Failed to load project detail');
      } finally {
        if (!cancelled) setLoading(false);
      }

      try {
        const real = await getProjectDetail(projectId);
        if (!cancelled && real) setDetail(real);
      } catch (e) {}
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
      { title: 'ID', dataIndex: 'id', width: 120 },
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
