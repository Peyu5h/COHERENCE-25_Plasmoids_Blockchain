import { useState, useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { showTransactionToast } from "~/components/ui/transaction-toaster";
import { toast } from "sonner";
import { Abi } from "viem";

interface UseTransactionOptions {
  /** Success message when transaction completes */
  successMessage?: string;
  /** Optional callback to run after successful transaction */
  onSuccess?: (data: any) => void;
  /** Display regular toast errors instead of transaction toasts for validation errors */
  useRegularToastForErrors?: boolean;
}

interface BaseContractConfig {
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: readonly unknown[];
  [key: string]: unknown;
}

interface ExtendedContractConfig extends BaseContractConfig {
  _meta?: {
    successMessage?: string;
  };
}

/**
 * Hook to manage blockchain transactions with integrated toast notifications
 *
 * Usage:
 * ```
 * const { writeAsync, isLoading, isSuccess } = useTransaction({
 *   successMessage: "Token transfer complete",
 *   onSuccess: () => refetchBalance()
 * });
 *
 * // Then in your handler:
 * const handleTransfer = async () => {
 *   if (!isValidInput()) {
 *     toast.error("Invalid input");
 *     return;
 *   }
 *
 *   try {
 *     await writeAsync({
 *       address: tokenAddress,
 *       abi: erc20Abi,
 *       functionName: 'transfer',
 *       args: [recipient, amount],
 *       _meta: { successMessage: "Custom success message" } // Optional transaction-specific message
 *     });
 *   } catch (error) {
 *     // Error handling is done by the hook
 *   }
 * };
 * ```
 */
export function useTransaction(options: UseTransactionOptions = {}) {
  const {
    successMessage = "Transaction completed successfully",
    onSuccess,
    useRegularToastForErrors = true,
  } = options;

  const [toastShown, setToastShown] = useState(false);
  const [currentSuccessMessage, setCurrentSuccessMessage] =
    useState<string>(successMessage);
  const currentTransactionRef = useRef<`0x${string}` | undefined>(undefined);
  const successHandledRef = useRef(false);

  const {
    writeContractAsync,
    data: hash,
    isPending,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isTransactionError,
    error: transactionError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (hash && hash !== currentTransactionRef.current) {
      currentTransactionRef.current = hash;
      successHandledRef.current = false;
    }
  }, [hash]);

  useEffect(() => {
    if (isPending && !toastShown) {
      showTransactionToast.loading(
        "Processing transaction",
        "Please confirm in your wallet",
      );
      setToastShown(true);
    }
  }, [isPending, toastShown]);

  useEffect(() => {
    if (isWriteError && writeError) {
      console.log("Transaction write error:", writeError);

      showTransactionToast.error(
        "Transaction failed",
        writeError?.message || "Failed to submit transaction",
      );
      setToastShown(false);
      currentTransactionRef.current = undefined;
      successHandledRef.current = false;
      resetWrite();
    }

    if (isTransactionError && transactionError) {
      console.log("Transaction error:", transactionError);
      showTransactionToast.error(
        "Transaction failed",
        transactionError?.message || "Transaction failed on blockchain",
      );
      setToastShown(false);
      currentTransactionRef.current = undefined;
      successHandledRef.current = false;
    }

    if (isSuccess && hash && !successHandledRef.current) {
      console.log("Transaction success, hash:", hash);
      successHandledRef.current = true;

      setTimeout(() => {
        showTransactionToast.success(
          "Transaction successful",
          currentSuccessMessage || successMessage,
        );
      }, 300);

      setToastShown(false);
      if (onSuccess && receipt) {
        onSuccess(receipt);
      }
    }
  }, [
    isWriteError,
    writeError,
    isTransactionError,
    transactionError,
    isSuccess,
    hash,
    receipt,
    successMessage,
    currentSuccessMessage,
    onSuccess,
    useRegularToastForErrors,
    resetWrite,
  ]);

  const writeAsync = async (config: ExtendedContractConfig) => {
    try {
      const { _meta, ...contractConfig } = config;

      if (_meta?.successMessage) {
        setCurrentSuccessMessage(_meta.successMessage);
      } else {
        setCurrentSuccessMessage(successMessage);
      }

      successHandledRef.current = false;
      return await writeContractAsync(contractConfig as any);
    } catch (error) {
      throw error;
    }
  };

  const write = (config: ExtendedContractConfig) => {
    const { _meta, ...contractConfig } = config;

    if (_meta?.successMessage) {
      setCurrentSuccessMessage(_meta.successMessage);
    } else {
      setCurrentSuccessMessage(successMessage);
    }

    successHandledRef.current = false;

    showTransactionToast.loading(
      "Processing transaction",
      "Please confirm in your wallet",
    );
    setToastShown(true);
    writeContract(contractConfig as any);
  };

  return {
    writeAsync,
    write,
    isLoading: isPending || isConfirming,
    isPending,
    isConfirming,
    isSuccess,
    isError: isWriteError || isTransactionError,
    hash,
    receipt,
    error: writeError || transactionError,
    reset: () => {
      resetWrite();
      currentTransactionRef.current = undefined;
      successHandledRef.current = false;
      setToastShown(false);
      setCurrentSuccessMessage(successMessage);
    },
  };
}
