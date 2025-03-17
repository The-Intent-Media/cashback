
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        dangerouslyAllowSVG: true,
        domains: ['0.0.0.0:8055'],
      remotePatterns: [
        {
          protocol: "http",
          hostname: "localhost",
          port: "1337",
        },
        {
          protocol: "http",
          hostname: "0.0.0.0",
          port: "8055",
        },
      ],
    },
  };
  
  export default nextConfig;
  