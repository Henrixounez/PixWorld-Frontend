import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ReduxState } from '../../store';
import { SET_SELECTED_COLOR } from '../../store/actions/painting';
import palette from '../constants/palette';
import { getCanvasController } from '../controller/CanvasController';

const Palette = styled.div`
  position: fixed;
  right: 10px;
  bottom: 10px;
  padding: 3px;
  background-color: #FFF;
  border: 1px solid #000;
  overflow: hidden;

  display: flex;
  flex-flow: column wrap;

  height: calc(30*25px);
  transition: 0.2s;

  @media (max-height: 800px) {
    height: calc(15 * 25px);
    width: calc(2 * 25px);
  }
  @media (max-height: 400px) {
    height: calc(6 * 25px);
    width: calc(5 * 25px);
  }
`;
const PaletteButton = styled.div<{selected: boolean}>`
  width: 25px;
  min-height: 25px;
  cursor: pointer;
  transition: 0.2s;
  box-sizing: border-box;
  &:hover {
    transform: scale(1.1);
    box-shadow: 0px 0px 5px #444;
  }
  ${({ selected }) => selected && `
    transform: scale(1.1);
    box-shadow: 0px 0px 5px #444;
    border: 1px solid #FFF;
    z-index: 10;
  `}
`;

export default function PaletteList() {
  const selectedColor = useSelector((state: ReduxState) => state.selectedColor);
  const dispatch = useDispatch();

  return (
    <Palette>
      {palette.map((color, i) => (
        <PaletteButton
          key={i}
          selected={selectedColor === color}
          style={{
            backgroundColor: color,
            transform: selectedColor === color ? "scale(1.2)" : '',
          }}
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
  );
}