// client/src/components/admin/Reports.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, Progress, List, Avatar, App } from 'antd';
import { Download, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { getStats, exportReport } from '../../services/adminService';

const Reports = () => {
  const { message } = App.useApp();
  const [stats, setStats] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await getStats();
        setStats(data);
      } catch (err) {
        message.error('Failed to load portal stats');
      }
    };
    loadStats();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data } = await exportReport();
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'achievement_report.xlsx');
      document.body.appendChild(link);
      link.click();
      message.success('Excel report downloaded');
    } catch (err) {
      message.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <Row gutter={16}>
        <Col span={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Total Employees" value={stats.totalEmployees} prefix={<Users size={20} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic title="Approved Sheets" value={stats.approved} suffix={`/ ${stats.totalEmployees}`} prefix={<CheckCircle2 size={20} />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card variant="borderless" className="bg-blue-600 text-white shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-blue-100 mb-1">Overall Compliance</p>
                <h2 className="text-2xl font-bold">{(stats.approved/stats.totalEmployees * 100 || 0).toFixed(1)}%</h2>
              </div>
              <TrendingUp size={32} className="text-blue-200" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title="Organization Completion Rate" 
        className="shadow-sm"
        extra={<Button type="primary" icon={<Download size={16} />} loading={exporting} onClick={handleExport}>Download Achievement Report</Button>}
      >
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="mb-4 font-medium">Goal Setting Phase</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Sheet Submission</span> <span>{stats.submitted} / {stats.totalEmployees}</span></div>
                <Progress percent={(stats.submitted/stats.totalEmployees*100)} size="small" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span>Approved & Locked</span> <span>{stats.approved} / {stats.totalEmployees}</span></div>
                <Progress percent={(stats.approved/stats.totalEmployees*100)} size="small" status="success" />
              </div>
            </div>
          </div>
          <div>
            <h4 className="mb-4 font-medium">Departmental Breakdown</h4>
            <div className="space-y-4">
              {(stats.breakdown || []).map(item => (
                <div key={item.dept} className="w-full border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between text-xs mb-1 text-gray-500 font-medium">
                    <span>{item.dept}</span> 
                    <span>{item.rate}%</span>
                  </div>
                  <Progress percent={item.rate} size={[null, 6]} showInfo={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Reports;
