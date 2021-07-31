import { ReduxState } from "..";
import ModalTypes from "../../pages/constants/modalTypes";

/* Actions */
export const SET_NB_PLAYERS = 'SET_NB_PLAYERS';
export const SET_CURSOR_POS = 'SET_CURSOR_POS';
export const SET_MODAL = 'SET_MODAL';

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

export type Actions = SetNbPlayersAction | SetCursorPosAction | SetModalAction;

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
    cursorPos: action.payload,
  };
}
export function setModal(state: ReduxState, action: SetModalAction): ReduxState {
  return {
    ...state,
    currentModal: action.payload,
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
  }
];