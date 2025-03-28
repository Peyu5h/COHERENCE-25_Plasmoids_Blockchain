"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { UserRole, useUserRole } from "~/hooks/useUserRole";
import RoleProtectedRoute from "~/components/RoleProtectedRoute";
import { useTransaction } from "~/hooks/useTransaction";
import { useAllUsers } from "~/hooks/useAllUsers";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "~/components/ui/table";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { toast } from "sonner";

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { role, isLoading: roleLoading } = useUserRole(address);
  const { users, isLoading: usersLoading, refetchUsers } = useAllUsers();
  const [activeTab, setActiveTab] = useState("all");

  if (roleLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  const getRoleText = (roleValue: number) => {
    switch (roleValue) {
      case 0:
        return "User";
      case 1:
        return "Authority";
      case 2:
        return "Verifier";
      case 3:
        return "Admin";
      default:
        return "Unknown";
    }
  };

  const getRoleBadge = (roleValue: number) => {
    let className = "";
    const text = getRoleText(roleValue);

    switch (roleValue) {
      case 0:
        className = "bg-blue-100 text-blue-800";
        break;
      case 1:
        className = "bg-purple-100 text-purple-800";
        break;
      case 2:
        className = "bg-indigo-100 text-indigo-800";
        break;
      case 3:
        className = "bg-red-100 text-red-800";
        break;
      default:
        className = "bg-gray-100 text-gray-800";
    }

    return <Badge className={className}>{text}</Badge>;
  };

  const filteredUsers = users.filter((user) => {
    if (activeTab === "all") return true;
    if (activeTab === "users") return user.role === 0;
    if (activeTab === "authorities") return user.role === 1;
    if (activeTab === "verifiers") return user.role === 2;
    if (activeTab === "admins") return user.role === 3;
    return true;
  });

  return (
    <RoleProtectedRoute requiredRole={UserRole.Admin}>
      <div className="container mx-auto py-8">
        <Card className="mb-8 bg-white">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Admin Dashboard
                </CardTitle>
                <CardDescription>Manage users and assign roles</CardDescription>
              </div>
              <Badge variant="outline" className="px-4 py-2">
                Admin Panel
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="authorities">Authorities</TabsTrigger>
            <TabsTrigger value="verifiers">Verifiers</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>
                  {activeTab === "all"
                    ? "All Users"
                    : activeTab === "users"
                      ? "Regular Users"
                      : activeTab === "authorities"
                        ? "Authority Users"
                        : activeTab === "verifiers"
                          ? "Verifier Users"
                          : "Admin Users"}
                </CardTitle>
                <CardDescription>
                  {usersLoading
                    ? "Loading users..."
                    : `${filteredUsers.length} ${activeTab === "all" ? "total users" : activeTab} found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    No users found in this category
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Wallet Address</TableHead>
                          <TableHead>Role</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.walletAddress}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback>
                                    {user.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-sm text-gray-500">
                                    {user.mobileNumber}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {`${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}`}
                            </TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
}
