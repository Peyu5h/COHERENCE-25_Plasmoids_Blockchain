import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";

export type Certificate = {
  userAddress: `0x${string}`;
  certificateId: string;
  issuanceDate: string;
  ipfsHash: string;
  certificateType: number;
  isVerified: boolean;
  timestamp: bigint;
  metadata: string;
};

export function useUserCertificates(userAddress?: string) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isError,
    isLoading: isContractLoading,
    refetch: refetchCertificates,
  } = useReadContract({
    address: userRegistryAddress,
    abi: userRegistryAbi,
    functionName: "getUserCertificates",
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  useEffect(() => {
    if (data) {
      const typedData = data as readonly Certificate[];
      setCertificates([...typedData]);
      setError(null);
    } else if (isError) {
      setError("Failed to fetch certificates");
    }
    setIsLoading(false);
  }, [data, isError]);

  return {
    certificates,
    refetchCertificates,
    isLoading: isLoading || isContractLoading,
    error,
  };
}

export function useAllCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    isError,
    isLoading: isContractLoading,
    refetch,
  } = useReadContract({
    address: userRegistryAddress,
    abi: userRegistryAbi,
    functionName: "getAllUsersCertificates",
    query: {
      enabled: true,
    },
  });

  useEffect(() => {
    if (data) {
      const [addresses, certs] = data as readonly [
        readonly `0x${string}`[],
        readonly Certificate[][],
      ];

      const flattenedCerts: Certificate[] = [];
      for (let i = 0; i < addresses.length; i++) {
        const userCerts = certs[i];
        for (const cert of userCerts) {
          flattenedCerts.push({
            ...cert,
            userAddress: addresses[i],
          });
        }
      }

      setCertificates(flattenedCerts);
      setError(null);
    } else if (isError) {
      setError("Failed to fetch certificates");
    }
    setIsLoading(false);
  }, [data, isError]);

  return {
    certificates,
    isLoading: isLoading || isContractLoading,
    error,
    refetchCertificates: refetch,
  };
}
