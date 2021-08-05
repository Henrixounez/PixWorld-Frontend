import { FormEvent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useTranslation } from 'next-i18next';

import { API_URL } from "../../constants/api";
import { useDispatch } from 'react-redux';
import { SET_MODAL } from '../../../store/actions/infos';
import ModalTypes from '../../constants/modalTypes';
import { getCanvasController } from '../../controller/CanvasController';

const Container = styled.div`
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
    border: 1px solid #000;
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
      color: #444;
    }
  }
`;
const FormRow = styled.form`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  width: 100%;
  justify-content: center;
  input {
    text-align: center;
  }
`;
const SendButton = styled.button`
  padding: 5px;
  border: 1px solid #777;
  border-radius: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  outline: none;
  &:hover {
    background-color: #EEE;
  }
`;

export default function Captcha() {
  const { t } = useTranslation('captcha');
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
    setCaptchaURL(`${API_URL}/captcha.svg?${Date.now()}`);
  }

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);

  return (
    <>
      <Container>
        <h1>{t('title')} 🤖</h1>
        <p>
          {t('subtitle')}<br/>
          <span>{t('tips')}</span>
        </p>
        <img
          src={captchaURL}
          alt="CAPTCHA"
        />
        <FormRow onSubmit={sendCaptcha}>
          <input
            type="text"
            placeholder={t('input')}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            ref={inputRef}
          />
          <SendButton type="submit">
            {t('send')}
          </SendButton>
        </FormRow>
      </Container>
    </>
  );
}