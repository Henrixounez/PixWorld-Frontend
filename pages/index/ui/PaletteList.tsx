import { useDispatch, useSelector } from 'react-redux';
import styled, { css } from 'styled-components';
import { ReduxState } from '../store';
import { SET_SELECTED_COLOR } from '../store/actions/painting';
import { getCanvasController } from '../controller/CanvasController';
import { BottomButton } from './Chat';
import { Grid } from 'react-feather';
import { useEffect, useState } from 'react';
import { SET_SHOW_PALETTE } from '../store/actions/parameters';
import { Colors, getColor } from '../../constants/colors';

const Container = styled.div`
  position: fixed;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-end;
  gap: 5px;
`;
const OpenButton = styled(BottomButton)`
  transition: 0.5s;
  width: calc(25px + 8px);
  @media (max-height: 800px) {
    width: calc(2 * 25px + 8px);
  }
  @media (max-height: 450px) {
    width: calc(5 * 25px + 8px);
  }
`;
const Palette = styled.div<{ show: boolean, darkMode: boolean, colorsNb: number }>`
  padding: 3px;
  color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  overflow: hidden;

  display: flex;
  flex-flow: column wrap;

  height: calc(${({ colorsNb }) => Math.min(30, colorsNb)}*25px);
  transition: 0.5s;

  @media (max-height: 800px) {
    height: calc(${({ colorsNb }) => Math.min(15, colorsNb)} * 25px);
    width: calc(${({ colorsNb }) => Math.ceil(colorsNb / Math.min(15, colorsNb)) } * 25px);
  }
  @media (max-height: 450px) {
    height: calc(${({ colorsNb }) => Math.min(6, colorsNb)} * 25px);
    width: calc(${({ colorsNb }) => Math.ceil(colorsNb / Math.min(6, colorsNb)) } * 25px);
  }
  ${({ show }) => !show && css`
    height: 0px !important;
  `};
`;
const PaletteButton = styled.div<{ selected: boolean, darkMode: boolean }>`
  width: 25px;
  height: 25px;
  cursor: pointer;
  transition: 0.2s;
  box-sizing: border-box;
  &:hover {
    transform: scale(1.1);
    box-shadow: 0px 0px 5px ${({ darkMode }) => getColor(Colors.LIGHT_TEXT, darkMode)};
  }
  ${({ selected, darkMode }) => selected && `
    transform: scale(1.1);
    box-shadow: 0px 0px 5px ${getColor(Colors.LIGHT_TEXT, darkMode)};
    border: 1px solid ${getColor(Colors.UI_BORDER, false)};
    z-index: 10;
  `}
`;

export default function PaletteList() {
  const dispatch = useDispatch();
  const selectedColor = useSelector((state: ReduxState) => state.selectedColor);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const showPalette = useSelector((state: ReduxState) => state.showPalette);
  const currentCanvas = useSelector((state: ReduxState) => state.canvases.find((c) => c.id === state.currentCanvas));
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    if (!display && showPalette) {
      const t = setTimeout(() => {
        setDisplay(true)
      }, 0);
      return () => clearTimeout(t);
    }
    if (display && !showPalette) {
      setDisplay(false);
    }
  }, [showPalette]);
  useEffect(() => {
    if (!display && showPalette) {
      const t = setTimeout(() => {
        dispatch({ type: SET_SHOW_PALETTE, payload: false });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [display]);

  return (
    <Container>
      <OpenButton darkMode={darkMode} onClick={() => { showPalette ? setDisplay(!display) : dispatch({ type: SET_SHOW_PALETTE, payload: !showPalette }) }}>
        <Grid/>
      </OpenButton>
      { showPalette && (
        <Palette show={display} darkMode={darkMode} colorsNb={currentCanvas?.palette.length ?? 0}>
          {currentCanvas?.palette.map((color, i) => (
            <PaletteButton
              key={i}
              selected={selectedColor === color}
              style={{
                backgroundColor: color,
                transform: selectedColor === color ? "scale(1.2)" : '',
              }}
              darkMode={darkMode}
              onClick={() => {
                dispatch({
                  type: SET_SELECTED_COLOR,
                  payload: color,
                });
                getCanvasController()?.canvas.focus();
              }}
            />
          ))}
        </Palette>
      )}
    </Container>
  );
}