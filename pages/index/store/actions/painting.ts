import { ReduxState } from "..";
import { CHUNK_SIZE } from "../../../constants/painting";
import { MAX_ZOOM } from "../../controller/CanvasController";

export interface NoPixelZoneReturn {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  canvas: string;
  createdAt: Date;
}
export interface ChunkRefresh {
  canvas: string;
  x: number;
  y: number;
}


/* Actions */
export const SET_SELECTED_COLOR = 'SET_SELECTED_COLOR';
export const SET_POSITION = 'SET_POSITION';
export const SET_SHOULD_RENDER = 'SET_SHOULD_RENDER';
export const SET_SHOULD_LOAD_CHUNKS = 'SET_SHOULD_LOAD_CHUNKS';
export const SET_SHOULD_CLEAR_CHUNKS = 'SET_SHOULD_CLEAR_CHUNKS';
export const SET_SHOULD_REFRESH_CHUNKS = 'SET_SHOULD_REFRESH_CHUNKS';
export const SET_ERASER_MODE = 'SET_ERASER_MODE';
export const SET_NPZ_MODE = 'SET_NPZ_MODE';

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
export interface SetShouldRenderAction {
  type: typeof SET_SHOULD_RENDER;
  payload: boolean;
}
export interface SetShouldLoadChunksAction {
  type: typeof SET_SHOULD_LOAD_CHUNKS;
  payload: boolean;
}
export interface SetShouldClearChunksAction {
  type: typeof SET_SHOULD_CLEAR_CHUNKS;
  payload: boolean;
}
export interface SetShouldRefreshChunksAction {
  type: typeof SET_SHOULD_REFRESH_CHUNKS;
  payload: {
    refresh: boolean;
    chunks: ChunkRefresh[];
  };
}
export interface SetEraserModeAction {
  type: typeof SET_ERASER_MODE;
  payload: boolean;
}
export interface SetNpzModeAction {
  type: typeof SET_NPZ_MODE;
  payload: {
    activated: boolean
    npzs: NoPixelZoneReturn[];
  }
}

export type Actions = SetSelectedColorAction | SetPositionAction | SetShouldRenderAction | SetShouldLoadChunksAction | SetShouldRefreshChunksAction | SetShouldClearChunksAction | SetEraserModeAction | SetNpzModeAction;

/* Functions */
export function setSelectedColor(state: ReduxState, action: SetSelectedColorAction): ReduxState {
  return {
    ...state,
    shouldRender: true,
    selectedColor: action.payload,
  };
}
export function setPosition(state: ReduxState, action: SetPositionAction): ReduxState {
  const canvas = state.canvases.find((e) => e.id === state.currentCanvas);
  const limitCanvas = ((canvas?.size || 1 )* CHUNK_SIZE) / 2;
  const x = action.payload.x < -limitCanvas ? -limitCanvas : action.payload.x > limitCanvas ? limitCanvas : action.payload.x;
  const y = action.payload.y < -limitCanvas ? -limitCanvas : action.payload.y > limitCanvas ? limitCanvas : action.payload.y;
  const zoom = action.payload.zoom < 1 ? 1 : action.payload.zoom >= MAX_ZOOM ? MAX_ZOOM - 1 : action.payload.zoom;

  localStorage.setItem('position', JSON.stringify(action.payload));
  return {
    ...state,
    position: {
      x,
      y,
      zoom,
    },
    shouldRender: true,
    shouldLoadChunks: true,
  };
}
export function setShouldRender(state: ReduxState, action: SetShouldRenderAction): ReduxState {
  return {
    ...state,
    shouldRender: action.payload,
  };
}
export function setShouldLoadChunks(state: ReduxState, action: SetShouldLoadChunksAction): ReduxState {
  return {
    ...state,
    shouldLoadChunks: action.payload,
  };
}
export function setShouldRefreshChunks(state: ReduxState, action: SetShouldRefreshChunksAction): ReduxState {
  return {
    ...state,
    shouldRefreshChunks: action.payload.refresh,
    chunksToRefresh: action.payload.chunks,
  };
}

export function setShouldClearChunks(state: ReduxState, action: SetShouldClearChunksAction): ReduxState {
  return {
    ...state,
    shouldClearChunks: action.payload,
  };
}
export function setEraserMode(state: ReduxState, action: SetEraserModeAction): ReduxState {
  return {
    ...state,
    eraserMode: action.payload,
  };
}
export function setNpzMode(state: ReduxState, action: SetNpzModeAction): ReduxState {
  return {
    ...state,
    npzMode: action.payload.activated,
    npzList: action.payload.npzs,
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
  },
  {
    action: SET_SHOULD_RENDER,
    function: setShouldRender,
  },
  {
    action: SET_SHOULD_LOAD_CHUNKS,
    function: setShouldLoadChunks,
  },
  {
    action: SET_SHOULD_REFRESH_CHUNKS,
    function: setShouldRefreshChunks,
  },
  {
    action: SET_SHOULD_CLEAR_CHUNKS,
    function: setShouldClearChunks,
  },
  {
    action: SET_ERASER_MODE,
    function: setEraserMode,
  },
  {
    action: SET_NPZ_MODE,
    function: setNpzMode,
  }
];