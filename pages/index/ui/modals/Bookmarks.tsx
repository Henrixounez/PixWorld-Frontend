import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { ChevronsRight, Copy, FilePlus, Trash2 } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ReduxState, store } from '../../store';
import { SET_MODAL } from '../../store/actions/infos';
import ModalTypes from '../../../constants/modalTypes';
import { coordinateLinkGoto } from '../Chat';
import { Colors, getColor } from '../../../constants/colors';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  gap: 1rem;
`;
const OverlayRow = styled.div<{ darkMode: boolean }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  gap: 1rem;
  flex-wrap: wrap;

  input {
    width: 50%;
  }
  img {
    width: 15%;
    max-height: 50px;
    object-fit: scale-down;
  }
  div {
    display: flex;
    flex-direction: row;
    gap: 1rem;
    svg {
      cursor: pointer;
      transition: .2s;
      &:hover {
        transform: scale(1.1);
      }
    }
  }
`;
const AddNew = styled.div<{error: boolean, darkMode: boolean}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  margin-top: 4rem;
  justify-content: center;

  input {
    max-width: 30vw;
    border-color: ${({ error, darkMode }) => error ? getColor(Colors.ALERT, darkMode) : 'initial'};
  }
  svg {
    cursor: pointer;
    transition: .2s;
    &:hover {
      transform: scale(1.1);
    }
  }
`;

interface BookmarkSave {
  title: string;
  position: string;
}

function roundPos(canvas: string, pos: { x: number, y: number, zoom: number }) {
  const canvasLetter = store!.getState().canvases.find((e) => e.id === canvas)?.letter;
  const x = Math.round(pos.x);
  const y = Math.round(pos.y);
  const zoom = Math.round(pos.zoom);

  return `#${canvasLetter}(${x},${y},${zoom})`;
}

export default function ModalBookmarks() {
  const { t } = useTranslation('bookmark');
  const dispatch = useDispatch();
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const [bookmarks, setBookmarks] = useState<Array<BookmarkSave>>([]);
  const [newBookmarkTitle, setNewBookmarkTitle] = useState('');
  const [newBookmarkPosition, setNewBookmarkPosition] = useState(roundPos(store!.getState().currentCanvas, store!.getState().position));
  const [errorNew, setErrorNew] = useState(false);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('savedBookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  const copy = (i: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(bookmarks[i].position);
    }
  }
  const del = (i: number) => {
    const newBookmarks = bookmarks.filter((_, i2) => i2 !== i);
    setBookmarks(newBookmarks);
    localStorage.setItem('savedBookmarks', JSON.stringify(newBookmarks));
  }
  const use = (i: number) => {
    const bookmark = bookmarks[i];
    coordinateLinkGoto(bookmark.position);
    dispatch({ type: SET_MODAL, payload: ModalTypes.NONE });
  }

  const saveNew = () => {
    try {
      const title = newBookmarkTitle;
      const pos = newBookmarkPosition;

      if (!title) {
        setErrorNew(true);
        return;
      }
      const found = bookmarks.findIndex((e) => e.title === title);
      const newBookmark = {
        title,
        position: pos
      };

      if (found !== -1)
        bookmarks[found] = newBookmark;
      else
        bookmarks.push(newBookmark)
      setBookmarks([...bookmarks]);
      localStorage.setItem('savedBookmarks', JSON.stringify([...bookmarks]))
      setNewBookmarkTitle("");

      setErrorNew(false);
    } catch (e) {
      setErrorNew(true);
    }
  }

  return (
    <Container>
      { bookmarks.map((b, i) => (
        <OverlayRow darkMode={darkMode} key={i}>
          <div>
            {b.title}
          </div>
          <div>
            {b.position}
          </div>
          <div>
            <Copy onClick={() => copy(i)}/>
            <Trash2 onClick={() => del(i)}/>
            <ChevronsRight onClick={() => use(i)}/>
          </div>
        </OverlayRow>
      ))}
      <AddNew error={errorNew} darkMode={darkMode}>
        <input type="text" value={newBookmarkTitle} placeholder={t('name')} onChange={(e) => setNewBookmarkTitle(e.target.value)} />
        <input type="text" value={newBookmarkPosition} placeholder={t('position')} onChange={(e) => setNewBookmarkPosition(e.target.value)} />
        <FilePlus onClick={() => saveNew() }/>
      </AddNew>
    </Container>
  )  
}