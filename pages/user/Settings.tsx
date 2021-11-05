import axios from "axios";
import { useTranslation } from "next-i18next";
import React, { FormEvent, useState } from "react";
import { Eye, EyeOff, Send } from "react-feather";
import { useDispatch } from "react-redux"
import styled from "styled-components";

import { API_URL } from "../constants/api";
import { BoxContainer, BoxRow, BoxTitle, CoordRow, ErrorBox, QueryForm, Textfield } from "../pagesComponents"
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

function Edit() {
  const { t } = useTranslation('stats');
  const dispatch = useDispatch();
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState("");
  const [emailVerify, setEmailVerify] = useState(false);

  const updateInfos = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("");
    setError("");
    setEmailVerify(false);
    try {
      const token = localStorage.getItem('token');

      if (!token)
        return;
  
      const res = await axios.put(`${API_URL}/user/me`, { password, email }, { headers: { 'Authorization': token }});
      dispatch({
        type: SET_USER,
        payload: res.data
      });
      setStatus("success");
      if (email)
        setEmailVerify(true);
    } catch (err: any) {
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
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <ShowBtn onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff/> : <Eye/> }
          </ShowBtn>
        </CoordRow>
        <CoordRow>
          <Textfield
            placeholder={t('edit.email')}
            type='email'
            name='email'
            autoComplete='email'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </CoordRow>
        <CoordRow>
          { emailVerify ? (
            <BoxRow style={{ textAlign: 'center', justifyContent: 'center', flex: 1 }}>
              {t('edit.verify')}
            </BoxRow>      
          ) : (
            <div style={{ flex: 1 }}/>
          )}
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

export default function PageSettings() {
  return (
    <>
      <Edit/>
    </>
  )
}