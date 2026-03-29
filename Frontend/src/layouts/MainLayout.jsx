import React from 'react';
import { Layout, Typography, Button, Dropdown, Menu } from 'antd';
import { Link, Outlet, useLocation } from 'umi';
import { observer } from 'mobx-react-lite';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import userStore from '@/stores/userStore';
import styles from './MainLayout.module.css';

const { Sider, Content } = Layout;
const { Text } = Typography;

function NavItem({ to, active, icon, children }) {
  return (
    <Link
      to={to}
      className={`${styles.navItem} ${active ? styles.active : ''}`}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
    </Link>
  );
}

const MainLayout = observer(() => {
  const { pathname } = useLocation();

  const handleLogout = () => {
    userStore.logout();
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className={styles.layout}>
      {/* LeftSide */}
      <Sider width={260} className={styles.sider} theme="light">
        {/* User Info */}
        <div className={styles.userBox}>
          <div className={styles.avatarPlaceholder}>
            <UserOutlined style={{ fontSize: '24px', color: '#666' }} />
          </div>
          <div className={styles.userRight}>
            <Text className={styles.userName}>
              {userStore.userName || 'User'}
            </Text>
            <Dropdown
              overlay={userMenu}
              trigger={['click']}
              placement="topLeft"
            >
              <Button className={styles.editLink}>Edit</Button>
            </Dropdown>
          </div>
        </div>

        <div className={styles.sep} />

        <nav className={styles.nav}>
          <NavItem to="/subject" active={pathname === '/subject'}>
            Subject
          </NavItem>

          <NavItem to="/commentLibrary" active={pathname === '/commentLibrary'}>
            Comment Library
          </NavItem>

          <NavItem to="/setting" active={pathname === '/setting'}>
            Setting
          </NavItem>
        </nav>
      </Sider>

      {/* RightSide */}
      <Layout>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
});

export default MainLayout;
