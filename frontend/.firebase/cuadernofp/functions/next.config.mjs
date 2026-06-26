// next.config.mjs
import withPWAInit from "@ducanh2912/next-pwa";
var withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true
});
var nextConfig = {
  turbopack: {},
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://cdd-backend-215337606799.europe-west1.run.app";
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: `${apiUrl}/api/:path*`
        }
      ]
    };
  }
};
var next_config_default = withPWA(nextConfig);
export {
  next_config_default as default
};
