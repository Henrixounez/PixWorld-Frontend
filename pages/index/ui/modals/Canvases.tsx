import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { API_URL } from "../../../constants/api";
import { Colors, getColor } from "../../../constants/colors";
import { ReduxState } from "../../store";
import { SET_POSITION } from "../../store/actions/painting";
import { SET_CANVAS } from "../../store/actions/parameters";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  gap: 1rem;
  padding: 0px 16px;
`;
const CanvasItem = styled.div<{ selected: boolean, darkMode: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  border: 1px solid ${({ darkMode, selected }) => getColor(selected ? Colors.ALERT : Colors.UI_BORDER, darkMode)};
  border-radius: 0.5rem;
  padding: 16px 8px;

  cursor: pointer;
  .img-container {
    > img {
      width: 100px;
      height: 100px;
    }
    flex: 1;
  }
  .colors-container {
    flex: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1px;
    > div {
      width: 10px;
      height: 10px;
    }
  }
  > p {
    flex: 1;
  }
`;

export default function ModalCanvases() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const canvases = useSelector((state: ReduxState) => state.canvases);
  const currentCanvas = useSelector((state: ReduxState) => state.currentCanvas);

  return (
    <Container>
      {canvases.map((canvas, i) => (
        <CanvasItem
          key={i}
          darkMode={darkMode}
          selected={canvas.id === currentCanvas}
          onClick={() => {
            dispatch({type: SET_CANVAS, payload: canvas.id });
            dispatch({type: SET_POSITION, payload: { x: 0, y: 0, zoom: 1 }});  
          }}
        >
          <div className="img-container">
            <img
              src={`${API_URL}/superchunk/${canvas.id}/${
                canvas.superchunkLevels.length - 1
              }/0/0`}
            />
          </div>
          <p>{canvas.name}</p>
          <p>
            {canvas.cooldownTime / 1000}s / {canvas.cooldownTime / 2000}s
          </p>
          <p>
            {canvas.size * 256}x{canvas.size * 256} pixels
          </p>
          <div className="colors-container">
            {canvas.palette.map((color) => (
              <div style={{ backgroundColor: color }} />
            ))}
          </div>
        </CanvasItem>
      ))}
    </Container>
  );
}
