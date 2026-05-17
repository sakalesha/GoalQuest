// client/src/store/slices/goalSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  goalSheet: null,
  goals: [],
  loading: false
};

const goalSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    setGoalSheet: (state, action) => {
      state.goalSheet = action.payload;
    },
    setGoals: (state, action) => {
      state.goals = action.payload;
    }
  }
});

export const { setGoalSheet, setGoals } = goalSlice.actions;
export default goalSlice.reducer;
