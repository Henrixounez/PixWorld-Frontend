import styled from 'styled-components';
import axios from 'axios';
import { MessageSquare } from 'react-feather';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'next-i18next';
// @ts-ignore
import * as Flags from 'country-flag-icons/react/3x2';

import { API_URL } from '../../constants/api';
import { getCanvasController } from '../controller/CanvasController';
import { ReduxState, store } from '../store';
import { SET_CANVAS } from '../store/actions/parameters';
import formatChatText, { FormatType } from './ChatFormatting';
import { NoPixelZoneReturn, SET_ERASER_MODE, SET_NPZ_MODE, SET_POSITION, SET_SHOULD_CLEAR_CHUNKS, SET_SHOULD_LOAD_CHUNKS } from '../store/actions/painting';
import { ADD_CHAT_MESSAGE, ChatChannels, SET_CHANNEL, SET_SHOW_CHAT } from '../store/actions/chat';
import countryCodes from '../../constants/countryCodes';
import { useRouter } from 'next/dist/client/router';
import { Colors, getColor } from '../../constants/colors';

export const BottomButton = styled.div<{ darkMode: boolean }>`
  font-size: 1rem;
  height: 35px;
  width: 35px;
  transition: .2s;
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode) };
  color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode) };
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode) };
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode) };
  }

  svg {
    color: ${Colors.TEXT};
  }
`;

const ChatButton = styled(BottomButton)`
  position: fixed;
  bottom: 10px;
  right: 50px;

  @media (max-height: 800px) {
    right: 75px;
  }
  @media (max-height: 450px) {
    right: 150px;
  }
`;
const UnreadBubble = styled.div<{ darkMode: boolean }>`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 12px;
  height: 12px;
  user-select: none;
  border-radius: 100%;
  background-color: ${({ darkMode }) => getColor(Colors.UNREAD, darkMode)};
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
  z-index: 10;

  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
  color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
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
  @media (max-height: 450px) {
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
const ChatInteraction = styled.div<{ darkMode: boolean }>`
  padding: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 5px;
  input {
    width: 80%;
    border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
    border-radius: 2px;
    background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
    color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  }
`;
const ChatMessage = styled.div`
  word-break: break-all;
`;
const SendButton = styled.div<{ darkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
  border-radius: 2px;
  cursor: pointer;
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  &:hover {
    opacity: 0.8;
  }
  user-select: none;
`;
const ChannelButton = styled.div<{ darkMode: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px 10px;
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
  border-radius: 2px;
  cursor: pointer;
  background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  &:hover {
    opacity: 0.8;
  }
  user-select: none;
`;
const ChannelsContainer = styled.div<{ darkMode: boolean }>`
  position: relative;
  > .channel-list {
    padding: 2px 10px;
    border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
    background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
    border-radius: 2px;
    position: absolute;
    display: flex;
    flex-direction: column;
    bottom: 24px;
    > p {
      padding: 4px 0;
      margin: 0;
      cursor: pointer;
    }
  }
`
const NotConnected = styled.div<{ darkMode: boolean }>`
  cursor: pointer;
  font-size: 0.8rem;
  color: ${({ darkMode }) => getColor(Colors.LINK, darkMode)};
  text-align: center;
  width: 100%;

  &:hover {
    color: ${({ darkMode }) => getColor(Colors.HOVERED_LINK, darkMode)};
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
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [forceScrollBottom, setForceScrollBottom] = useState(true);
  const [showChannels, setShowChannels] = useState(false);
  const channel = useSelector((state: ReduxState) => state.channel);
  const messageList = useSelector((state: ReduxState) => state.channelMessages);
  const user = useSelector((state: ReduxState) => state.user);
  const showChat = useSelector((state: ReduxState) => state.showChat);
  const chatRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const canvas = useSelector((state: ReduxState) => state.currentCanvas);
  const unreadMessage = useSelector((state: ReduxState) => state.unreadMessage);
  const eraserMode = useSelector((state: ReduxState) => state.eraserMode);
  const npzMode = useSelector((state: ReduxState) => state.npzMode);
  const currentNpzs = useSelector((state: ReduxState) => state.npzList);

  const messageToWs = (text: string) => {
    getCanvasController()?.connectionController.sendToWs('sendMessage', JSON.stringify({ message: text, channel }));
    setForceScrollBottom(true);
  }
  const setNpz = async () => {
    const token = localStorage.getItem('token');
    const npzRes: NoPixelZoneReturn[] = !npzMode ? (await axios.get(`${API_URL}/noPixelZone`, { headers: { 'Authorization': token } })).data : currentNpzs;

    dispatch({
      type: SET_NPZ_MODE,
      payload: {
        activated: !npzMode,
        npzs: npzRes
      }
    });
    dispatch({
      type: ADD_CHAT_MESSAGE,
      payload: {
        author: 'PixWorld',
        color: 'green',
        msg: `NPZ mode: ${!npzMode}`
      }
    });
  }
  const sendMessage = () => {
    const cmd = message.split(' ')[0];
    switch (cmd) {
      case '/here':
        const position = store!.getState().position;
        messageToWs(`#${store!.getState().canvases.find((e) => e.id === canvas)?.letter}(${Math.round(position.x)},${Math.round(position.y)},${Math.round(position.zoom)})`);
        break;
      case '/npz':
        setNpz();
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
        if (message.length > 400) {
          dispatch({
            type: ADD_CHAT_MESSAGE,
            payload: {
              author: 'PixWorld',
              color: 'green',
              msg: `Your message exceeds the 400 characters limit`
            }
          });
          return;
        }
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
    if (messageList.length && chatRef.current) {
      const isAtBottom = chatRef.current.scrollTop >= chatRef.current.scrollHeight - chatRef.current.clientHeight - (chatRef.current.lastElementChild?.clientHeight ?? 0) - 13;
      if (isAtBottom || forceScrollBottom) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
        if (forceScrollBottom)
          setForceScrollBottom(false);
      }
    } else if (messageList.length === 0) {
      setForceScrollBottom(true);
    }
  }, [messageList, chatRef, showChat]);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [channel])

  return (
    <>
      <ChatButton onClick={() => dispatch({ type: SET_SHOW_CHAT, payload: !showChat })} darkMode={darkMode}>
        <MessageSquare height="20px" />
        { unreadMessage && (
          <UnreadBubble  darkMode={darkMode}/>
        )}
      </ChatButton>
      <ChatWindow show={showChat} darkMode={darkMode}>
        <ChatText ref={chatRef}>
          {messageList.map((msg, i) => (
            <ChatMessage key={i} >
              <span title={isNaN(msg.createdAt.getTime()) ? '' : msg.createdAt.toLocaleDateString('fr-FR') + ' ' + msg.createdAt.toLocaleTimeString('fr-FR')}>
                {isNaN(msg.createdAt.getTime()) ? '' : msg.createdAt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' '}
              </span>
              <span style={{ color: msg.color, cursor: 'pointer' }} onClick={() => setMessage(message + `@${msg.author}`)}>
                { countryCodes.includes(msg.country) && (
                  <img src={`/flags/${msg.country}.svg`} style={{ height: "0.6rem", marginRight: "0.2rem" }} />
                )}
                {msg.tag && `[${msg.tag}] `}
                {msg.author}
              </span>
              : {formatChatText(msg.msg, textClick, darkMode, 0)}
            </ChatMessage>
          ))}
        </ChatText>
        <ChatInteraction darkMode={darkMode}>
          { user ? (
            <>
              <input
                type="text"
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={400}
                onKeyDown={(e) => {
                  if (e.code === "Enter")
                    sendMessage();
                }}
              />
              <SendButton onClick={sendMessage} darkMode={darkMode}>
                {t('send')}
              </SendButton>
              <ChannelsContainer darkMode={darkMode}>
                <ChannelButton darkMode={darkMode} onClick={() => setShowChannels(!showChannels)}>
                  {channel}
                </ChannelButton>
                {showChannels ? (
                    <div className='channel-list'>
                      {Object.entries(ChatChannels).map(([key, channel]) => (
                        <p
                          key={key}
                          onClick={() =>
                            dispatch({
                              type: SET_CHANNEL,
                              payload: channel
                            })
                          }
                        >
                          {channel}
                        </p>
                      ))}
                    </div>
                  ) : null}
              </ChannelsContainer>
            </>
          ) : (
            <NotConnected onClick={() => router.push('/user/login')} darkMode={darkMode}>
              {t('needConnect')}
            </NotConnected>
          )}
        </ChatInteraction>
      </ChatWindow>
    </>
  );
}