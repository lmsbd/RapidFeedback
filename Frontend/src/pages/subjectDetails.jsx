import { history, useParams } from 'umi';
import { Button, Card, Empty, Modal, Tooltip, Typography, message } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import styles from './subjectDetails.module.less';
import { useEffect, useState } from 'react';
import userStore from '@/stores/userStore';
import subjectStore from '../stores/subjectStore';
import projectStore from '../stores/projectStore';
import { getProjectList, deleteProject } from '../apis/projects';
/**
 * @typedef {object} projectItem
 * @property {string} id
 * @property {string} name
 * @property {string} countdown
 * @property {number} subjectId
 *
 */

const { Title } = Typography;

function pickFirstCount(...values) {
  for (const value of values) {
    const num = Number(value);
    if (Number.isFinite(num) && num >= 0) return num;
  }
  return null;
}

function getProjectProgress(project) {
  const markedCount = pickFirstCount(project?.markedCount);
  const unmarkedCount = pickFirstCount(project?.unmarkedCount);
  if (markedCount !== null || unmarkedCount !== null) {
    return {
      leftText: markedCount === null ? '-' : String(markedCount),
      rightText: unmarkedCount === null ? '-' : String(unmarkedCount),
    };
  }

  const projectType = String(project?.projectType || '').toLowerCase();
  const isGroupProject =
    projectType.includes('group') || projectType.includes('team');

  const scored = isGroupProject
    ? pickFirstCount(
        project?.scoredGroups,
        project?.scoredTeams,
        project?.scoredGroupCount,
        project?.scoredCount,
        project?.scoredStudents
      )
    : pickFirstCount(project?.scoredStudents, project?.scoredCount);

  const total = isGroupProject
    ? pickFirstCount(
        project?.groupCount,
        project?.teamCount,
        project?.totalGroups,
        project?.totalTeams,
        project?.totalCount,
        project?.studentCount
      )
    : pickFirstCount(
        project?.studentCount,
        project?.totalStudents,
        project?.totalCount
      );

  return {
    leftText: scored === null ? '-' : String(scored),
    rightText: total === null ? '-' : String(total),
  };
}

export default function SubjectDetails() {
  const { id: subjectId } = useParams(); // 从 /subjectDetails/:id 里拿 id
  const [subjectName, setSubjectName] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const isMarker = String(userStore.role) === '2';
  const showMarkCounts = Array.isArray(projects)
    ? projects.some(
        (p) =>
          pickFirstCount(p?.markedCount) !== null ||
          pickFirstCount(p?.unmarkedCount) !== null
      )
    : false;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsData = await getProjectList(subjectId);
      setSubjectName(subjectStore.getSubjectNameFromSession(subjectId));
      setProjects(projectsData || []);
      projectStore.setProjects(subjectId, projectsData || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [subjectId]);
  const handleCreateProject = () => {
    if (isMarker) return;
    history.push(`/createProject/${subjectId}`);
  };

  const handleManageSubject = () => {
    if (isMarker) return;
    history.push(`/manageSubject/${subjectId}`);
  };

  const handleEditClick = (project) => {
    history.push(`/markedList/${project.id}`, {
      projectName: project.name,
      projectType: project.projectType,
      subjectId: subjectId,
      subjectName: subjectName,
    });
  };
  const handleBack = () => {
    history.push(`/`);
  };
  const handleViewProject = (project) => {
    history.push(`/${subjectId}/viewProject/${project.id}`);
  };

  const handleDeleteClick = (project) => {
    if (isMarker) return;
    Modal.confirm({
      title: 'Comfirm Delete Project',
      content: `Are you sure to delete project "${project.name}"? This action cannot be undone.`,
      okText: 'Confirm Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteProject(project.id);
          message.success('Project deleted successfully');
          await fetchProjects();
        } catch (error) {
          console.error('Failed to delete project:', error);
          message.error(
            error?.response?.data?.message ||
              'Failed to delete project, please try again later'
          );
        }
      },
    });
  };

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
        <div className={styles.titleSection}>
          <Title level={2} className={styles.pageTitle}>
            {subjectName}
          </Title>
          <Tooltip title="Manage Subject">
            <Button
              aria-label="Manage Subject"
              className={`${styles.createButton} ${styles.editSubjectButton}`}
              icon={<EditOutlined />}
              onClick={handleManageSubject}
              disabled={isMarker}
            />
          </Tooltip>
        </div>
        <Button
          onClick={handleCreateProject}
          className={styles.createButton}
          icon={<PlusOutlined />}
          disabled={isMarker}
        >
          Create Project
        </Button>
      </div>
      <div className={styles.mainContent}>
        <Card className={styles.projectSection} loading={loading}>
          {Array.isArray(projects) && projects.length > 0 ? (
            <>
              <div className={styles.projectTableHeader}>
                <div className={styles.headerCell}>Project</div>
                <div className={styles.headerCell}>
                  {showMarkCounts ? 'Marked / Unmarked' : 'Scored / Total'}
                </div>
                <div className={styles.headerCell}>Actions</div>
              </div>
              {projects.map((project) => {
                const { leftText, rightText } = getProjectProgress(project);
                return (
                  <div className={styles.projectItem} key={project.id}>
                    <div className={styles.itemBody}>
                      <p
                        className={styles.itemName}
                        onClick={() => handleViewProject(project)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleViewProject(project);
                        }}
                      >
                        {project.name}
                      </p>
                      <div className={styles.itemRatio}>
                        <p className={styles.itemCnt}>{leftText}</p>
                        <p className={styles.itemCnt}>/</p>
                        <p className={styles.itemCnt}>{rightText}</p>
                      </div>
                      <div className={styles.itemBtns}>
                        <Button
                          className={styles.actionButton}
                          onClick={() => handleEditClick(project)}
                          icon={<EditOutlined />}
                        >
                          Mark & Review
                        </Button>
                        <Button
                          danger
                          className={styles.deleteButton}
                          onClick={() => handleDeleteClick(project)}
                          icon={<DeleteOutlined />}
                          disabled={isMarker}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <Empty
              description={
                isMarker ? 'No projects available' : 'No projects yet'
              }
            ></Empty>
          )}
        </Card>
      </div>
    </div>
  );
}
