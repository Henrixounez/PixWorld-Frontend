import { ReduxState } from "..";

/* Action */
export const SET_GRID_ACTIVE = 'SET_GRID_ACTIVE';
export const SET_ZOOM_TOWARD_CURSOR = 'SET_ZOOM_TOWARD_CURSOR';
export const SET_ACTIVITY = 'SET_ACTIVITY';
export const SET_NOTIFICATIONS = 'SET_NOTIFICATIONS';
export const SET_SOUNDS = 'SET_SOUNDS';
export const SET_CANVAS = 'SET_CANVAS';
export const SET_DARK_MODE = 'SET_DARK_MODE';
export const SET_SHOW_BUTTONS = 'SET_SHOW_BUTTONS';

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
export interface SetNotificationsAction {
  type: typeof SET_NOTIFICATIONS;
  payload: boolean;
}
export interface SetSoundsAction {
  type: typeof SET_SOUNDS;
  payload: boolean;
}
export interface SetCanvasAction {
  type: typeof SET_CANVAS;
  payload: string;
}
export interface SetDarkModeAction {
  type: typeof SET_DARK_MODE;
  payload: boolean;
}
export interface SetShowButtonsAction {
  type: typeof SET_SHOW_BUTTONS;
  payload: boolean;
}

export type Actions = SetGridActiveAction | SetZoomTowardCursorAction | SetActivityAction | SetNotificationsAction | SetSoundsAction | SetCanvasAction | SetDarkModeAction | SetShowButtonsAction;

/* Functions */
export function setGridActive(state: ReduxState, action: SetGridActiveAction): ReduxState {
  localStorage.setItem('gridActive', String(action.payload));
  return {
    ...state,
    shouldRender: true,
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
    shouldRender: true,
    activity: action.payload
  };
}
export function setNotifications(state: ReduxState, action: SetNotificationsAction): ReduxState {
  let finalValue = action.payload;

  if (action.payload === true) {
    if (Notification.permission === "denied") {
      alert('Notifications for this website are blocked, please enable them in your browser.');
      finalValue = false;
    } else if (Notification.permission === "default") {
      finalValue = false;
    }
  } else {
    finalValue = false;
  }

  localStorage.setItem('notifications', String(finalValue));
  return {
    ...state,
    notifications: finalValue,
  }
}
export function setSounds(state: ReduxState, action: SetSoundsAction): ReduxState {
  localStorage.setItem('sounds', String(action.payload));
  return {
    ...state,
    sounds: action.payload
  };
}
export function setCanvas(state: ReduxState, action: SetCanvasAction): ReduxState {
  localStorage.setItem('canvas', String(action.payload));
  return {
    ...state,
    shouldLoadChunks: action.payload !== state.currentCanvas,
    currentCanvas: action.payload,
    shouldClearChunks: true,
  };
}
export function setDarkMode(state: ReduxState, action: SetDarkModeAction): ReduxState {
  localStorage.setItem('darkMode', String(action.payload));
  return {
    ...state,
    darkMode: action.payload
  };
}
export function setShowButtons(state: ReduxState, action: SetShowButtonsAction): ReduxState {
  localStorage.setItem('showButtons', String(action.payload));
  return {
    ...state,
    showButtons: action.payload
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
    action: SET_NOTIFICATIONS,
    function: setNotifications
  },
  {
    action: SET_SOUNDS,
    function: setSounds,
  },
  {
    action: SET_CANVAS,
    function: setCanvas
  },
  {
    action: SET_DARK_MODE,
    function: setDarkMode
  },
  {
    action: SET_SHOW_BUTTONS,
    function: setShowButtons
  }
]
