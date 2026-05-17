// client/src/pages/employee/EmployeeDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Layout, Button, Card, Typography, Space, Alert, Tabs, App } from 'antd';
import { Plus, Send } from 'lucide-react';
import { getMyGoalSheet, getGoalsBySheet, deleteGoal, submitGoalSheet } from '../../services/goalService';
import GoalList from '../../components/employee/GoalList';
import GoalForm from '../../components/employee/GoalForm';
import CheckInForm from '../../components/employee/CheckInForm';
import { useSelector } from 'react-redux';

const { Content } = Layout;
const { Title, Text } = Typography;

const EmployeeDashboard = () => {
  const { message } = App.useApp();
  const [sheet, setSheet] = useState(null);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [checkInVisible, setCheckInVisible] = useState(false);
  const [currentQuarter, setCurrentQuarter] = useState('Q1');

  const { user } = useSelector(state => state.auth);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: sheetData } = await getMyGoalSheet();
      setSheet(sheetData);
      const { data: goalsData } = await getGoalsBySheet(sheetData._id);
      setGoals(goalsData);
    } catch (err) {
      message.error('Failed to load goal data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalWeight = goals.reduce((sum, g) => sum + g.weightage, 0);

  const handleSubmitSheet = async () => {
    if (totalWeight !== 100) {
      return message.error('Total weightage must be exactly 100% before submission.');
    }
    try {
      await submitGoalSheet(sheet._id);
      message.success('Goal sheet submitted for review!');
      loadData();
    } catch (err) {
      message.error(err.response?.data?.message || 'Submission failed');
    }
  };

  const handleEdit = (goal) => {
    setSelectedGoal(goal);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(id);
      message.success('Goal removed');
      loadData();
    } catch (err) {
      message.error('Failed to remove goal');
    }
  };

  const handleCheckIn = (goal) => {
    setSelectedGoal(goal);
    setCheckInVisible(true);
  };

  return (
    <Layout className="min-h-screen bg-gray-100">
      <Content className="p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <Title level={2} className="mb-0">My Performance Portal</Title>
              <Text type="secondary">Manage your goals and quarterly check-ins</Text>
            </div>
            {sheet?.status === 'DRAFT' && (
              <Space>
                <Button 
                  type="primary" 
                  icon={<Plus size={16} />} 
                  onClick={() => { setSelectedGoal(null); setFormVisible(true); }}
                  disabled={goals.length >= 8}
                  className="flex items-center"
                >
                  {goals.length >= 8 ? 'Goal Limit Reached (8)' : 'Add Goal'}
                </Button>
                <Button 
                  type="primary" 
                  ghost
                  icon={<Send size={16} />} 
                  onClick={handleSubmitSheet}
                  disabled={totalWeight !== 100}
                  className="flex items-center"
                >
                  Submit for Approval
                </Button>
              </Space>
            )}
          </div>

          <Card>
            <Tabs 
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: '1. Goal Planning',
                  children: (
                    <GoalList 
                      goals={goals} 
                      sheetStatus={sheet?.status} 
                      onEdit={handleEdit} 
                      onDelete={handleDelete} 
                    />
                  )
                },
                {
                  key: '2',
                  label: '2. Monthly Check-Ins',
                  disabled: sheet?.status === 'DRAFT',
                  children: (
                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                          <Button 
                            key={q} 
                            type={currentQuarter === q ? 'primary' : 'default'}
                            onClick={() => setCurrentQuarter(q)}
                          >
                            {q}
                          </Button>
                        ))}
                      </div>
                      <Alert 
                        title={`Currently recording progress for ${currentQuarter}`} 
                        type="info" 
                        showIcon 
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {goals.map(goal => (
                          <Card 
                            key={goal._id} 
                            size="small" 
                            title={goal.title}
                            extra={<Button type="link" onClick={() => handleCheckIn(goal)}>Update</Button>}
                          >
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between"><span>Weightage:</span> <span>{goal.weightage}%</span></div>
                              <div className="flex justify-between"><span>UoM:</span> <span>{goal.uomType}</span></div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </div>
      </Content>

      <GoalForm 
        visible={formVisible} 
        onCancel={() => setFormVisible(false)} 
        onSuccess={() => { setFormVisible(false); loadData(); }}
        goal={selectedGoal}
        sheetId={sheet?._id}
        totalWeightageUsed={totalWeight}
      />

      <CheckInForm 
        visible={checkInVisible}
        onCancel={() => setCheckInVisible(false)}
        goal={selectedGoal}
        quarter={currentQuarter}
      />
    </Layout>
  );
};

export default EmployeeDashboard;
