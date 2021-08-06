import styled from 'styled-components';
import { useDispatch, useSelector } from "react-redux"
import React, { useEffect } from 'react';
import { Bookmark, ChevronDown, ChevronUp } from 'react-feather';
import { useTranslation } from 'next-i18next';

import { SET_OVERLAY_ACTIVATE, SET_OVERLAY_AUTOCOLOR, SET_OVERLAY_IMAGE, SET_OVERLAY_OPEN, SET_OVERLAY_POSITION, SET_OVERLAY_POSITION_MOUSE, SET_OVERLAY_TRANSPARENCY } from '../../store/actions/overlay';
import { ReduxState } from '../../store';
import { SET_MODAL } from '../../store/actions/infos';
import ModalTypes from '../constants/modalTypes';

const OverlayContainer = styled.div<{darkMode: boolean}>`
  position: fixed;
  top: 10px;
  right: 10px;
  font-size: 1rem;
  background-color: #FFFD;
  border: 1px solid #000;
  padding: 5px 10px;
  min-width: 50px;
  text-align: center;
  gap: 10px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  transition: .2s;
  filter: ${({ darkMode }) => darkMode ? 'invert(1)' : 'invert(0)'};

  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  @media (max-height: 450px) {
    flex-direction: row;
    right: 10px;
    max-width: 50vw;
  }

`;
const ActivateButton = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 5px;
  padding: 5px 0;
  margin-left: auto;
  align-items: center;
  user-select: none;
`;
const OpenButton = styled.div`
  cursor: pointer;
  margin: auto;
`;
const RangeSlider = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  user-select: none;
  input {
    user-select: none;
  }
`;
const CheckboxRow = styled.div`
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
`;
const TaintedText = styled.span`
  font-size: 0.8rem;
  max-width: 220px;
  margin: 0;
`;
const SaveRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 80%;
  gap: 1rem;
`;
const OverlayOptions = styled.div`
  cursor: pointer;
  border: 1px solid #AAA;
  border-radius: 2px;
  padding: .25rem .5rem;
  transition: .2s;

  &:hover {
    border: 1px solid #777;
  }
`;
const OverlaySave = styled.div`
  cursor: pointer;
  transition: .2s;
  
  svg {
    color: #AAA;
    transition: .2s;
  }
  &:hover {
    svg {
      color: #000;
    }
    transform: scale(1.1);
  }
`;

export interface OverlaySave {
  image: string;
  transparency: number;
  position: {
    x: number;
    y: number;
  };
  autoColor: boolean;
}

export default function Overlay() {
  const { t } = useTranslation('overlay');
  const dispatch = useDispatch();
  const image = useSelector((state: ReduxState) => state.overlay.image);
  const activate = useSelector((state: ReduxState) => state.overlay.activate);
  const transparency = useSelector((state: ReduxState) => state.overlay.transparency);
  const position = useSelector((state: ReduxState) => state.overlay.position);
  const positionWithMouse = useSelector((state: ReduxState) => state.overlay.positionMouse);
  const autoColor = useSelector((state: ReduxState) => state.overlay.autoColor);
  const tainted = useSelector((state: ReduxState) => state.overlay.tainted);
  const overlayOpen = useSelector((state: ReduxState) => state.overlay.open);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const openFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files)
      return;

    const fileURL = URL.createObjectURL(e.target.files[0]);
    dispatch({ type: SET_OVERLAY_IMAGE, payload: fileURL });

    const urlInput = document.getElementById('url-input') as HTMLInputElement;
    urlInput.value = ""
  }
  const openUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: SET_OVERLAY_IMAGE, payload: e.target.value });

    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.value = ""
  }
  const saveOverlay = () => {
    if (image && image.startsWith('http')) {
      const currentTxt = localStorage.getItem('savedOverlays') || '[]';
      const data: Array<OverlaySave> = JSON.parse(currentTxt);
      const found = data.findIndex((e) => e.image === image);
      const toAdd = { image, transparency, position, autoColor };

      if (found !== -1)
        data[found] = toAdd;
      else
        data.push(toAdd);
      
      localStorage.setItem('savedOverlays', JSON.stringify(data));
    }
  }

  useEffect(() => {
    if (image && image.startsWith('http')) {
      const urlInput = document.getElementById('url-input') as HTMLInputElement;
      urlInput.value = image;
    }
  }, [image]);

  return (
    <OverlayContainer darkMode={darkMode}>
      <ActivateButton onClick={() => {
        dispatch({ type: SET_OVERLAY_ACTIVATE, payload: !activate });
      }}>
        <input type="checkbox" checked={activate} readOnly />
        {t('title')}
      </ActivateButton>
      { activate && (
        <>
          { overlayOpen && (
            <>
              {t('input')}
              <input type="url" id="url-input" onChange={openUrl} placeholder={t('inputUrl')} />
              <input type="file" id="file-input" onChange={openFile}/>
              <br/>
              {t('transparency')}
              <RangeSlider>
                <input type="range" min={0} max={1} step={0.01} onChange={(e) => dispatch({ type: SET_OVERLAY_TRANSPARENCY, payload: Number(e.target.value) })} value={transparency} />
                <span>
                  {Math.round(transparency * 100)}
                </span>
              </RangeSlider>
              <br/>
              {t('position')}
              <input type="number" onChange={(e) => dispatch({ type: SET_OVERLAY_POSITION, payload: { x: Number(e.target.value), y: position.y }})} value={position.x} />
              <input type="number" onChange={(e) => dispatch({ type: SET_OVERLAY_POSITION, payload: { x: position.x, y: Number(e.target.value) }})} value={position.y} />
              <CheckboxRow onClick={() => dispatch({ type: SET_OVERLAY_POSITION_MOUSE, payload: !positionWithMouse })}>
                <input type="checkbox" checked={positionWithMouse} readOnly />
                {t('positionMouse')}
              </CheckboxRow>
              <br/>
              { tainted ? (
                <TaintedText>
                  {t('tainted')}
                </TaintedText>
              ) : (
                <CheckboxRow onClick={() => dispatch({ type: SET_OVERLAY_AUTOCOLOR, payload: !autoColor })}>
                  <input type="checkbox" checked={autoColor} readOnly />
                  {t('autoColor')}
                </CheckboxRow>
              )}
              <br/>
              <SaveRow>
                <OverlayOptions onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.OVERLAY })}>
                  {t('options')}
                </OverlayOptions>
                { image && image.startsWith('http') ? (
                  <OverlaySave title={t('saveBtn')} onClick={() => saveOverlay()}>
                    <Bookmark />
                  </OverlaySave>
                ) : null }
              </SaveRow>
            </>
          )}
          <OpenButton onClick={() => dispatch({ type: SET_OVERLAY_OPEN, payload: !overlayOpen })}>
            {overlayOpen ? 
              <ChevronUp   height="20px"/> :
              <ChevronDown height="20px"/>
            }
          </OpenButton>
        </>
      )}
    </OverlayContainer>
  );
}