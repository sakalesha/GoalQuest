// client/src/components/shared/Navbar.jsx
import React, { useState } from 'react';
import { Layout, Menu, Button, Space, Typography, Drawer } from 'antd';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { LogOut, Target, Users, Settings, Menu as MenuIcon } from 'lucide-react';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setMobileMenuVisible(false);
  };

  const getMenuItems = () => {
    const items = [];
    if (user.role === 'employee') {
      items.push({ 
        key: '/employee', 
        label: <Link to="/employee" onClick={() => setMobileMenuVisible(false)}>My Goals</Link>, 
        icon: <Target size={16} /> 
      });
    } else if (user.role === 'manager') {
      items.push({ 
        key: '/manager', 
        label: <Link to="/manager" onClick={() => setMobileMenuVisible(false)}>Team Review</Link>, 
        icon: <Users size={16} /> 
      });
      items.push({ 
        key: '/employee', 
        label: <Link to="/employee" onClick={() => setMobileMenuVisible(false)}>My Goals</Link>, 
        icon: <Target size={16} /> 
      });
    } else if (user.role === 'admin') {
      items.push({ 
        key: '/admin', 
        label: <Link to="/admin" onClick={() => setMobileMenuVisible(false)}>Admin Control</Link>, 
        icon: <Settings size={16} /> 
      });
      items.push({ 
        key: '/manager', 
        label: <Link to="/manager" onClick={() => setMobileMenuVisible(false)}>Review Panel</Link>, 
        icon: <Users size={16} /> 
      });
    }
    return items;
  };

  return (
    <Header className="flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200">
      <div className="flex items-center">
        <div className="flex items-center px-3 py-1 bg-blue-600 rounded mr-4 md:mr-8">
          <Text className="font-bold text-white uppercase tracking-wider">GoalQuest</Text>
        </div>
        
        {/* Desktop Menu */}
        <div className="hidden lg:block">
          <Menu 
            mode="horizontal" 
            selectedKeys={[location.pathname]}
            items={getMenuItems()} 
            className="border-none min-w-[300px]"
          />
        </div>
      </div>
      
      {/* Desktop User Info & Logout */}
      <div className="hidden lg:flex items-center space-x-4">
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
      </div>

      {/* Mobile Menu Toggle */}
      <div className="lg:hidden flex items-center space-x-2">
        <div className="flex flex-col items-end leading-tight mr-2">
          <Text strong className="text-sm">{user.name}</Text>
          <Text type="secondary" className="text-[10px] uppercase font-bold text-blue-600">{user.role}</Text>
        </div>
        <Button 
          type="text" 
          icon={<MenuIcon size={24} />} 
          onClick={() => setMobileMenuVisible(true)} 
        />
      </div>

      {/* Mobile Drawer */}
      <Drawer
        title="GoalQuest Navigation"
        placement="right"
        onClose={() => setMobileMenuVisible(false)}
        open={mobileMenuVisible}
        width={280}
      >
        <Menu 
          mode="vertical" 
          selectedKeys={[location.pathname]}
          items={getMenuItems()} 
          className="border-none mb-4"
        />
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-gray-100">
          <Button 
            type="primary" 
            danger 
            block 
            icon={<LogOut size={18} />} 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </Drawer>
    </Header>
  );
};

export default Navbar;
