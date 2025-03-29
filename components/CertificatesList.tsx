"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTransaction } from "~/hooks/useTransaction";
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
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { CheckCircle, XCircle, ExternalLink, Edit } from "lucide-react";
import { useUserRole } from "~/hooks/useUserRole";
import {
  useUserCertificates,
  useAllCertificates,
} from "~/hooks/useCertificates";
import { getIPFSGatewayURL } from "~/hooks/usePinata";
import { Skeleton } from "~/components/ui/skeleton";
import { FileText } from "lucide-react";
import UpdateCertificateForm from "~/components/UpdateCertificateForm";

export default function CertificatesList({
  userAddress,
}: {
  userAddress?: string;
}) {
  const { address: connectedAddress } = useAccount();
  const { role } = useUserRole(connectedAddress);
  const [selectedTab, setSelectedTab] = useState("all");
  const [isUpdateCertificateOpen, setIsUpdateCertificateOpen] = useState(false);
  const [selectedCertificateIndex, setSelectedCertificateIndex] =
    useState<number>(0);

  const { writeAsync, isLoading: isActionLoading } = useTransaction({
    successMessage: "Certificate action completed successfully!",
    onSuccess: () => {
      refetchCertificates();
    },
  });

  const {
    certificates: userCertificates,
    isLoading: isUserCertLoading,
    error: userCertError,
    refetchCertificates,
  } = useUserCertificates(userAddress || connectedAddress);

  const {
    certificates: allCertificates,
    isLoading: isAllCertLoading,
    error: allCertError,
  } = useUserCertificates();

  const certificates = role === 2 ? allCertificates : userCertificates;
  const isLoading = role === 2 ? isAllCertLoading : isUserCertLoading;
  const error = role === 2 ? allCertError : userCertError;

  const handleMockApprove = async (certificate: any) => {
    try {
      await writeAsync({
        address: userRegistryAddress,
        abi: userRegistryAbi,
        functionName: "mockApproveCertificate",
        args: [certificate.userAddress, certificate.certificateId],
      });
    } catch (error) {
      console.error("Error approving certificate:", error);
    }
  };

  const handleMockReject = async (certificate: any) => {
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
    } catch (error) {
      console.error("Error rejecting certificate:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-lg border p-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-8 text-center">
        <XCircle className="mx-auto mb-2 h-10 w-10 text-red-500" />
        <p className="font-medium text-red-700">{error}</p>
      </div>
    );
  }

  if (!certificates || certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="text-muted-foreground/40 mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-medium">No Certificates Found</h3>
        <p className="text-muted-foreground text-sm">
          You haven&apos;t uploaded any certificates yet. Click the button above
          to add your first certificate.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All Certificates</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates
              ?.filter((cert) => {
                if (selectedTab === "verified") return cert.isVerified;
                if (selectedTab === "pending") return !cert.isVerified;
                return true;
              })
              .map((certificate, index) => {
                const metadata = JSON.parse(certificate.metadata);
                return (
                  <Card
                    key={`${certificate.certificateId}-${certificate.timestamp}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between"></div>
                      <CardTitle className="text-lg">
                        Income Certificate
                      </CardTitle>
                      <CardDescription>
                        ID: {certificate.certificateId}
                        <br />
                        Issued:{" "}
                        {new Date(
                          certificate.issuanceDate,
                        ).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-gray-500">Amount:</span>
                          <span className="ml-2 font-medium">
                            ₹{metadata.amount}
                          </span>
                        </div>
                        {metadata.imageUrl && (
                          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                            <img
                              src={getIPFSGatewayURL(metadata.imageUrl)}
                              alt="Certificate"
                              className="h-full w-full object-cover"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-12"
                              onClick={() => {
                                setSelectedCertificateIndex(index);
                                setIsUpdateCertificateOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() =>
                                window.open(
                                  getIPFSGatewayURL(metadata.imageUrl),
                                  "_blank",
                                )
                              }
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>

                    {role === 2 && !certificate.isVerified && (
                      <CardFooter className="flex gap-2">
                        <Button
                          onClick={() => handleMockApprove(certificate)}
                          disabled={isActionLoading}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleMockReject(certificate)}
                          disabled={isActionLoading}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>

      {isUpdateCertificateOpen && (
        <UpdateCertificateForm
          isOpen={isUpdateCertificateOpen}
          onClose={() => setIsUpdateCertificateOpen(false)}
          certificateIndex={selectedCertificateIndex}
        />
      )}
    </div>
  );
}
