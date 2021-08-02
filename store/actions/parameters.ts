import { ReduxState } from "..";

/* Action */
export const SET_GRID_ACTIVE = 'SET_GRID_ACTIVE';
export const SET_ZOOM_TOWARD_CURSOR = 'SET_ZOOM_TOWARD_CURSOR';
export const SET_ACTIVITY = 'SET_ACTIVITY';
export const SET_SHOW_CHAT = 'SET_SHOW_CHAT';

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
export interface SetShowChatAction {
    type: typeof SET_SHOW_CHAT;
    payload: boolean;
}

export type Actions = SetGridActiveAction | SetZoomTowardCursorAction | SetActivityAction | SetShowChatAction;

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
export function setShowChat(state: ReduxState, action: SetShowChatAction): ReduxState {
    localStorage.setItem('showChat', String(action.payload));
    return {
        ...state,
        showChat: action.payload
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
    },
    {
        action: SET_SHOW_CHAT,
        function: setShowChat
    }
]
