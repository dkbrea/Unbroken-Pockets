import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body>
        {/* The Main component renders the current page */}
        <Main />
        {/* NextScript renders all the necessary scripts for Next.js */}
        <NextScript />
      </body>
    </Html>
  );
} 