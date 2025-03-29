"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useUserRole, UserRole } from "~/hooks/useUserRole";
import { useWalletMiddleware } from "~/hooks/useWalletMiddleware";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Wallet, Building2, ShieldCheck, FileCheck } from "lucide-react";
import { toast } from "sonner";
import RegistrationForm from "~/components/RegistrationForm";

type EthereumProvider = {
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
  [key: string]: unknown;
};

export default function Home() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { role, isLoading } = useUserRole(address);
  const [registrationType, setRegistrationType] = useState<
    "user" | "authority" | "verifier" | null
  >(null);

  useWalletMiddleware();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleAccountsChanged = () => {
        window.location.href = "/";
      };

      const handleChainChanged = () => {
        window.location.href = "/";
      };

      const provider = window.ethereum as any;
      if (provider) {
        provider.on("accountsChanged", handleAccountsChanged);
        provider.on("chainChanged", handleChainChanged);

        return () => {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
        };
      }
    }
  }, []);

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

  if (isLoading && isConnected && address) {
    return (
      <div className="from-background to-secondary/10 flex min-h-screen flex-col bg-gradient-to-b">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-sky-700 to-sky-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
              Decentralized Identity System
            </h1>
            <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
              Secure & Decentralized Digital Identity System powered by
              blockchain technology
            </p>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold">
                Self-Sovereign Identity
              </h3>
              <p className="text-muted-foreground">
                Take control of your digital identity with blockchain-backed
                security and privacy.
              </p>
            </div>
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold">
                Zero-Knowledge Proofs
              </h3>
              <p className="text-muted-foreground">
                Share only what you want. Verify without revealing sensitive
                information.
              </p>
            </div>
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <h3 className="mb-2 text-lg font-semibold">
                Portable Digital ID
              </h3>
              <p className="text-muted-foreground">
                Carry your verified credentials anywhere with blockchain
                technology.
              </p>
            </div>
          </div>

          <div className="mx-auto flex items-center justify-center gap-6">
            <h2 className="mb-8 text-center text-2xl font-bold">
              Loading Your Profile
            </h2>
            <div className="mb-8">
              <w3m-account-button />
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card animate-pulse rounded-lg border-2 border-transparent p-6"
              >
                <div className="bg-muted mb-4 h-12 w-12 rounded-full"></div>
                <div className="bg-muted mb-4 h-6 w-3/4 rounded"></div>
                <div className="bg-muted mb-4 h-4 w-full rounded"></div>
                <div className="bg-muted mb-4 h-4 w-5/6 rounded"></div>
                <div className="bg-muted h-10 w-full rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const needsRegistration = role === UserRole.None;

  return (
    <div className="from-background to-secondary/10 flex max-h-screen min-h-screen flex-col overflow-y-hidden bg-gradient-to-b">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-sky-700 to-sky-400 bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
            Decentralized Identity System
          </h1>
          <p className="text-muted-foreground mx-auto max-w-3xl text-xl">
            Secure & Decentralized Digital Identity System powered by blockchain
            technology
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">
              Self-Sovereign Identity
            </h3>
            <p className="text-muted-foreground">
              Take control of your digital identity with blockchain-backed
              security and privacy.
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">
              Zero-Knowledge Proofs
            </h3>
            <p className="text-muted-foreground">
              Share only what you want. Verify without revealing sensitive
              information.
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6 shadow-sm">
            <h3 className="mb-2 text-lg font-semibold">Portable Digital ID</h3>
            <p className="text-muted-foreground">
              Carry your verified credentials anywhere with blockchain
              technology.
            </p>
          </div>
        </div>

        {isConnected && needsRegistration && !registrationType && (
          <>
            <div className="mx-auto flex items-center justify-center gap-6">
              <h2 className="mb-8 text-center text-2xl font-bold">
                Choose Your Role to Register
              </h2>
              <div className="mb-8">
                <w3m-account-button />
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
              <Card
                onClick={() => setRegistrationType("user")}
                className="hover:border-primary/20 relative cursor-pointer overflow-hidden border-2 border-transparent transition-all"
              >
                <div className="absolute top-0 left-0 h-1 w-full bg-sky-500"></div>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Wallet className="h-6 w-6 text-sky-500" />
                  </div>
                  <CardTitle className="text-xl">Individual</CardTitle>
                  <CardDescription>
                    Access your personal digital identity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Manage your verified documents, control data sharing, and
                    maintain your digital identity.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="text-muted w-full bg-sky-600 hover:bg-sky-700"
                    onClick={() => setRegistrationType("user")}
                  >
                    Register as User
                  </Button>
                </CardFooter>
              </Card>

              <Card
                onClick={() => setRegistrationType("authority")}
                className="hover:border-primary/20 relative cursor-pointer overflow-hidden border-2 border-transparent transition-all"
              >
                <div className="absolute top-0 left-0 h-1 w-full bg-purple-400"></div>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <Building2 className="h-6 w-6 text-purple-300" />
                  </div>
                  <CardTitle className="text-xl">Government</CardTitle>
                  <CardDescription>
                    Verify and issue digital credentials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Authenticate documents, issue digital credentials, and
                    manage verification requests.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-purple-400 hover:bg-purple-500"
                    onClick={() => setRegistrationType("authority")}
                  >
                    Register as Authority
                  </Button>
                </CardFooter>
              </Card>

              <Card
                onClick={() => setRegistrationType("verifier")}
                className="hover:border-primary/20 relative cursor-pointer overflow-hidden border-2 border-transparent transition-all"
              >
                <div className="absolute top-0 left-0 h-1 w-full bg-green-500"></div>
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <ShieldCheck className="h-6 w-6 text-green-500" />
                  </div>
                  <CardTitle className="text-xl">Organization</CardTitle>
                  <CardDescription>Verify identities securely</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Verify individual identities and maintain verification
                    records securely on the blockchain.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRegistrationType("verifier");
                    }}
                  >
                    Register as Verifier
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </>
        )}

        {isConnected && needsRegistration && registrationType && (
          <RegistrationForm
            formType={registrationType}
            isOpen={!!registrationType}
            onClose={() => setRegistrationType(null)}
          />
        )}

        {!isConnected && (
          <Card className="mx-auto w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <p className="mb-4">
                Connect your wallet to register or access your dashboard.
              </p>
              <w3m-connect-button />
            </CardContent>
          </Card>
        )}
      </div>

      <footer className="bg-background mt-auto border-t py-6">
        <div className="text-muted-foreground container mx-auto px-4 text-center">
          © {new Date().getFullYear()} Decentralized Identity System
        </div>
      </footer>
    </div>
  );
}
