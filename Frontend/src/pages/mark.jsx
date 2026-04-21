import { useEffect, useMemo, useRef, useState } from 'react';
import { history, useLocation } from 'umi';
import {
  Alert,
  Button,
  Card,
  Input,
  Select,
  Slider,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from 'antd';
import BackButton from '../components/BackButton/BackButton';
import {
  getGroupAssessmentScores,
  getProjectDetail,
  getProjectDetailMock,
  getStudentAssessmentScores,
} from '../apis/getProjectDetail';
import { getCommentListByCriteriaId } from '../apis/comment';
import { saveGroupMark, saveMark } from '../apis/mark';
import styles from './mark.module.less';

const { Title, Text } = Typography;
const { TextArea } = Input;

function normalizeDurationMs(ms) {
  const num = Number(ms);
  if (!Number.isFinite(num)) return null;
  return Math.max(0, Math.floor(num));
}

function formatMinutesSecondsFromMs(ms) {
  if (!Number.isFinite(ms)) return '-';
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${String(secs).padStart(2, '0')}s`;
}

function formatMMSSFromMs(ms) {
  if (!Number.isFinite(ms)) return '-';
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function normalizeStep(step) {
  const s = Number(step);
  if (!Number.isFinite(s) || s <= 0) return 1;
  return s;
}

function normalizeMax(max) {
  const m = Number(max);
  if (!Number.isFinite(m) || m <= 0) return 100;
  return m;
}

function commentTypeTag(type) {
  if (type === 2) return <Tag color="green">Positive</Tag>;
  if (type === 1) return <Tag color="gold">Neutral</Tag>;
  if (type === 0) return <Tag color="red">Negative</Tag>;
  return null;
}

function appendComment(existing, next) {
  const a = String(existing || '').trim();
  const b = String(next || '').trim();
  if (!b) return a;
  if (!a) return b;
  return `${a}\n${b}`;
}

export default function MarkPage() {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  const projectId = searchParams.get('projectId') || '';
  const individualId = searchParams.get('individualId') || '';
  const groupId = searchParams.get('groupId') || '';
  const pageType = searchParams.get('type') || 'mark';
  const isReview = pageType === 'review';
  const rawStudentName = searchParams.get('studentName') || '';
  const studentCode = searchParams.get('studentId') || '';
  const rawGroupName = searchParams.get('groupName') || '';
  const studentName = rawStudentName ? decodeURIComponent(rawStudentName) : '';
  const groupName = rawGroupName ? decodeURIComponent(rawGroupName) : '';

  const fromGroup = searchParams.get('fromGroup') === '1';
  const returnGroupId = searchParams.get('returnGroupId') || '';
  const returnGroupName = searchParams.get('returnGroupName') || '';
  const displayGroupName = groupName || returnGroupName;

  const isIndividual = !!individualId;
  const targetId = isIndividual ? individualId : groupId;
  const targetName = isIndividual ? studentName : groupName;

  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);

  const [rows, setRows] = useState([]);

  const [commentOptionsByCriteria, setCommentOptionsByCriteria] = useState({});
  const [commentLoadingByCriteria, setCommentLoadingByCriteria] = useState({});
  const commentRequestSeq = useRef({});

  const descriptionArr = Array.isArray(detail?.description)
    ? detail.description
    : [];
  const firstDescription = descriptionArr[0] ? descriptionArr[0] : null;
  const countdownMs = normalizeDurationMs(firstDescription?.countdown);

  const [remainingMs, setRemainingMs] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerBaselineRef = useRef({ startedAt: 0, baselineMs: 0 });

  useEffect(() => {
    if (isReview || !Number.isFinite(countdownMs)) {
      setRemainingMs(null);
      setTimerRunning(false);
      timerBaselineRef.current = { startedAt: 0, baselineMs: 0 };
      return;
    }

    setRemainingMs(countdownMs);
    setTimerRunning(false);
    timerBaselineRef.current = { startedAt: 0, baselineMs: countdownMs };
  }, [countdownMs, isReview]);

  useEffect(() => {
    if (isReview) return;
    if (!timerRunning) return;
    if (!Number.isFinite(remainingMs)) return;

    let timer = null;

    const tick = () => {
      const { startedAt, baselineMs } = timerBaselineRef.current;
      const elapsed = Date.now() - startedAt;
      const next = Math.max(0, baselineMs - elapsed);
      setRemainingMs(next);

      if (next <= 0) {
        setTimerRunning(false);
        if (timer) {
          clearInterval(timer);
          timer = null;
        }
      }
    };

    tick();
    timer = window.setInterval(tick, 250);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerRunning]);

  const handleTimerToggle = () => {
    if (isReview) return;
    if (!Number.isFinite(remainingMs)) return;
    if (remainingMs <= 0) return;

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

  useEffect(() => {
    let cancelled = false;

    const fetchDetail = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const res =
          pageType === 'review'
            ? isIndividual
              ? await getStudentAssessmentScores(projectId, individualId)
              : await getGroupAssessmentScores(projectId, groupId)
            : await getProjectDetail(projectId);
        if (cancelled) return;
        setDetail(res || null);
        const dArr = Array.isArray(res?.description) ? res.description : [];
        const first = dArr[0] ? dArr[0] : null;
        const assessment = Array.isArray(first?.assessment)
          ? first.assessment
          : [];
        const initialRows = assessment.map((a, idx) => {
          const criteriaId = a?.criteriaId ?? idx + 1;
          const score = pageType === 'review' ? a?.score : null;
          const numericScore = Number(score);
          const hasScore =
            score !== null &&
            score !== undefined &&
            Number.isFinite(numericScore);
          const comment = pageType === 'review' ? String(a?.comment ?? '') : '';
          return {
            key: String(criteriaId),
            criteriaId,
            name: a?.name || '-',
            weighting: a?.weighting,
            maxMark: a?.maxMark,
            markIncrements: a?.markIncrements,
            mark: hasScore ? numericScore : 0,
            scored: pageType === 'mark' ? true : hasScore,
            comment,
          };
        });
        setRows(initialRows);
      } catch (e) {
        console.error(e);
        message.error(
          pageType === 'review'
            ? 'Failed to load existing scores'
            : 'Failed to load project detail'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      cancelled = true;
    };
  }, [projectId, pageType, isIndividual, individualId, groupId]);

  const missingParams = useMemo(() => {
    const missing = [];
    if (!projectId) missing.push('projectId');
    if (!individualId && !groupId) missing.push('individualId or groupId');
    if (individualId && !studentName) missing.push('studentName');
    if (groupId && !groupName) missing.push('groupName');
    return missing;
  }, [projectId, individualId, groupId, studentName, groupName]);

  const totalScore = useMemo(() => {
    const hasWeighting = rows.some((r) => Number.isFinite(Number(r.weighting)));

    if (!hasWeighting) {
      return rows.reduce((sum, r) => sum + (Number(r.mark) || 0), 0);
    }

    return rows.reduce((sum, r) => {
      const mark = Number(r.mark) || 0;
      const weighting = Number(r.weighting) || 0;
      return sum + (mark * weighting) / 100;
    }, 0);
  }, [rows]);

  const handleSave = async () => {
    if (missingParams.length > 0) {
      message.error(`Missing: ${missingParams.join(', ')}`);
      return;
    }

    const unscored = rows.filter((r) => !r.scored);
    if (unscored.length > 0) {
      message.error('Please score all criteria');
      return;
    }

    const numericProjectId = Number(projectId);
    const numericTargetId = Number(targetId);

    if (!Number.isFinite(numericProjectId) || numericProjectId <= 0) {
      message.error('Invalid projectId');
      return;
    }

    if (!Number.isFinite(numericTargetId) || numericTargetId <= 0) {
      message.error(isIndividual ? 'Invalid studentId' : 'Invalid groupId');
      return;
    }

    const details = rows
      .map((r) => {
        const criteriaId = Number(r.criteriaId);
        const score = Number.isFinite(Number(r.mark)) ? Number(r.mark) : 0;
        return {
          criteriaId: Number.isFinite(criteriaId) ? criteriaId : null,
          score,
          comment: String(r.comment || ''),
        };
      })
      .filter((d) => d.criteriaId !== null);

    const payload = isIndividual
      ? { projectId: numericProjectId, studentId: numericTargetId, details }
      : { projectId: numericProjectId, groupId: numericTargetId, details };

    setSaving(true);
    try {
      const res = isIndividual
        ? await saveMark(payload)
        : await saveGroupMark(payload);
      if (res?.code === 200) {
        message.success('Saved');
        if (fromGroup && returnGroupId) {
          const returnParams = new URLSearchParams({
            projectId: String(numericProjectId),
            groupId: returnGroupId,
            groupName: returnGroupName,
          });
          history.push(`/groupMark?${returnParams.toString()}`);
        } else {
          history.push(`/markedList/${numericProjectId}`);
        }
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

  const ensureCommentsLoaded = async (criteriaId) => {
    if (!criteriaId) return;
    if (commentOptionsByCriteria[criteriaId]) return;

    const seq = (commentRequestSeq.current[criteriaId] || 0) + 1;
    commentRequestSeq.current[criteriaId] = seq;
    setCommentLoadingByCriteria((p) => ({ ...p, [criteriaId]: true }));

    try {
      const res = await getCommentListByCriteriaId(Number(criteriaId));
      if ((commentRequestSeq.current[criteriaId] || 0) !== seq) return;

      if (res?.code === 200 && Array.isArray(res?.data)) {
        setCommentOptionsByCriteria((p) => ({ ...p, [criteriaId]: res.data }));
      } else {
        message.error(res?.message || 'Failed to load comments');
        setCommentOptionsByCriteria((p) => ({ ...p, [criteriaId]: [] }));
      }
    } catch (e) {
      if ((commentRequestSeq.current[criteriaId] || 0) !== seq) return;
      console.error(e);
      message.error('Failed to load comments');
      setCommentOptionsByCriteria((p) => ({ ...p, [criteriaId]: [] }));
    } finally {
      if ((commentRequestSeq.current[criteriaId] || 0) === seq) {
        setCommentLoadingByCriteria((p) => ({ ...p, [criteriaId]: false }));
      }
    }
  };

  const handleSelectPreset = (criteriaId, commentId) => {
    const list = commentOptionsByCriteria[criteriaId] || [];
    const item = list.find((c) => String(c?.id) === String(commentId));
    if (!item?.content) return;
    setRows((prev) =>
      prev.map((r) =>
        r.criteriaId === criteriaId ? { ...r, comment: item.content } : r
      )
    );
  };

  const columns = useMemo(
    () => [
      {
        title: 'Criteria',
        dataIndex: 'name',
      },
      {
        title: 'Score',
        key: 'mark',
        width: 420,
        render: (_, record) => {
          const max = normalizeMax(record.maxMark);
          const step = normalizeStep(record.markIncrements);
          const value = Number.isFinite(Number(record.mark))
            ? Number(record.mark)
            : 0;
          return (
            <div className={styles.markCell}>
              <Slider
                min={0}
                max={max}
                step={step}
                value={value}
                onChange={(v) => {
                  const next = Number(v);
                  setRows((prev) =>
                    prev.map((r) =>
                      r.criteriaId === record.criteriaId
                        ? { ...r, mark: next, scored: true }
                        : r
                    )
                  );
                }}
              />
              <Text className={styles.markValue}>{value}</Text>
              <Text type="secondary" className={styles.markMeta}>
                / {max} (step {step})
              </Text>
            </div>
          );
        },
      },
      {
        title: 'Comment',
        key: 'comment',
        width: 560,
        render: (_, record) => {
          const criteriaId = record.criteriaId;
          const loadingPreset = !!commentLoadingByCriteria[criteriaId];
          const options = (commentOptionsByCriteria[criteriaId] || []).map(
            (c) => ({
              value: String(c.id),
              label: (
                <span className={styles.presetOption}>
                  {commentTypeTag(c.commentType)}
                  <Tooltip title={c.content} placement="topLeft">
                    <span className={styles.presetContent}>{c.content}</span>
                  </Tooltip>
                </span>
              ),
            })
          );

          return (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Select
                placeholder="Select a preset comment"
                style={{ width: '100%' }}
                options={options}
                loading={loadingPreset}
                allowClear
                showSearch
                optionFilterProp="label"
                onOpenChange={(open) => {
                  if (open) ensureCommentsLoaded(criteriaId);
                }}
                onChange={(v) => {
                  if (v) handleSelectPreset(criteriaId, v);
                }}
              />
              <TextArea
                value={record.comment}
                placeholder="Enter comment"
                style={{ width: '100%' }}
                autoSize={{ minRows: 2, maxRows: 4 }}
                onChange={(e) => {
                  const next = e.target.value;
                  setRows((prev) =>
                    prev.map((r) =>
                      r.criteriaId === criteriaId ? { ...r, comment: next } : r
                    )
                  );
                }}
              />
            </Space>
          );
        },
      },
    ],
    [commentLoadingByCriteria, commentOptionsByCriteria]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <BackButton
          text="Back"
          customPath={
            fromGroup && returnGroupId
              ? `/groupMark?projectId=${projectId}&groupId=${returnGroupId}&groupName=${encodeURIComponent(returnGroupName)}`
              : undefined
          }
        />
        <div className={styles.headerMain}>
          <Title level={3} className={styles.title}>
            {detail?.projectName ? detail.projectName : 'Mark '}
            {fromGroup && isIndividual ? ' '+displayGroupName || '-': null}
          </Title>
          <div className={styles.metaRow}>
            <Space size={12} wrap>
              {/* <Text>
                {isIndividual ? 'Student ID' : 'Group ID'}: {targetId || '-'}
              </Text> */}
              <Text>
                {isIndividual ? 'Student Name' : 'Group Name'}:{' '}
                {isIndividual
                  ? `${targetName || '-'}${studentCode ? ` (${studentCode})` : ''}`
                  : targetName || '-'}
              </Text>

            </Space>
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
                <Button size="small" onClick={handleTimerToggle}>
                  {timerRunning ? 'Stop' : 'Start'}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {missingParams.length > 0 ? (
          <Alert
            type="error"
            showIcon
            message="Missing URL parameters"
            description={`Missing: ${missingParams.join(', ')}`}
          />
        ) : (
          <Card className={styles.card}>
            <Spin spinning={loading && !detail}>
              <Table
                rowKey="key"
                dataSource={rows}
                columns={columns}
                pagination={false}
              />
            </Spin>
          </Card>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <Text strong>Total score:</Text>
          <Text className={styles.totalValue}>
            {Number.isFinite(Number(totalScore))
              ? Number(totalScore).toFixed(2)
              : '--'}
          </Text>
        </div>
        <Button type="primary" loading={saving} onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
}
