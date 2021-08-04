import { ReduxState } from "..";
import ModalTypes from "../../pages/constants/modalTypes";

/* Actions */
export const SET_NB_PLAYERS = 'SET_NB_PLAYERS';
export const SET_CURSOR_POS = 'SET_CURSOR_POS';
export const SET_MODAL = 'SET_MODAL';
export const SET_COOLDOWN = 'SET_COOLDOWN';
export const SET_ALERT = 'SET_ALERT';
export const SET_SEARCH = 'SET_SEARCH';

/* Types */
export interface SetNbPlayersAction {
  type: typeof SET_NB_PLAYERS;
  payload: number;
}
export interface SetCursorPosAction {
  type: typeof SET_CURSOR_POS;
  payload: { x: number, y: number };
}
export interface SetModalAction {
  type: typeof SET_MODAL;
  payload: ModalTypes;
}
export interface SetCooldownAction {
  type: typeof SET_COOLDOWN;
  payload: number;
}
export interface SetAlertAction {
  type: typeof SET_ALERT;
  payload: {
    show: boolean;
    text?: string;
    color?: string;
  };
}
export interface SetSearchAction {
  type: typeof SET_SEARCH;
  payload: boolean;
}

export type Actions = SetNbPlayersAction | SetCursorPosAction | SetModalAction | SetCooldownAction | SetAlertAction | SetSearchAction;

/* Functions */
export function setNbPlayers(state: ReduxState, action: SetNbPlayersAction): ReduxState {
  return {
    ...state,
    playersNb: action.payload,
  };
}
export function setCursorPos(state: ReduxState, action: SetCursorPosAction): ReduxState {
  return {
    ...state,
    shouldRender: state.gridActive ? true : state.shouldRender,
    cursorPos: action.payload,
  };
}
export function setModal(state: ReduxState, action: SetModalAction): ReduxState {
  return {
    ...state,
    currentModal: action.payload,
  };
}
export function setCooldown(state: ReduxState, action: SetCooldownAction): ReduxState {
  return {
    ...state,
    cooldown: action.payload,
  };
}
export function setAlert(state: ReduxState, action: SetAlertAction): ReduxState {
  return {
    ...state,
    alert: action.payload,
  };
}
export function setSearch(state: ReduxState, action: SetSearchAction): ReduxState {
  return {
    ...state,
    searchActive: action.payload,
  };
}

/* Dispatches */
export const dispatches = [
  {
    action: SET_NB_PLAYERS,
    function: setNbPlayers,
  },
  {
    action: SET_CURSOR_POS,
    function: setCursorPos,
  },
  {
    action: SET_MODAL,
    function: setModal,
  },
  {
    action: SET_COOLDOWN,
    function: setCooldown,
  },
  {
    action: SET_ALERT,
    function: setAlert
  },
  {
    action: SET_SEARCH,
    function: setSearch
  }
];