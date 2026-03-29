import { useEffect, useState } from 'react';
import { Card, Typography, Spin, message } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { history } from 'umi';
import { getCommentLibraryList } from '../../apis/comment';
import styles from './index.module.less';
import DashboardHeader from '../../components/DashboardHeader/DashboardHeader';

const { Title } = Typography;

export default function Index() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await getCommentLibraryList();
      if (response.code === 200 && response.data) {
        setCategories(response.data);
      } else {
        message.error('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleGoDetails = (categoryId) => {
    history.push(`/commentLibrary/commentList/${categoryId}`);
  };

  if (loading) {
    return (
      <div className={styles.commentLibraryPage}>
        <DashboardHeader title="Comment Library" />
        <div className={styles.loadingContainer}>
          <Spin size="large" tip="Loading categories..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.commentLibraryPage}>
      {/* Header */}
      <DashboardHeader title="Comment Library" />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Category List */}
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <Card
              key={category.id}
              className={styles.categoryItem}
              onClick={() => handleGoDetails(category.id)}
            >
              <div className={styles.itemContainer}>
                <div className={styles.itemContent}>
                  <Title level={3} className={styles.itemName}>
                    {category.name}
                  </Title>
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
}
