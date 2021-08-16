import styled from 'styled-components'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { API_URL } from '../constants/api';
import { useDispatch } from 'react-redux';
import { SET_USER } from '../../store/actions/user';
import { useRouter } from 'next/dist/client/router';
import PageLogs from './Logs';
import SideBar from './sidebar';
import { Activity, Database, Map, Shield } from 'react-feather';
import PageActivity from './Activity';
import PageBan from './Ban';
import PageMapOperations from './MapOperations';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #202124;
  color: #ffffffc0;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  flex-direction: row;
`;
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 5rem 2rem;
`;

export enum PageTypes {
  ACTIVITY = "activity",
  LOGS = "logs",
  BAN = "ban",
  MAP = "map"
}

export const pages = [
  {
    type: PageTypes.ACTIVITY,
    icon: <Activity/>,
    name: "Activity",
    component: <PageActivity/>
  },
  {
    type: PageTypes.LOGS,
    icon: <Database/>,
    name: "Logs",
    component: <PageLogs/>
  },
  {
    type: PageTypes.BAN,
    icon: <Shield/>,
    name: "Ban",
    component: <PageBan/>
  },
  {
    type: PageTypes.MAP,
    icon: <Map/>,
    name: "Map",
    component: <PageMapOperations/>
  }
]


export default function AdminPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token)
        return router.replace(router.basePath);

      const res = await axios.get(`${API_URL}/user/me`, { headers: { 'Authorization': token }});
      dispatch({
        type: SET_USER,
        payload: res.data
      });
      if (res.data.type !== "admin") {
        router.replace(router.basePath);
      } else {
        setIsAdmin(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (window)
      checkAdmin();
  }, []);

  const currentPage = router.query.page as PageTypes;

  if (!isAdmin) {
    return (
      <Container>
        Checking...
      </Container>
    );
  } else {
    return (
      <Container>
        <SideBar currentPage={currentPage} />
        <ContentContainer>
          {pages.find((p) => p.type === currentPage)?.component}
        </ContentContainer>
      </Container>
    )
  }
}