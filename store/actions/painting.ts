import { ReduxState } from "..";
import { CHUNK_SIZE } from "../../pages/constants/painting";
import { MAX_ZOOM } from "../../pages/controller/CanvasController";

/* Actions */
export const SET_SELECTED_COLOR = 'SET_SELECTED_COLOR';
export const SET_POSITION = 'SET_POSITION';
export const SET_SHOULD_RENDER = 'SET_SHOULD_RENDER';
export const SET_SHOULD_LOAD_CHUNKS = 'SET_SHOULD_LOAD_CHUNKS';
export const SET_SHOULD_CLEAR_CHUNKS = 'SET_SHOULD_CLEAR_CHUNKS';

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

export type Actions = SetSelectedColorAction | SetPositionAction | SetShouldRenderAction | SetShouldLoadChunksAction | SetShouldClearChunksAction;

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
  const limitCanvas = (canvas?.size || 1 * CHUNK_SIZE) / 2;
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
export function setShouldClearChunks(state: ReduxState, action: SetShouldClearChunksAction): ReduxState {
  return {
    ...state,
    shouldClearChunks: action.payload,
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
    action: SET_SHOULD_CLEAR_CHUNKS,
    function: setShouldClearChunks,
  }
];