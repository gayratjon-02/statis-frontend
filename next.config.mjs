/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: [
          // HSTS — force HTTPS for 1 year, include subdomains, preload
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          // Prevent MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Deny framing — clickjacking protection
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Enable XSS filter in older browsers
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy — don't leak full URL to third parties
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions policy — disable unused browser APIs
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Cross-Origin-Opener-Policy — allow Google Auth popups
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.amazonaws.com https://via.placeholder.com https://*.googleusercontent.com",
              "connect-src 'self' https://*.amazonaws.com https://accounts.google.com https://oauth2.googleapis.com",
              "frame-src https://accounts.google.com https://checkout.stripe.com",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self' https://accounts.google.com https://checkout.stripe.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
