// client/src/pages/auth/Login.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Divider, App } from 'antd';
import { login } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

const { Title, Text } = Typography;

const Login = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await login(values);
      dispatch(setCredentials(data));
      message.success(`Welcome back, ${data.name}!`);
      
      // Navigate based on role
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'manager') navigate('/manager');
      else navigate('/employee');
    } catch (err) {
      message.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-none">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-lg text-white mb-4">
            <Typography.Text className="text-xl font-bold text-white">GQ</Typography.Text>
          </div>
          <Title level={3}>GoalQuest Portal</Title>
          <Text type="secondary">Enterprise Goal Alignment System</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="email" label="Professional Email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<Mail size={16} className="text-gray-400 mr-2" />} placeholder="name@goalquest.com" />
          </Form.Item>
          
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password prefix={<Lock size={16} className="text-gray-400 mr-2" />} placeholder="••••••••" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} className="h-10 mt-4 font-bold">
            Sign In
          </Button>

          <div className="text-center mt-4">
            <Text type="secondary">Don't have an account? </Text>
            <Button type="link" onClick={() => navigate('/register')} className="p-0">Register Now</Button>
          </div>
        </Form>
        
        <Divider plain><Text type="secondary" className="text-xs italic">Demo Credentials</Text></Divider>
        <div className="grid grid-cols-2 gap-2 text-[10px] bg-gray-50 p-3 rounded">
          <div><Text strong>Admin:</Text> admin@goalquest.com</div>
          <div><Text strong>Manager:</Text> m1@goalquest.com</div>
          <div><Text strong>Employee:</Text> emp1@goalquest.com</div>
          <div><Text strong>Password:</Text> password123</div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
