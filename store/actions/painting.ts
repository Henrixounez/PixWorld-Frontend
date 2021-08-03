import { ReduxState } from "..";

/* Actions */
export const SET_SELECTED_COLOR = 'SET_SELECTED_COLOR';
export const SET_POSITION = 'SET_POSITION';

/* Types */
export interface SetSelectedColorAction {
  type: typeof SET_SELECTED_COLOR;
  payload: string;
}
export interface SetPositionAction {
  type: typeof SET_POSITION;
  payload: {
    x: number,
    y: number,
    zoom: number,
  };
}

export type Actions = SetSelectedColorAction | SetPositionAction;

/* Functions */
export function setSelectedColor(state: ReduxState, action: SetSelectedColorAction): ReduxState {
  return {
    ...state,
    selectedColor: action.payload,
  };
}
export function setPosition(state: ReduxState, action: SetPositionAction): ReduxState {
  localStorage.setItem('position', JSON.stringify(action.payload));
  return {
    ...state,
    position: action.payload,
  };
}

/* Dispatches */
export const dispatches = [
  {
    action: SET_SELECTED_COLOR,
    function: setSelectedColor,
  },
  {
    action: SET_POSITION,
    function: setPosition,
  }
];