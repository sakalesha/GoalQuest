// client/src/components/employee/CheckInForm.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Select, Descriptions, Tag, Statistic, Card, App } from 'antd';
import { upsertCheckIn, getGoalCheckIns } from '../../services/checkInService';
import dayjs from 'dayjs';

const CheckInForm = ({ visible, onCancel, goal, quarter }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (visible && goal) {
      loadCheckIn();
    }
  }, [visible, goal, quarter]);

  const loadCheckIn = async () => {
    setLoading(true);
    try {
      const { data } = await getGoalCheckIns(goal._id);
      setHistory(data);
      const current = data.find(c => c.quarter === quarter);
      if (current) {
        form.setFieldsValue({
          ...current,
          completionDate: current.completionDate ? dayjs(current.completionDate) : null
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ status: 'NOT_STARTED', actualAchievement: 0, progressScore: 0 });
      }
    } catch (err) {
      message.error('Failed to load check-in data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await upsertCheckIn({
        ...values,
        goalId: goal._id,
        quarter,
        completionDate: values.completionDate ? values.completionDate.toISOString() : null
      });
      message.success(`${quarter} update saved`);
      onCancel();
    } catch (err) {
      message.error('Failed to save update');
    }
  };

  if (!goal) return null;

  const isTimeline = goal.uomType === 'TIMELINE';

  return (
    <Modal
      title={`Quarterly Check-In: ${quarter}`}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={700}
      confirmLoading={loading}
      destroyOnHidden
    >
      <Card className="mb-4 bg-gray-50 border-none">
        <Descriptions title="Goal Definition" column={{ xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }} size="small">
          <Descriptions.Item label="Title">{goal.title}</Descriptions.Item>
          <Descriptions.Item label="UoM">{goal.uomType}</Descriptions.Item>
          <Descriptions.Item label="Target">
            {isTimeline ? dayjs(goal.deadline).format('DD MMM YYYY') : goal.target}
          </Descriptions.Item>
          <Descriptions.Item label="Weightage">{goal.weightage}%</Descriptions.Item>
        </Descriptions>
      </Card>

      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item 
            name="actualAchievement" 
            label="Actual Achievement" 
            rules={[{ required: !isTimeline, message: 'Achievement is required' }]}
          >
            <InputNumber className="w-full" disabled={isTimeline} placeholder={isTimeline ? 'N/A' : 'Value'} />
          </Form.Item>

          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="NOT_STARTED">Not Started</Select.Option>
              <Select.Option value="ON_TRACK">On Track</Select.Option>
              <Select.Option value="COMPLETED">Completed</Select.Option>
            </Select>
          </Form.Item>
        </div>

        {isTimeline && (
          <Form.Item name="completionDate" label="Completion Date" rules={[{ required: true, message: 'Date is required' }]}>
            <DatePicker className="w-full" />
          </Form.Item>
        )}

        <Form.Item label="Manager Feedback" name="managerComment">
          <Input.TextArea readOnly rows={2} className="bg-gray-50" placeholder="No feedback yet" />
        </Form.Item>
      </Form>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <Statistic 
          title={`System Computed Progress Score (${quarter})`} 
          value={form.getFieldValue('progressScore') * 100 || 0} 
          precision={2}
          suffix="%"
          valueStyle={{ color: '#3f8600' }}
        />
      </div>
    </Modal>
  );
};

export default CheckInForm;
