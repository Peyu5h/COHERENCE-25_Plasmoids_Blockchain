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
import { Button } from "~/components/ui/button";
import { IdCardIcon, ShieldIcon, FileTextIcon } from "lucide-react";

export default function UserDashboard() {
  const { address } = useAccount();
  const { name, isLoading } = useUserRole(address);

  return (
    <RoleProtectedRoute requiredRole={UserRole.User}>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Dashboard</h1>
          <Badge
            variant="outline"
            className="bg-blue-100 px-4 py-2 text-base text-blue-800 hover:bg-blue-100"
          >
            {isLoading ? "Loading..." : `Welcome, ${name}`}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-blue-200 text-blue-800">
                    {name?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium">{name || "User"}</p>
                  <p className="text-muted-foreground truncate font-mono text-sm">
                    {address}
                  </p>
                  <Badge className="mt-2 bg-blue-500 hover:bg-blue-600">
                    User
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Digital Identity</CardTitle>
              <CardDescription>Manage your digital identity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="flex h-24 flex-col items-center justify-center gap-1 p-4"
                >
                  <IdCardIcon className="h-5 w-5 text-blue-600" />
                  <span>View ID</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex h-24 flex-col items-center justify-center gap-1 p-4"
                >
                  <ShieldIcon className="h-5 w-5 text-blue-600" />
                  <span>Privacy Settings</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex h-24 flex-col items-center justify-center gap-1 p-4 sm:col-span-2"
                >
                  <FileTextIcon className="h-5 w-5 text-blue-600" />
                  <span>Request Certificate</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Certificates & Documents</CardTitle>
              <CardDescription>
                Your verified documents and certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4">
                <p className="text-muted-foreground text-center text-sm">
                  You don&apos;t have any verified documents or certificates
                  yet.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
