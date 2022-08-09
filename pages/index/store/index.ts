import { useMemo } from 'react';
import { applyMiddleware, createStore, Store, Middleware } from 'redux';
import { throttle } from 'lodash';
import * as Actions from './reducer';
import { ActionTypes } from './reducer';
import ModalTypes from '../../constants/modalTypes';
import { User } from './actions/user';
import { Canvas, getCanvasController, RENDER_REFRESH_MS } from '../controller/CanvasController';
import { ChatChannels, Message } from './actions/chat';
import { Colors } from '../../constants/colors';
import { ChunkRefresh, NoPixelZoneReturn } from './actions/painting';

export interface ReduxState {
  playersNb: number;
  cursorPos: {x: number, y: number};
  selectedColor: string;
  currentModal: ModalTypes;
  cooldown: Record<string, number>;
  chatMessages: Message[];
  channelMessages: Message[];
  unreadMessage: boolean;
  gridActive: boolean;
  zoomTowardCursor: boolean;
  activity: boolean;
  showChat: boolean;
  channel: ChatChannels;
  shouldRender: boolean;
  shouldLoadChunks: boolean;
  shouldClearChunks: boolean;
  shouldRefreshChunks: boolean;
  chunksToRefresh: ChunkRefresh[];
  searchActive: boolean;
  disconnectReason: string;
  notifications: boolean;
  sounds: boolean;
  darkMode: boolean;
  gridSize: number;
  showButtons: boolean;
  showPalette: boolean;
  autoBrush: boolean;
  eraserMode: boolean;
  npzMode: boolean;
  npzList: NoPixelZoneReturn[];
  lastNotificationDate: Date;
  lastReadNotificationDate: Date;
  position: {
    x: number,
    y: number,
    zoom: number,
  }
  history: {
    activate: boolean;
    date: string;
    hour: string;
  };
  overlay: {
    activate: boolean;
    image: string;
    transparency: number;
    position: { x: number | null, y: number | null };
    positionMouse: boolean;
    autoColor: boolean;
    tainted: boolean;
    open: boolean;
  },
  alert: {
    show: boolean;
    text?: string;
    color?: Colors;
  },
  currentCanvas: string;
  canvases: Array<Canvas>,
  user?: User,
}

export let store: Store<ReduxState, ActionTypes> | undefined;

export const initialState: ReduxState = {
  playersNb: 0,
  cursorPos: { x: 0, y: 0 },
  selectedColor: "#FFFFFF",
  currentModal: ModalTypes.NONE,
  cooldown: {},
  chatMessages: [],
  channelMessages: [],
  unreadMessage: false,
  gridActive: true,
  zoomTowardCursor: true,
  activity: true,
  showChat: true,
  channel: ChatChannels.INT,
  shouldRender: true,
  shouldLoadChunks: true,
  shouldClearChunks: false,
  shouldRefreshChunks: false,
  chunksToRefresh: [],
  searchActive: false,
  disconnectReason: "",
  notifications: false,
  sounds: true,
  darkMode: false,
  gridSize: 10,
  showButtons: true,
  showPalette: true,
  autoBrush: false,
  eraserMode: false,
  npzMode: false,
  npzList: [],
  lastNotificationDate: new Date(0),
  lastReadNotificationDate: new Date(0),
  position: {
    x: 0,
    y: 0,
    zoom: 1,
  },
  history: {
    activate: false,
    date: '',
    hour: ''
  },
  overlay: {
    activate: false,
    image: "",
    transparency: 0.5,
    position: { x: 0, y: 0 },
    positionMouse: false,
    autoColor: false,
    tainted: false,
    open: false,
  },
  alert: {
    show: false,
    text: undefined,
    color: undefined,
  },
  currentCanvas: '',
  canvases: [],
  user: undefined,
};

const reducer = (state = initialState, action: ActionTypes) => {
  return Actions.reducer(state, action);
};

const debounced = throttle(
  function (state: ReduxState) {
    const canvasController = getCanvasController();
    if (canvasController) {
      if (state.shouldClearChunks) {
        canvasController?.clearChunks(state.chunksToRefresh);
      }
      if (state.shouldRender) {
        canvasController?.render();
      }
      if (state.shouldLoadChunks) {
        canvasController?.loadNeighboringChunks();
      }
      if (state.shouldRefreshChunks && state.chunksToRefresh.length) {
        canvasController?.refreshChunks(state.chunksToRefresh);
      }
    }
  }
, RENDER_REFRESH_MS);

const renderer: Middleware<{}, ReduxState> = storeApi => next => action => {
  const result = next(action);

  const state = storeApi.getState();
  if (state && (state.shouldClearChunks || state.shouldRender || state.shouldLoadChunks || state.shouldRefreshChunks)) {
    debounced(state);
  }
  return result;
}

function initStore(preloadedState = initialState): Store<ReduxState, ActionTypes> {
  return createStore(reducer, preloadedState, applyMiddleware<ActionTypes>(renderer)) as Store<ReduxState, ActionTypes>;
}

export const initializeStore = (preloadedState: ReduxState): Store<ReduxState, ActionTypes> => {
  let newStore = store ?? initStore(preloadedState);

  if (preloadedState && store) {
    newStore = initStore({
      ...store.getState(),
      ...preloadedState,
    });
    store = undefined;
  }

  if (typeof window === 'undefined') return newStore;
  if (!store) store = newStore;

  return newStore;
};

export function useStore(newInitialState: ReduxState): Store<ReduxState, ActionTypes> {
  const newStore = useMemo(() => initializeStore(newInitialState), [newInitialState]);
  return newStore;
}
