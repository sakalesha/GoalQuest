// client/src/components/employee/GoalForm.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Select, InputNumber, DatePicker, Alert, Progress, App } from 'antd';
import { createGoal, updateGoal } from '../../services/goalService';
import dayjs from 'dayjs';

const GoalForm = ({ visible, onCancel, onSuccess, goal, sheetId, totalWeightageUsed }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [uomType, setUomType] = useState('MIN');
  const [weightage, setWeightage] = useState(10);

  const remainingWeightage = 100 - totalWeightageUsed + (goal ? goal.weightage : 0);

  useEffect(() => {
    if (!visible) return;

    if (goal) {
      form.setFieldsValue({
        ...goal,
        deadline: goal.deadline ? dayjs(goal.deadline) : null
      });
      setUomType(goal.uomType);
      setWeightage(goal.weightage);
    } else {
      form.resetFields();
      form.setFieldsValue({ weightage: 10, uomType: 'MIN' });
      setUomType('MIN');
      setWeightage(10);
    }
  }, [goal, visible, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        goalSheetId: sheetId,
        weightage: Number(values.weightage),
        deadline: values.deadline ? values.deadline.toISOString() : null
      };

      if (goal) {
        await updateGoal(goal._id, payload);
        message.success('Goal updated');
      } else {
        await createGoal(payload);
        message.success('Goal created');
      }
      onSuccess();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to save goal');
    }
  };

  const isShared = goal?.isShared;

  return (
    <Modal
      title={goal ? "Edit Goal" : "Add New Goal"}
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={700}
      destroyOnHidden
    >
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Weightage Allocation (Max 100%)</span>
          <span className="text-sm font-bold">{remainingWeightage}% Available</span>
        </div>
        <Progress percent={((100 - remainingWeightage) + weightage)} success={{ percent: (100 - remainingWeightage) }} />
      </div>

      {isShared && (
        <Alert
          title="Shared Goal"
          description="Title and Target are read-only for shared goals."
          type="info"
          showIcon
          className="mb-4"
        />
      )}

      <Form form={form} layout="vertical">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Form.Item name="thrustArea" label="Thrust Area" rules={[{ required: true }]}>
            <Select placeholder="Select Thrust Area">
              <Select.Option value="Quality">Quality</Select.Option>
              <Select.Option value="Cost">Cost</Select.Option>
              <Select.Option value="Safety">Safety</Select.Option>
              <Select.Option value="Productivity">Productivity</Select.Option>
              <Select.Option value="Business Growth">Business Growth</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="uomType" label="Unit of Measurement (UoM)" rules={[{ required: true }]}>
            <Select onChange={val => setUomType(val)} disabled={isShared}>
              <Select.Option value="MAX">Max (Higher is better)</Select.Option>
              <Select.Option value="MIN">Min (Lower is better)</Select.Option>
              <Select.Option value="TIMELINE">Timeline (Date-based)</Select.Option>
              <Select.Option value="ZERO">Zero-based (Zero = Success)</Select.Option>
            </Select>
          </Form.Item>
        </div>

        <Form.Item name="title" label="Goal Title" rules={[{ required: true }]}>
          <Input disabled={isShared} placeholder="e.g. Reduce rejection rate" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Provide details on how the goal achieved" />
        </Form.Item>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Form.Item name="target" label="Target Value" rules={[{ required: true }]}>
            <InputNumber className="w-full" disabled={isShared || uomType === 'ZERO'} 
              placeholder={uomType === 'ZERO' ? 'Fixed at 0' : 'Value'} 
              onChange={val => {
                if (uomType === 'ZERO' && val !== 0) form.setFieldsValue({ target: 0 });
              }}
            />
          </Form.Item>

          <Form.Item name="weightage" label="Weightage (%)" rules={[
            { required: true },
            { type: 'number', min: 10, message: 'Minimum 10%' },
            { type: 'number', max: remainingWeightage, message: `Exceeds available: ${remainingWeightage}%` }
          ]}>
            <InputNumber className="w-full" onChange={val => setWeightage(val || 0)} />
          </Form.Item>

          {uomType === 'TIMELINE' && (
            <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}>
              <DatePicker className="w-full" disabled={isShared} />
            </Form.Item>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default GoalForm;
