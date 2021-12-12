import styled from 'styled-components';
import { useDispatch, useSelector } from "react-redux"
import { useTranslation } from 'next-i18next';
import { ReduxState } from "../store"
import { useEffect, useState } from 'react';
import { SET_ALERT } from '../store/actions/infos';
import { getCanvasController } from '../controller/CanvasController';
import { AudioType } from '../controller/SoundController';
import { Colors, getColor } from '../../constants/colors';

const AlertContainer = styled.div<{show: boolean, bgColor: string, darkMode: boolean}>`
  position: fixed;
  top: 55px;
  left: calc(50vw);
  transform: translate(-50%, 0);
  font-size: 1rem;
  text-align: center;
  color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  background-color: ${({ bgColor }) => bgColor};
  border: ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
  border: 1px solid #000;
  padding: 10px;
  gap: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: .5s;
  opacity: ${({ show }) => show ? '1' : '0'};
  user-select: none;
`;

export default function Alert() {
  const { t } = useTranslation('alerts');
  const dispatch = useDispatch();
  const alert = useSelector((state: ReduxState) => state.alert);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const [display, setDisplay] = useState(false);

  useEffect(() => {
    if (alert.show) {
      getCanvasController()?.soundController.playSound(AudioType.OPTIONS);
      const timeout0 = setTimeout(() => {
        setDisplay(true);
      }, 0);
      const timeout1 = setTimeout(() => {
        setDisplay(false);
      }, 2000);
      const timeout2 = setTimeout(() => {
        dispatch({ type: SET_ALERT, payload: { ...alert, show: false }});
      }, 2500);

      return () => {
        clearTimeout(timeout0);
        clearTimeout(timeout1);
        clearTimeout(timeout2);
      }
    }
  }, [alert]);

  const color = alert.color !== undefined ? alert.color : Colors.UI_BACKGROUND;
  return (
    <>
      { alert.show && alert.text ? (
        <AlertContainer show={display} bgColor={getColor(color, darkMode)} darkMode={darkMode}>
          {t(alert.text)}
        </AlertContainer>
      ) : (
        null
      )}
    </>
  );
}