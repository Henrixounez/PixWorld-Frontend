import type { AppProps } from 'next/app'
import Head from 'next/head';
import '../styles/index.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>PixWorld</title>
        <meta name="description">Place pixels where you want on this canvas !</meta>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
