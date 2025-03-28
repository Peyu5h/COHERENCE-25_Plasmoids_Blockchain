"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useUserRole, UserRole } from "~/hooks/useUserRole";

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole;
  requireVerified?: boolean;
}

export default function RoleProtectedRoute({
  children,
  requiredRole,
  requireVerified = true,
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { role, isVerified, isLoading } = useUserRole(address);

  useEffect(() => {
    if (!isLoading) {
      if (!isConnected || !address) {
        router.push("/");
        return;
      }

      if (role < requiredRole) {
        router.push("/");
        return;
      }

      if (requireVerified && !isVerified) {
        if (role === UserRole.Authority) {
          router.push("/authority/pending");
        } else {
          router.push("/");
        }
        return;
      }
    }
  }, [
    address,
    isConnected,
    isLoading,
    role,
    isVerified,
    router,
    requiredRole,
    requireVerified,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (
    !isConnected ||
    !address ||
    role < requiredRole ||
    (requireVerified && !isVerified)
  ) {
    return null;
  }

  return <>{children}</>;
}
