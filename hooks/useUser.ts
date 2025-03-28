import { useState, useEffect } from "react";
import { useUserRole } from "~/hooks/useUserRole";
import { useReadContract } from "wagmi";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";

export interface UserDetails {
  name: string;
  walletAddress: `0x${string}` | string;
  phone: string;
  address: string;
  aadharNumber: string;
  didAddress: string;
  dob: string;
  gender: string;
}

export function useUser(address?: `0x${string}`) {
  const { name: roleName, isLoading: isRoleLoading } = useUserRole(address);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const {
    data: userData,
    isError,
    isLoading: isContractLoading,
  } = useReadContract({
    address: userRegistryAddress,
    abi: userRegistryAbi,
    functionName: "getUserData",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    if (userData && address) {
      const [name, dob, gender, physicalAddress, mobileNumber] = userData as [
        string,
        string,
        string,
        string,
        string,
        number,
        boolean,
      ];

      const userDetails: UserDetails = {
        name,
        walletAddress: address,
        phone: mobileNumber,
        address: physicalAddress,
        aadharNumber: "XXXX-XXXX-XXXX",
        didAddress: `did:ethr:${address}`,
        dob,
        gender,
      };

      setUserDetails(userDetails);
      setIsLoading(false);
    } else if (isError) {
      console.error("Error fetching user data from contract");
      setUserDetails(null);
      setIsLoading(false);
    }
  }, [userData, address, isError]);

  const calculateAge = (dob?: string): number | undefined => {
    if (!dob) return undefined;

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const age = userDetails?.dob ? calculateAge(userDetails.dob) : undefined;

  return {
    user: userDetails,
    isLoading: isLoading || isRoleLoading || isContractLoading,
    age,
  };
}
