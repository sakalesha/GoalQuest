// client/src/pages/manager/ManagerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Layout, Typography, Tabs, Card, Statistic, Row, Col } from 'antd';
import { Users, FileCheck, MessageSquare } from 'lucide-react';
import ApprovalDashboard from '../../components/manager/ApprovalDashboard';
import TeamCheckIn from '../../components/manager/TeamCheckIn';
import PushSharedGoal from '../../components/admin/PushSharedGoal';
import { useSelector } from 'react-redux';
import { getManagerStats } from '../../services/reportService';

const { Content } = Layout;
const { Title, Text } = Typography;

const ManagerDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [statsData, setStatsData] = useState({ directReports: 0, pendingApprovals: 0, unreadCheckIns: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await getManagerStats();
        setStatsData(data);
      } catch (err) {
        console.error('Failed to fetch manager stats', err);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'Direct Reports', value: statsData.directReports, icon: <Users className="text-blue-500" /> },
    { title: 'Pending Approvals', value: statsData.pendingApprovals, icon: <FileCheck className="text-orange-500" /> },
    { title: 'Unread Check-ins', value: statsData.unreadCheckIns, icon: <MessageSquare className="text-green-500" /> }
  ];

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end space-y-4 sm:space-y-0">
            <div>
              <Title level={2} className="mb-0 text-xl md:text-3xl">Team Management Dashboard</Title>
              <Text type="secondary" className="text-sm">Review and approve your direct reports' performance goals</Text>
            </div>
          </div>

          <Row gutter={[16, 16]}>
            {stats.map((s, idx) => (
              <Col xs={24} sm={12} md={8} key={idx}>
                <Card variant="borderless" className="shadow-sm">
                  <Statistic 
                    title={<span className="flex items-center space-x-2 font-medium">{s.icon} <span className="ml-1">{s.title}</span></span>}
                    value={s.value} 
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Card variant="borderless" className="shadow-sm overflow-hidden">
            <Tabs 
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Cycle Approvals',
                  children: <ApprovalDashboard />
                },
                {
                  key: '2',
                  label: 'Execution Progress',
                  children: <TeamCheckIn />
                },
                {
                  key: '3',
                  label: 'Push Team Goals',
                  children: <PushSharedGoal />
                }
              ]}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default ManagerDashboard;
