import axios from "axios";
import { useTranslation } from "next-i18next";
import { FormEvent, useState } from "react";
import { Eye, EyeOff, Send } from "react-feather";
import { useDispatch, useSelector } from "react-redux"
import styled from "styled-components";

import { API_URL } from "../constants/api";
import { BoxContainer, BoxRow, BoxTitle, CoordRow, ErrorBox, QueryForm, Textfield } from "../pagesComponents"
import { UserReduxState } from "./store"
import { SET_USER } from "./store/actions/user";

export const ShowBtn = styled.div`
  display: flex;
  align-items: center;
  position: absolute;
  cursor: pointer;
  right: 1rem;
  user-select: none;
  svg {
    transition: .2s;
  }
  &:hover {
    svg {
      color: #4bc0c0;
    }
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

function Edit() {
  const { t } = useTranslation('stats');
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState("");

  const updateInfos = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      if (!password.length) {
        setError(t('edit.emptyPassword'));
        return;
      }
      const token = localStorage.getItem('token');

      if (!token)
        return;
  
      const res = await axios.put(`${API_URL}/user/me`, { password }, { headers: { 'Authorization': token }});
      dispatch({
        type: SET_USER,
        payload: res.data
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.response?.data || t('edit.error'));
    }
  }

  return (
    <BoxContainer status={status}>
      <BoxTitle>
        {t('edit.title')}
      </BoxTitle>
      <QueryForm onSubmit={updateInfos}>
        <CoordRow style={{ position: 'relative', alignItems: 'center' }}>
          <Textfield
            placeholder={t('edit.password')}
            autoComplete='new-password'
            aria-autocomplete='list'
            required
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ShowBtn onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff/> : <Eye/> }
          </ShowBtn>
        </CoordRow>
        <CoordRow>
          <div style={{ flex: 1 }}/>
          <button>
            <Send/>
          </button>
        </CoordRow>
      </QueryForm>
      { error ? (
        <ErrorBox>
          {t(error)}
        </ErrorBox>
      ) : null}
    </BoxContainer>
  );
}

export default function PageHome() {
  return (
    <>
      <Stats/>
      <Edit/>
    </>
  )
}