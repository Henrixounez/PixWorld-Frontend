import styled from 'styled-components'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_URL } from '../constants/api';
import { Provider, useDispatch } from 'react-redux';
import { useRouter } from 'next/dist/client/router';
import SideBar from '../sidebar';
import { Activity, User } from 'react-feather';
import PageHome from './Home';
import { initialState, useStore } from './store';
import { SET_USER } from './store/actions/user';
import { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { languagesModules } from '../constants/languages';
import PageActivity from './Activity';

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #202124;
  color: #ffffffc0;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: row;
`;
export const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 5rem 2rem;
  @media(max-width: 500px) {
    padding: 1rem 0.5rem;
  }
`;

export enum PageTypes {
  HOME = "home",
  ACTIVITY = "activity",
}

export const pages = [
  {
    type: PageTypes.HOME,
    icon: <User/>,
    name: "Home",
    component: <PageHome/>
  },
  {
    type: PageTypes.ACTIVITY,
    icon: <Activity/>,
    name: "Activity",
    component: <PageActivity/>
  }
]


function UserRouterPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        router.replace('/user/login');
      } else {
        const res = await axios.get(`${API_URL}/user/me`, { headers: { 'Authorization': token }});
        dispatch({
          type: SET_USER,
          payload: res.data
        });
      }
      setLoaded(true);
    } catch (err) {
      console.error(err);
      router.replace('/user/login');
    }
  };

  useEffect(() => {
    if (window && !loaded)
      checkUser();
  }, []);

  const currentPage = router.query.page as PageTypes;

  if (!loaded) {
    return (
      <Container>
        Loging in...
      </Container>
    );
  } else {
    return (
      <Container>
        <SideBar currentPage={currentPage} pages={pages} routePrefix="user" />
        <ContentContainer>
          {pages.find((p) => p.type === currentPage)?.component}
        </ContentContainer>
      </Container>
    )
  }
}

export default function UserPage() {
  const store = useStore(initialState);

  return (
    <Provider store={store}>
      <UserRouterPage/>
    </Provider>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext & { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, languagesModules))
    }
  }
}