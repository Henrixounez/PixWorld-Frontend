import { ReduxState } from "..";
import { getCanvasController } from "../../pages/controller/CanvasController";

export interface User {
  username: string;
  totalPixels: number;
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
  payload: number;
}

export type Actions = SetUserAction | SetNbPixelsAction;

/* Functions */
export function setUser(state: ReduxState, action: SetUserAction): ReduxState {
  if (action.payload)
    getCanvasController()?.connectionController.sendToWs('loginUser', localStorage.getItem('token'));
  else
    getCanvasController()?.connectionController.sendToWs('logoutUser', {});
  return {
    ...state,
    user: action.payload,
  };
}
export function setNbPixels(state: ReduxState, action: SetNbPixelsAction): ReduxState {
  if (state.user) {
    return {
      ...state,
      user: {
        ...state.user,
        totalPixels: action.payload,
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