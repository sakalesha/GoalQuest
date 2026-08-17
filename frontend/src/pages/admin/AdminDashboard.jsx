// client/src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { Layout, Typography, Tabs, Card } from 'antd';
import { Settings, ClipboardList, PieChart, Send, ShieldAlert } from 'lucide-react';
import CycleConfig from '../../components/admin/CycleConfig';
import AuditLog from '../../components/admin/AuditLog';
import Reports from '../../components/admin/Reports';
import PushSharedGoal from '../../components/admin/PushSharedGoal';
import GoalExceptions from '../../components/admin/GoalExceptions';

const { Content } = Layout;
const { Title, Text } = Typography;

const AdminDashboard = () => {
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <Title level={2} className="mb-0 text-xl md:text-3xl">Administrator Governance</Title>
            <Text type="secondary" className="text-sm">System configuration, compliance monitoring and audit trails</Text>
          </div>

          <Card variant="borderless" className="shadow-none bg-transparent" styles={{ body: { padding: 0 } }}>
            <Tabs 
              defaultActiveKey="1" 
              type="card"
              items={[
                {
                  key: '1',
                  label: <span className="flex items-center"><PieChart size={14} className="mr-2"/> Completion & Stats</span>,
                  children: <Reports />
                },
                {
                  key: '2',
                  label: <span className="flex items-center"><Send size={14} className="mr-2"/> Push Shared Goals</span>,
                  children: <PushSharedGoal />
                },
                {
                  key: '3',
                  label: <span className="flex items-center"><ShieldAlert size={14} className="mr-2"/> Exceptions & Unlocks</span>,
                  children: <GoalExceptions />
                },
                {
                  key: '4',
                  label: <span className="flex items-center"><Settings size={14} className="mr-2"/> Cycle Management</span>,
                  children: <CycleConfig />
                },
                {
                  key: '5',
                  label: <span className="flex items-center"><ClipboardList size={14} className="mr-2"/> Audit Logs</span>,
                  children: <AuditLog />
                }
              ]}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminDashboard;
