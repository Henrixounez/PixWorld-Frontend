import { UserReduxState } from '.';
import * as User from './actions/user';
import * as Faction from './actions/faction';

export type ActionTypes =
  User.Actions |
  Faction.Actions;

export interface Dispatch {
  action: string,
  function: (state: UserReduxState, action: ActionTypes) => UserReduxState
};

// @ts-ignore
const allDispatches: Array<Dispatch> = [
  User.dispatches,
  Faction.dispatches,
].flat();

export function reducer(state: UserReduxState, action: ActionTypes) {
  const dispatchAction = allDispatches.find((e) => e?.action === action.type);

  if (dispatchAction)
    return dispatchAction.function(state, action);
  else
    return state;
}