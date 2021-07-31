import { ReduxState } from "..";

/* Actions */
export const SET_NB_PLAYERS = 'SET_NB_PLAYERS';
export const SET_CURSOR_POS = 'SET_CURSOR_POS';

/* Types */
export interface SetNbPlayersAction {
  type: typeof SET_NB_PLAYERS;
  payload: number;
}
export interface SetCursorPosAction {
  type: typeof SET_CURSOR_POS;
  payload: { x: number, y: number };
}

export type Actions = SetNbPlayersAction | SetCursorPosAction;

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

/* Dispatches */
export const dispatches = [
  {
    action: SET_NB_PLAYERS,
    function: setNbPlayers,
  },
  {
    action: SET_CURSOR_POS,
    function: setCursorPos
  }
];