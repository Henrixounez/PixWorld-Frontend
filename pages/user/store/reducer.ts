import { UserReduxState } from '.';
import * as User from './actions/user';

export type ActionTypes =
  User.Actions;

export interface Dispatch {
  action: string,
  function: (state: UserReduxState, action: ActionTypes) => UserReduxState
};

// @ts-ignore
const allDispatches: Array<Dispatch> = [
  User.dispatches,
].flat();

export function reducer(state: UserReduxState, action: ActionTypes) {
  const dispatchAction = allDispatches.find((e) => e?.action === action.type);

  if (dispatchAction)
    return dispatchAction.function(state, action);
  else
    return state;
}