"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  User,
  Phone,
  Home,
  Shield,
  Cake,
  IdCard,
  CheckCircle,
  XCircle,
} from "lucide-react";

type SharedUserData = {
  did: string;
  timestamp: string;
  sharedData: {
    name?: string;
    phone?: string;
    age?: number;
    address?: string;
    aadharNumber?: string;
  };
};

export default function UserDetailsPage() {
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState<SharedUserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const encodedData = searchParams.get("data");
      if (!encodedData) {
        setError("No user data provided");
        setIsLoading(false);
        return;
      }

      const decodedData = JSON.parse(decodeURIComponent(encodedData));
      setUserData(decodedData);
    } catch (err) {
      console.error("Error parsing user data:", err);
      setError("Invalid user data format");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  function formatDID(did: string) {
    if (!did) return "";
    return `${did.slice(0, 12)}...${did.slice(-12)}`;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-card/80 mx-auto max-w-2xl backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive flex items-center justify-center gap-2">
              <XCircle className="h-6 w-6" />
              Error Loading User Details
            </CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-card/80 mx-auto max-w-2xl backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Shared User Details</CardTitle>
          <CardDescription>
            Verified credentials shared by the user
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-36" />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">
                  {userData?.sharedData.name || "Anonymous User"}
                </h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/90 hover:bg-primary px-3 py-1">
                    <Shield className="mr-2 h-3 w-3" />
                    Verified Identity
                  </Badge>
                </div>
              </>
            )}
          </div>

          <Separator />

          <div className="space-y-6">
            {isLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))
            ) : (
              <>
                {userData?.sharedData.name && (
                  <div className="flex items-start gap-3">
                    <User className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-muted-foreground text-sm">
                        {userData.sharedData.name}
                      </p>
                    </div>
                  </div>
                )}

                {userData?.sharedData.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Phone Number</p>
                      <p className="text-muted-foreground text-sm">
                        {userData.sharedData.phone}
                      </p>
                    </div>
                  </div>
                )}

                {userData?.sharedData.age !== undefined && (
                  <div className="flex items-start gap-3">
                    <Cake className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Age</p>
                      <p className="text-muted-foreground text-sm">
                        {userData.sharedData.age} years old
                      </p>
                    </div>
                  </div>
                )}

                {userData?.sharedData.address && (
                  <div className="flex items-start gap-3">
                    <Home className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-muted-foreground text-sm">
                        {userData.sharedData.address}
                      </p>
                    </div>
                  </div>
                )}

                {userData?.sharedData.aadharNumber && (
                  <div className="flex items-start gap-3">
                    <IdCard className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Aadhaar Number</p>
                      <p className="text-muted-foreground text-sm">
                        {userData.sharedData.aadharNumber}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-muted/5 mt-6 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-primary h-5 w-5" />
              <div>
                <h4 className="font-medium">Verified Credentials</h4>
                <p className="text-muted-foreground text-sm">
                  These details have been verified through the blockchain
                </p>
              </div>
            </div>
            <div className="text-muted-foreground mt-2 text-sm">
              Shared on: {new Date(userData?.timestamp || "").toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
