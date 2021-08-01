import type { AppProps } from 'next/app'
import Head from 'next/head';
import { Provider } from 'react-redux';
import { appWithTranslation } from 'next-i18next';
import { useStore } from '../store';
import '../styles/index.css';

function MyApp({ Component, pageProps }: AppProps) {
  const store = useStore(pageProps.initialReduxState);

  return (
    <>
      <Head>
        <title>PixWorld</title>
        <meta name="description" content="Place pixels where you want on this canvas !"/>
        <meta name="viewport" content="width=device-width,initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      </Head>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </>
  );
};

export default appWithTranslation(MyApp);
