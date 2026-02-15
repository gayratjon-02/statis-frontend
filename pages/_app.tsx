import "@/styles/globals.css";
import "@/scss/theme.scss";
import "@/scss/pc/auth.scss";
import "@/scss/pc/dashboard.scss";
import "@/scss/pc/landing.scss";
import "@/scss/pc/library.scss";
import "@/scss/pc/generate.scss";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useAuth } from "@/libs/hooks/useAuth";

const PUBLIC_ROUTES = ["/login", "/landing"];

export default function App({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Still checking auth
  if (isAuthenticated === null) return null;

  // Not authenticated and not on a public route — useAuth handles redirect
  if (!isAuthenticated && !PUBLIC_ROUTES.includes(router.pathname)) return null;

  return <Component {...pageProps} />;
}
