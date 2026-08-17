// client/src/components/admin/PushSharedGoal.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, DatePicker, Button, App, Card, Divider, Transfer } from 'antd';
import { pushSharedGoal } from '../../services/goalService';
import api from '../../services/api';

const PushSharedGoal = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await api.get('/admin/users'); // Assuming this exists or I'll add it
        setEmployees(data.filter(u => u.role === 'employee').map(u => ({
          key: u._id,
          title: u.name,
          description: `${u.department} - ${u.email}`
        })));
      } catch (err) {
        message.error('Failed to load employees');
      }
    };
    fetchEmployees();
  }, []);

  const onFinish = async (values) => {
    if (targetKeys.length === 0) return message.error('Please select at least one recipient');
    setLoading(true);
    try {
      const { title, description, uomType, target, weightage, deadline } = values;
      await pushSharedGoal({
        recipients: targetKeys,
        goalData: { title, description, uomType, target, weightage, deadline }
      });
      message.success(`Shared goal pushed to ${targetKeys.length} employees`);
      form.resetFields();
      setTargetKeys([]);
    } catch (err) {
      message.error('Failed to push shared goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Push Shared Goal / Departmental KPI" variant="borderless">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Form.Item name="title" label="Goal Title" rules={[{ required: true }]}>
              <Input placeholder="e.g. Increase System Uptime" />
            </Form.Item>
            
            <Form.Item name="description" label="Description" rules={[{ required: true }]}>
              <Input.TextArea rows={3} placeholder="Detailed explanation of the KPI" />
            </Form.Item>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item name="uomType" label="UoM" rules={[{ required: true }]}>
                <Select placeholder="Type">
                  <Select.Option value="MAX">MAX (Higher is better)</Select.Option>
                  <Select.Option value="MIN">MIN (Lower is better)</Select.Option>
                  <Select.Option value="ZERO">BINARY (0 or 1)</Select.Option>
                  <Select.Option value="TIMELINE">TIMELINE (Date bound)</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="target" label="Target Value" rules={[{ required: true }]}>
                <InputNumber className="w-full" />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Form.Item name="weightage" label="Weightage (%)" rules={[{ required: true }]}>
                <InputNumber min={10} max={100} className="w-full" />
              </Form.Item>
              <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
                <DatePicker className="w-full" />
              </Form.Item>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Form.Item label="Select Recipient Employees" required>
              <Transfer
                dataSource={employees}
                showSearch
                listStyle={{ height: 350, width: '100%', minWidth: 250 }}
                targetKeys={targetKeys}
                onChange={setTargetKeys}
                render={item => item.title}
                oneWay
              />
            </Form.Item>
          </div>
        </div>

        <Divider />
        <Button type="primary" htmlType="submit" loading={loading} block size="large">
          Broadcast Goal to Selected Employees
        </Button>
      </Form>
    </Card>
  );
};

export default PushSharedGoal;
