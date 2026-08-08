import withPWAInit from "@ducanh2912/next-pwa";
import { execSync } from "child_process";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
});

let commitDate = "";
try {
  commitDate = execSync('git log -1 --format=%cd --date=format:"%Y%m%d"').toString().trim();
} catch (e) {
  commitDate = "unknown";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: commitDate,
  },
  output: "standalone",
  turbopack: {},
  async rewrites() {
    // URL de la API según el entorno.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://cdd-backend-215337606799.europe-west1.run.app";
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/api/:path*`,
        },
      ],
    };
  },
  async headers() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://cdd-backend-215337606799.europe-west1.run.app";
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com; connect-src 'self' https://accounts.google.com https://www.googleapis.com https://login.microsoftonline.com https://graph.microsoft.com ${apiUrl}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; frame-src 'self' blob: https://accounts.google.com;`
          }
        ]
      }
    ];
  }
};

export default withPWA(nextConfig);
