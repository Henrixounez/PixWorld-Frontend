import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { GetStaticPropsContext } from 'next';
import styled from 'styled-components'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

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
import { API_URL } from './constants/api';
import { SET_USER } from '../store/actions/user';
import { store } from '../store';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: lightblue;
  overflow: hidden;
`;

export default function Home() {
  const dispatch = useDispatch();

  const getMe = async () => {
    const token = localStorage.getItem('token');

    if (!token || store?.getState().user)
      return;
    try {
      const res = await axios.get(`${API_URL}/user/me`, { headers: { 'Authorization': token }});
      localStorage.setItem('token', res.headers['authorization']);
      dispatch({
        type: SET_USER,
        payload: res.data
      });
    } catch (e) {
      if (e.response?.status === 401)
        localStorage.removeItem('token');
    }
  };

  useEffect(() => {
    if (window) {
      getMe();
    }
  }, []);

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