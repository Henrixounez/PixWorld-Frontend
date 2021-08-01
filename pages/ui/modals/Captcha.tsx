import { FormEvent, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { API_URL } from "../../constants/api";
import { useDispatch } from 'react-redux';
import { SET_MODAL } from '../../../store/actions/infos';
import ModalTypes from '../../constants/modalTypes';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

  img {
    border: 1px solid #000;
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
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [captchaURL, setCaptchaURL] = useState('');
  const [value, setValue] = useState('');

  const sendCaptcha = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await axios.post(API_URL + '/captcha/verify', { text: value });
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
        <h1>Captcha - Are you a robot ? 🤖</h1>
        <p>
          Enter the characters from the image below.<br/>
          <span>(Characters are case insensitive, p and P is the same)</span>
        </p>
        <img
          src={captchaURL}
          alt="CAPTCHA"
        />
        <FormRow onSubmit={sendCaptcha}>
          <input
            type="text"
            placeholder="Captcha Value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            ref={inputRef}
          />
          <SendButton type="submit">
            Send
          </SendButton>
        </FormRow>
      </Container>
    </>
  );
}