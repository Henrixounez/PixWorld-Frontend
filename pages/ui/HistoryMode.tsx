import styled from 'styled-components';
import { useDispatch, useSelector } from "react-redux";
import { SET_HISTORY_DATE } from '../../store/actions/history';
import { ReduxState } from '../../store';
import { API_URL } from "../constants/api";
import axios from 'axios';
import React, { useEffect, useState } from 'react';

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
    const active = useSelector((state: ReduxState) => state.historyMode);
    const historyDate = useSelector((state: ReduxState) => state.historyDate);
    const [minDate, setMinDate] = useState("");
    const [availableHours, setAvailableHours] = useState<string[]>([]);
    

    async function getFirstDate() {
        try {
          const datesUrl = `${API_URL}/history/date`;
          const res = await axios(datesUrl);
          const storedText = res.data;
          const lines = storedText.split('\n');
          const dates = lines.map((line: any) => line.split('&')[0]);
          return dates[0];
        } catch (err) {
          console.error(err);
        }
      }

    async function setHoursFromDate(date: string) {
        try {
            const datesUrl = `${API_URL}/history/date`
            const res = await axios(datesUrl);
            const storedText = res.data;
            const lines = storedText.split('\n');

            let ret: string[] = [];

            lines.forEach((line: string) => {
                const splittedLine = line.split('&');
                if (splittedLine[0] == date) {
                    for (let i = 1; i < splittedLine.length; i++) {
                        ret.push(splittedLine[i].replace('-', ':'));
                    }
                }
            });
            setAvailableHours(ret);      
        } catch (err) {
            console.error(err);
        }
    }

    function changeDate(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch({type: SET_HISTORY_DATE, payload: event.target.value});
    }

    useEffect(() => {
        getFirstDate().then(function (result) {
            setMinDate(result);
            console.log(minDate);
        });
        
    }, []);

    useEffect(() => {
        setHoursFromDate(historyDate);
    }, [historyDate]);

    console.log("r");
    return (
        <HistoryContainer show={active}>
            Select date:
            <input type='date' id='dateSelector' min={minDate} max={new Date().toISOString().slice(0, 10)} defaultValue={historyDate} onChange={changeDate}/>
            <br/>
            <select name="hour" id="hourSelect">
                {availableHours.map((h) => (
                    <option value={h}>
                        {h}
                    </option>
                ))}
            </select>
        </HistoryContainer>
    );
}