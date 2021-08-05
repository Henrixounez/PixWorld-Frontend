import styled from 'styled-components';
import { useSelector } from "react-redux"
import { ReduxState } from "../../store"
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { getCanvasController } from '../controller/CanvasController';
import { AudioType } from '../controller/SoundController';

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
  const { t } = useTranslation('notification');
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const cooldownUntil = useSelector((state: ReduxState) => state.cooldown);
  const notifications = useSelector((state: ReduxState) => state.notifications);
  const [display, setDisplay] = useState(false);
  const [lastNotifTime, setLastNotifTime] = useState(0);

  function calculateDiff() {
    const diff = Math.round((cooldownUntil - Date.now()) / 1000);
    if (diff > 0) {
      document.title = `PixWorld | ${diff}`;
    } else {
      document.title = 'PixWorld';
      if (diff === 0) {
        getCanvasController()?.soundController.playSound(AudioType.GOOD);
        if (
          notifications &&
          window.Notification &&
          Notification.permission === "granted" &&
          document.visibilityState === "hidden" &&
          Date.now() - lastNotifTime > 20 * 1000
        ) {
          new Notification(
            t('cooldown.title'),
            {
              body: t('cooldown.body'),
              renotify: false,
              requireInteraction: false,
              silent: false,
              vibrate: [100, 100],
            }
          );
          setLastNotifTime(Date.now())
        }
      }
    }
      setCooldownLeft(diff < 0 ? 0 : diff);
  }

  useEffect(() => {
    const timeout = cooldownLeft === 0 ? setTimeout(() => setDisplay(false), 1000) : undefined;

    return () => {
      if (timeout)
        clearTimeout(timeout);
    };
}, [cooldownLeft]);

  useEffect(() => {
    setDisplay(true);
    const timeout = setTimeout(() => calculateDiff(), 0);
    const interval = setInterval(() => calculateDiff(), 1000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    }
  }, [cooldownUntil]);

  return (
    <>
      { display ? (
        <CooldownContainer show={cooldownLeft > 0} limit={cooldownLeft > MAX_COOLDOWN - COOLDOWN_TIME}>
          {cooldownLeft}
        </CooldownContainer>
      ) : null }
    </>
  );
}