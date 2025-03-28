"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useUserRole, UserRole } from "~/hooks/useUserRole";
import { useTransaction } from "~/hooks/useTransaction";
import RoleProtectedRoute from "~/components/RoleProtectedRoute";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { FileText, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { getIPFSGatewayURL } from "~/hooks/usePinata";
import { toast } from "sonner";
import { useUserCertificates } from "~/hooks/useCertificates";

type Certificate = {
  userAddress: `0x${string}`;
  certificateId: string;
  issuanceDate: string;
  ipfsHash: string;
  certificateType: number;
  isVerified: boolean;
  timestamp: bigint;
  metadata: string;
};

export default function AuthorityDashboard() {
  const { address, isConnected } = useAccount();
  const { name, role, isLoading: roleLoading } = useUserRole(address);
  const [activeTab, setActiveTab] = useState("profile");
  const [processedCertificates, setProcessedCertificates] = useState<string[]>(
    [],
  );

  const { writeAsync, isLoading: isActionLoading } = useTransaction({
    successMessage: "Certificate action completed successfully!",
  });

  const {
    certificates,
    isLoading: isCertificatesLoading,
    error: certificatesError,
  } = useUserCertificates("0x1304865A3409A96abc5596C241f1572E1AAc0b87");

  const availableCertificates =
    certificates?.filter(
      (cert) =>
        !processedCertificates.includes(
          `${cert.userAddress}-${cert.certificateId}`,
        ),
    ) || [];

  const handleMockApprove = async (certificate: Certificate) => {
    try {
      await writeAsync({
        address: userRegistryAddress,
        abi: userRegistryAbi,
        functionName: "mockApproveCertificate",
        args: [certificate.userAddress, certificate.certificateId],
      });
      setProcessedCertificates((prev) => [
        ...prev,
        `${certificate.userAddress}-${certificate.certificateId}`,
      ]);
      toast.success("Certificate approved successfully!");
    } catch (error) {
      console.error("Error approving certificate:", error);
      toast.error("Failed to approve certificate");
    }
  };

  const handleMockReject = async (certificate: Certificate) => {
    try {
      await writeAsync({
        address: userRegistryAddress,
        abi: userRegistryAbi,
        functionName: "mockRejectCertificate",
        args: [
          certificate.userAddress,
          certificate.certificateId,
          "Certificate rejected by authority",
        ],
      });
      setProcessedCertificates((prev) => [
        ...prev,
        `${certificate.userAddress}-${certificate.certificateId}`,
      ]);
      toast.success("Certificate rejected successfully!");
    } catch (error) {
      console.error("Error rejecting certificate:", error);
      toast.error("Failed to reject certificate");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to access the authority dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (roleLoading || isCertificatesLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (certificatesError) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
            <CardDescription className="text-center">
              {certificatesError}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <RoleProtectedRoute requiredRole={UserRole.Authority}>
      <div className="container mx-auto max-w-4xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Authority Dashboard</h1>
          <Badge
            variant="outline"
            className="bg-purple-100 px-4 py-2 text-base text-purple-800 hover:bg-purple-100"
          >
            {roleLoading ? "Loading..." : `Welcome, ${name}`}
          </Badge>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="certificates">
              Certificates
              {availableCertificates.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  {availableCertificates.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
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
          </TabsContent>

          <TabsContent value="certificates">
            {availableCertificates.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <h3 className="mb-1 text-lg font-medium text-gray-900">
                      No Certificates Available
                    </h3>
                    <p className="text-gray-500">
                      You have no certificates to review at this time
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Certificate Requests</CardTitle>
                  <CardDescription>
                    Review and manage certificate requests from users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Address</TableHead>
                        <TableHead>Certificate ID</TableHead>
                        <TableHead>Issued Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableCertificates.map((cert) => {
                        const metadata = JSON.parse(cert.metadata);
                        return (
                          <TableRow
                            key={`${cert.userAddress}-${cert.certificateId}`}
                          >
                            <TableCell>
                              <div className="w-32 truncate font-mono text-sm">
                                {cert.userAddress}
                              </div>
                            </TableCell>
                            <TableCell>{cert.certificateId}</TableCell>
                            <TableCell>
                              {new Date(cert.issuanceDate).toLocaleDateString()}
                            </TableCell>
                            <TableCell>₹{metadata.amount}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {metadata.imageUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      window.open(
                                        getIPFSGatewayURL(metadata.imageUrl),
                                        "_blank",
                                      )
                                    }
                                  >
                                    <ExternalLink className="mr-1 h-4 w-4" />
                                    View
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleMockApprove(cert)}
                                  disabled={isActionLoading}
                                >
                                  <CheckCircle className="mr-1 h-4 w-4" />
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="bg-destructive hover:bg-destructive/80"
                                  onClick={() => handleMockReject(cert)}
                                  disabled={isActionLoading}
                                >
                                  <XCircle className="mr-1 h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
}
