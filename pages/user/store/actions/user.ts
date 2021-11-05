import { UserReduxState } from "..";
import { FactionMember } from "./faction";

export interface User {
  username: string;
  totalPixels: number;
  dailyPixels: number;
  type: string;
  factionMember?: FactionMember;
}

/* Actions */
export const SET_USER = 'SET_USER';
export const SET_NB_PIXELS = 'SET_NB_PIXELS';

/* Types */
export interface SetUserAction {
  type: typeof SET_USER;
  payload: User;
}
export interface SetNbPixelsAction {
  type: typeof SET_NB_PIXELS;
  payload: {
    totalPixels: number;
    dailyPixels: number;
  };
}

export type Actions = SetUserAction | SetNbPixelsAction;

/* Functions */
export function setUser(state: UserReduxState, action: SetUserAction): UserReduxState {
  return {
    ...state,
    user: action.payload,
  };
}
export function setNbPixels(state: UserReduxState, action: SetNbPixelsAction): UserReduxState {
  if (state.user) {
    return {
      ...state,
      user: {
        ...state.user,
        totalPixels: action.payload.totalPixels,
        dailyPixels: action.payload.dailyPixels,
      }
    };
  } else {
    return state;
  }
}

/* Dispatches */
export const dispatches = [
  {
    action: SET_USER,
    function: setUser,
  },
  {
    action: SET_NB_PIXELS,
    function: setNbPixels,
  }
];