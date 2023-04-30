import { GetStaticPropsContext } from 'next';
import { useEffect, useState } from 'react';
import styled from 'styled-components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { AppProps } from 'next/dist/next-server/lib/router/router';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Provider } from 'react-redux';
import { initialState, ReduxState, useStore } from './index/store';

import { languagesModules } from './constants/languages';
import Canvas from './index/ui/Canvas';
import ButtonList from './index/ui/ButtonList';
import CursorPosition from './index/ui/CursorPosition';
import Modal from './index/ui/Modal';
import PaletteList from './index/ui/PaletteList';
import PlayerCounter from './index/ui/PlayerCounter';
import Overlay from './index/ui/Overlay';
import Cooldown from './index/ui/Cooldown';
import Chat from './index/ui/Chat';
import Alert from './index/ui/Alert';
import HistoryMode from './index/ui/HistoryMode';
import { API_URL } from './constants/api';
import { Canvas as CanvasType, getCanvasController  } from './index/controller/CanvasController';
import getOriginalPos from './getPos';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #F0F0F0;
  overflow: hidden;
`;

interface HomeProps {
  pos?: { x: number, y: number, zoom: number, canvas: string },
  canvases: Array<CanvasType>,
  initialReduxState: ReduxState,
}
export default function Home({ initialReduxState, canvases }: AppProps | HomeProps) {
  const router = useRouter();
  const [pos, setPos] = useState<{ x: number, y: number, zoom: number, canvas: string } | undefined>(undefined);
  const store = useStore(initialReduxState || { ...initialState, canvases: canvases });


  useEffect(() => {
    if (!pos && router.query.pos) {
      setPos(getOriginalPos(canvases, router.query.pos as string) ?? undefined);
    }
  }, [router])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token && !store.getState().user) {
        getCanvasController()?.connectionController.getMe();
        getCanvasController()?.connectionController.sendToWs("reload", {});
      }
    }
  }, [store]);

  return (
    <Provider store={store}>
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
        <Canvas pos={pos} />
        <HistoryMode/>
      </Container>
    </Provider>
  );
};


export async function getStaticProps(ctx: GetStaticPropsContext & { locale: string }) {
  let canvases: Array<CanvasType> = [];
  try {
    const { data }: { data: Array<CanvasType> } = await axios.get(`${API_URL}/canvas`);
    canvases = data;
  } catch (err) {}

  return {
    props: {
      canvases,
      ...(await serverSideTranslations(ctx.locale, languagesModules))
    }
  }
}