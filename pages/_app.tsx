import "@/styles/globals.css";
import "@/scss/pc/home.scss";
import "@/scss/pc/auth.scss";
import "@/scss/mobile/home.scss";
import "@/libs/components/homepage/Navbar/Navbar.scss";
import "@/libs/components/homepage/Stepper/Stepper.scss";
import "@/libs/components/homepage/BrandStep/BrandStep.scss";
import "@/libs/components/homepage/ProductStep/ProductStep.scss";
import "@/libs/components/homepage/ConceptStep/ConceptStep.scss";
import "@/libs/components/homepage/NotesStep/NotesStep.scss";
import "@/libs/components/homepage/GenerateStep/GenerateStep.scss";
import "@/libs/components/homepage/CreateBrandModal/CreateBrandModal.scss";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useAuth } from "@/libs/hooks/useAuth";

const PUBLIC_ROUTES = ["/login"];

export default function App({ Component, pageProps }: AppProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Still checking auth
  if (isAuthenticated === null) return null;

  // Not authenticated and not on a public route — useAuth handles redirect
  if (!isAuthenticated && !PUBLIC_ROUTES.includes(router.pathname)) return null;

  return <Component {...pageProps} />;
}
