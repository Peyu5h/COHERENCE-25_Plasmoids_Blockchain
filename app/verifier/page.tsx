"use client";

import { useAccount } from "wagmi";
import { useUserRole, UserRole } from "~/hooks/useUserRole";
import RoleProtectedRoute from "~/components/RoleProtectedRoute";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";

export default function VerifierDashboard() {
  const { address } = useAccount();
  const { name, isLoading } = useUserRole(address);

  return (
    <RoleProtectedRoute requiredRole={UserRole.Verifier}>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Verifier Dashboard</h1>
          <Badge
            variant="outline"
            className="bg-indigo-100 px-4 py-2 text-base text-indigo-800 hover:bg-indigo-100"
          >
            {isLoading ? "Loading..." : `Welcome, ${name}`}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Your verifier account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-indigo-200 text-indigo-800">
                    {name?.substring(0, 2).toUpperCase() || "VR"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium">{name || "Verifier"}</p>
                  <p className="text-muted-foreground truncate font-mono text-sm">
                    {address}
                  </p>
                  <Badge className="mt-2 bg-indigo-500 hover:bg-indigo-600">
                    Verifier
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification Operations</CardTitle>
              <CardDescription>Tools to verify identities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">Pending Verifications</h3>
                  <p className="text-muted-foreground text-sm">
                    You currently have no pending verification requests.
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h3 className="mb-2 font-semibold">Recent Activity</h3>
                  <p className="text-muted-foreground text-sm">
                    No recent verification activity to display.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Verification Guidelines</CardTitle>
              <CardDescription>
                Standards and procedures for identity verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <h3 className="mb-2 font-semibold">Verification Process</h3>
                  <p className="text-sm">
                    As a verifier, you are responsible for validating the
                    identity information provided by users and authorities.
                    Follow these guidelines to ensure proper verification:
                  </p>
                  <ul className="mt-2 list-inside list-disc text-sm">
                    <li>Verify government ID matches provided information</li>
                    <li>Ensure address documentation is current and valid</li>
                    <li>Check for any inconsistencies in provided data</li>
                    <li>Document all verification steps taken</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
