"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";

export enum UserRole {
  None = 0,
  User = 1,
  Authority = 2,
  Verifier = 3,
  Admin = 4,
}

interface UserRoleData {
  role: UserRole;
  isVerified: boolean;
  isLoading: boolean;
  name: string;
  isAdmin: boolean;
  isAuthority: boolean;
  isUser: boolean;
  isVerifier: boolean;
}

export function useUserRole(address?: `0x${string}`) {
  const [userData, setUserData] = useState<UserRoleData>({
    role: UserRole.None,
    isVerified: false,
    isLoading: true,
    name: "",
    isAdmin: false,
    isAuthority: false,
    isUser: false,
    isVerifier: false,
  });

  const { data, isLoading, isError } = useReadContract({
    address: userRegistryAddress,
    abi: userRegistryAbi,
    functionName: "getUserData",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    if (!isLoading) {
      if (data) {
        const [name, , , , , role, isVerified] = data;
        setUserData({
          role: role as UserRole,
          isVerified,
          isLoading: false,
          name,
          isAdmin: role === UserRole.Admin,
          isAuthority: role === UserRole.Authority,
          isUser: role === UserRole.User,
          isVerifier: role === UserRole.Verifier,
        });
      } else {
        setUserData((prev) => ({
          ...prev,
          role: UserRole.None,
          isLoading: false,
        }));
      }
    }
  }, [data, isLoading, isError, address]);

  useEffect(() => {
    if (!address) {
      setUserData((prev) => ({
        ...prev,
        role: UserRole.None,
        isLoading: false,
      }));
    }
  }, [address]);

  return userData;
}
