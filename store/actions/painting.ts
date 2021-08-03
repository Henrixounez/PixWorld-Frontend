import { ReduxState } from "..";

/* Actions */
export const SET_SELECTED_COLOR = 'SET_SELECTED_COLOR';
export const SET_POSITION = 'SET_POSITION';
export const SET_SHOULD_RENDER = 'SET_SHOULD_RENDER';
export const SET_SHOULD_LOAD_CHUNKS = 'SET_SHOULD_LOAD_CHUNKS';

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

export type Actions = SetSelectedColorAction | SetPositionAction | SetShouldRenderAction | SetShouldLoadChunksAction;

/* Functions */
export function setSelectedColor(state: ReduxState, action: SetSelectedColorAction): ReduxState {
  return {
    ...state,
    shouldRender: true,
    selectedColor: action.payload,
  };
}
export function setPosition(state: ReduxState, action: SetPositionAction): ReduxState {
  localStorage.setItem('position', JSON.stringify(action.payload));
  return {
    ...state,
    position: action.payload,
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
  }
];