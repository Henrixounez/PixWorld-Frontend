import { GetServerSidePropsContext } from 'next';
import styled from 'styled-components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import crypto from 'crypto';

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
import Alert from './ui/Alert';
import HistoryMode from './ui/HistoryMode';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: lightblue;
  overflow: hidden;
`;

export default function Home({ wsHash }: { wsHash: string }) {

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
      <Alert/>
      <Canvas wsHash={wsHash} />
      <HistoryMode/>
    </Container>
  )
};


export async function getServerSideProps(ctx: GetServerSidePropsContext & { locale: string }) {
  const ENCRYPTION_KEY = process.env.WS_HASH_KEY!;
  const iv = crypto.randomBytes(16);
  const id = crypto.randomBytes(16).toString('hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const text = `${Date.now()}-${id}`;

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return {
    props: {
      wsHash: iv.toString('hex') + ':' + encrypted.toString('hex'),
      ...(await serverSideTranslations(ctx.locale, languagesModules)),
    },
  };
}