import { useState, useEffect } from "react";
import { useUserRole } from "~/hooks/useUserRole";

export interface UserDetails {
  name: string;
  walletAddress: `0x${string}` | string;
  email: string;
  phone: string;
  address: string;
  aadharNumber: string;
  didAddress: string;
  dob: string;
}

export function useUser(address?: `0x${string}`) {
  const { name, isLoading: isRoleLoading } = useUserRole(address);
  const [isLoading, setIsLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call to fetch user details
        // For now, we'll mock the data based on the address
        if (address && name) {
          // This simulates an API delay
          await new Promise((resolve) => setTimeout(resolve, 500));

          // Mock data - in real app, this would come from backend
          const userDetails: UserDetails = {
            name: name,
            walletAddress: address,
            email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            phone: "+91 9876543210",
            address: "401 C-wing, Happy Homes Society, J.M. Road, Mumbai",
            aadharNumber: "XXXX-XXXX-1234",
            didAddress: `0x${address.substring(2, 8)}...${address.substring(address.length - 4)}`,
            dob: "2000-01-15", // Format: YYYY-MM-DD
          };

          setUserDetails(userDetails);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (address && name && !isRoleLoading) {
      fetchUserDetails();
    } else if (!address || !name) {
      setUserDetails(null);
      setIsLoading(false);
    }
  }, [address, name, isRoleLoading]);

  // Calculate age from dob
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
    isLoading: isLoading || isRoleLoading,
    age,
  };
}
