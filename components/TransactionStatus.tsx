import React from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ExternalLink } from "lucide-react";

export type TransactionStatusProps = {
  hash?: `0x${string}` | null;
  isPending?: boolean;
  isConfirming?: boolean;
  isConfirmed?: boolean;
  error?: string | null;
  network?: "sepolia" | "mainnet" | "optimism" | "arbitrum" | "base";
  messages?: {
    pending?: string;
    confirming?: string;
    confirmed?: string;
  };
  className?: string;
};

const TransactionStatus: React.FC<TransactionStatusProps> = ({
  hash,
  isPending,
  isConfirming,
  isConfirmed,
  error,
  network = "sepolia",
  messages = {},
  className = "",
}) => {
  if (!isPending && !isConfirming && !isConfirmed && !error) {
    return null;
  }

  const getExplorerUrl = () => {
    const baseUrls: Record<string, string> = {
      sepolia: "https://sepolia.etherscan.io",
      mainnet: "https://etherscan.io",
      optimism: "https://optimistic.etherscan.io",
      arbitrum: "https://arbiscan.io",
      base: "https://basescan.org",
    };

    const baseUrl = baseUrls[network] || baseUrls.sepolia;
    return hash ? `${baseUrl}/tx/${hash}` : null;
  };

  const getStatusMessage = () => {
    if (error) return error;
    if (isPending) return messages.pending || "Submitting transaction...";
    if (isConfirming) return messages.confirming || "Confirming transaction...";
    if (isConfirmed) return messages.confirmed || "Transaction confirmed!";
    return null;
  };

  const getStatusTitle = () => {
    if (error) return "Error";
    if (isConfirmed) return "Success!";
    return "Processing";
  };

  const getAlertClasses = () => {
    if (error) return "border-red-500/50 bg-red-500/10";
    if (isConfirmed) return "border-green-500/50 bg-green-500/10";
    return "bg-muted";
  };

  const explorerUrl = getExplorerUrl();

  return (
    <Alert className={`mt-4 ${getAlertClasses()} ${className}`}>
      <AlertTitle>{getStatusTitle()}</AlertTitle>
      <AlertDescription className="flex w-full flex-row items-center justify-between gap-2">
        {getStatusMessage()}
        {explorerUrl && (
          <div className="">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-foreground flex items-center gap-1 text-sm hover:underline"
            >
              View on Etherscan
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default TransactionStatus;
