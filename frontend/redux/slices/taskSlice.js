import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess: (state, action) => {
      state.loading = false;
      if (Array.isArray(action.payload)) {
        state.tasks = action.payload;
      } else if (action.payload && Array.isArray(action.payload.tasks)) {
        state.tasks = action.payload.tasks;
      } else {
        state.tasks = [];
      }
    },
    fetchTasksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addTask: (state, action) => {
      if (!Array.isArray(state.tasks)) state.tasks = [];
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task._id !== action.payload);
    },
    updateTaskStatus: (state, action) => {
      const { taskId, newStatus } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task._id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex] = {
          ...state.tasks[taskIndex],
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
    },
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} = taskSlice.actions;

export default taskSlice.reducer;
