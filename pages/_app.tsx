import "@/styles/globals.css";
import "@/scss/pc/home.scss";
import "@/scss/mobile/home.scss";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
