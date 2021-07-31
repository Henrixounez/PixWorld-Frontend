import { useDispatch, useSelector } from "react-redux";
import { SET_GRID_ACTIVE } from '../../../store/actions/parameters';
import { ReduxState } from '../../../store';

export default function ModalParameters() {
    const dispatch = useDispatch();
    const gridActive = useSelector((state: ReduxState) => state.gridActive);

    const changeGridActive = () => {
        dispatch({type: SET_GRID_ACTIVE, payload: !gridActive});
        
    }
    return (
        <>
            <h3>
                Parameters
            </h3>
            <hr/>
            Grid active
            <br/>
            <input type="checkbox" id="gridActive" checked={gridActive} onChange={changeGridActive}/>
        </>
    );
}