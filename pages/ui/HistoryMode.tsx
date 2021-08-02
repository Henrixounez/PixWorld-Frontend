import styled from 'styled-components';
import { useDispatch, useSelector } from "react-redux";
import { SET_HISTORY_DATE } from '../../store/actions/history';
import { ReduxState } from '../../store';

const HistoryContainer = styled.div<{show: boolean}>`
position: fixed;
top: 10px;
left: calc(50vw - 250px);
width: 250px;
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

    function changeDate(event: React.ChangeEvent<HTMLInputElement>) {
        dispatch({type: SET_HISTORY_DATE, payload: event.target.value});
    }

    return (
        <HistoryContainer show={active}>
            Select date:
            <input type='date' id='dateSelector' min='2021-07-31' defaultValue={historyDate} onChange={changeDate}/>
        </HistoryContainer>
    );
}