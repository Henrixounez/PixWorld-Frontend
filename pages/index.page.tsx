import styled from 'styled-components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { GetStaticPropsContext } from 'next';

import { languagesModules } from './constants/languages';
import Canvas from './ui/Canvas';
import ButtonList from './ui/ButtonList';
import CursorPosition from './ui/CursorPosition';
import Modal from './ui/Modal';
import PaletteList from './ui/PaletteList';
import PlayerCounter from './ui/PlayerCounter';
import Overlay from './ui/Overlay';
import Cooldown from './ui/Cooldown';
import Chat from './ui/Chat';

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
      <Overlay/>
      <Cooldown/>
      <PaletteList/>
      <Chat/>
      <PlayerCounter/>
      <CursorPosition/>
      <Canvas />
    </Container>
  )
}

export async function getStaticProps(ctx: GetStaticPropsContext & { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, languagesModules)),
    },
  };
}