import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [],
  currentChat: null,
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchChatsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchChatsSuccess: (state, action) => {
      state.loading = false;
      state.chats = action.payload;
    },
    fetchChatsFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentChat: (state, action) => {
      state.currentChat = action.payload;
    },
    fetchMessagesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action) => {
      state.loading = false;
      state.messages = action.payload;
    },
    fetchMessagesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    createChat: (state, action) => {
      state.chats.push(action.payload);
    },
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  setCurrentChat,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  addMessage,
  createChat,
} = chatSlice.actions;

export default chatSlice.reducer; 