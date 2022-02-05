import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import styled from 'styled-components';
import axios from 'axios';

import { SET_HISTORY_DATE, SET_HISTORY_HOUR } from '../store/actions/history';
import { ReduxState } from '../store';
import { API_URL } from "../../constants/api";
import { SET_SHOULD_LOAD_CHUNKS } from '../store/actions/painting';
import { getCanvasController } from '../controller/CanvasController';
import { Colors, getColor } from '../../constants/colors';

const HistoryContainer = styled.div<{ darkMode: boolean }>`
  position: fixed;
  top: 10px;
  left: 50vw;
  transform: translate(-50%, 0);
  font-size: 1rem;
  color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
  padding: 0.5rem 0.5rem;
  gap: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: .5s;
  user-select: none;

  @media(max-width: 500px) {
    top: 55px;
  }
`;

function dateFrToEn(date: string) {
  if (date === '')
    return '';
  const [dd, mm, yyyy] = date.split('-');
  return `${yyyy}-${mm}-${dd}`;
}
function dateEnToFr(date: string) {
  if (date === '')
    return '';
  const [yyyy, mm, dd] = date.split('-');
  return `${dd}-${mm}-${yyyy}`;
}

export default function HistoryMode() {
  const dispatch = useDispatch();
  const active = useSelector((state: ReduxState) => state.history.activate);
  const historyDate = useSelector((state: ReduxState) => state.history.date);
  const canvas = useSelector((state: ReduxState) => state.currentCanvas);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const [minDate, setMinDate] = useState(new Date().toLocaleDateString('fr-FR').replace(/\//g, '-'));
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [loadedDate, setLoadedDate] = useState(false);

  async function getFirstDate() {
    try {
      const datesUrl = `${API_URL}/history/dates/${canvas}`;
      const res = await axios(datesUrl);

      if (res.data.length) {
        setMinDate(res.data[0]);
      }
      setLoadedDate(true);
    } catch (err) {
      console.error(err);
    }
    }

  async function setHoursFromDate(date: string) {
    if (!date || date === '')
      return;
    try {
      const hoursUrl = `${API_URL}/history/hours/${date}/${canvas}`
      const res = await axios(hoursUrl);
      setAvailableHours(res.data || []);
      changeHour(res.data[0] || '');
    } catch (err) {
      console.error(err);
    }
  }

  function changeDate(value: string) {
    getCanvasController()?.clearHistoryChunks();
    dispatch({type: SET_HISTORY_HOUR, payload: ''});
    dispatch({type: SET_HISTORY_DATE, payload: dateEnToFr(value)});
  }
  function changeHour(value: string) {
    getCanvasController()?.clearHistoryChunks();
    dispatch({type: SET_HISTORY_HOUR, payload: value});
    dispatch({type: SET_SHOULD_LOAD_CHUNKS, payload: true});
  }
  function getCurrentDate() {
    if (historyDate !== '') {
      const date = new Date(dateFrToEn(historyDate));
      date.setMinutes(date.getMinutes() -  date.getTimezoneOffset());
      return date.toISOString().slice(0, 10);
    } else {
      return minDate;
    }
  }

  useEffect(() => {
    if (active) {
      if (!loadedDate)
        getFirstDate();
      if (!availableHours.length)
        setHoursFromDate(historyDate);
    }
  }, [active]);

  useEffect(() => {
    if (active && historyDate !== '')
      setHoursFromDate(historyDate);
  }, [historyDate]);

  return (
    <>
      {active ? (
        <HistoryContainer darkMode={darkMode}>
          Select date:
          <input
            type='date'
            id='dateSelector'
            min={new Date(dateFrToEn(minDate)).toISOString().slice(0, 10)}
            max={new Date().toISOString().slice(0, 10)}
            defaultValue={getCurrentDate()}
            onChange={(e) => changeDate(e.target.value)}
          />
          <select
            name="hour"
            id="hourSelect"
            onChange={(e) => changeHour(e.target.value)}
          >
            {availableHours.map((h, i) => (
              <option key={i} value={h}>
                {h}
              </option>
            ))}
          </select>
        </HistoryContainer>
      ) : (
        null
      )}
    </>
  );
}