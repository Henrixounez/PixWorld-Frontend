import styled from 'styled-components';
import { MessageSquare } from 'react-feather';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'next-i18next';
// @ts-ignore
import * as Flags from 'country-flag-icons/react/3x2';

import { getCanvasController } from '../controller/CanvasController';
import { ReduxState, store } from '../../store';
import { SET_MODAL } from '../../store/actions/infos';
import ModalTypes from '../constants/modalTypes';
import { SET_CANVAS } from '../../store/actions/parameters';
import formatChatText, { FormatType } from './ChatFormatting';
import { SET_ERASER_MODE, SET_POSITION, SET_SHOULD_CLEAR_CHUNKS, SET_SHOULD_LOAD_CHUNKS } from '../../store/actions/painting';
import { ADD_CHAT_MESSAGE, SET_SHOW_CHAT } from '../../store/actions/chat';

const ChatButton = styled.div<{darkMode: boolean}>`
  position: fixed;
  bottom: 10px;
  right: 50px;
  font-size: 1rem;
  height: 35px;
  width: 35px;
  transition: .2s;

  background-color: #FFFD;
  color: #FFFD;
  border: 1px solid #000;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  filter: ${({ darkMode }) => darkMode ? 'invert(1)' : 'invert(0)'};
  &:hover {
    background-color: #FFFA;
  }

  svg {
    color: black;
  }
  div {
    filter: ${({ darkMode }) => darkMode ? 'invert(1)' : 'invert(0)'};
  }

  @media (max-height: 800px) {
    right: 75px;
  }
  @media (max-height: 400px) {
    right: 150px;
  }
`;
const UnreadBubble = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  user-select: none;
  border-radius: 100%;
  background-color: #FF0000;
`;
const ChatWindow = styled.div<{show: boolean, darkMode: boolean}>`
  position: fixed;
  bottom: 50px;
  right: 50px;
  font-size: 1rem;
  height: 200px;
  width: 300px;
  max-width: 80vw;
  transition: .2s;

  filter: ${({ darkMode }) => darkMode ? 'invert(1)' : 'invert(0)'};
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
  background-color: #FFFD;
  &:hover {
    background-color:  #FFFA;
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

export function coordinateLinkGoto(text: string) {
  const regex = /#(.)\((-?\d*),\s*(-?\d*),\s*(-?\d*)\)/;
  const res = text.match(regex);
  if (res && res.length === 5) {
    const canvasLetter = res[1];
    const x = Number(res[2]);
    const y = Number(res[3]);
    const zoom = Number(res[4]);

    const canvas = store!.getState().canvases.find((e) => e.letter === canvasLetter);

    if (!canvas)
      return false;
    if (canvas.id !== store?.getState().currentCanvas)
      store?.dispatch({ type: SET_CANVAS, payload: canvas.id });

    store?.dispatch({ type: SET_POSITION, payload: { x, y, zoom } });
    return true;
  }
  return false;
}

export default function Chat() {
  const { t } = useTranslation('chat');
  const dispatch = useDispatch();
  const [message, setMessage] = useState('');
  const messageList = useSelector((state: ReduxState) => state.chatMessages);
  const user = useSelector((state: ReduxState) => state.user);
  const showChat = useSelector((state: ReduxState) => state.showChat);
  const position = useSelector((state: ReduxState) => state.position);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const canvas = useSelector((state: ReduxState) => state.currentCanvas);
  const unreadMessage = useSelector((state: ReduxState) => state.unreadMessage);
  const eraserMode = useSelector((state: ReduxState) => state.eraserMode);

  const messageToWs = (text: string) => {
    getCanvasController()?.connectionController.sendToWs('sendMessage', text);
  }
  const sendMessage = () => {
    const cmd = message.split(' ')[0];
    switch (cmd) {
      case '/here':
        messageToWs(`#${store!.getState().canvases.find((e) => e.id === canvas)?.letter}(${Math.round(position.x)},${Math.round(position.y)},${Math.round(position.zoom)})`);
        break;
      case '/eraser':
        dispatch({
          type: SET_ERASER_MODE,
          payload: !eraserMode,
        });
        dispatch({
          type: SET_SHOULD_CLEAR_CHUNKS,
          payload: true,
        });
        dispatch({
          type: SET_SHOULD_LOAD_CHUNKS,
          payload: true,
        });
        dispatch({
          type: ADD_CHAT_MESSAGE,
          payload: {
            author: 'PixWorld',
            color: 'green',
            msg: `Eraser mode: ${!eraserMode}`
          }
        });
        break;
      case '/help':
        dispatch({
          type: ADD_CHAT_MESSAGE,
          payload: {
            author: 'PixWorld Help',
            color: 'green',
            msg: `
> == Commands ==
> /help : Show this help
> /here : Share your position
> /setCountry [Country Code] : Set your chat country flag
> == Other ==
> Click on someone name to mention
            ` }});
        break;
      default:
        messageToWs(message);
        break;
    }
    setMessage('');
  };

  const textClick = (type: FormatType, text: string) => {
    switch (type) {
      case FormatType.POSITION:
        coordinateLinkGoto(text);
      break;
    }
  }

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messageList, chatRef, showChat]);

  return (
    <>
      <ChatButton darkMode={darkMode} onClick={() => dispatch({ type: SET_SHOW_CHAT, payload: !showChat })}>
        <MessageSquare height="20px" />
        { unreadMessage && (
          <UnreadBubble />
        )}
      </ChatButton>
      <ChatWindow show={showChat} darkMode={darkMode}>
        <ChatText ref={chatRef}>
          {messageList.map((msg, i) => {
            const Flag = Flags[msg.country];
            return (
              <ChatMessage key={i} >
                <span style={{ color: msg.color, cursor: 'pointer' }} onClick={() => setMessage(message + `@${msg.author}`)}>
                  { Flag && <Flag style={{ height: "0.6rem", marginRight: "0.2rem" }}/> }
                  {msg.author}
                </span>
                : {formatChatText(msg.msg, textClick)}
              </ChatMessage>
            );
          })}
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