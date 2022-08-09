import { ReduxState } from "..";

/* Actions */
export const SET_OVERLAY_ACTIVATE = 'SET_ACTIVATE_OVERLAY';
export const SET_OVERLAY_OPEN = 'SET_OVERLAY_OPEN';
export const SET_OVERLAY_IMAGE = 'SET_OVERLAY_IMAGE';
export const SET_OVERLAY_TRANSPARENCY = 'SET_OVERLAY_TRANSPARENCY';
export const SET_OVERLAY_POSITION = 'SET_OVERLAY_POSITION';
export const SET_OVERLAY_POSITION_MOUSE = 'SET_OVERLAY_POSITION_MOUSE';
export const SET_OVERLAY_AUTOCOLOR = 'SET_OVERLAY_AUTOCOLOR';
export const SET_OVERLAY_TAINTED = 'SET_OVERLAY_TAINTED';

/* Types */
export interface SetOverlayActivateAction {
  type: typeof SET_OVERLAY_ACTIVATE;
  payload: boolean;
}
export interface SetOverlayOpenAction {
  type: typeof SET_OVERLAY_OPEN;
  payload: boolean;
}
export interface SetOverlayImageAction {
  type: typeof SET_OVERLAY_IMAGE;
  payload: string;
}
export interface SetOverlayTransparencyAction {
  type: typeof SET_OVERLAY_TRANSPARENCY;
  payload: number;
}
export interface SetOverlayPositionAction {
  type: typeof SET_OVERLAY_POSITION;
  payload: { x: number | null, y: number | null };
}
export interface SetOverlayPositionMouseAction {
  type: typeof SET_OVERLAY_POSITION_MOUSE;
  payload: boolean;
}
export interface SetOverlayAutoColorAction {
  type: typeof SET_OVERLAY_AUTOCOLOR;
  payload: boolean;
}
export interface SetOverlayTaintedAction {
  type: typeof SET_OVERLAY_TAINTED;
  payload: boolean;
}


export type Actions = SetOverlayActivateAction | SetOverlayOpenAction | SetOverlayImageAction | SetOverlayTransparencyAction | SetOverlayPositionAction | SetOverlayPositionMouseAction | SetOverlayAutoColorAction | SetOverlayTaintedAction;

/* Functions */
export function setOverlayActivate(state: ReduxState, action: SetOverlayActivateAction): ReduxState {
  localStorage.setItem('overlayActive', String(action.payload));
  return {
    ...state,
    shouldRender: true,
    overlay: {
      ...state.overlay,
      activate: action.payload,
    },
  };
}
export function setOverlayOpen(state: ReduxState, action: SetOverlayOpenAction): ReduxState {
  localStorage.setItem('overlayOpen', String(action.payload));
  return {
    ...state,
    overlay: {
      ...state.overlay,
      open: action.payload,
    },
  };
}
export function setOverlayImage(state: ReduxState, action: SetOverlayImageAction): ReduxState {
  return {
    ...state,
    shouldRender: true,
    overlay: {
      ...state.overlay,
      image: action.payload,
    }
  };
}
export function setOverlayTransparency(state: ReduxState, action: SetOverlayTransparencyAction): ReduxState {
  return {
    ...state,
    shouldRender: true,
    overlay: {
      ...state.overlay,
      transparency: action.payload,
    }
  };
}
export function setOverlayPosition(state: ReduxState, action: SetOverlayPositionAction): ReduxState {
  return {
    ...state,
    shouldRender: true,
    overlay: {
      ...state.overlay,
      position: action.payload,
    }
  };
}
export function setOverlayPositionMouse(state: ReduxState, action: SetOverlayPositionMouseAction): ReduxState {
  return {
    ...state,
    overlay: {
      ...state.overlay,
      positionMouse: action.payload,
    }
  };
}
export function setOverlayAutoColor(state: ReduxState, action: SetOverlayAutoColorAction): ReduxState {
  return {
    ...state,
    overlay: {
      ...state.overlay,
      autoColor: action.payload,
    }
  };
}
export function setOverlayTainted(state: ReduxState, action: SetOverlayTaintedAction): ReduxState {
  return {
    ...state,
    overlay: {
      ...state.overlay,
      tainted: action.payload,
    }
  };
}

/* Dispatches */
export const dispatches = [
  {
    action: SET_OVERLAY_IMAGE,
    function: setOverlayImage,
  },
  {
    action: SET_OVERLAY_OPEN,
    function: setOverlayOpen,
  },
  {
    action: SET_OVERLAY_ACTIVATE,
    function: setOverlayActivate,
  },
  {
    action: SET_OVERLAY_TRANSPARENCY,
    function: setOverlayTransparency,
  },
  {
    action: SET_OVERLAY_POSITION,
    function: setOverlayPosition,
  },
  {
    action: SET_OVERLAY_POSITION_MOUSE,
    function: setOverlayPositionMouse,
  },
  {
    action: SET_OVERLAY_AUTOCOLOR,
    function: setOverlayAutoColor,
  },
  {
    action: SET_OVERLAY_TAINTED,
    function: setOverlayTainted,
  }
];