import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useReadContract, useReadContracts } from "wagmi";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";

export type User = {
  name: string;
  dob: string;
  gender: string;
  address: string;
  mobileNumber: string;
  role: number;
  isVerified: boolean;
  walletAddress: string;
};

export function useAllUsers() {
  const { address } = useAccount();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    data: userAddresses,
    isLoading: isAddressesLoading,
    refetch: refetchAddresses,
  } = useReadContract({
    address: userRegistryAddress,
    abi: userRegistryAbi,
    functionName: "getAllUsers",
    query: {
      enabled: !!address,
    },
  });

  const {
    data: usersData,
    isLoading: isUsersDataLoading,
    refetch: refetchUsersData,
  } = useReadContracts({
    contracts:
      userAddresses?.map((userAddress) => ({
        address: userRegistryAddress,
        abi: userRegistryAbi,
        functionName: "getUserData",
        args: [userAddress],
      })) || [],
    query: {
      enabled: !!userAddresses && userAddresses.length > 0,
    },
  });

  useEffect(() => {
    if (
      !isAddressesLoading &&
      !isUsersDataLoading &&
      userAddresses &&
      usersData
    ) {
      try {
        const processedUsers = userAddresses
          .map((walletAddress, index) => {
            const userData = usersData[index]?.result;
            if (!userData) {
              return null;
            }

            return {
              name: userData[0],
              dob: userData[1],
              gender: userData[2],
              address: userData[3],
              mobileNumber: userData[4],
              role: Number(userData[5]),
              isVerified: userData[6],
              walletAddress: walletAddress as string,
            };
          })
          .filter(Boolean) as User[];

        setUsers(processedUsers);
        setError(null);
      } catch (err) {
        console.error("Error processing users data:", err);
        setError("Failed to process users data");
      } finally {
        setIsLoading(false);
      }
    }
  }, [isAddressesLoading, isUsersDataLoading, userAddresses, usersData]);

  const refetchUsers = () => {
    refetchAddresses();
    refetchUsersData();
  };

  return { users, isLoading, error, refetchUsers };
}
