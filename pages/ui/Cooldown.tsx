import styled from 'styled-components';
import { useDispatch, useSelector } from "react-redux"
import { ReduxState } from "../../store"
import { useEffect } from 'react';
import { SET_COOLDOWN } from '../../store/actions/infos';

const COOLDOWN_TIME = 4;
const MAX_COOLDOWN = 60;

const CooldownContainer = styled.div<{show: boolean, limit: boolean}>`
  position: fixed;
  top: 10px;
  left: calc(50vw - 25px);
  width: 50px;
  font-size: 1rem;
  height: 35px;
  background-color: ${({ limit })=> limit ? "#FFA9A9cc" : "#FFFD" };
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

export default function Cooldown() {
  const dispatch = useDispatch();
  const cooldown = useSelector((state: ReduxState) => state.cooldown);

  useEffect(() => {
    const interval = setInterval(() => {
      if (cooldown > 0)
        dispatch({ type: SET_COOLDOWN, payload: cooldown - 1});
    }, 1000);
    return () => {
      clearInterval(interval);
    }
  }, [cooldown]);

  return (
    <CooldownContainer show={cooldown > 0} limit={cooldown > MAX_COOLDOWN - COOLDOWN_TIME}>
      {cooldown}
    </CooldownContainer>
  );
}