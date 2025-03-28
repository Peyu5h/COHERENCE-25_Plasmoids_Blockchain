import { useReadContract } from "wagmi";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import { Address } from "viem";

export enum Role {
  None,
  User,
  Authority,
}

export type UserData = {
  name: string;
  dob: string;
  gender: string;
  physicalAddress: string;
  mobileNumber: string;
  role: Role;
};

export function useUserData(address: string | undefined) {
  const {
    data: userData,
    isLoading,
    error,
  } = useReadContract({
    address: userRegistryAddress,
    abi: userRegistryAbi,
    functionName: "getUserData",
    args: address ? [address as Address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const formattedData = userData
    ? {
        name: userData[0],
        dob: userData[1],
        gender: userData[2],
        physicalAddress: userData[3],
        mobileNumber: userData[4],
        role: userData[5],
      }
    : undefined;

  return {
    userData: formattedData,
    isLoading,
    error,
  };
}
