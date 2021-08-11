import styled from 'styled-components'
import { HelpCircle, Upload, Sliders, User, Search, ChevronsRight, Bookmark } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { SET_MODAL, SET_SEARCH } from '../../store/actions/infos';
import ModalTypes from '../constants/modalTypes';
import { ReduxState } from '../../store';
import { getCanvasController } from '../controller/CanvasController';
import { coordinateLinkGoto } from './Chat';

const ButtonListContainer = styled.div<{darkMode: boolean}>`
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  max-width: calc(50vw - 25px);
  filter: ${({ darkMode }) => darkMode ? 'invert(1)' : 'invert(0)'};
`;
const Button = styled.div`
  background-color: #FFFD;
  border: 1px solid #000;
  box-sizing: border-box;
  min-width: 40px;
  height: 40px;
  padding: 8px 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover {
    background-color: #FFFA;
  }
`;
const SearchInput = styled.input<{active: boolean}>`
  width: 5rem;
  padding: .25rem .25rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
`

function SearchBtn() {
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchActive = useSelector((state: ReduxState) => state.searchActive);

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
    <Button onClick={() => dispatch({ type: SET_SEARCH, payload: !searchActive })}>
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

  return (
    <ButtonListContainer darkMode={darkMode}>
      <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.INFOS })}>
        <HelpCircle/>
      </Button>
      <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.STATS })}>
        <User/>
      </Button>
      <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.CONVERTER })}>
        <Upload/>
      </Button>
      <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.PARAMETERS })}>
        <Sliders/>
      </Button>
      <Button onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.BOOKMARKS })}>
        <Bookmark/>
      </Button>
      <SearchBtn/>
    </ButtonListContainer>
  );
}