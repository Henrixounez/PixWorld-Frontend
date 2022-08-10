import { ReduxState } from "..";

/* Actions */
export const SET_SHOW_CHAT = 'SET_SHOW_CHAT';
export const SET_CHAT_MESSAGE = 'SET_CHAT_MESSAGE';
export const ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE';
export const CLEAR_CHAT_MESSAGES = 'CLEAR_CHAT_MESSAGES';
export const SET_UNREAD_MESSAGE = 'SET_UNREAD_MESSAGE';
export const SET_CHANNEL = 'SET_CHANNEL';

export enum ChatChannels {
  INT = "int",
  EN = "en",
  FR = "fr",
  RU = "ru",
  ES = "es",
  PT = "pt",
  TR = "tr",
  RO = "ro"
}

export type Message = {
  id: number;
  author: string;
  country: string;
  msg: string;
  tag: string;
  color: string;
  channel: ChatChannels;
  createdAt: Date;
}

/* Types */
export interface SetShowChatAction {
  type: typeof SET_SHOW_CHAT;
  payload: boolean;
}
export interface SetChatMessageAction {
  type: typeof SET_CHAT_MESSAGE;
  payload: Message[];
}
export interface AddChatMessageAction {
  type: typeof ADD_CHAT_MESSAGE;
  payload: Message;
}
export interface ClearChatMessagesAction {
  type: typeof CLEAR_CHAT_MESSAGES;
  payload: number[];
}
export interface SetUnreadMessageAction {
  type: typeof SET_UNREAD_MESSAGE;
  payload: boolean;
}
export interface SetChannelAction {
  type: typeof SET_CHANNEL;
  payload: ChatChannels;
}

export type Actions = SetShowChatAction | SetChatMessageAction | AddChatMessageAction | ClearChatMessagesAction | SetUnreadMessageAction | SetChannelAction;

/* Functions */
export function setShowChat(state: ReduxState, action: SetShowChatAction): ReduxState {
  localStorage.setItem('showChat', String(action.payload));
  return {
    ...state,
    showChat: action.payload,
    unreadMessage: action.payload ? false : state.unreadMessage,
  };
}
export function setChatMessage(state: ReduxState, action: SetChatMessageAction): ReduxState {
  const chatMessages = action.payload.map((m) => ({ ...m, createdAt: new Date(m.createdAt)})) 
  return {
    ...state,
    chatMessages,
    channelMessages: chatMessages.filter((cm) => cm.channel === state.channel || !cm.channel),
  };
}
export function addChatMessage(state: ReduxState, action: AddChatMessageAction): ReduxState {
  const chatMessages = [...state.chatMessages, ({ ...action.payload, createdAt: new Date(action.payload.createdAt) })];
  return {
    ...state,
    chatMessages,
    channelMessages: chatMessages.filter((cm) => cm.channel === state.channel || !cm.channel),
    unreadMessage: !state.showChat && action.payload.channel === state.channel,
  };
}
export function clearChatMessages(state: ReduxState, action: ClearChatMessagesAction): ReduxState {
  const chatMessages = state.chatMessages.map((c) => {
    if (action.payload.includes(c.id)) {
      return { ...c, msg: "<message deleted>" };
    } else {
      return c;
    }
  })
  return {
    ...state,
    chatMessages,
    channelMessages: chatMessages.filter((cm) => cm.channel === state.channel || !cm.channel),
    unreadMessage: !state.showChat && state.chatMessages.some((cm) => cm.channel === state.channel),
  };
}
export function setUnreadMessage(state: ReduxState, action: SetUnreadMessageAction): ReduxState {
  return {
    ...state,
    unreadMessage: action.payload,
  };
}
export function setChannel(state: ReduxState, action: SetChannelAction): ReduxState {
  const chatMessages = state.chatMessages.filter((cm) => cm.channel);
  return {
    ...state,
    chatMessages,
    channelMessages: state.chatMessages.filter((cm) => cm.channel === action.payload),
    channel: action.payload,
  };
}

/* Dispatches */
export const dispatches = [
  {
    action: SET_SHOW_CHAT,
    function: setShowChat
  },
  {
    action: SET_CHAT_MESSAGE,
    function: setChatMessage,
  },
  {
    action: ADD_CHAT_MESSAGE,
    function: addChatMessage,
  },
  {
    action: CLEAR_CHAT_MESSAGES,
    function: clearChatMessages,
  },
  {
    action: SET_UNREAD_MESSAGE,
    function: setUnreadMessage,
  },
  {
    action: SET_CHANNEL,
    function: setChannel,
  }
];