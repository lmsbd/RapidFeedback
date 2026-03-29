import { Typography } from 'antd';
import styles from './DashboardHeader.module.less';

const { Title } = Typography;

export default function DashboardHeader({ title }) {
  return (
    <div className={styles.dashboardHeader}>
      <div className={styles.dashboardTitle}>
        <Title level={2} className={styles.dashboardText}>
          {title}
        </Title>
      </div>
    </div>
  );
}
