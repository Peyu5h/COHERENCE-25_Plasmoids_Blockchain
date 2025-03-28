import { useWriteContract } from "wagmi";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";

export function useUploadCertificate() {
  const { writeContractAsync, isPending, error } = useWriteContract();

  const uploadCertificate = async ({
    certificateId,
    amount,
    issuanceDate,
    imageHash,
  }: {
    certificateId: string;
    amount: bigint;
    issuanceDate: string;
    imageHash: string;
  }) => {
    return writeContractAsync({
      address: userRegistryAddress,
      abi: userRegistryAbi,
      functionName: "uploadIncomeCertificate",
      args: [certificateId, amount, issuanceDate, imageHash],
    });
  };

  return {
    uploadCertificate,
    isLoading,
    error,
  };
}
