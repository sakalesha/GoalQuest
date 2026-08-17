// client/src/pages/auth/Register.jsx
import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Select, App } from 'antd';
import { register } from '../../services/authService';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Briefcase } from 'lucide-react';

const { Title, Text } = Typography;
const { Option } = Select;

const Register = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = await register(values);
      dispatch(setCredentials(data));
      message.success(`Account created successfully! Welcome, ${data.name}!`);
      
      // Navigate based on role
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'manager') navigate('/manager');
      else navigate('/employee');
    } catch (err) {
      message.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-none">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-lg text-white mb-4">
            <Typography.Text className="text-xl font-bold text-white">GQ</Typography.Text>
          </div>
          <Title level={3}>Create Account</Title>
          <Text type="secondary">Join the GoalQuest Network</Text>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input prefix={<User size={16} className="text-gray-400 mr-2" />} placeholder="John Doe" />
          </Form.Item>

          <Form.Item name="email" label="Professional Email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<Mail size={16} className="text-gray-400 mr-2" />} placeholder="name@goalquest.com" />
          </Form.Item>
          
          <Form.Item name="password" label="Password" rules={[{ required: true, min: 6 }]}>
            <Input.Password prefix={<Lock size={16} className="text-gray-400 mr-2" />} placeholder="••••••••" />
          </Form.Item>

          <Form.Item name="department" label="Department" rules={[{ required: true }]}>
            <Select placeholder="Select your department" prefix={<Briefcase size={16} className="text-gray-400 mr-2" />}>
              <Option value="Engineering">Engineering</Option>
              <Option value="Sales">Sales</Option>
              <Option value="Quality">Quality</Option>
              <Option value="Human Resources">Human Resources</Option>
              <Option value="Finance">Finance</Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={loading} className="h-10 mt-2 font-bold">
            Sign Up
          </Button>

          <div className="text-center mt-4">
            <Text type="secondary">Already have an account? </Text>
            <Button type="link" onClick={() => navigate('/login')} className="p-0">Sign In</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
