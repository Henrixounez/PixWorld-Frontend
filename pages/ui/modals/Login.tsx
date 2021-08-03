import axios from 'axios';
import { useTranslation } from 'next-i18next';
import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ReduxState } from '../../../store';
import { SET_MODAL } from '../../../store/actions/infos';
import { SET_USER } from '../../../store/actions/user';
import { API_URL } from '../../constants/api';
import ModalTypes from '../../constants/modalTypes';

export const Container = styled.div`
  form {
    margin-top: 4rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }
`;
export const InputRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;

  input {
    font-size: .9rem;
    padding: .5rem;
  }
`;
export const ShowBtn = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  cursor: pointer;
  right: 5px;
  user-select: none;
`;
export const SubmitBtn = styled.button`
  outline: none;
  box-shadow: none !important;
  font-size: .9rem;
  padding: .5rem;
`;
export const Error = styled.div`
  color: crimson;
  margin: 0;
`;
export const Switch = styled.div`
  font-size: 1rem;
`;

export default function ModalLogin() {
  const dispatch = useDispatch();
  const { t } = useTranslation('auth');
  const user = useSelector((state: ReduxState) => state.user);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/user/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      dispatch({
        type: SET_USER,
        payload: res.data
      });
      dispatch({
        type: SET_MODAL,
        payload: ModalTypes.STATS
      });
    } catch (err) {
      setErr(err.response?.data || "Error during registration");
    }
  };

  useEffect(() => {
    if (user)
      dispatch({
        type: SET_MODAL,
        payload: ModalTypes.STATS
      });
  }, []);

  return (
    <Container>
      <form onSubmit={login}>
        <InputRow>
        </InputRow>
        <InputRow>
          <input
            placeholder={t('login.username')}
            type='text'
            name='username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputRow>
        <InputRow>
          <input
            placeholder='Password'
            autoComplete={t('login.password')}
            aria-autocomplete='list'
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ShowBtn onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff height="15px"/> : <Eye height="15px"/> }
          </ShowBtn>
        </InputRow>
        { err && (
          <Error>
            {err}
          </Error>
        )}
        <SubmitBtn>
          {t('login.loginBtn')}
        </SubmitBtn>
        <Switch>
          {t('login.noAccount')}&nbsp;
          <a
            href=''
            onClick={(e) => {
              e.preventDefault();
              dispatch({ type: SET_MODAL, payload: ModalTypes.REGISTER });
            }}
          >
            {t('login.goToRegister')}
          </a>
        </Switch>
      </form>
    </Container>
  );
}