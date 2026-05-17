// client/src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import goalReducer from './slices/goalSlice';
import cycleReducer from './slices/cycleSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goals: goalReducer,
    cycles: cycleReducer
  }
});
