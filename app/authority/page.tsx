"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserRole, UserRole } from "~/hooks/useUserRole";
import { useTransaction } from "~/hooks/useTransaction";
import { useUser } from "~/hooks/useUser";
import RoleProtectedRoute from "~/components/RoleProtectedRoute";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
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
  Shield,
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Briefcase,
  MapPin,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";
import { getIPFSGatewayURL } from "~/hooks/usePinata";
import { toast } from "sonner";
import { useUserCertificates } from "~/hooks/useCertificates";
import { format } from "date-fns";

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
  const { user, isLoading: userLoading, age } = useUser(address);
  const { name: roleName, role, isLoading: roleLoading } = useUserRole(address);

  const [processedCertificates, setProcessedCertificates] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("processedCertificates");
      if (saved) {
        setProcessedCertificates(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading from localStorage:", e);
    }
  }, []);

  useEffect(() => {
    if (Object.keys(processedCertificates).length > 0) {
      localStorage.setItem(
        "processedCertificates",
        JSON.stringify(processedCertificates),
      );
    }
  }, [processedCertificates]);

  const { writeAsync, isLoading: isActionLoading } = useTransaction({
    successMessage: "Certificate action completed successfully!",
  });

  const addressOfUser = "0x1304865A3409A96abc5596C241f1572E1AAc0b87";

  const {
    certificates: allCertificates,
    isLoading: isCertificatesLoading,
    error: certificatesError,
    refetchCertificates,
  } = useUserCertificates(addressOfUser);

  const availableCertificates =
    allCertificates?.filter(
      (cert) =>
        !processedCertificates[`${cert.userAddress}-${cert.certificateId}`],
    ) || [];

  const handleMockApprove = async (certificate: Certificate) => {
    try {
      await writeAsync({
        address: userRegistryAddress,
        abi: userRegistryAbi,
        functionName: "mockApproveCertificate",
        args: [certificate.userAddress, certificate.certificateId],
      });

      setProcessedCertificates((prev) => ({
        ...prev,
        [`${certificate.userAddress}-${certificate.certificateId}`]: true,
      }));

      toast.success("Certificate approved successfully!");
      refetchCertificates();
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

      setProcessedCertificates((prev) => ({
        ...prev,
        [`${certificate.userAddress}-${certificate.certificateId}`]: true,
      }));

      toast.success("Certificate rejected successfully!");
      refetchCertificates();
    } catch (error) {
      console.error("Error rejecting certificate:", error);
      toast.error("Failed to reject certificate");
    }
  };

  const clearProcessedHistory = () => {
    setProcessedCertificates({});
    localStorage.removeItem("processedCertificates");
    toast.success("Processed history cleared!");
    refetchCertificates();
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
          <CardFooter className="flex justify-center">
            <w3m-account-button />
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isLoading = roleLoading || isCertificatesLoading || userLoading;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
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

  function formatDID(did: string) {
    if (!did) return "";
    return `${did.slice(0, 12)}...${did.slice(-12)}`;
  }

  return (
    <RoleProtectedRoute requiredRole={UserRole.Authority}>
      <div className="from-background/40 to-background/60 flex h-screen flex-col overflow-hidden bg-gradient-to-b lg:flex-row">
        <div className="border-border/60 bg-background/80 hidden shrink-0 border-r pt-4 pl-8 backdrop-blur-sm lg:block lg:w-80 xl:w-96">
          <div className="flex h-full flex-col p-6">
            <div className="flex flex-col items-center justify-center space-y-4 pb-6">
              {userLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Authority"}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user?.name?.substring(0, 2).toUpperCase() || "AU"}
                  </AvatarFallback>
                </Avatar>
              )}

              {userLoading ? (
                <>
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-36" />
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground text-center text-sm break-all">
                    {user?.walletAddress}
                  </p>
                  <Badge className="bg-primary/90 hover:bg-primary px-3 py-1">
                    Authority
                  </Badge>
                </>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex-1 space-y-6 overflow-auto pr-2">
              {userLoading ? (
                Array(6)
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
                  <div className="flex items-start gap-3">
                    <User className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Full Name</p>
                      <p className="text-muted-foreground text-sm">
                        {user?.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-muted-foreground text-sm">
                        {user?.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-muted-foreground text-sm">
                        {user?.dob
                          ? format(new Date(user.dob), "PPP")
                          : "Not provided"}
                        {age !== undefined && ` (${age} years)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Home className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-muted-foreground text-sm">
                        {user?.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">DID Address</p>
                      <p className="text-muted-foreground text-sm">
                        {user?.didAddress
                          ? formatDID(user.didAddress)
                          : "Not available"}{" "}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Department</p>
                      <p className="text-muted-foreground text-sm">
                        Income Tax Department
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="container h-full w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="mt-4 mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Authority Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage certificate verifications and approvals
                </p>
              </div>
              <div className="flex w-full justify-end sm:w-auto">
                <w3m-account-button />
              </div>
            </div>

            <div className="h-[calc(100%-3.5rem)] overflow-auto pb-6">
              <div className="mb-4 flex flex-row items-center justify-between">
                <h2 className="text-xl font-semibold">Certificate Requests</h2>
                <Button
                  variant="outline"
                  onClick={clearProcessedHistory}
                  className="text-sm"
                >
                  <RefreshCcw />
                </Button>
              </div>

              <Card className="border-muted/60 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Pending Certificate Requests</CardTitle>
                  <CardDescription>
                    Review and approve or reject certificate requests from users
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[500px]">
                  {availableCertificates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="text-muted-foreground/40 mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-medium">
                        No Pending Certificates
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        There are no pending certificates to review at this
                        time.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Certificate ID</TableHead>
                            <TableHead>Issued Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {availableCertificates.map((cert) => {
                            try {
                              const metadata = JSON.parse(
                                cert.metadata || "{}",
                              );
                              const uniqueKey = `${cert.userAddress}-${cert.certificateId}-${cert.timestamp}`;

                              return (
                                <TableRow key={uniqueKey}>
                                  <TableCell>
                                    <div className="w-32 truncate font-mono text-sm">
                                      {cert.userAddress}
                                    </div>
                                  </TableCell>
                                  <TableCell>{cert.certificateId}</TableCell>
                                  <TableCell>
                                    {new Date(
                                      cert.issuanceDate,
                                    ).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    ₹{metadata.amount || "N/A"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      {metadata.imageUrl && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            window.open(
                                              getIPFSGatewayURL(
                                                metadata.imageUrl,
                                              ),
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
                            } catch (e) {
                              console.error("Error parsing metadata:", e);
                              return null;
                            }
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
