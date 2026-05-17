// client/src/services/goalService.js
import api from './api';

export const getMyGoalSheet = () => api.get('/goal-sheets/my');
export const getTeamGoalSheets = () => api.get('/goal-sheets/team');
export const getGoalsBySheet = (sheetId) => api.get(`/goals/sheet/${sheetId}`);
export const createGoal = (goalData) => api.post('/goals', goalData);
export const updateGoal = (id, goalData) => api.patch(`/goals/${id}`, goalData);
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
export const submitGoalSheet = (id) => api.post(`/goal-sheets/${id}/submit`);
export const approveGoalSheet = (id) => api.post(`/goal-sheets/${id}/approve`);
export const returnGoalSheet = (id, comment) => api.post(`/goal-sheets/${id}/return`, { comment });
export const pushSharedGoal = (data) => api.post('/goals/push', data);
