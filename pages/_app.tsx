import "@/styles/globals.css";
import "@/scss/theme.scss";
import "@/scss/pc/dashboard.scss";
import "@/scss/pc/landing.scss";
import "@/scss/pc/library.scss";
import "@/scss/pc/generate.scss";
import "@/scss/pc/admin-auth.scss";
import "@/scss/pc/admin-dashboard.scss";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
