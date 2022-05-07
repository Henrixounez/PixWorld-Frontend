import axios from "axios";
import { useTranslation } from "next-i18next";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux"
import styled from "styled-components";

import { API_URL } from "../constants/api";
import formatChatText from "../index/ui/ChatFormatting";
import { BoxContainer, BoxRow, BoxTitle } from "../pagesComponents"
import { UserReduxState } from "./store"

const NotificationContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 500px;
  overflow-y: auto;
  gap: 1rem;
  padding: 1rem 0;
`;
const NotificationBox = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 1rem;
  border-radius: 1rem;
  background-color: rgba(0,0,0,0.2);
  h2 {
    font-size: 1.25rem;
    margin: 0;
  }
  span {
    padding-top: 1rem;
  }
  &:hover {
    background-color: rgba(0,0,0,0.3);
  }
`;

function Stats() {
  const { t } = useTranslation('stats');
  const user = useSelector((state: UserReduxState) => state.user);

  return (
    <BoxContainer>
      <BoxTitle>
        {user?.username} - {t('title')}
      </BoxTitle>
      <BoxRow>
        <b>{t('profile.pixelsToday')}:</b> {user?.dailyPixels}<br/>
      </BoxRow>
      <BoxRow>
        <b>{t('profile.pixelsTotal')}:</b> {user?.totalPixels}<br/>
      </BoxRow>
    </BoxContainer>
  )
}

interface Notification {
  title: string;
  text: string;
  createdAt: Date;
}
function Notifications() {
  const { t } = useTranslation('stats')
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const getNotifications = async () => {
    try {
      const res = await axios.get(`${API_URL}/notifications`);
      
      setNotifications(
        res.data.map((e: Notification) => ({ ...e, createdAt: new Date(e.createdAt) }))
      );
      localStorage.setItem('lastReadNotificationDate', (new Date()).toString());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  return (
    <BoxContainer>
      <BoxTitle>
        {t('news.title')}
      </BoxTitle>
      <NotificationContainer>
        { notifications.map((n, i) => (
          <NotificationBox key={i}>
            <h2>
              {n.title}
            </h2>
            <span>
              {formatChatText(n.text, () => {}, false, 0)}
            </span>
          </NotificationBox>
        ))}
      </NotificationContainer>
    </BoxContainer>
  )
}

export default function PageHome() {
  return (
    <>
      <Stats/>
      <Notifications/>
    </>
  )
}