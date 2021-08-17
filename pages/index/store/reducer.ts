import { ReduxState } from '.';
import * as Infos from './actions/infos';
import * as Painting from './actions/painting';
import * as Overlay from './actions/overlay';
import * as Chat from './actions/chat';
import * as Parameters from './actions/parameters'
import * as User from './actions/user';
import * as HistoryMode from './actions/history';

export type ActionTypes =
  Infos.Actions |
  Painting.Actions |
  Overlay.Actions |
  Chat.Actions |
  Parameters.Actions |
  User.Actions |
  HistoryMode.Actions;

export interface Dispatch {
  action: string,
  function: (state: ReduxState, action: ActionTypes) => ReduxState
};

// @ts-ignore
const allDispatches: Array<Dispatch> = [
  Infos.dispatches,
  Painting.dispatches,
  Overlay.dispatches,
  Chat.dispatches,
  Parameters.dispatches,
  User.dispatches,
  HistoryMode.dispatches
].flat();

export function reducer(state: ReduxState, action: ActionTypes) {
  const dispatchAction = allDispatches.find((e) => e?.action === action.type);

  if (dispatchAction)
    return dispatchAction.function(state, action);
  else
    return state;
}