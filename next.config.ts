/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    REACT_APP_API_URL: process.env.REACT_APP_API_URL,
    REACT_APP_API_WS: process.env.REACT_APP_API_WS,
  },
};

const { i18n } = require('./next-i18next.config');
module.exports = nextConfig;
