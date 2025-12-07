import type { NextConfig } from "next";
import type { RuleSetRule } from "webpack";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yavuzceliker.github.io",
        pathname: "/sample-images/**",
      },
    ],
  },
  webpack: (config) => {
    const rules = config.module.rules as RuleSetRule[];
    const svgRule = rules.find(
      (rule): rule is RuleSetRule & { test: RegExp } =>
        typeof rule === "object" &&
        rule !== null &&
        rule.test instanceof RegExp &&
        rule.test.test(".svg"),
    );

    if (svgRule) {
      svgRule.exclude = /\.svg$/i;
    }

    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: [{ loader: "@svgr/webpack", options: { titleProp: true } }],
    });

    return config;
  },
};

export default nextConfig;
