import { ReduxState } from "..";

/* Action */
export const SET_GRID_ACTIVE = 'SET_GRID_ACTIVE';
export const SET_ZOOM_TOWARD_CURSOR = 'SET_ZOOM_TOWARD_CURSOR';
export const SET_ACTIVITY = 'SET_ACTIVITY';

/* Types */

export interface SetGridActiveAction {
    type: typeof SET_GRID_ACTIVE;
    payload: boolean;
}
export interface SetZoomTowardCursorAction {
    type: typeof SET_ZOOM_TOWARD_CURSOR;
    payload: boolean;
}
export interface SetActivityAction {
    type: typeof SET_ACTIVITY;
    payload: boolean;
}

export type Actions = SetGridActiveAction | SetZoomTowardCursorAction | SetActivityAction;

/* Functions */
export function setGridActive(state: ReduxState, action: SetGridActiveAction): ReduxState {
    localStorage.setItem('gridActive', String(action.payload));
    return {
        ...state,
        gridActive: action.payload
    };
}
export function setZoomTowardCursor(state: ReduxState, action: SetZoomTowardCursorAction): ReduxState {
    localStorage.setItem('zoomTowardCursor', String(action.payload));
    return {
        ...state,
        zoomTowardCursor: action.payload
    };
}
export function setActivity(state: ReduxState, action: SetActivityAction): ReduxState {
    localStorage.setItem('activity', String(action.payload));
    return {
        ...state,
        activity: action.payload
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
    },
    {
        action: SET_ACTIVITY,
        function: setActivity
    }
]
