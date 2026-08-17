// client/src/services/reportService.js
import api from './api';

export const getSystemStats = () => api.get('/reports/stats/system');
export const getManagerStats = () => api.get('/reports/stats/manager');
export const exportAchievementReport = () => api.get('/reports/export', { responseType: 'blob' });
