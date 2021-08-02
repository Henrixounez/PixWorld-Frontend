import axios from 'axios';
import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import { ReduxState } from '../../../store';
import { SET_MODAL } from '../../../store/actions/infos';
import { SET_USER } from '../../../store/actions/user';
import { API_URL } from '../../constants/api';
import ModalTypes from '../../constants/modalTypes';
import {
  Container, Error, InputRow, ShowBtn, SubmitBtn, Switch
} from './Login';

export default function ModalRegister() {
  const dispatch = useDispatch();
  const user = useSelector((state: ReduxState) => state.user);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState('');

  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/user/register`, { email, username, password });
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
      <h1>User Registration</h1>
      <form onSubmit={register}>
        <InputRow>
          <input
            placeholder='Email'
            type='email'
            name='email'
            autoComplete='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </InputRow>
        <InputRow>
          <input
            placeholder='Username'
            type='text'
            name='username'
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </InputRow>
        <InputRow>
          <input
            placeholder='Password'
            autoComplete='new-password'
            aria-autocomplete='list'
            required
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
          Register
        </SubmitBtn>
        <Switch>
          Have an account ?&nbsp;
          <a
            href=''
            onClick={(e) => {
              e.preventDefault();
              dispatch({ type: SET_MODAL, payload: ModalTypes.LOGIN });
            }}
          >
            Login
          </a>
        </Switch>
      </form>
    </Container>
  );
}