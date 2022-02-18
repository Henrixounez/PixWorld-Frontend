import { UserReduxState } from "..";

export interface Faction {
  id: number;
  name: string;
  tag: string;
  description: string;
  totalPixelCount?: number;
  createdAt: Date;
}

export interface FactionInvite {
  id: number;
  username: string;
  name: string;
  faction: Faction;
  createdAt: Date;
}

export enum FactionRole {
  ADMIN = 'ADMIN',
  MOD = 'MOD',
  PLAYER = 'PLAYER',
  NEW = 'NEW'
}

export interface FactionMember {
  id: number;
  role: FactionRole;
  faction: number;
  username?: string;
  createdAt: Date;
}

/* Actions */
export const SET_FACTION = 'SET_FACTION';
export const DEL_FACTION = 'DEL_FACTION';

/* Types */
export interface SetFactionAction {
  type: typeof SET_FACTION,
  payload: Faction
}
export interface DelFactionAction {
  type: typeof DEL_FACTION,
  payload: null
}

export type Actions = SetFactionAction | DelFactionAction;

/* Functions */
export function setFaction(state: UserReduxState, action: SetFactionAction): UserReduxState {
  return {
    ...state,
    faction: action.payload,
  };
}
export function delFaction(state: UserReduxState, _action: DelFactionAction): UserReduxState {
  return {
    ...state,
    faction: undefined,
    user: state.user ? {
      ...state!.user,
      factionMember: undefined,
    } : undefined
  };
}

/* Dispatches */
export const dispatches = [
  {
    action: SET_FACTION,
    function: setFaction
  },
  {
    action: DEL_FACTION,
    function: delFaction,
  }
];