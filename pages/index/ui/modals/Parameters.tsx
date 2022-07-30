import styled from 'styled-components';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/dist/client/router';
import { useDispatch, useSelector } from "react-redux";
import Cookies from 'universal-cookie';
import { Download } from 'react-feather';

import { languages, languagesDisplay } from '../../../constants/languages';
import { SET_ACTIVITY, SET_DARK_MODE, SET_GRID_ACTIVE, SET_GRID_SIZE, SET_NOTIFICATIONS, SET_SOUNDS, SET_ZOOM_TOWARD_CURSOR } from '../../store/actions/parameters';
import { ReduxState } from '../../store';
import { SET_HISTORY_MODE_ACTIVE } from '../../store/actions/history';
import { getCanvasController } from '../../controller/CanvasController';
import { PIXEL_SIZE } from '../../../constants/painting';

const InputRow = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 80%;
  margin: auto;
  user-select: none;
  .checkbox {
    width: 15px;
    height: 15px;
  }
`;

export default function ModalParameters() {
  const { t, i18n } = useTranslation('parameters');
  const router = useRouter();
  const dispatch = useDispatch();
  const gridActive = useSelector((state: ReduxState) => state.gridActive);
  const zoomTowardCursor = useSelector((state: ReduxState) => state.zoomTowardCursor);
  const activity = useSelector((state: ReduxState) => state.activity);
  const notifications = useSelector((state: ReduxState) => state.notifications);
  const sounds = useSelector((state: ReduxState) => state.sounds);
  const history = useSelector((state: ReduxState) => state.history.activate);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const gridSize = useSelector((state: ReduxState) => state.gridSize);

  return (
    <>
      <hr/>
      <InputRow onClick={() => {
        const canvas = getCanvasController()?.canvas;

        getCanvasController()?.setZoom(PIXEL_SIZE);
        if (canvas) {
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = 'pixworld-download.png';
          link.href = url;
          link.click();
        }
      }}>
        {t('download')}
        <div>
          <Download/>
        </div>
      </InputRow>
      <hr/>
      <InputRow onClick={() => dispatch({type: SET_GRID_ACTIVE, payload: !gridActive})}>
        {t('grid')}
        <input type="checkbox" className="checkbox" id="gridActive" checked={gridActive} readOnly/>
      </InputRow>
      <hr/>
      <InputRow onClick={() => dispatch({type: SET_ZOOM_TOWARD_CURSOR, payload: !zoomTowardCursor})}>
        {t('zoomCursor')}
        <input type="checkbox" className="checkbox" id="zoomTowardCursor" checked={zoomTowardCursor} readOnly/>
      </InputRow>
      <hr/>
      <InputRow onClick={() => dispatch({type: SET_ACTIVITY, payload: !activity})}>
        {t('activity')}
        <input type="checkbox" className="checkbox" id="activity" checked={activity} readOnly/>
      </InputRow>
      <hr/>
      <InputRow onClick={async () => {
        if (!notifications) {
          await Notification.requestPermission();
          dispatch({ type: SET_NOTIFICATIONS, payload: !notifications })
        } else {
          dispatch({type: SET_NOTIFICATIONS, payload: !notifications})
        }
      }}>
        {t('notifications')}
        <input type="checkbox" className="checkbox" id="notifications" checked={notifications} readOnly/>
      </InputRow>
      <hr/>
      <InputRow onClick={() => dispatch({type: SET_SOUNDS, payload: !sounds})}>
        {t('sounds')}
        <input type="checkbox" className="checkbox" id="sounds" checked={sounds} readOnly/>
      </InputRow>
      <hr/>
      <InputRow onClick={() => dispatch({type: SET_HISTORY_MODE_ACTIVE, payload: !history})}>
        {t('history')}
        <input type="checkbox" className="checkbox" id="history" checked={history} readOnly/>
      </InputRow>
      <hr/>
      <InputRow onClick={() => dispatch({type: SET_DARK_MODE, payload: !darkMode}) }>
        {t('darkMode')}
        <input type="checkbox" className="checkbox" id="darkMode" checked={darkMode} readOnly/>
      </InputRow>
      <hr/>
      <InputRow>
        {t('gridSize')}
        <input type="number" id="gridSize" value={gridSize} min={1} onChange={(e) => dispatch({ type: SET_GRID_SIZE, payload: Number(e.target.value) })} />
      </InputRow>
      <hr/>
      <InputRow>
        {t('language')}
        <select value={i18n.language} onChange={(e) => {
          const cookies = new Cookies();
          cookies.set('NEXT_LOCALE', e.target.value);
          router.push(router.pathname, router.asPath, { locale: e.target.value });
        }}>
          {languages.map((l, i) => (
            <option key={i} value={l}>
              {languagesDisplay[i]}
            </option>
          ))}
        </select>
      </InputRow>
    </>
  );
}