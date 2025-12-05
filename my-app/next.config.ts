import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    turbopack: {
        rules: {
            // Turbopack-native SVG -> React component loader
            "*.svg": {
                loaders: ["@svgr/webpack"],
            },
        },
    },
};

export default nextConfig;
