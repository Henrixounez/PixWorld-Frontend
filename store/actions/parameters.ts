import { ReduxState } from "..";

/* Action */
export const SET_GRID_ACTIVE = 'SET_GRID_ACTIVE';
export const SET_ZOOM_TOWARD_CURSOR = 'SET_ZOOM_TOWARD_CURSOR';

/* Types */

export interface SetGridActiveAction {
    type: typeof SET_GRID_ACTIVE;
    payload: boolean;
}

export interface SetZoomTowardCursorAction {
    type: typeof SET_ZOOM_TOWARD_CURSOR;
    payload: boolean;
}

export type Actions = SetGridActiveAction | SetZoomTowardCursorAction;

/* Functions */
export function setGridActive(state: ReduxState, action: SetGridActiveAction): ReduxState {
    return {
        ...state,
        gridActive: action.payload
    };
}

export function setZoomTowardCursor(state: ReduxState, action: SetZoomTowardCursorAction): ReduxState {
    return {
        ...state,
        zoomTowardCursor: action.payload
    };
}

/* Dispatches */
export const dispatches = [
    {
        action: SET_GRID_ACTIVE,
        function: setGridActive
    },
    {
        action: SET_ZOOM_TOWARD_CURSOR,
        function: setZoomTowardCursor
    }
]
