// client/src/components/admin/GoalExceptions.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Modal, Tag, Space, Typography, App } from 'antd';
import { Lock, Unlock, Search } from 'lucide-react';
import api from '../../services/api';

const { Text } = Typography;

const GoalExceptions = () => {
  const { message } = App.useApp();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadAllSheets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/goal-sheets'); // I'll add this route
      setSheets(data);
    } catch (err) {
      message.error('Failed to load goal sheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSheets();
  }, []);

  const handleToggleLock = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'APPROVED' ? 'DRAFT' : 'APPROVED';
      await api.patch(`/admin/goal-sheets/${id}/status`, { status: newStatus });
      message.success(`Sheet ${newStatus === 'DRAFT' ? 'unlocked' : 're-locked'}`);
      loadAllSheets();
    } catch (err) {
      message.error('Action failed');
    }
  };

  const filteredSheets = sheets.filter(s => 
    s.employeeId.name.toLowerCase().includes(search.toLowerCase()) ||
    s.employeeId.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <div>
          <Text strong>{record.employeeId.name}</Text>
          <div className="text-xs text-gray-400">{record.employeeId.email}</div>
        </div>
      )
    },
    {
      title: 'Current Status',
      dataIndex: 'status',
      key: 'status',
      render: s => <Tag color={s === 'APPROVED' || s === 'LOCKED' ? 'red' : 'green'}>{s}</Tag>
    },
    {
      title: 'Action',
      key: 'actions',
      render: (_, record) => (
        <Button 
          icon={record.status === 'APPROVED' || record.status === 'LOCKED' ? <Unlock size={14} /> : <Lock size={14} />}
          onClick={() => handleToggleLock(record._id, record.status)}
          size="small"
        >
          {record.status === 'APPROVED' || record.status === 'LOCKED' ? 'Unlock for Rework' : 'Force Lock'}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-4">
      <Input 
        prefix={<Search size={16} />} 
        placeholder="Search employees..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
      />
      <Table 
        dataSource={filteredSheets} 
        columns={columns} 
        rowKey="_id" 
        loading={loading}
      />
    </div>
  );
};

export default GoalExceptions;
