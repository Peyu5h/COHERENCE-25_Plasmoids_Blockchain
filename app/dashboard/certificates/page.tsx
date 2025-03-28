"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useUserRole } from "~/hooks/useUserRole";
import RoleProtectedRoute from "~/components/RoleProtectedRoute";
import CertificatesList from "~/components/CertificatesList";
import RequestCertificateForm from "~/components/RequestCertificateForm";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { FileText, Plus } from "lucide-react";

export default function CertificatesPage() {
  const { address, isConnected } = useAccount();
  const { role, isLoading: roleLoading } = useUserRole(address);
  const [activeTab, setActiveTab] = useState<string>("view");

  if (!isConnected) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to view your certificates
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (roleLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <RoleProtectedRoute requiredRole="user">
      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Digital Certificates</h1>
            <p className="text-gray-500">
              Manage and request your digital identity certificates
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "view" ? "default" : "outline"}
              onClick={() => setActiveTab("view")}
            >
              <FileText className="mr-2 h-4 w-4" />
              View Certificates
            </Button>
            <Button
              variant={activeTab === "request" ? "default" : "outline"}
              onClick={() => setActiveTab("request")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Request Certificate
            </Button>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-8"
        >
          <TabsContent value="view" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your Certificates</CardTitle>
                <CardDescription>
                  View and manage all your digital certificates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificatesList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request">
            <RequestCertificateForm />
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
}
