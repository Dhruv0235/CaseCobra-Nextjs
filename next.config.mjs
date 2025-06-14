/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        proocol: "https",
        hostname: "4mrz4s25za.ufs.sh",
        port: "",
      },
    ],
  },
};

export default nextConfig;
