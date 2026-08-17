// client/src/store/slices/cycleSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeCycle: null,
  cycles: []
};

const cycleSlice = createSlice({
  name: 'cycles',
  initialState,
  reducers: {
    setActiveCycle: (state, action) => {
      state.activeCycle = action.payload;
    },
    setCycles: (state, action) => {
      state.cycles = action.payload;
    }
  }
});

export const { setActiveCycle, setCycles } = cycleSlice.actions;
export default cycleSlice.reducer;
