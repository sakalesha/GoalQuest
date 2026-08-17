// client/src/components/manager/TeamCheckIn.jsx
import React, { useState, useEffect } from 'react';
import { Table, Input, Button, Space, Typography, Card, InputNumber, App } from 'antd';
import { getTeamProgress, addManagerComment } from '../../services/checkInService';

const { Text } = Typography;

const TeamCheckIn = () => {
  const { message } = App.useApp();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState({});

  const loadProgress = async () => {
    setLoading(true);
    try {
      const { data: res } = await getTeamProgress();
      setData(res);
      // Initialize comments state
      const initialComments = {};
      res.forEach(item => {
        initialComments[item._id] = item.managerComment || '';
      });
      setComments(initialComments);
    } catch (err) {
      message.error('Failed to load team progress');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleSaveComment = async (id) => {
    try {
      await addManagerComment(id, comments[id]);
      message.success('Comment saved');
      loadProgress();
    } catch (err) {
      message.error('Failed to save comment');
    }
  };

  const columns = [
    {
      title: 'Employee',
      key: 'emp',
      render: (_, record) => record.goalId.employeeId.name
    },
    {
      title: 'Goal',
      key: 'goal',
      render: (_, record) => record.goalId.title
    },
    {
      title: 'Quarter',
      dataIndex: 'quarter',
      key: 'quarter'
    },
    {
      title: 'Actual',
      dataIndex: 'actualAchievement',
      key: 'actual'
    },
    {
      title: 'Score',
      dataIndex: 'progressScore',
      key: 'score',
      render: score => `${(score * 100).toFixed(1)}%`
    },
    {
      title: 'Feedback',
      key: 'feedback',
      width: '30%',
      render: (_, record) => (
        <Space.Compact style={{ width: '100%' }}>
          <Input 
            placeholder="Add guidance..." 
            value={comments[record._id]} 
            onChange={e => setComments({...comments, [record._id]: e.target.value})}
          />
          <Button onClick={() => handleSaveComment(record._id)}>Save</Button>
        </Space.Compact>
      )
    }
  ];

  return (
    <Card title="Quarterly Execution Review" size="small">
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey="_id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
};

export default TeamCheckIn;
