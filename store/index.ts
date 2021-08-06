import { useMemo } from 'react';
import { createStore, Store } from 'redux';
import * as Actions from './reducer';
import { ActionTypes } from './reducer';
import palette from '../pages/constants/palette';
import ModalTypes from '../pages/constants/modalTypes';
import { User } from './actions/user';

export interface ReduxState {
  playersNb: number;
  cursorPos: {x: number, y: number};
  selectedColor: string;
  currentModal: ModalTypes;
  cooldown: number;
  chatMessages: { author: string, msg: string, color: string }[];
  gridActive: boolean;
  zoomTowardCursor: boolean;
  activity: boolean;
  showChat: boolean;
  shouldRender: boolean;
  shouldLoadChunks: boolean;
  searchActive: boolean;
  notifications: boolean;
  sounds: boolean;
  darkMode: boolean;
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
    color?: string;
  },
  currentCanvas: string;
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
  gridActive: true,
  zoomTowardCursor: true,
  activity: true,
  showChat: true,
  shouldRender: true,
  shouldLoadChunks: true,
  searchActive: false,
  notifications: false,
  sounds: true,
  darkMode: false,
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
