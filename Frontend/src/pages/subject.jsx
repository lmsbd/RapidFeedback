import { useEffect, useState } from 'react';
import { Card, Button, Typography } from 'antd';
import { ArrowRightOutlined, PlusOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { observer } from 'mobx-react-lite';
import userStore from '@/stores/userStore';
import styles from './subject.module.less';

import subjectStore from '../stores/subjectStore';
import DashboardHeader from '../components/DashboardHeader/DashboardHeader';
import { getSubjectsByUser } from '../apis/getSubject';

const { Title, Text } = Typography;

const Subject = observer(() => {
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        // const response = await getSubjectsByUser('1');
        const response = await getSubjectsByUser(userStore.userId);
        subjectStore.setSubjects(response);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  const handleCreateSubject = () => {
    history.push('/createSubject');
  };

  const handleGoDetails = (id) => {
    history.push(`/subjectDetails/${id}`);
  };

  const hideCreate = String(userStore.role) === '2';

  return (
    <div className={styles.subjectPage}>
      {/* Header */}
      <DashboardHeader title="Subject List" />
      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.contentHeader}>
          {/* Create Button */}
          <div className={styles.createSection}>
            {!hideCreate && (
              <Button
                onClick={handleCreateSubject}
                className={styles.createButton}
                icon={<PlusOutlined className="creationIcon" />}
              >
                Create
              </Button>
            )}
          </div>
        </div>

        {/* Subject List */}
        <div className={styles.subjectList}>
          {subjectStore.subjectsList &&
            subjectStore.subjectsList.length > 0 &&
            subjectStore.subjectsList.map((subject) => (
              <Card
                key={subject.id}
                className={styles.subjectItem}
                onClick={() => handleGoDetails(subject.id)}
              >
                <div className={styles.itemContainer}>
                  <div className={styles.itemContent}>
                    <Title level={3} className={styles.itemName}>
                      {subject.name}
                    </Title>
                    {subject.description && (
                      <Text className={styles.itemDescription}>
                        {subject.description}
                      </Text>
                    )}
                  </div>
                  <div>
                    <ArrowRightOutlined
                      style={{ color: '#020b32', fontSize: '20px' }}
                    />
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
});

export default Subject;
