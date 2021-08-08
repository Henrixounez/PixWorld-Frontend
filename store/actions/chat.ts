import { ReduxState } from "..";

/* Actions */
export const SET_SHOW_CHAT = 'SET_SHOW_CHAT';
export const SET_CHAT_MESSAGE = 'SET_CHAT_MESSAGE';
export const ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE';
export const SET_UNREAD_MESSAGE = 'SET_UNREAD_MESSAGE';

/* Types */
export interface SetShowChatAction {
  type: typeof SET_SHOW_CHAT;
  payload: boolean;
}
export interface SetChatMessageAction {
  type: typeof SET_CHAT_MESSAGE;
  payload: { author: string, msg: string, color: string }[];
}
export interface AddChatMessageAction {
  type: typeof ADD_CHAT_MESSAGE;
  payload: { author: string, msg: string, color: string };
}
export interface SetUnreadMessageAction {
  type: typeof SET_UNREAD_MESSAGE;
  payload: boolean;
}

export type Actions = SetShowChatAction | SetChatMessageAction | AddChatMessageAction | SetUnreadMessageAction;

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
    action: SET_UNREAD_MESSAGE,
    function: setUnreadMessage,
  }
];