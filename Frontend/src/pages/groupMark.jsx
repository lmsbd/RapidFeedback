import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { history, useLocation } from 'umi';
import {
  Button,
  Card,
  Input,
  InputNumber,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  EditOutlined,
  ReloadOutlined,
  CaretRightOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import BackButton from '../components/BackButton/BackButton';
import {
  getProjectDetail,
  getStudentAssessmentScores,
} from '../apis/getProjectDetail';
import { getGroupMark, saveGroupMark } from '../apis/mark';
import styles from './groupMark.module.less';

const { Title, Text } = Typography;
const { TextArea } = Input;

function getStudentName(student) {
  return `${student?.firstName ?? ''} ${student?.surname ?? ''}`.trim();
}

function normalizeDurationMs(ms) {
  const num = Number(ms);
  if (!Number.isFinite(num)) return null;
  return Math.max(0, Math.floor(num));
}

function formatMMSSFromMs(ms) {
  if (!Number.isFinite(ms)) return '-';
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function calcTotalScore(assessments) {
  if (!Array.isArray(assessments) || assessments.length === 0) return null;
  const hasWeighting = assessments.some((a) =>
    Number.isFinite(Number(a.weighting))
  );
  if (!hasWeighting) {
    return assessments.reduce((sum, a) => sum + (Number(a.score) || 0), 0);
  }
  return assessments.reduce((sum, a) => {
    const score = Number(a.score) || 0;
    const maxMark = Number(a.maxMark) || 100;
    const weighting = Number(a.weighting) || 0;
    const ratio = maxMark > 0 ? score / maxMark : 0;
    return sum + ratio * weighting;
  }, 0);
}

export default function GroupMarkPage() {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const projectId = searchParams.get('projectId') || '';
  const groupId = searchParams.get('groupId') || '';
  const rawGroupName = searchParams.get('groupName') || '';
  const groupName = rawGroupName ? decodeURIComponent(rawGroupName) : '';
  const pageType = searchParams.get('type') || 'mark';
  const isReview = pageType === 'review';

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [students, setStudents] = useState([]);
  const [studentScores, setStudentScores] = useState({});
  // per-student group score: { [studentId]: number }
  const [groupScores, setGroupScores] = useState({});
  const [groupComment, setGroupComment] = useState('');
  const [saving, setSaving] = useState(false);

  const countdownMs = useMemo(() => {
    const descArr = Array.isArray(detail?.description)
      ? detail.description
      : [];
    const first = descArr[0] || null;
    return normalizeDurationMs(first?.countdown);
  }, [detail]);

  const [remainingMs, setRemainingMs] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerBaselineRef = useRef({ startedAt: 0, baselineMs: 0 });

  useEffect(() => {
    if (isReview || !Number.isFinite(countdownMs)) {
      setRemainingMs(null);
      setTimerRunning(false);
      return;
    }
    setRemainingMs(countdownMs);
    setTimerRunning(false);
    timerBaselineRef.current = { startedAt: 0, baselineMs: countdownMs };
  }, [countdownMs, isReview]);

  useEffect(() => {
    if (isReview || !timerRunning || !Number.isFinite(remainingMs)) return;
    let timer = null;
    const tick = () => {
      const { startedAt, baselineMs } = timerBaselineRef.current;
      const elapsed = Date.now() - startedAt;
      const next = Math.max(0, baselineMs - elapsed);
      setRemainingMs(next);
      if (next <= 0) {
        setTimerRunning(false);
        if (timer) clearInterval(timer);
      }
    };
    tick();
    timer = window.setInterval(tick, 250);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerRunning]);

  const handleTimerToggle = () => {
    if (isReview || !Number.isFinite(remainingMs) || remainingMs <= 0) return;
    if (timerRunning) {
      setTimerRunning(false);
      return;
    }
    timerBaselineRef.current = {
      startedAt: Date.now(),
      baselineMs: remainingMs,
    };
    setTimerRunning(true);
  };

  const handleTimerReset = () => {
    if (isReview || !Number.isFinite(countdownMs)) return;
    setTimerRunning(false);
    setRemainingMs(countdownMs);
    timerBaselineRef.current = { startedAt: 0, baselineMs: countdownMs };
  };

  const fetchData = useCallback(async () => {
    if (!projectId || !groupId) return;
    setLoading(true);
    try {
      const res = await getProjectDetail(projectId);
      setDetail(res || null);

      const teams = Array.isArray(res?.teams) ? res.teams : [];
      const team = teams.find((t) => String(t?.id) === String(groupId));
      const members = Array.isArray(team?.students) ? team.students : [];
      setStudents(members);

      const scoreMap = {};
      await Promise.all(
        members.map(async (student) => {
          const sid = student?.id ?? student?.studentId;
          if (!sid) return;
          try {
            const scoreRes = await getStudentAssessmentScores(projectId, sid);
            if (scoreRes) {
              const descArr = Array.isArray(scoreRes?.description)
                ? scoreRes.description
                : [];
              const first = descArr[0] || null;
              const assessments = Array.isArray(first?.assessment)
                ? first.assessment
                : [];
              const hasScores = assessments.some(
                (a) => a?.score !== null && a?.score !== undefined
              );
              if (hasScores) {
                const total = calcTotalScore(assessments);
                scoreMap[String(sid)] = { total, assessments };
              }
            }
          } catch {
            // student not yet marked
          }
        })
      );
      setStudentScores(scoreMap);

      // Try fetching saved group mark data from backend
      if (isReview) {
        // Review mode: fetch saved group mark from backend only
        try {
          const gmRes = await getGroupMark(projectId, groupId);
          const savedGroupMark = gmRes?.data;
          const initialGroupScores = {};
          members.forEach((s) => {
            const sid = String(s?.id ?? s?.studentId);
            const saved = savedGroupMark?.students?.find(
              (st) => String(st.studentId) === sid
            );
            initialGroupScores[sid] = saved?.groupScore ?? 0;
          });
          setGroupScores(initialGroupScores);
          setGroupComment(savedGroupMark?.comment || '');
        } catch {
          const initialGroupScores = {};
          members.forEach((s) => {
            const sid = String(s?.id ?? s?.studentId);
            initialGroupScores[sid] = 0;
          });
          setGroupScores(initialGroupScores);
        }
      } else {
        // Mark mode: use average of individual scores as default
        const totals = Object.values(scoreMap)
          .map((s) => s.total)
          .filter((t) => t !== null && Number.isFinite(t));
        const avg =
          totals.length > 0
            ? Number(
                (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(2)
              )
            : 0;
        const initialGroupScores = {};
        members.forEach((s) => {
          const sid = String(s?.id ?? s?.studentId);
          initialGroupScores[sid] = avg;
        });
        setGroupScores(initialGroupScores);
      }
    } catch (e) {
      console.error(e);
      message.error('Failed to load group data');
    } finally {
      setLoading(false);
    }
  }, [projectId, groupId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkStudent = (student) => {
    const sid = student?.id ?? student?.studentId;
    const name = getStudentName(student);
    const params = new URLSearchParams({
      projectId: String(projectId),
      individualId: String(sid),
      studentName: name || 'Student',
      type: 'mark',
      fromGroup: '1',
      returnGroupId: String(groupId),
      returnGroupName: groupName,
    });
    history.push(`/mark?${params.toString()}`);
  };

  const handleReviewStudent = (student) => {
    const sid = student?.id ?? student?.studentId;
    const name = getStudentName(student);
    const params = new URLSearchParams({
      projectId: String(projectId),
      individualId: String(sid),
      studentName: name || 'Student',
      type: 'review',
      fromGroup: '1',
      returnGroupId: String(groupId),
      returnGroupName: groupName,
    });
    history.push(`/mark?${params.toString()}`);
  };

  const handleGroupScoreChange = (sid, value) => {
    setGroupScores((prev) => ({ ...prev, [sid]: value }));
  };

  const handleSave = async () => {
    if (!projectId || !groupId) {
      message.error('Missing project or group info');
      return;
    }

    const allScored = students.every((s) => {
      const sid = String(s?.id ?? s?.studentId);
      return !!studentScores[sid];
    });

    if (!allScored) {
      message.error('Please mark all students before saving the group score');
      return;
    }

    const studentsPayload = students.map((s) => {
      const sid = String(s?.id ?? s?.studentId);
      return {
        studentId: Number(sid),
        groupScore: groupScores[sid] ?? 0,
      };
    });

    setSaving(true);
    try {
      const res = await saveGroupMark({
        projectId: Number(projectId),
        groupId: Number(groupId),
        comment: groupComment,
        students: studentsPayload,
      });
      if (res?.code === 200) {
        message.success('Group score saved');
        history.push(`/markedList/${projectId}`);
      } else {
        message.error(res?.message || 'Failed to save');
      }
    } catch (e) {
      const backendMessage = e?.response?.data?.message;
      message.error(backendMessage || e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: 'ID',
        key: 'id',
        width: 120,
        render: (_, r) => r?.studentId ?? r?.id ?? '-',
      },
      {
        title: 'Name',
        key: 'name',
        render: (_, r) => getStudentName(r),
      },
      {
        title: 'Individual Score',
        key: 'individualScore',
        width: 180,
        render: (_, r) => {
          const sid = String(r?.id ?? r?.studentId);
          const scoreData = studentScores[sid];
          if (!scoreData) {
            return (
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleMarkStudent(r)}
              >
                Mark
              </Button>
            );
          }
          return (
            <Space>
              <Text strong>{Number(scoreData.total).toFixed(2)}</Text>
              <Button
                type="link"
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleReviewStudent(r)}
              >
                Edit
              </Button>
            </Space>
          );
        },
      },
      {
        title: 'Group Score',
        key: 'groupScore',
        width: 160,
        render: (_, r) => {
          const sid = String(r?.id ?? r?.studentId);
          return (
            <InputNumber
              value={groupScores[sid] ?? 0}
              min={0}
              step={0.01}
              precision={2}
              onChange={(v) => handleGroupScoreChange(sid, v)}
              style={{ width: '100%' }}
            />
          );
        },
      },
    ],
    [studentScores, groupScores, isReview, projectId, groupId, groupName]
  );

  const markedCount = students.filter((s) => {
    const sid = String(s?.id ?? s?.studentId);
    return !!studentScores[sid];
  }).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton
          customPath={`/markedList/${projectId}`}
          text="Project"
        />
        <div className={styles.headerMain}>
          <Title level={3} className={styles.title}>
            {groupName || 'Group'}
          </Title>
          <div className={styles.metaRow}>
            <Text type="secondary">
              {markedCount} / {students.length} students marked
            </Text>
          </div>
        </div>
        {!isReview && (
          <div className={styles.countdown}>
            {remainingMs === null ? (
              <Tag>--</Tag>
            ) : remainingMs <= 0 ? (
              <Tag color="red">Time is up</Tag>
            ) : (
              <div className={styles.countdownInner}>
                <Text type="secondary">{formatMMSSFromMs(remainingMs)}</Text>
                <Space size={4}>
                  <Button
                    size="small"
                    icon={
                      timerRunning ? (
                        <PauseOutlined />
                      ) : (
                        <CaretRightOutlined />
                      )
                    }
                    onClick={handleTimerToggle}
                  />
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={handleTimerReset}
                  />
                </Space>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <Card
          className={styles.card}
          title={<Text strong>Group Students</Text>}
        >
          <Spin spinning={loading}>
            <Table
              rowKey={(r) => String(r?.id ?? r?.studentId)}
              dataSource={students}
              columns={columns}
              pagination={false}
              size="middle"
            />
          </Spin>
        </Card>

        <Card className={styles.scoreCard}>
          <Text strong className={styles.sectionLabel}>
            Group Comment
          </Text>
          <TextArea
            value={groupComment}
            placeholder="Enter group comment..."
            autoSize={{ minRows: 3, maxRows: 6 }}
            onChange={(e) => setGroupComment(e.target.value)}
            style={{ marginTop: 8 }}
          />
        </Card>
      </div>

      <div className={styles.footer}>
        <div />
        <Button type="primary" loading={saving} onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
