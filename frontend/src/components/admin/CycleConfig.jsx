// client/src/components/admin/CycleConfig.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, DatePicker, Button, Table, Tag, Select, Space, App } from 'antd';
import { getCycles, createCycle, updateCyclePhase } from '../../services/adminService';
import dayjs from 'dayjs';

const CycleConfig = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCycles = async () => {
    setLoading(true);
    try {
      const { data } = await getCycles();
      setCycles(data);
    } catch (err) {
      message.error('Failed to load cycles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCycles();
  }, []);

  const onAddCycle = async (values) => {
    try {
      await createCycle({
        ...values,
        openDate: values.dates[0].toISOString(),
        closeDate: values.dates[1].toISOString()
      });
      message.success('New appraisal cycle started');
      form.resetFields();
      loadCycles();
    } catch (err) {
      message.error('Failed to create cycle');
    }
  };

  const handlePhaseChange = async (id, phase) => {
    try {
      await updateCyclePhase(id, phase);
      message.success('Cycle phase updated');
      loadCycles();
    } catch (err) {
      message.error('Update failed');
    }
  };

  const columns = [
    { title: 'Year', dataIndex: 'year', key: 'year' },
    { 
      title: 'Current Phase', 
      key: 'phase',
      render: (_, record) => (
        <Select 
          value={record.phase} 
          style={{ width: 140 }}
          onChange={(val) => handlePhaseChange(record._id, val)}
          disabled={record.status === 'CLOSED'}
        >
          <Select.Option value="GOAL_SETTING">Goal Setting</Select.Option>
          <Select.Option value="Q1">Q1 Check-in</Select.Option>
          <Select.Option value="Q2">Q2 Check-in</Select.Option>
          <Select.Option value="Q3">Q3 Check-in</Select.Option>
          <Select.Option value="Q4">Q4 / Annual</Select.Option>
        </Select>
      )
    },
    { 
      title: 'Validity', 
      key: 'validity',
      render: (_, record) => `${dayjs(record.openDate).format('MMM YYYY')} - ${dayjs(record.closeDate).format('MMM YYYY')}`
    },
    { 
      title: 'Status', 
      dataIndex: 'status', 
      key: 'status',
      render: status => <Tag color={status === 'OPEN' ? 'green' : 'red'}>{status}</Tag>
    }
  ];

  return (
    <div className="space-y-6">
      <Card title="Start New Cycle" className="shadow-sm">
        <Form form={form} layout="inline" onFinish={onAddCycle}>
          <Form.Item name="year" label="Cycle Year" rules={[{ required: true }]}>
            <InputNumber placeholder="2024" />
          </Form.Item>
          <Form.Item name="dates" label="Window" rules={[{ required: true }]}>
            <DatePicker.RangePicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create Cycle</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Active & Past Cycles" className="shadow-sm">
        <Table 
          columns={columns} 
          dataSource={cycles} 
          rowKey="_id" 
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default CycleConfig;
