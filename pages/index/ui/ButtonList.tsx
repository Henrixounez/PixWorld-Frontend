import styled from 'styled-components'
import Link from 'next/link';
import { HelpCircle, Upload, Sliders, User, Search, ChevronsRight, Bookmark, ChevronDown, ChevronUp, Map, Shield, Edit3 } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';

import { SET_MODAL, SET_SEARCH } from '../store/actions/infos';
import ModalTypes from '../../constants/modalTypes';
import { ReduxState } from '../store';
import { getCanvasController } from '../controller/CanvasController';
import { coordinateLinkGoto } from './Chat';
import { SET_AUTO_BRUSH, SET_SHOW_BUTTONS } from '../store/actions/parameters';
import { Colors, getColor } from '../../constants/colors';
import { UserType } from '../store/actions/user';

const ButtonListContainer = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  max-width: 40px;
  gap: 5px;
  flex-wrap: wrap;
`;
const ButtonListDropdown = styled.div<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  flex-wrap: wrap;
  max-width: 40px;
  max-height: calc(100vh - 150px);
  transition: .5s;
  opacity: ${({ show }) => show ? '1' : '0'};
`;
const Button = styled.div<{ darkMode: boolean }>`
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
  box-sizing: border-box;
  min-width: 40px;
  height: 40px;
  padding: 8px 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
  svg {
    color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  }
`;
const SearchInput = styled.input<{active: boolean}>`
  width: 5rem;
  padding: .25rem .25rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
`;
const UnreadBubble = styled.div<{ darkMode: boolean }>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  user-select: none;
  border-radius: 100%;
  background-color: ${({ darkMode }) => getColor(Colors.UNREAD, darkMode)};
`;

function SearchBtn() {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchActive = useSelector((state: ReduxState) => state.searchActive);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);

  const positionSearch = () => {
    if (inputRef.current) {
      const res = coordinateLinkGoto(inputRef.current.value);

      if (res === true) {
        dispatch({ type: SET_SEARCH, payload: false });
        inputRef.current.value = '';
      }
    }
  }

  useEffect(() => {
    if (searchActive) {
      if (inputRef.current)
        inputRef.current.focus();
    } else {
      getCanvasController()?.canvas.focus();
    }
  }, [searchActive]);

  return (
    <Button onClick={() => dispatch({ type: SET_SEARCH, payload: !searchActive })} darkMode={darkMode}>
      <Search/>
      { searchActive ? (
        <>
          <SearchInput
            ref={inputRef}
            placeholder='#w(-290,12,10)'
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.code === "Enter") {
                positionSearch();
              }
            }}
            active={searchActive}
            type="text"
          />
          <ChevronsRight
            height='20px'
            onClick={(e) => { e.stopPropagation(); positionSearch(); }}
          />
        </>
      ) : null }
    </Button>
  );
}

export default function ButtonList() {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const showButtons = useSelector((state: ReduxState) => state.showButtons);
  const lastNotificationDate = useSelector((state: ReduxState) => state.lastNotificationDate);
  const lastReadNotificationDate = useSelector((state: ReduxState) => state.lastReadNotificationDate);
  const autoBrush = useSelector((state: ReduxState) => state.autoBrush);
  const hasModerationAccess = useSelector((state: ReduxState) => state.user?.type === UserType.ADMIN || state.user?.type === UserType.MOD )
  const [display, setDisplay] = useState(true);

  useEffect(() => {
    if (!display && showButtons) {
      const t = setTimeout(() => {
        setDisplay(true)
      }, 0);
      return () => clearTimeout(t);
    }
    if (display && !showButtons) {
      setDisplay(false);
    }
  }, [showButtons]);
  useEffect(() => {
    if (!display && showButtons) {
      const t = setTimeout(() => {
        dispatch({ type: SET_SHOW_BUTTONS, payload: false });
      }, 500);
      return () => clearTimeout(t);
    }
  }, [display]);

  return (
    <ButtonListContainer>
      <Button onClick={() => { showButtons ? setDisplay(!display) : dispatch({ type: SET_SHOW_BUTTONS, payload: !showButtons }) }} darkMode={darkMode}>
        {display ? <ChevronDown/> : <ChevronUp/> }
      </Button>
      { showButtons && (
        <ButtonListDropdown show={display}>
          <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.INFOS })} darkMode={darkMode}>
            <HelpCircle/>
          </Button>
          <Link href="/user/home">
            <a style={{ color: "inherit", position: "relative" }}>
              <Button darkMode={darkMode}>
                <User/>
              </Button>
              { lastNotificationDate > lastReadNotificationDate ? (
                <UnreadBubble darkMode={darkMode}/>
              ) : null }
            </a>
          </Link>
          <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.CONVERTER })} darkMode={darkMode}>
            <Upload/>
          </Button>
          <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.PARAMETERS })} darkMode={darkMode}>
            <Sliders/>
          </Button>
          <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.CANVASES })} darkMode={darkMode}>
            <Map/>
          </Button>
          <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.BOOKMARKS })} darkMode={darkMode}>
            <Bookmark/>
          </Button>
          {hasModerationAccess ? (
            <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.MODERATION })} darkMode={darkMode}>
              <Shield/>
            </Button>
          ) : null}
            <Button onClick={() => dispatch({ type: SET_AUTO_BRUSH, payload: !autoBrush })} darkMode={darkMode}>
              <Edit3 style={{ color: getColor(autoBrush ? Colors.UNREAD : Colors.TEXT, darkMode) }}/>
            </Button>
          <SearchBtn/>
        </ButtonListDropdown>
      )}
    </ButtonListContainer>
  );
}