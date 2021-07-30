import type { AppProps } from 'next/app'
import Head from 'next/head';
import '../styles/index.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>PixWorld</title>
        <meta name="description" content="Place pixels where you want on this canvas !"/>
        <meta name="viewport" content="width=device-width,initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
