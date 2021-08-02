import styled from 'styled-components';
import { MessageSquare } from 'react-feather';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'next-i18next';

import { getCanvasController } from '../controller/CanvasController';
import { ReduxState } from '../../store';
import { SET_MODAL } from '../../store/actions/infos';
import ModalTypes from '../constants/modalTypes';
import { SET_SHOW_CHAT } from '../../store/actions/parameters';

const ChatButton = styled.div`
  position: fixed;
  bottom: 10px;
  right: 50px;
  font-size: 1rem;
  height: 35px;
  width: 35px;
  transition: .2s;

  background-color: #FFFD;
  border: 1px solid #000;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: #FFFA;
  }

  @media (max-height: 800px) {
    right: 75px;
  }
  @media (max-height: 400px) {
    right: 150px;
  }
`;
const ChatWindow = styled.div<{show: boolean}>`
  position: fixed;
  bottom: 50px;
  right: 50px;
  font-size: 1rem;
  height: 200px;
  width: 300px;
  max-width: 80vw;
  transition: .2s;

  background-color: #FFFD;
  border: 1px solid #000;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: .8rem;

  ${({ show }) => !show && `
    display: none;
  `}
  @media (max-height: 800px) {
    right: 75px;
  }
  @media (max-height: 400px) {
    right: 150px;
  }
`;
const ChatText = styled.div`
  height: 85%;
  padding: 5px;
  box-sizing: border-box;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
`;
const ChatInteraction = styled.div`
  padding: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 5px;
  input {
    width: 80%;
  }
`;
const ChatMessage = styled.div`
`;
const SendButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border: 1px solid #777;
  border-radius: 2px;
  cursor: pointer;
  &:hover {
    background-color: #EEE;
  }
  user-select: none;
`;
const NotConnected = styled.div`
  cursor: pointer;
  font-size: 0.8rem;
  color: #428BCA;
  text-align: center;
  width: 100%;

  &:hover {
    color: #226BAA;
  }
`;

export default function Chat() {
  const { t } = useTranslation('chat');
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const messageList = useSelector((state: ReduxState) => state.chatMessages);
  const user = useSelector((state: ReduxState) => state.user);
  const showChat = useSelector((state: ReduxState) => state.showChat);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const sendMessage = () => {
    setMessage('');
    getCanvasController()?.connectionController.sendToWs('sendMessage', message);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messageList, chatRef, showChat]);

  return (
    <>
      <ChatButton onClick={() => dispatch({ type: SET_SHOW_CHAT, payload: !showChat })}>
        <MessageSquare height="20px"/>
      </ChatButton>
      <ChatWindow show={showChat}>
        <ChatText ref={chatRef}>
          {messageList.map((msg, i) => (
            <ChatMessage key={i}>
              <span style={{ color: msg.color }}>
                {msg.author}
              </span>
              : {msg.msg}
            </ChatMessage>
          ))}
        </ChatText>
        <ChatInteraction>
          { user ? (
            <>
              <input
                type="text"
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.code === "Enter")
                    sendMessage();
                }}
              />
              <SendButton onClick={sendMessage}>
                {t('send')}
              </SendButton>
            </>
          ) : (
            <NotConnected onClick={() => dispatch({ type: SET_MODAL, payload: ModalTypes.LOGIN })}>
              {t('needConnect')}
            </NotConnected>
          )}
        </ChatInteraction>
      </ChatWindow>
    </>
  );
}