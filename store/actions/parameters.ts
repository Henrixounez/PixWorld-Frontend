import { ReduxState } from "..";

/* Action */
export const SET_GRID_ACTIVE = 'SET_GRID_ACTIVE';

/* Types */

export interface SetGridActiveAction {
    type: typeof SET_GRID_ACTIVE;
    payload: boolean;
}

export type Actions = SetGridActiveAction;

/* Functions */
export function setGridActive(state: ReduxState, action: SetGridActiveAction): ReduxState {
    return {
        ...state,
        gridActive: action.payload
    };
}

/* Dispatches */
export const dispatches = [
    {
        action: SET_GRID_ACTIVE,
        function: setGridActive
    }
]
