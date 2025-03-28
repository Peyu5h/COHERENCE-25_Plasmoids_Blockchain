import { useEffect } from "react";
import { useAccount } from "wagmi";

export function useWalletMiddleware() {
  const { isConnected } = useAccount();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: NodeJS.Timeout;

    const handleChange = () => {
      // Clear any existing timeout
      if (timeoutId) clearTimeout(timeoutId);

      // Set a new timeout to handle the change
      timeoutId = setTimeout(() => {
        // Store a flag in sessionStorage
        sessionStorage.setItem("wallet_changed", "true");
        // Force reload the page
        window.location.href = "/";
      }, 100);
    };

    const provider = window.ethereum as any;
    if (provider) {
      // Handle account changes
      provider.on("accountsChanged", handleChange);
      // Handle chain changes
      provider.on("chainChanged", handleChange);
      // Handle disconnect
      provider.on("disconnect", handleChange);
    }

    // Check for stored flag on page load
    const hasChanged = sessionStorage.getItem("wallet_changed");
    if (hasChanged) {
      sessionStorage.removeItem("wallet_changed");
      // Reload once more to ensure clean state
      window.location.reload();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (provider) {
        provider.removeListener("accountsChanged", handleChange);
        provider.removeListener("chainChanged", handleChange);
        provider.removeListener("disconnect", handleChange);
      }
    };
  }, [isConnected]);
}
