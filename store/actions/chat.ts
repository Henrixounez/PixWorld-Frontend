import { ReduxState } from "..";

/* Actions */
export const SET_CHAT_MESSAGE = 'SET_CHAT_MESSAGE';
export const ADD_CHAT_MESSAGE = 'ADD_CHAT_MESSAGE';

/* Types */
export interface SetChatMessageAction {
  type: typeof SET_CHAT_MESSAGE;
  payload: { author: string, msg: string, color: string }[];
}
export interface AddChatMessageAction {
  type: typeof ADD_CHAT_MESSAGE;
  payload: { author: string, msg: string, color: string };
}

export type Actions = SetChatMessageAction | AddChatMessageAction;

/* Functions */
export function setChatMessage(state: ReduxState, action: SetChatMessageAction): ReduxState {
  return {
    ...state,
    chatMessages: action.payload,
  };
}
export function addChatMessage(state: ReduxState, action: AddChatMessageAction): ReduxState {
  return {
    ...state,
    chatMessages: [...state.chatMessages, action.payload]
  };
}

/* Dispatches */
export const dispatches = [
  {
    action: SET_CHAT_MESSAGE,
    function: setChatMessage,
  },
  {
    action: ADD_CHAT_MESSAGE,
    function: addChatMessage,
  }
];