// client/src/components/shared/Navbar.jsx
import React from 'react';
import { Layout, Menu, Button, Space, Typography } from 'antd';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { LogOut, Target, Users, Settings } from 'lucide-react';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [];
    if (user.role === 'employee') {
      items.push({ 
        key: '/employee', 
        label: <Link to="/employee">My Goals</Link>, 
        icon: <Target size={16} /> 
      });
    } else if (user.role === 'manager') {
      items.push({ 
        key: '/manager', 
        label: <Link to="/manager">Team Review</Link>, 
        icon: <Users size={16} /> 
      });
      items.push({ 
        key: '/employee', 
        label: <Link to="/employee">My Goals</Link>, 
        icon: <Target size={16} /> 
      });
    } else if (user.role === 'admin') {
      items.push({ 
        key: '/admin', 
        label: <Link to="/admin">Admin Control</Link>, 
        icon: <Settings size={16} /> 
      });
      items.push({ 
        key: '/manager', 
        label: <Link to="/manager">Review Panel</Link>, 
        icon: <Users size={16} /> 
      });
    }
    return items;
  };

  return (
    <Header className="flex items-center justify-between px-6 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-8">
        <div className="flex items-center px-3 py-1 bg-blue-600 rounded">
          <Text className="font-bold text-white uppercase tracking-wider">GoalQuest</Text>
        </div>
        <Menu 
          mode="horizontal" 
          selectedKeys={[location.pathname]}
          items={getMenuItems()} 
          className="border-none min-w-[400px]"
        />
      </div>
      
      <Space size="middle">
        <div className="flex flex-col items-end leading-tight">
          <Text strong>{user.name}</Text>
          <Text type="secondary" className="text-[10px] uppercase font-bold text-blue-600">{user.role}</Text>
        </div>
        <Button 
          type="text" 
          danger 
          icon={<LogOut size={16} />} 
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Space>
    </Header>
  );
};

export default Navbar;
