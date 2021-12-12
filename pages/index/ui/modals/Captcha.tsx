import { FormEvent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { RefreshCw } from 'react-feather';

import { API_URL } from "../../../constants/api";
import { useDispatch, useSelector } from 'react-redux';
import { SET_MODAL } from '../../store/actions/infos';
import ModalTypes from '../../../constants/modalTypes';
import { getCanvasController } from '../../controller/CanvasController';
import { Colors, getColor } from '../../../constants/colors';
import { ReduxState } from '../../store';

const Container = styled.div<{ darkMode: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 80%;
  margin: 10% 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  justify-content: space-around;

  @media (max-height: 800px) {
    font-size: 0.8rem;
    height: 90%;
    margin: 5% 0;
  }

  img {
    border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
    max-width: 60vw;
    max-height: 30vh;
  }
  h1 {
    margin: 0;
  }
  p {
    margin: 0;
    span {
      font-weight: 100;
      font-size: 0.8rem;
      color: ${({ darkMode }) => getColor(Colors.LIGHT_TEXT, darkMode)};
    }
  }
`;
const FormRow = styled.form<{ darkMode: boolean }>`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  margin-top: 1rem;
  justify-content: center;
  input {
    text-align: center;
    background-color: ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
    border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BORDER, darkMode)};
    color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  }
`;
const SendButton = styled.button<{ darkMode: boolean }>`
  padding: 5px;
  border: 1px solid ${({ darkMode }) => getColor(Colors.UI_BACKGROUND, darkMode)};
  color: ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  outline: none;
  &:hover {
    opacity: 0.8;
  }
`;
const RefreshButton = styled.div<{ darkMode: boolean }>`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border: 1px solid ${({ darkMode }) => getColor(Colors.TEXT, darkMode)};
  border-radius: 2px;
  &:hover {
    opacity: 0.8;
  }
`;

export default function Captcha() {
  const { t } = useTranslation('captcha');
  const darkMode = useSelector((state: ReduxState) => state.darkMode);
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [captchaURL, setCaptchaURL] = useState('');
  const [value, setValue] = useState('');

  const sendCaptcha = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await axios.post(API_URL + '/captcha/verify', { text: value });
      getCanvasController()?.canvas.focus();
      dispatch({ type: SET_MODAL, payload: ModalTypes.NONE });
    } catch (err) {
      refreshCaptcha();
    }
    setValue('');
  }

  const refreshCaptcha = () => {
    setCaptchaURL(`${API_URL}/captcha.png?${Date.now()}`);
  }

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <>
      <Container darkMode={darkMode}>
        <h1>{t('title')} 🤖</h1>
        <p>
          {t('subtitle')}<br/>
          <span>{t('tips')}</span>
        </p>
        <img
          src={captchaURL}
          alt="CAPTCHA"
        />
        <FormRow onSubmit={sendCaptcha} darkMode={darkMode}>
          <RefreshButton onClick={(e) => { e.preventDefault(); refreshCaptcha(); }} darkMode={darkMode}>
            <RefreshCw/>
          </RefreshButton>
          <input
            type="text"
            placeholder={t('input')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            ref={inputRef}
          />
          <SendButton type="submit" darkMode={darkMode}>
            {t('send')}
          </SendButton>
        </FormRow>
      </Container>
    </>
  );
}