"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "viem/chains";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";

interface NetworkProviderProps {
  children: React.ReactNode;
  enforceNetwork?: boolean;
}

export function NetworkProvider({
  children,
  enforceNetwork = true,
}: NetworkProviderProps) {
  const router = useRouter();
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const isCorrectNetwork = chainId === sepolia.id;

  useEffect(() => {
    if (!isConnected || !enforceNetwork) {
      setIsLoading(false);
      return;
    }

    if (!isCorrectNetwork) {
      setIsLoading(false);
    } else {
      setError("");
      setIsLoading(false);
    }
  }, [isConnected, isCorrectNetwork, enforceNetwork]);

  const handleSwitchNetwork = async () => {
    try {
      setError("");
      await switchChain({ chainId: sepolia.id });
    } catch (err) {
      setError(
        `Failed to switch network: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  if (enforceNetwork && isConnected && !isCorrectNetwork) {
    return (
      <div className="container mx-auto flex h-screen max-w-2xl flex-col items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertTitle>Wrong Network</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Please switch to Sepolia network to continue.</p>
            <Button
              onClick={handleSwitchNetwork}
              variant="outline"
              className="mt-4"
            >
              Switch to Sepolia
            </Button>
          </AlertDescription>
        </Alert>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
