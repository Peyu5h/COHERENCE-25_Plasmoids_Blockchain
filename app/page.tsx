"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import RegistrationForm from "~/components/RegistrationForm";
import { useUserRole, UserRole } from "~/hooks/useUserRole";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { role, isLoading } = useUserRole(address);
  const [registrationType, setRegistrationType] = useState<
    "user" | "authority" | "verifier" | null
  >(null);

  useEffect(() => {
    if (!isLoading && isConnected && address) {
      if (role === UserRole.Admin) {
        router.push("/admin");
      } else if (role === UserRole.User) {
        router.push("/dashboard");
      } else if (role === UserRole.Authority) {
        router.push("/authority");
      } else if (role === UserRole.Verifier) {
        router.push("/verifier");
      }
    }
  }, [isLoading, isConnected, address, role, router]);

  // Show loading state only if we're both connected and loading data
  if (isLoading && isConnected && address) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  // Need to register if role is None
  const needsRegistration = role === UserRole.None;

  return (
    <div className="flex min-h-screen flex-col items-center p-8">
      <h1 className="mb-8 text-3xl font-bold">Welcome to DID Registry</h1>

      <div className="mb-8 w-full max-w-md">
        <w3m-account-button />
      </div>

      {isConnected && needsRegistration && !registrationType && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <h2 className="mb-6 text-center text-xl font-semibold">
              Choose Registration Type
            </h2>

            <div className="flex flex-col space-y-4">
              <Button
                onClick={() => setRegistrationType("user")}
                className="bg-blue-600 py-6 hover:bg-blue-700"
              >
                Register as User
                <Badge className="ml-2 bg-blue-800">Standard</Badge>
              </Button>

              <Button
                onClick={() => setRegistrationType("authority")}
                className="bg-purple-600 py-6 hover:bg-purple-700"
              >
                Register as Authority
                <Badge className="ml-2 bg-purple-800">Official</Badge>
              </Button>

              <Button
                onClick={() => setRegistrationType("verifier")}
                className="bg-indigo-600 py-6 hover:bg-indigo-700"
              >
                Register as Verifier
                <Badge className="ml-2 bg-indigo-800">Professional</Badge>
              </Button>
            </div>

            <p className="text-muted-foreground mt-6 text-center text-sm">
              Choose the role that best fits your identity needs within our
              decentralized identity system.
            </p>
          </CardContent>
        </Card>
      )}

      {isConnected && needsRegistration && registrationType && (
        <div className="w-full">
          <Button
            onClick={() => setRegistrationType(null)}
            variant="outline"
            className="mb-6 flex items-center"
          >
            ← Back to options
          </Button>
          <RegistrationForm formType={registrationType} />
        </div>
      )}

      {!isConnected && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">
              Connect your wallet to register or access your dashboard.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
