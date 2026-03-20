const ADMIN_DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN ?? "";

export function isAdminDomain(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hostname === ADMIN_DOMAIN;
}

export function adminPath(path: string): string {
  if (isAdminDomain()) {
    return path.replace(/^\/_admin/, "") || "/";
  }
  return path;
}
