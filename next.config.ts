import type { NextConfig } from "next";

const getRemotePatterns = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!apiUrl) return [];

    try {
        const url = new URL(apiUrl);
        return [
            {
                protocol: url.protocol.replace(":", "") as "http" | "https",
                hostname: url.hostname,
                port: url.port || undefined,
                pathname: "/uploads/**",
            },
        ];
    } catch (error) {
        console.error("Invalid NEXT_PUBLIC_API_BASE_URL in next.config.ts:", error);
        return [];
    }
};

const nextConfig: NextConfig = {
    output: "standalone",
    allowedDevOrigins: ["msi-4", "msi-lo", "goatedcodoer", "192.168.0.143", "100.124.220.52"],
    images: {
        remotePatterns: getRemotePatterns(),
    },
};

export default nextConfig;
