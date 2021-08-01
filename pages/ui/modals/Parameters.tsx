import styled from 'styled-components';
import { useDispatch, useSelector } from "react-redux";
import { SET_GRID_ACTIVE, SET_ZOOM_TOWARD_CURSOR } from '../../../store/actions/parameters';
import { ReduxState } from '../../../store';
import { getCanvasController } from "../../controller/CanvasController";

const CheckboxRow = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  user-select: none;
`;

export default function ModalParameters() {
    const dispatch = useDispatch();
    const gridActive = useSelector((state: ReduxState) => state.gridActive);
    const zoomTowardCursor = useSelector((state: ReduxState) => state.zoomTowardCursor);

    const changeGridActive = () => {
        dispatch({type: SET_GRID_ACTIVE, payload: !gridActive});
        getCanvasController()?.render();
    }

    const changeZoomTowardCursor = () => {
        dispatch({type: SET_ZOOM_TOWARD_CURSOR, payload: !zoomTowardCursor});
    }
    return (
        <>
            <h3>
                Parameters
            </h3>
            <hr/>
            <CheckboxRow onClick={changeGridActive}>
                Grid active
                <input type="checkbox" id="gridActive" checked={gridActive} readOnly/>
            </CheckboxRow>
            <hr/>
            <CheckboxRow onClick={changeZoomTowardCursor}>
                Zoom toward cursor
                <input type="checkbox" id="zoomTowardCursor" checked={zoomTowardCursor} readOnly/>
            </CheckboxRow>
        </>
    );
}