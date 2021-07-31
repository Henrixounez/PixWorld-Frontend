import styled from 'styled-components'
import Canvas from './ui/Canvas';
import ButtonList from './ui/ButtonList';
import CursorPosition from './ui/CursorPosition';
import Modal from './ui/Modal';
import PaletteList from './ui/PaletteList';
import PlayerCounter from './ui/PlayerCounter';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: lightblue;
  overflow: hidden;
`;

export default function Home() {
  return (
    <Container>
      <Modal/>
      <ButtonList/>
      <PaletteList/>
      <PlayerCounter/>
      <CursorPosition/>
      <Canvas />
    </Container>
  )
}
