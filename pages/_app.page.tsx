import type { AppProps } from 'next/app'
import Head from 'next/head';
import { appWithTranslation } from 'next-i18next';
import '../styles/index.css';

function MyApp({ Component, pageProps }: AppProps) {

  return (
    <>
      <Head>
        <title>PixWorld</title>
        <meta name='application-name' content='PixWorld' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='PixWorld' />
        <meta name="description" content="Place pixels where you want on this canvas !"/>
        <meta name="viewport" content="width=device-width,initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-TileColor' content='#da532c' />
        <meta name='msapplication-tap-highlight' content='no' />
        <meta name='theme-color' content='#FFFFFF' />

        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

        <link rel='icon' type='image/png' sizes='32x32' href='/icons/favicon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/icons/favicon-16x16.png' />
        <link rel='manifest' href='/manifest.json' />
        <link rel='shortcut icon' href='/favicon.ico' />
            
        <meta name='twitter:card' content='summary' />
        <meta name='twitter:url' content='https://pixworld.vercel.app' />
        <meta name='twitter:title' content='PixWorld' />
        <meta name='twitter:description' content='Place pixels where you want on this canvas !' />
        <meta name='twitter:image' content='https://pixworld.vercel.app/icons/android-chrome-192x192.png' />
        <meta name='twitter:creator' content='@Henrixounez' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='PixWorld' />
        <meta property='og:description' content='Place pixels where you want on this canvas !' />
        <meta property='og:site_name' content='PixWorld' />
        <meta property='og:url' content='https://pixworld.vercel.app' />
        <meta property='og:image' content={pageProps.ogImage} />
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default appWithTranslation(MyApp);
