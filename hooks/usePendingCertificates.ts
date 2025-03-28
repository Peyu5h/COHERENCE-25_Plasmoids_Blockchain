import { useReadContract } from "wagmi";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import { Address } from "viem";
import { type Certificate } from "./useCertificates";

export function usePendingCertificates(authorityAddress: string) {
  const {
    data: pendingCertificates,
    isLoading,
    error,
  } = useReadContract({
    address: userRegistryAddress,
    abi: userRegistryAbi,
    functionName: "getPendingCertificates",
    args: [],
    query: {
      enabled: Boolean(authorityAddress),
    },
  });

  return {
    pendingCertificates: pendingCertificates as Certificate[] | undefined,
    isLoading,
    error,
  };
}
