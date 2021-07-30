import type { AppProps } from 'next/app'
import Head from 'next/head';
import '../styles/index.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>PixWorld</title>
        <meta name="description" content="Place pixels where you want on this canvas !"/>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
