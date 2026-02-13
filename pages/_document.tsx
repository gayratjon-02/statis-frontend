import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="robots" content="index,follow" />
        <link rel="icon" type="image/png" href="/img/logo/favicon.svg" />

        {/* SEO */}
        <meta
          name="keywords"
          content="Static Engine, AI Ad Generator, Facebook Ads, Meta Ads, Ad Creative, Marketing Automation, SaaS"
        />
        <meta
          name="description"
          content="Static Engine is a SaaS web application that enables marketers, media buyers, brand owners, and agencies to generate professional Facebook/Meta ad images using AI. Generate on-brand, scroll-stopping ad images in seconds."
        />
        <meta name="author" content="Static Engine" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
