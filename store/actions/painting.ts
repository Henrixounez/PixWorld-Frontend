import { ReduxState } from "..";

/* Actions */
export const SET_SELECTED_COLOR = 'SET_SELECTED_COLOR';

/* Types */
export interface SetSelectedColorAction {
  type: typeof SET_SELECTED_COLOR;
  payload: string;
}

export type Actions = SetSelectedColorAction;

/* Functions */
export function setSelectedColor(state: ReduxState, action: SetSelectedColorAction): ReduxState {
  return {
    ...state,
    selectedColor: action.payload,
  };
}

/* Dispatches */
export const dispatches = [
  {
    action: SET_SELECTED_COLOR,
    function: setSelectedColor,
  }
];