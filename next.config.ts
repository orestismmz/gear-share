import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external sources such as supabase
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yynxyshxahjccsdirlpa.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
