import { ReduxState } from "..";

/* Actions */
export const SET_SHOW_CHAT = 'SET_SHOW_CHAT';
export const SET_CHAT_MESSAGE = 'SET_CHAT_MESSAGE';
export const ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE';
export const CLEAR_CHAT_MESSAGES = 'CLEAR_CHAT_MESSAGES';
export const SET_UNREAD_MESSAGE = 'SET_UNREAD_MESSAGE';

export type Message = {
  id: number;
  author: string;
  msg: string;
  color: string;
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

export type Actions = SetShowChatAction | SetChatMessageAction | AddChatMessageAction | ClearChatMessagesAction | SetUnreadMessageAction;

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
  return {
    ...state,
    chatMessages: action.payload,
  };
}
export function addChatMessage(state: ReduxState, action: AddChatMessageAction): ReduxState {
  return {
    ...state,
    chatMessages: [...state.chatMessages, action.payload],
    unreadMessage: !state.showChat,
  };
}
export function clearChatMessages(state: ReduxState, action: ClearChatMessagesAction): ReduxState {
  return {
    ...state,
    chatMessages: state.chatMessages.map((c) => {
      if (action.payload.includes(c.id)) {
        return { ...c, msg: "<message deleted>" };
      } else {
        return c;
      }
    }),
    unreadMessage: !state.showChat,
  };
}
export function setUnreadMessage(state: ReduxState, action: SetUnreadMessageAction): ReduxState {
  return {
    ...state,
    unreadMessage: action.payload,
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
  }
];