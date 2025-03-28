"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useUserRole, UserRole } from "~/hooks/useUserRole";

export default function PendingAuthorityPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { role, isVerified, isLoading } = useUserRole(address);

  useEffect(() => {
    if (!isLoading) {
      if (!isConnected || !address) {
        router.push("/");
        return;
      }

      if (role !== UserRole.Authority) {
        router.push("/");
        return;
      }

      if (isVerified) {
        router.push("/authority");
        return;
      }
    }
  }, [address, isConnected, isLoading, role, isVerified, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold">Verification Pending</h1>
        <div className="mb-6 rounded-md border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-yellow-700">
            Your authority account is pending verification by an admin.
          </p>
        </div>
        <p className="mb-4 text-gray-600">
          Once an admin approves your request, you will gain access to the
          Authority Dashboard.
        </p>
        <p className="text-sm text-gray-500">
          This process may take some time. Please check back later.
        </p>
      </div>
    </div>
  );
}
