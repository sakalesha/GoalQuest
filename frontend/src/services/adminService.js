// client/src/services/adminService.js
import api from './api';

export const getCycles = () => api.get('/admin/cycles');
export const createCycle = (data) => api.post('/admin/cycles', data);
export const updateCyclePhase = (id, phase) => api.patch(`/admin/cycles/${id}/phase`, { phase });
export const getAuditLogs = () => api.get('/admin/audit-logs');
export const getStats = () => api.get('/admin/stats');
export const exportReport = () => api.get('/reports/export', { responseType: 'blob' });
