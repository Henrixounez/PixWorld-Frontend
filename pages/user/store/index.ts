import { useMemo } from 'react';
import { createStore, Store } from 'redux';
import * as Actions from './reducer';
import { ActionTypes } from './reducer';
import { User } from './actions/user';
import { Faction } from './actions/faction';

export interface UserReduxState {
  user?: User,
  faction?: Faction,
}

export let store: Store<UserReduxState, ActionTypes> | undefined;

export const initialState: UserReduxState = {
  user: undefined,
};

const reducer = (state = initialState, action: ActionTypes) => {
  return Actions.reducer(state, action);
};

function initStore(preloadedState = initialState): Store<UserReduxState, ActionTypes> {
  return createStore(reducer, preloadedState) as Store<UserReduxState, ActionTypes>;
}

export const initializeStore = (preloadedState: UserReduxState): Store<UserReduxState, ActionTypes> => {
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

export function useStore(newInitialState: UserReduxState): Store<UserReduxState, ActionTypes> {
  const newStore = useMemo(() => initializeStore(newInitialState), [newInitialState]);
  return newStore;
}
