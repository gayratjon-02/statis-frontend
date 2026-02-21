import "@/styles/globals.css";
import "@/scss/theme.scss";
import "@/scss/pc/dashboard.scss";
import "@/scss/pc/landing.scss";
import "@/scss/pc/library.scss";
import "@/scss/pc/generate.scss";
import "@/scss/pc/admin-auth.scss";
import "@/scss/pc/admin-dashboard.scss";
import "@/scss/pc/concept-library.scss";
import type { AppProps } from "next/app";
import { PostHogProvider } from "../libs/analytics/PostHogProvider";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <PostHogProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: "#1e293b",
            color: "#f1f5f9",
            border: "1px solid #334155",
            borderRadius: "12px",
          },
          error: {
            style: { borderColor: "#ef4444" },
            iconTheme: { primary: "#ef4444", secondary: "#1e293b" },
          },
          success: {
            style: { borderColor: "#22c55e" },
          },
        }}
      />
    </PostHogProvider>
  );
}
