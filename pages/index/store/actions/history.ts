import { ReduxState } from "..";

/* Action */
export const SET_HISTORY_MODE_ACTIVE = 'SET_HISTORY_MODE_ACTIVE';
export const SET_HISTORY_DATE = 'SET_HISTORY_DATE'
export const SET_HISTORY_HOUR = 'SET_HISTORY_HOUR'

/* Types */

export interface SetHistoryModeActiveAction {
    type: typeof SET_HISTORY_MODE_ACTIVE;
    payload: boolean;
}
export interface SetHistoryDateAction {
    type: typeof SET_HISTORY_DATE;
    payload: string;
}
export interface SetHistoryHourAction {
    type: typeof SET_HISTORY_HOUR;
    payload: string;
}

export type Actions = SetHistoryModeActiveAction | SetHistoryDateAction | SetHistoryHourAction;

export function setHistoryModeActive(state: ReduxState, action: SetHistoryModeActiveAction): ReduxState {
    return {
        ...state,
        history: {
            ...state.history,
            activate: action.payload
        }
    };
}
export function setHistoryDate(state: ReduxState, action: SetHistoryDateAction): ReduxState {
    return {
        ...state,
        history: {
            ...state.history,
            date: action.payload
        }
    };
}
export function setHistoryHour(state: ReduxState, action: SetHistoryHourAction): ReduxState {
    return {
        ...state,
        history: {
            ...state.history,
            hour: action.payload
        }
    };
}

/* Dispatches */

export const dispatches = [
    {
        action: SET_HISTORY_MODE_ACTIVE,
        function: setHistoryModeActive,
    },
    {
        action: SET_HISTORY_DATE,
        function: setHistoryDate,
    },
    {
        action: SET_HISTORY_HOUR,
        function: setHistoryHour,
    }
]

