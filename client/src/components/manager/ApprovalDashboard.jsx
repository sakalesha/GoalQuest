// client/src/components/manager/ApprovalDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Input, InputNumber, DatePicker, Tag, Typography, Space, App } from 'antd';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { getTeamGoalSheets, approveGoalSheet, returnGoalSheet, getGoalsBySheet, updateGoal } from '../../services/goalService';
import dayjs from 'dayjs';

const { Text } = Typography;

const ApprovalDashboard = () => {
  const { message } = App.useApp();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [returnModalVisible, setReturnModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [currentGoals, setCurrentGoals] = useState([]);
  const [selectedSheetId, setSelectedSheetId] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState(null);
  const [comment, setComment] = useState('');

  const [editingKey, setEditingKey] = useState('');
  const [editedValues, setEditedValues] = useState({});

  const loadSheets = async () => {
    setLoading(true);
    try {
      const { data } = await getTeamGoalSheets();
      setSheets(data);
      // Update selected sheet if it's currently open
      if (selectedSheetId) {
        const updated = data.find(s => s._id === selectedSheetId);
        if (updated) setSelectedSheet(updated);
      }
    } catch (err) {
      message.error('Failed to load pending sheets');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (goalId) => {
    try {
      await updateGoal(goalId, editedValues[goalId]);
      message.success('Goal updated');
      // Refresh current goals
      const { data } = await getGoalsBySheet(selectedSheetId);
      setCurrentGoals(data);
    } catch (err) {
      message.error('Update failed');
    }
  };

  const onValueChange = (goalId, field, value) => {
    setEditedValues(prev => ({
      ...prev,
      [goalId]: {
        ...(prev[goalId] || {}),
        [field]: value
      }
    }));
  };

  const handleViewDetails = async (sheet) => {
    setSelectedSheetId(sheet._id);
    setSelectedSheet(sheet);
    setDetailsModalVisible(true);
    setLoading(true);
    try {
      const { data } = await getGoalsBySheet(sheet._id);
      setCurrentGoals(data);
      // Initialize edited values
      const initialEdited = {};
      data.forEach(g => {
        initialEdited[g._id] = { target: g.target, weightage: g.weightage };
      });
      setEditedValues(initialEdited);
    } catch (err) {
      message.error('Failed to load goal details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSheets();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveGoalSheet(id);
      message.success('Goal sheet approved and locked');
      loadSheets();
    } catch (err) {
      message.error('Approval failed');
    }
  };

  const handleReturn = async () => {
    if (!comment) return message.error('Please provide a comment for rework');
    try {
      await returnGoalSheet(selectedSheetId, comment);
      message.success('Returned to employee');
      setReturnModalVisible(false);
      setDetailsModalVisible(false);
      setComment('');
      loadSheets();
    } catch (err) {
      message.error('Action failed');
    }
  };

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
      title: 'Department',
      dataIndex: ['employeeId', 'department'],
      key: 'dept'
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color = 'default';
        if (status === 'SUBMITTED') color = 'processing';
        if (status === 'APPROVED') color = 'success';
        if (status === 'DRAFT') color = 'warning';
        return <Badge status={color} text={status} />;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'SUBMITTED' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                icon={<CheckCircle size={14} className="mr-1" />}
                onClick={() => handleApprove(record._id)}
                className="flex items-center"
              >
                Approve
              </Button>
              <Button 
                danger 
                size="small" 
                icon={<XCircle size={14} className="mr-1" />}
                onClick={() => { setSelectedSheetId(record._id); setReturnModalVisible(true); }}
                className="flex items-center"
              >
                Return
              </Button>
            </>
          )}
          <Button 
            type="text" 
            icon={<Eye size={16} />} 
            title="View Details" 
            onClick={() => handleViewDetails(record)}
          />
        </Space>
      )
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="mb-4 flex justify-between items-center">
        <Typography.Title level={4}>Approval Queue</Typography.Title>
        <Button size="small" onClick={loadSheets}>Refresh</Button>
      </div>
      <Table 
        columns={columns} 
        dataSource={sheets} 
        rowKey="_id" 
        loading={loading}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 700 }}
      />

      <Modal
        title="Return Goal Sheet for Rework"
        open={returnModalVisible}
        onOk={handleReturn}
        onCancel={() => setReturnModalVisible(false)}
        width={500}
        centered
      >
        <Typography.Text type="secondary" className="block mb-2 text-sm">
          Explain what needs to be corrected in the goal sheet.
        </Typography.Text>
        <Input.TextArea 
          rows={4} 
          value={comment} 
          onChange={(e) => setComment(e.target.value)}
          placeholder="e.g. Weightage allocation is not reflective of priority, please adjust."
        />
      </Modal>

      <Modal
        title="Goal Sheet Details"
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>Close</Button>,
          selectedSheet?.status === 'SUBMITTED' && (
            <React.Fragment key="actions">
              <Button 
                danger 
                onClick={() => setReturnModalVisible(true)}
                icon={<XCircle size={14} className="mr-1" />}
              >
                Return
              </Button>
              <Button 
                type="primary" 
                onClick={() => { handleApprove(selectedSheetId); setDetailsModalVisible(false); }}
                icon={<CheckCircle size={14} className="mr-1" />}
              >
                Approve Sheet
              </Button>
            </React.Fragment>
          )
        ]}
        width={900}
        centered
        className="max-w-[95vw]"
      >
        <Table 
          loading={loading}
          dataSource={currentGoals}
          rowKey="_id"
          pagination={false}
          scroll={{ x: 600 }}
          columns={[
            { title: 'Goal Title', dataIndex: 'title', key: 'title', render: (t) => <Text strong>{t}</Text> },
            { title: 'UoM', dataIndex: 'uomType', key: 'uom' },
            { 
              title: 'Target', 
              dataIndex: 'target', 
              key: 'target',
              render: (v, record) => (
                record.uomType === 'TIMELINE' ? (
                  <DatePicker 
                    defaultValue={record.deadline ? dayjs(record.deadline) : null}
                    onChange={(date) => onValueChange(record._id, 'deadline', date ? date.toISOString() : null)}
                    size="small"
                  />
                ) : (
                  <InputNumber 
                    value={editedValues[record._id]?.target ?? v} 
                    onChange={(val) => onValueChange(record._id, 'target', val)}
                    size="small"
                  />
                )
              )
            },
            { 
              title: 'Weightage', 
              dataIndex: 'weightage', 
              key: 'weight', 
              render: (w, record) => (
                <div className="flex items-center space-x-2">
                  <InputNumber 
                    value={editedValues[record._id]?.weightage ?? w} 
                    onChange={(val) => onValueChange(record._id, 'weightage', val)}
                    min={10} max={100}
                    size="small"
                  />
                  <span>%</span>
                </div>
              ) 
            },
            {
              title: 'Actions',
              key: 'edit_actions',
              render: (_, record) => (
                <Button 
                  size="small" 
                  type="link" 
                  onClick={() => handleSaveGoal(record._id)}
                  disabled={!editedValues[record._id]}
                >
                  Save
                </Button>
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default ApprovalDashboard;
