import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // En producción (Vercel), usaremos la URL de Render. En desarrollo, localhost.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
