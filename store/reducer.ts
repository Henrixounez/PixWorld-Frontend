import { ReduxState } from './';
import * as Infos from './actions/infos';

export type ActionTypes =
  Infos.Actions;

export interface Dispatch {
  action: string,
  function: (state: ReduxState, action: ActionTypes) => ReduxState
};

// @ts-ignore
const allDispatches: Array<Dispatch> = [
  Infos.dispatches,
].flat();

export function reducer(state: ReduxState, action: ActionTypes) {
  const dispatchAction = allDispatches.find((e) => e.action === action.type);

  if (dispatchAction)
    return dispatchAction.function(state, action);
  else
    return state;
}