import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
  type: 'disc_found' | 'general' | 'system';
}

interface MessagesState {
  messages: Message[];
  unreadCount: number;
}

const initialState: MessagesState = {
  messages: [],
  unreadCount: 0,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const message = state.messages.find(m => m.id === action.payload);
      if (message && !message.read) {
        message.read = true;
        state.unreadCount -= 1;
      }
    },
    markAllAsRead: (state) => {
      state.messages.forEach(message => {
        if (!message.read) {
          message.read = true;
        }
      });
      state.unreadCount = 0;
    },
  },
});

export const { addMessage, markAsRead, markAllAsRead } = messagesSlice.actions;
export default messagesSlice.reducer; 