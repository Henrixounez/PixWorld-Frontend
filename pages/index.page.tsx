import { GetServerSidePropsContext } from 'next';
import styled from 'styled-components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import crypto from 'crypto';
import axios from 'axios';

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
import { API_URL } from './constants/api';
import { Canvas as CanvasType  } from './controller/CanvasController';
import { CHUNK_SIZE, PIXEL_SIZE } from './constants/painting';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #F0F0F0;
  overflow: hidden;
`;

export default function Home({ wsHash, pos }: { wsHash: string, pos?: { x: number, y: number, zoom: number, canvas: string } }) {

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
      <Canvas wsHash={wsHash} pos={pos} />
      <HistoryMode/>
    </Container>
  )
};


const DEFAULT_OG_IMAGE = 'https://api.henrixounez.com/pixworld/superchunk/world/3/0/0';

async function getPosAndOgImage(canvases: Array<CanvasType>, pos: string): Promise<{ img: string, pos?: { x: number, y: number, zoom: number, canvas: string } }> {
  const regex = /(.)\((-?\d*),\s*(-?\d*),\s*(-?\d*)\)/;
  const res = pos.match(regex);

  if (!res || res.length !== 5)
    return { img: DEFAULT_OG_IMAGE };

  const letter = res[1];
  const x = Number(res[2]);
  const y = Number(res[3]);
  const zoom = Number(res[4]);

  const canvas = canvases.find((e) => e.letter === letter);

  if (!canvas)
    return { img: DEFAULT_OG_IMAGE };

  const pixelSize = PIXEL_SIZE / zoom;
  const levels = [canvas.size, ...canvas.superchunkLevels];
  const zoomLevels = levels.filter((_, i) => (
    i === levels.length - 1 || pixelSize > 0.2 ** (i)
  ));

  const selectedZoom = levels.findIndex((e) => e === zoomLevels[0]);

  if (selectedZoom === 0) {
    const toLoadX = Math.floor(x / CHUNK_SIZE);
    const toLoadY = Math.floor(x / CHUNK_SIZE);

    return { pos: { x, y, zoom, canvas: canvas.id }, img: `https://api.henrixounez.com/pixworld/chunk/${canvas.id}/${toLoadX}/${toLoadY}` };
  } else {
    const halfCanvasSize = canvas.size * CHUNK_SIZE / 2;

    const superChunkSize = canvas.size * CHUNK_SIZE / zoomLevels[0];

    let toLoadX = Math.floor((x + halfCanvasSize) / superChunkSize);
    let toLoadY = Math.floor((y + halfCanvasSize) / superChunkSize);

    return { pos: { x, y, zoom, canvas: canvas.id }, img: `https://api.henrixounez.com/pixworld/superchunk/${canvas.id}/${selectedZoom}/${toLoadX}/${toLoadY}` };
  }
}

export async function getServerSideProps(ctx: GetServerSidePropsContext & { locale: string }) {
  const ENCRYPTION_KEY = process.env.WS_HASH_KEY!;
  const iv = crypto.randomBytes(16);
  const id = crypto.randomBytes(16).toString('hex');
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  const text = `${Date.now()}-${id}`;

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const { data: canvases }: { data: Array<CanvasType> } = await axios.get(`${API_URL}/canvas`);

  const posAndOg = ctx.query.pos ? await getPosAndOgImage(canvases, ctx.query.pos as string) : { img: DEFAULT_OG_IMAGE };

  return {
    props: {
      canvases,
      pos: posAndOg.pos || null,
      ogImage: posAndOg.img,
      wsHash: iv.toString('hex') + ':' + encrypted.toString('hex'),
      ...(await serverSideTranslations(ctx.locale, languagesModules)),
    },
  };
}