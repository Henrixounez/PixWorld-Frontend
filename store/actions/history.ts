import { ReduxState } from "..";

/* Action */
export const SET_HISTORY_MODE_ACTIVE = 'SET_HISTORY_MODE_ACTIVE';
export const SET_HISTORY_DATE = 'SET_HISTORY_DATE'

/* Types */

export interface SetHistoryModeActiveAction {
    type: typeof SET_HISTORY_MODE_ACTIVE;
    payload: boolean;
}

export interface SetHistoryDateAction {
    type: typeof SET_HISTORY_DATE;
    payload: string;
}

export type Actions = SetHistoryModeActiveAction | SetHistoryDateAction;

export function setHistoryModeActive(state: ReduxState, action: SetHistoryModeActiveAction): ReduxState {
    return {
        ...state,
        historyMode: action.payload
    };
}

export function setHistorydate(state: ReduxState, action: SetHistoryDateAction): ReduxState {
    return {
        ...state,
        historyDate: action.payload
    };
}

/* Dispatches */

export const dispatches = [
    {
        action: SET_HISTORY_MODE_ACTIVE,
        function: setHistoryModeActive
    },
    {
        action: SET_HISTORY_DATE,
        function: setHistorydate
    }
]

