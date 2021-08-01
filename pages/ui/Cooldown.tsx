import styled from 'styled-components';
import { useSelector } from "react-redux"
import { ReduxState } from "../../store"
import { useEffect, useState } from 'react';

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
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownUntil = useSelector((state: ReduxState) => state.cooldown);

  function calculateDiff() {
    const diff = Math.round((cooldownUntil - Date.now()) / 1000);
    setCooldownLeft(diff < 0 ? 0 : diff);
    if (diff > 0) {
      document.title = `PixWorld | ${diff}`;
    } else {
      document.title = 'PixWorld';
    }
  }

  useEffect(() => {
    calculateDiff();
    const interval = setInterval(() => calculateDiff(), 1000);
    return () => {
      clearInterval(interval);
    }
  }, [cooldownUntil]);

  return (
    <CooldownContainer show={cooldownLeft > 0} limit={cooldownLeft > MAX_COOLDOWN - COOLDOWN_TIME}>
      {cooldownLeft}
    </CooldownContainer>
  );
}