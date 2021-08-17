import { ReduxState } from "..";
import ModalTypes from "../../../constants/modalTypes";
import { getCanvasController, GRID_ZOOM } from "../../controller/CanvasController";

/* Actions */
export const SET_NB_PLAYERS = 'SET_NB_PLAYERS';
export const SET_CURSOR_POS = 'SET_CURSOR_POS';
export const SET_MODAL = 'SET_MODAL';
export const SET_COOLDOWN = 'SET_COOLDOWN';
export const SET_ALERT = 'SET_ALERT';
export const SET_SEARCH = 'SET_SEARCH';
export const SET_DISCONNECT = 'SET_DISCONNECT';

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
export interface SetDisconnectAction {
  type: typeof SET_DISCONNECT;
  payload: string;
}

export type Actions = SetNbPlayersAction | SetCursorPosAction | SetModalAction | SetCooldownAction | SetAlertAction | SetSearchAction | SetDisconnectAction;

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
    shouldRender: state.position.zoom < GRID_ZOOM ? true : state.shouldRender,
    cursorPos: action.payload,
  };
}
export function setModal(state: ReduxState, action: SetModalAction): ReduxState {
  if (action.payload === ModalTypes.NONE) {
    getCanvasController()?.canvas.focus();
  }
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
export function setDisconnect(state: ReduxState, action: SetDisconnectAction): ReduxState {
  return {
    ...state,
    disconnectReason: action.payload,
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
  },
  {
    action: SET_DISCONNECT,
    function: setDisconnect
  }
];