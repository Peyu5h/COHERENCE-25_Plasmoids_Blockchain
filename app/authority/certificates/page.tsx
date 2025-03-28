"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserRole } from "~/hooks/useUserRole";
import { useTransaction } from "~/hooks/useTransaction";
import RoleProtectedRoute from "~/components/RoleProtectedRoute";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  FileText,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
} from "lucide-react";
import { getIPFSGatewayURL } from "~/hooks/usePinata";
import axios from "axios";

type Certificate = {
  userAddress: string;
  authorityAddress: string;
  certificateId: string;
  issuanceDate: string;
  ipfsHash: string;
  metadataHash: string;
  certificateType: number;
  isVerified: boolean;
  timestamp: number;
  userName?: string;
};

export default function AuthorityCertificatesPage() {
  const { address, isConnected } = useAccount();
  const { role, isLoading: roleLoading } = useUserRole(address);
  const [pendingCertificates, setPendingCertificates] = useState<Certificate[]>(
    [],
  );
  const [verifiedCertificates, setVerifiedCertificates] = useState<
    Certificate[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("pending");

  const { writeAsync, isLoading: isActionLoading } = useTransaction({
    successMessage: "Certificate action completed successfully!",
    onSuccess: () => {
      loadCertificates();
      setSelectedCertificate(null);
    },
  });

  const certificateTypes = {
    0: "Income",
    1: "Address",
    2: "Identity",
    3: "Education",
    4: "Employment",
    5: "Other",
  };

  const loadCertificates = async () => {
    if (!isConnected || !address) return;

    try {
      setLoading(true);
      // temp data for now
      const mockPendingCertificates: Certificate[] = [
        {
          userAddress: "0x1234567890123456789012345678901234567890",
          authorityAddress: address as string,
          certificateId: "INC-2023-001",
          issuanceDate: "2023-05-15",
          ipfsHash: "QmZ9nkf4nKMZ7CSsfYy6gPcSLHhB5FxUvzUJzDnqbf8Uzn",
          metadataHash: "{}",
          certificateType: 0, // Income
          isVerified: false,
          timestamp: Date.now() - 500000,
        },
        {
          userAddress: "0x2345678901234567890123456789012345678901",
          authorityAddress: address as string,
          certificateId: "ID-2023-042",
          issuanceDate: "2023-06-22",
          ipfsHash: "QmZ9nkf4nKMZ7CSsfYy6gPcSLHhB5FxUvzUJzDnqbf8Uzn",
          metadataHash: "{}",
          certificateType: 2, // Identity
          isVerified: false,
          timestamp: Date.now() - 200000,
        },
      ];

      const mockVerifiedCertificates: Certificate[] = [
        {
          userAddress: "0x3456789012345678901234567890123456789012",
          authorityAddress: address as string,
          certificateId: "EDU-2023-007",
          issuanceDate: "2023-04-10",
          ipfsHash: "QmZ9nkf4nKMZ7CSsfYy6gPcSLHhB5FxUvzUJzDnqbf8Uzn",
          metadataHash: "{}",
          certificateType: 3, // Education
          isVerified: true,
          timestamp: Date.now() - 1000000,
        },
      ];

      setPendingCertificates(mockPendingCertificates);
      setVerifiedCertificates(mockVerifiedCertificates);

      // Load user names for all certificates
      const allCertificates = [
        ...mockPendingCertificates,
        ...mockVerifiedCertificates,
      ];
      const users = [
        ...new Set(allCertificates.map((cert) => cert.userAddress)),
      ];
      const userData: Record<string, string> = {};

      for (const user of users) {
        try {
          const response = await axios.get(`/api/user/${user}`);
          if (response.data && response.data.success) {
            userData[user] = response.data.data.name;
          }
        } catch (error) {
          console.error(`Failed to fetch user name for ${user}:`, error);
          userData[user] = "Unknown User";
        }
      }

      setUserNames(userData);
    } catch (error) {
      console.error("Error loading certificates:", error);
      setError("Failed to load certificates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      loadCertificates();
    }
  }, [isConnected, address]);

  const verifyCertificate = async (certificate: Certificate) => {
    if (!isConnected || !address) return;

    try {
      await writeAsync({
        address: userRegistryAddress,
        abi: userRegistryAbi,
        functionName: "verifyCertificate",
        args: [
          certificate.userAddress as `0x${string}`,
          certificate.certificateId,
        ],
      });
    } catch (error) {
      console.error("Error verifying certificate:", error);
    }
  };

  const rejectCertificate = async (
    certificate: Certificate,
    reason: string = "Rejected by authority",
  ) => {
    if (!isConnected || !address) return;

    try {
      await writeAsync({
        address: userRegistryAddress,
        abi: userRegistryAbi,
        functionName: "rejectCertificate",
        args: [
          certificate.userAddress as `0x${string}`,
          certificate.certificateId,
          reason,
        ],
      });
    } catch (error) {
      console.error("Error rejecting certificate:", error);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to manage certificates
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
    <RoleProtectedRoute requiredRole="authority">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Certificate Management</h1>
          <p className="text-gray-500">
            Verify and manage certificate requests
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              Pending Verification
              {pendingCertificates.length > 0 && (
                <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                  {pendingCertificates.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="verified">Verified Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : pendingCertificates.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <h3 className="mb-1 text-lg font-medium text-gray-900">
                      No Pending Certificates
                    </h3>
                    <p className="text-gray-500">
                      You have no certificate requests waiting for verification
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Certificate Requests</CardTitle>
                  <CardDescription>
                    Review and verify certificate requests from users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requester</TableHead>
                        <TableHead>Certificate Type</TableHead>
                        <TableHead>Certificate ID</TableHead>
                        <TableHead>Issued Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingCertificates.map((cert) => (
                        <TableRow
                          key={`${cert.userAddress}-${cert.certificateId}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {userNames[cert.userAddress]
                                    ?.substring(0, 2)
                                    .toUpperCase() || "UN"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {userNames[cert.userAddress] ||
                                    "Unknown User"}
                                </div>
                                <div className="w-32 truncate text-xs text-gray-500">
                                  {cert.userAddress}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {(certificateTypes as any)[
                                cert.certificateType
                              ] || "Unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>{cert.certificateId}</TableCell>
                          <TableCell>
                            {new Date(cert.issuanceDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    getIPFSGatewayURL(cert.ipfsHash),
                                    "_blank",
                                  )
                                }
                              >
                                <ExternalLink className="mr-1 h-4 w-4" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => verifyCertificate(cert)}
                                disabled={isActionLoading}
                              >
                                <CheckCircle className="mr-1 h-4 w-4" />
                                Verify
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-50"
                                onClick={() => rejectCertificate(cert)}
                                disabled={isActionLoading}
                              >
                                <XCircle className="mr-1 h-4 w-4" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verified">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : verifiedCertificates.length === 0 ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                    <h3 className="mb-1 text-lg font-medium text-gray-900">
                      No Verified Certificates
                    </h3>
                    <p className="text-gray-500">
                      You haven't verified any certificates yet
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Verified Certificates</CardTitle>
                  <CardDescription>
                    Certificates that you have previously verified
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {verifiedCertificates.map((cert) => (
                      <Card
                        key={`${cert.userAddress}-${cert.certificateId}`}
                        className="overflow-hidden"
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="mr-1 h-3 w-3" /> Verified
                            </Badge>
                            <Badge variant="outline">
                              {(certificateTypes as any)[
                                cert.certificateType
                              ] || "Unknown"}
                            </Badge>
                          </div>
                          <CardTitle className="mt-2 text-base">
                            Certificate #{cert.certificateId}
                          </CardTitle>
                          <CardDescription>
                            Issued:{" "}
                            {new Date(cert.issuanceDate).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="text-sm">
                            <div className="mb-1 text-gray-500">Issued To</div>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {userNames[cert.userAddress]
                                    ?.substring(0, 2)
                                    .toUpperCase() || "UN"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {userNames[cert.userAddress] || "Unknown User"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              window.open(
                                getIPFSGatewayURL(cert.ipfsHash),
                                "_blank",
                              )
                            }
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Certificate
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleProtectedRoute>
  );
}
