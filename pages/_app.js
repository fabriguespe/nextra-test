// pages/_app.js
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Default Title</title>
        <meta name="description" content="Default description" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
