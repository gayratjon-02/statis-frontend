import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import LandingPage from "./homepage";

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("se_access_token");
    const member = localStorage.getItem("se_member");

    if (token && member) {
      router.replace("/dashboard");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) return null;

  return <LandingPage />;
}
