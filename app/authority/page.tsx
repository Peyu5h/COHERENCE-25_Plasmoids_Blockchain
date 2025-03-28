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
import { CalendarIcon, ClipboardIcon, CheckCircleIcon } from "lucide-react";

export default function AuthorityDashboard() {
  const { address } = useAccount();
  const { name, isLoading } = useUserRole(address);

  return (
    <RoleProtectedRoute requiredRole={UserRole.Authority}>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Authority Dashboard</h1>
          <Badge
            variant="outline"
            className="bg-purple-100 px-4 py-2 text-base text-purple-800 hover:bg-purple-100"
          >
            {isLoading ? "Loading..." : `Welcome, ${name}`}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Your authority account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-purple-200 text-purple-800">
                    {name?.substring(0, 2).toUpperCase() || "AU"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium">{name || "Authority"}</p>
                  <p className="text-muted-foreground truncate font-mono text-sm">
                    {address}
                  </p>
                  <Badge className="mt-2 bg-purple-500 hover:bg-purple-600">
                    Authority
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authority Operations</CardTitle>
              <CardDescription>
                Tools and operations available to authorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                  variant="outline"
                  className="flex h-24 flex-col items-center justify-center gap-1 p-4"
                >
                  <ClipboardIcon className="h-5 w-5 text-purple-600" />
                  <span>Issue Certificate</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex h-24 flex-col items-center justify-center gap-1 p-4"
                >
                  <CheckCircleIcon className="h-5 w-5 text-purple-600" />
                  <span>Verify Document</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex h-24 flex-col items-center justify-center gap-1 p-4 sm:col-span-2"
                >
                  <CalendarIcon className="h-5 w-5 text-purple-600" />
                  <span>Schedule Verification</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* fetch here certificates */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Your recent authority activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* todo fetching api */}
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
