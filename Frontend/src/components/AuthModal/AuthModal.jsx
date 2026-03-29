import React, { useState } from 'react';
import { Modal, Form, Input, Button, Tabs, message, Select } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { history } from 'umi';
import userStore from '@/stores/userStore';
import request from '@/utils/request';
import styles from './AuthModal.module.less';

const { TabPane } = Tabs;
const { Option } = Select;

const AuthModal = observer(({ visible, onClose }) => {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const handleLogin = async (values) => {
    console.log('Login attempt with values:', values);
    setLoading(true);
    try {
      console.log('Sending login request...');
      const response = await request.post('/login', {
        email: values.email,
        password: values.password,
      });

      console.log('Login response:', response);

      if (response.code === 200) {
        // Login successful, save user info and token
        console.log('Login successful, saving user data:', response.data);
        userStore.login(response.data.token, response.data);
        message.success('Login successful!');
        onClose();
        loginForm.resetFields();
        history.replace('/subject');
      } else {
        message.error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Login failed, please check your network connection');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const response = await request.post('/register', {
        username: values.username,
        password: values.password,
        email: values.email,
        role: values.role,
      });

      if (response.code === 200) {
        message.success('Registration successful! Please login');
        setActiveTab('login');
        registerForm.resetFields();
      } else {
        message.error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Register error:', error);
      message.error(
        'Registration failed, please check your network connection'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    loginForm.resetFields();
    registerForm.resetFields();
  };

  const handleCancel = () => {
    loginForm.resetFields();
    registerForm.resetFields();
    onClose();
  };

  return (
    <Modal
      title="User Authentication"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={400}
      className={styles.authModal}
    >
      <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
        <TabPane tab="Login" key="login">
          <Form
            form={loginForm}
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Please enter your email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Please enter your password"
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Login
              </Button>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab="Register" key="register">
          <Form
            form={registerForm}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              label="Username"
              rules={[
                { required: true, message: 'Please enter your username' },
                { min: 2, message: 'Username must be at least 2 characters' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Please enter your username"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email' },
                {
                  type: 'email',
                  message: 'Please enter a valid email address',
                },
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="Please enter your email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password' },
                { min: 6, message: 'Password must be at least 6 characters' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Please enter your password"
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Please select a role">
                <Option value={1}>Admin</Option>
                <Option value={2}>Marker</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Register
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
    </Modal>
  );
});

export default AuthModal;
