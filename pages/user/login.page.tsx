import axios from "axios";
import { GetServerSidePropsContext } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Eye, EyeOff, Send } from "react-feather";
import { Provider, useDispatch, useSelector } from "react-redux";

import { API_URL } from "../constants/api";
import { languagesModules } from "../constants/languages";
import { BoxContainer, BoxRow, BoxTitle, CoordRow, ErrorBox, QueryForm, Textfield } from "../pagesComponents";
import { ShowBtn } from "./Settings";
import { initialState, UserReduxState, useStore } from "./store";
import { SET_USER } from "./store/actions/user";
import { Container, ContentContainer } from "./[page].page";

function Login() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t } = useTranslation('auth');
  const user = useSelector((state: UserReduxState) => state.user);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState("");

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setError("");
      setStatus("");
      const res = await axios.post(`${API_URL}/user/login`, { username, password });
      localStorage.setItem('token', res.data.token);
      dispatch({
        type: SET_USER,
        payload: res.data
      });
      router.replace('/user');
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.response?.data || "Error during login");
    }
  };

  useEffect(() => {
    if (user)
      router.replace('/user');
  }, [])

  return (
    <Container>
      <ContentContainer>
        <BoxContainer status={status}>
          <BoxTitle>
            {t('login.title')}
          </BoxTitle>
          <QueryForm onSubmit={login}>
            <CoordRow style={{ position: 'relative', alignItems: 'center' }}>
              <Textfield
                placeholder={t('login.username')}
                type='text'
                name='username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}          
              />
              <Textfield
                placeholder={t('login.password')}
                autoComplete="password"
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
              <BoxRow>
                {t('login.noAccount')}
                <Link href='/user/register'>
                  <a style={{ color: '#4bc0c0' }}>
                    {t('login.goToRegister')}
                  </a>
                </Link>
              </BoxRow>
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