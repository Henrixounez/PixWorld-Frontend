import styled from 'styled-components';
import { useSelector } from "react-redux"
import { ReduxState } from "../store"
import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { getCanvasController } from '../controller/CanvasController';
import { AudioType } from '../controller/SoundController';
import { Colors, getColor } from '../../constants/colors';

const COOLDOWN_TIME = 4;
const MAX_COOLDOWN = 60;

const CooldownContainer = styled.div<{show: boolean, limit: boolean, darkMode: boolean}>`
  position: fixed;
  top: 10px;
  left: 50vw;
  width: 50px;
  transform: translate(-50%, 0);
  font-size: 1rem;
  height: 35px;
  background-color: ${({ limit, darkMode }) => getColor(limit ? Colors.ALERT : Colors.UI_BACKGROUND, darkMode) };
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
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
  const cooldownUntil = useSelector((state: ReduxState) => state.cooldown?.[state.currentCanvas] ?? 0);
  const notifications = useSelector((state: ReduxState) => state.notifications);
  const [display, setDisplay] = useState(false);
  const [lastNotifTime, setLastNotifTime] = useState(0);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

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
        <CooldownContainer show={cooldownLeft > 0} limit={cooldownLeft > MAX_COOLDOWN - COOLDOWN_TIME} darkMode={darkMode}>
          {cooldownLeft}
        </CooldownContainer>
      ) : null }
    </>
  );
}