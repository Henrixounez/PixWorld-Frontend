import { useEffect, useState } from 'react';
import { Check, Copy, FilePlus, Trash2 } from 'react-feather';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';
import { SET_OVERLAY_AUTOCOLOR, SET_OVERLAY_IMAGE, SET_OVERLAY_POSITION, SET_OVERLAY_TRANSPARENCY } from '../../../store/actions/overlay';
import { OverlaySave } from '../Overlay';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  gap: 1rem;
`;
const OverlayRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  gap: 1rem;

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
const AddNew = styled.div<{error: boolean}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  margin-top: 4rem;

  input {
    padding: 0.5rem 1rem;
    border: 1px solid;
    border-radius: 2px;
    border-color: ${({ error }) => error ? '#FF0000' : 'initial'};
  }
  svg {
    transition: .2s;
    &:hover {
      transform: scale(1.1);
    }
  }
`;

export default function ModalOverlay() {
  const dispatch = useDispatch();
  const [overlays, setOverlays] = useState<Array<OverlaySave>>([]);
  const [newOverlayValue, setNewOverlayValue] = useState('');
  const [errorNew, setErrorNew] = useState(false);

  useEffect(() => {
    const savedOverlays = localStorage.getItem('savedOverlays');
    if (savedOverlays) {
      setOverlays(JSON.parse(savedOverlays));
    }
  }, []);

  const copy = (i: number) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(overlays[i]));
    }
  }
  const del = (i: number) => {
    const newOverlays = overlays.filter((_, i2) => i2 !== i);
    setOverlays(newOverlays);
    localStorage.setItem('savedOverlays', JSON.stringify(newOverlays));
  }
  const use = (i: number) => {
    const overlay = overlays[i];
    dispatch({ type: SET_OVERLAY_IMAGE, payload: overlay.image });
    dispatch({ type: SET_OVERLAY_TRANSPARENCY, payload: overlay.transparency });
    dispatch({ type: SET_OVERLAY_POSITION, payload: overlay.position });
    dispatch({ type: SET_OVERLAY_AUTOCOLOR, payload: overlay.autoColor });
  }

  const saveNew = () => {
    try {
      const data = JSON.parse(newOverlayValue);

      if (!data.image || !data.transparency || !data.position || !data.position.x || !data.position.y || !data.autoColor) {
        setErrorNew(true);
        return;
      }
      const found = overlays.findIndex((e) => e.image === data.image);
      const newOverlay = {
        image: data.image,
        transparency: data.transparency,
        position: {
          x: data.position.x,
          y: data.position.y,
        },
        autoColor: data.autoColor,
      };

      if (found !== -1)
        overlays[found] = newOverlay;
      else
        overlays.push(newOverlay)
      setOverlays([...overlays]);
      localStorage.setItem('savedOverlays', JSON.stringify([...overlays]))

      setErrorNew(false);
    } catch (e) {
      setErrorNew(true);
    }
  }

  return (
    <Container>
      { overlays.map((o, i) => (
        <OverlayRow key={i}>
          <img src={o.image} width="80px"/>
          <input readOnly value={JSON.stringify(o)} />
          <div>
            <Copy onClick={() => copy(i)}/>
            <Trash2 onClick={() => del(i)}/>
            <Check onClick={() => use(i)}/>
          </div>
        </OverlayRow>
      ))}
      <AddNew error={errorNew}>
        <input type="text" value={newOverlayValue} onChange={(e) => setNewOverlayValue(e.target.value)} />
        <FilePlus onClick={() => saveNew() }/>
      </AddNew>
    </Container>
  )  
}