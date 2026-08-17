// client/src/components/admin/AuditLog.jsx
import React, { useState, useEffect } from 'react';
import { Table, Tag, Card, Typography, Space, Input, DatePicker } from 'antd';
import { getAuditLogs } from '../../services/adminService';
import dayjs from 'dayjs';

const { Text } = Typography;

const AuditLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const { data } = await getAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const columns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'time',
      render: date => dayjs(date).format('DD MMM, HH:mm'),
    },
    {
      title: 'Actor',
      key: 'actor',
      render: (_, record) => record.actor?.name || 'System'
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: action => <Tag color={action === 'APPROVE' ? 'green' : 'blue'}>{action}</Tag>
    },
    {
      title: 'Entity',
      key: 'entity',
      render: (_, record) => (
        <Space orientation="vertical" size={0}>
          <Text strong className="capitalize text-[10px]">{record.entityType}</Text>
          <Text code className="text-[10px]">{record.entityId}</Text>
        </Space>
      )
    },
    {
      title: 'Changes',
      key: 'changes',
      render: (_, record) => (
        <div className="text-xs">
          {record.fieldChanged}: 
          <Text delete type="secondary" className="mx-1">{JSON.stringify(record.oldValue)}</Text> → 
          <Text strong type="success" className="ml-1">{JSON.stringify(record.newValue)}</Text>
        </div>
      )
    }
  ];

  return (
    <Card title="System Audit Trail" className="shadow-sm">
      <Table 
        columns={columns} 
        dataSource={logs} 
        rowKey="_id" 
        loading={loading}
        size="small"
        pagination={{ pageSize: 15 }}
        scroll={{ x: 700 }}
      />
    </Card>
  );
};

export default AuditLog;
