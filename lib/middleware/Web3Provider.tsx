"use client";

import { wagmiAdapter, projectId, config } from "~/lib/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";

import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";
import React, { useState, useEffect, type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { NetworkProvider } from "./NetworkProvider";

function Web3Provider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  const initialState = cookies
    ? cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
    : undefined;

  const metadata = {
    name: "Web3Wrap",
    description: "....",
    url: "https://reown.com/appkit",
    icons: ["https://assets.reown.com/reown-profile-pic.png"],
  };

  const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [sepolia, mainnet],
    metadata: metadata,
    features: {
      analytics: true,
      socials: ["google"],
      walletFeaturesOrder: [],
      email: false,
    },
    themeMode: "dark",
  });

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>{children}</NetworkProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Web3Provider;
