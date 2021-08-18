import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Send } from "react-feather";
import { Provider, useSelector } from "react-redux";

import { API_URL } from "../constants/api";
import { languagesModules } from "../constants/languages";
import { BoxContainer, BoxRow, BoxTitle, CoordRow, ErrorBox, QueryForm, Textfield } from "../pagesComponents";
import { ShowBtn } from "./Settings";
import { initialState, UserReduxState, useStore } from "./store";
import { Container, ContentContainer } from "./[page].page";

function Login() {
  const router = useRouter();
  const { t } = useTranslation('auth');
  const user = useSelector((state: UserReduxState) => state.user);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const register = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      await axios.post(`${API_URL}/user/register`, { email, username, password });

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.response?.data || "Error during registration");
    }
  };

  useEffect(() => {
    if (user)
      router.replace('/user');
  }, []);

  return (
    <Container>
      <ContentContainer>
        <BoxContainer status={status}>
          <BoxTitle>
            {t('register.title')}
          </BoxTitle>
          { status === "success" ? (
            <>
              <BoxRow style={{ textAlign: 'center', justifyContent: 'center' }}>
                {t('register.success').split('\n').map((e, i) => (
                  <React.Fragment key={i}>
                    {e}<br/>
                  </React.Fragment>
                ))}
              </BoxRow>
              <BoxRow style={{ textAlign: 'center', justifyContent: 'center' }}>
                <Link href='/user/login'>
                  <a style={{ color: '#4bc0c0' }}>
                    {t('register.goToLogin')}
                  </a>
                </Link>
              </BoxRow>
            </>
          ) : (
            <QueryForm onSubmit={register}>
              <CoordRow>
                <Textfield
                  placeholder={t('register.email')}
                  type='email'
                  name='email'
                  autoComplete='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Textfield
                  placeholder={t('register.username')}
                  type='text'
                  name='username'
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </CoordRow>
              <CoordRow style={{ position: 'relative', alignItems: 'center' }}>
                <Textfield
                  placeholder={t('register.password')}
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
                <BoxRow>
                  {t('register.haveAccount')}
                  <Link href='/user/login'>
                    <a style={{ color: '#4bc0c0' }}>
                      {t('register.goToLogin')}
                    </a>
                  </Link>
                </BoxRow>
                <div style={{ flex: 1 }}/>
                <button>
                  <Send/>
                </button>
              </CoordRow>
            </QueryForm>
          )}
          { error ? (
            <ErrorBox>
              {t(error)}
            </ErrorBox>
          ) : null}
        </BoxContainer>
      </ContentContainer>
    </Container>
  )
}

export default function LoginPage() {
  const store = useStore(initialState);

  return (
    <Provider store={store}>
      <Login/>
    </Provider>
  )
}

export async function getServerSideProps(ctx: GetServerSidePropsContext & { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, languagesModules))
    }
  }
}