import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import styled from 'styled-components';
import axios from 'axios';

import { SET_HISTORY_DATE, SET_HISTORY_HOUR } from '../../store/actions/history';
import { ReduxState } from '../../store';
import { API_URL } from "../constants/api";
import { SET_SHOULD_LOAD_CHUNKS } from '../../store/actions/painting';
import { getCanvasController } from '../controller/CanvasController';

const HistoryContainer = styled.div<{show: boolean}>`
    position: fixed;
    top: 10px;
    left: calc(50vw - 250px);
    width: 350px;
    font-size: 1rem;
    height: 35px;
    background-color: #FFFD;
    border: 1px solid #000;
    padding: 0 10px;
    gap: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    transition: .5s;
    opacity: ${({ show }) => show ? '1' : '0'};
    user-select: none;
`;

export default function HistoryMode() {
    const dispatch = useDispatch();
    const active = useSelector((state: ReduxState) => state.history.activate);
    const historyDate = useSelector((state: ReduxState) => state.history.date);
    const [minDate, setMinDate] = useState("");
    const [availableHours, setAvailableHours] = useState<string[]>([]);

    async function getFirstDate() {
        try {
          const datesUrl = `${API_URL}/history/dates`;
          const res = await axios(datesUrl);
          setMinDate(res.data);
        } catch (err) {
          console.error(err);
        }
      }

    async function setHoursFromDate(date: string) {
        try {
            const hoursUrl = `${API_URL}/history/hours/${date}`
            const res = await axios(hoursUrl);
            setAvailableHours(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    function changeDate(event: React.ChangeEvent<HTMLInputElement>) {
        getCanvasController()?.clearHistoryChunks();
        dispatch({type: SET_HISTORY_HOUR, payload: ''});
        dispatch({type: SET_HISTORY_DATE, payload: event.target.value});
    }
    function changeHour(event: React.ChangeEvent<HTMLSelectElement>) {
        getCanvasController()?.clearHistoryChunks();
        dispatch({type: SET_HISTORY_HOUR, payload: event.target.value});
        dispatch({type: SET_SHOULD_LOAD_CHUNKS, payload: true});
    }

    useEffect(() => {
        if (active && minDate === "")
            getFirstDate();
    }, [active]);

    useEffect(() => {
        setHoursFromDate(historyDate);
    }, [historyDate]);

    return (
        <HistoryContainer show={active}>
            Select date:
            <input type='date' id='dateSelector' min={minDate} max={new Date().toISOString().slice(0, 10)} defaultValue={historyDate} onChange={changeDate}/>
            <br/>
            <select name="hour" id="hourSelect" onChange={changeHour}>
                {availableHours.map((h, i) => (
                    <option key={i} value={h}>
                        {h}
                    </option>
                ))}
            </select>
        </HistoryContainer>
    );
}