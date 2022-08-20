import styled from 'styled-components'
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Activity, Mail } from 'react-feather';
import { useRouter } from 'next/dist/client/router';

import { API_URL } from '../constants/api';
import SideBar from '../sidebar';
import PageActivity from './Activity';
import PageNotifications from './Notifications';

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
  @media(max-width: 500px) {
    padding: 1rem 0.5rem;
  }
`;

export enum PageTypes {
  ACTIVITY = "activity",
  LOGS = "logs",
  BAN = "ban",
  MAP = "map",
  NOTIFICATIONS = "notifications",
}

export const pages = [
  {
    type: PageTypes.ACTIVITY,
    icon: <Activity/>,
    name: "Activity",
    component: <PageActivity/>
  },
  {
    type: PageTypes.NOTIFICATIONS,
    icon: <Mail/>,
    name: "Notifications",
    component: <PageNotifications/>
  }
]


export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdmin = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token)
        return router.replace(router.basePath);

      const res = await axios.get(`${API_URL}/user/me`, { headers: { 'Authorization': token }});
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
    if (window && !isAdmin)
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
        <SideBar currentPage={currentPage} pages={pages} routePrefix="admin" />
        <ContentContainer>
          {pages.find((p) => p.type === currentPage)?.component}
        </ContentContainer>
      </Container>
    )
  }
}