// client/src/components/employee/GoalList.jsx
import React from 'react';
import { Table, Button, Space, Tag, Typography, Popconfirm, Tooltip, Alert } from 'antd';
import { Edit2, Trash2, Lock, ShieldCheck } from 'lucide-react';
import RoleBadge from '../shared/RoleBadge';

const { Text } = Typography;

const GoalList = ({ goals, onEdit, onDelete, sheetStatus }) => {
  const isLocked = sheetStatus === 'APPROVED' || sheetStatus === 'LOCKED' || sheetStatus === 'SUBMITTED';

  const columns = [
    {
      title: 'Thrust Area',
      dataIndex: 'thrustArea',
      key: 'thrustArea',
      render: text => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Goal Details',
      key: 'details',
      render: (_, record) => (
        <div>
          <div className="flex items-center space-x-1">
            <Text strong>{record.title}</Text>
            {record.isShared && <Tooltip title="Shared Goal"><ShieldCheck size={14} className="text-blue-500" /></Tooltip>}
          </div>
          <Text type="secondary" className="text-xs">{record.description}</Text>
        </div>
      )
    },
    {
      title: 'UoM',
      dataIndex: 'uomType',
      key: 'uomType',
    },
    {
      title: 'Target',
      key: 'target',
      render: (_, record) => (
        record.uomType === 'TIMELINE' 
          ? new Date(record.deadline).toLocaleDateString()
          : record.target
      )
    },
    {
      title: 'Weightage',
      dataIndex: 'weightage',
      key: 'weightage',
      render: val => `${val}%`
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: val => <Tag>{val.replace('_', ' ')}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            disabled={isLocked && record.role !== 'admin'}
            icon={isLocked ? <Lock size={16} /> : <Edit2 size={16} />} 
            onClick={() => onEdit(record)}
          />
          {!isLocked && (
            <Popconfirm title="Delete this goal?" onConfirm={() => onDelete(record._id)}>
              <Button type="text" danger icon={<Trash2 size={16} />} />
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  const totalWeight = goals.reduce((sum, g) => sum + g.weightage, 0);

  return (
    <div className="space-y-4">
      {isLocked && (
        <Alert 
          title="Goal Sheet Locked" 
          description={sheetStatus === 'SUBMITTED' ? "Sheet is under review." : "Approved sheets cannot be edited without Admin assistance."}
          type="warning" 
          showIcon 
        />
      )}
      <Table 
        columns={columns} 
        dataSource={goals} 
        rowKey="_id" 
        pagination={false}
        scroll={{ x: 800 }}
        footer={() => (
          <div className="flex justify-between items-center px-4">
            <Text strong>Goal Count: {goals.length} / 8</Text>
            <Text strong className={totalWeight === 100 ? "text-green-600" : "text-red-500"}>
              Total Weightage: {totalWeight}%
            </Text>
          </div>
        )}
      />
    </div>
  );
};

export default GoalList;
