/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    qualities: [75, 95],
  },
  async redirects() {
    return [
      {
        source: "/:market/:lang/policies/privacy-policy",
        destination: "/:market/:lang/policies/privacy",
        permanent: true,
      },
      {
        source: "/:market/:lang/policies/terms-of-service",
        destination: "/:market/:lang/policies/terms",
        permanent: true,
      },
      {
        source: "/policies/privacy-policy",
        destination: "/eu/en/policies/privacy",
        permanent: true,
      },
      {
        source: "/policies/terms-of-service",
        destination: "/eu/en/policies/terms",
        permanent: true,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

export default nextConfig
