// client/src/services/checkInService.js
import api from './api';

export const upsertCheckIn = (data) => api.post('/check-ins', data);
export const getGoalCheckIns = (goalId) => api.get(`/check-ins/goal/${goalId}`);
export const getTeamProgress = () => api.get('/check-ins/team');
export const addManagerComment = (id, comment) => api.post(`/check-ins/${id}/comment`, { comment });
