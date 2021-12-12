import { useMemo } from 'react';
import { createStore, Store } from 'redux';
import * as Actions from './reducer';
import { ActionTypes } from './reducer';
import palette from '../../constants/palette';
import ModalTypes from '../../constants/modalTypes';
import { User } from './actions/user';
import { Canvas } from '../controller/CanvasController';
import { Message } from './actions/chat';
import { Colors } from '../../constants/colors';

export interface ReduxState {
  playersNb: number;
  cursorPos: {x: number, y: number};
  selectedColor: string;
  currentModal: ModalTypes;
  cooldown: number;
  chatMessages: Message[];
  unreadMessage: boolean;
  gridActive: boolean;
  zoomTowardCursor: boolean;
  activity: boolean;
  showChat: boolean;
  shouldRender: boolean;
  shouldLoadChunks: boolean;
  shouldClearChunks: boolean;
  searchActive: boolean;
  disconnectReason: string;
  notifications: boolean;
  sounds: boolean;
  darkMode: boolean;
  showButtons: boolean;
  showPalette: boolean;
  eraserMode: boolean;
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
    position: { x: number, y: number };
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
  selectedColor: palette[0],
  currentModal: ModalTypes.NONE,
  cooldown: 0,
  chatMessages: [],
  unreadMessage: false,
  gridActive: true,
  zoomTowardCursor: true,
  activity: true,
  showChat: true,
  shouldRender: true,
  shouldLoadChunks: true,
  shouldClearChunks: false,
  searchActive: false,
  disconnectReason: "",
  notifications: false,
  sounds: true,
  darkMode: false,
  showButtons: true,
  showPalette: true,
  eraserMode: false,
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

function initStore(preloadedState = initialState): Store<ReduxState, ActionTypes> {
  return createStore(reducer, preloadedState) as Store<ReduxState, ActionTypes>;
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
