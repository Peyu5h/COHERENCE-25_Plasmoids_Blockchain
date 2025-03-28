"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import axios from "axios";
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
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  FileText,
  Download,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { getIPFSGatewayURL } from "~/hooks/usePinata";

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
  authorityName?: string;
};

export default function CertificatesList({
  userAddress,
}: {
  userAddress?: string;
}) {
  const { address: connectedAddress } = useAccount();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("all");
  const [authorityNames, setAuthorityNames] = useState<Record<string, string>>(
    {},
  );

  const targetAddress = userAddress || connectedAddress;

  const certificateTypes = {
    0: "Income",
    1: "Address",
    2: "Identity",
    3: "Education",
    4: "Employment",
    5: "Other",
  };

  const loadCertificates = async () => {
    if (!targetAddress) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/certificates/${targetAddress}`);

      if (response.data && response.data.success) {
        setCertificates(response.data.data.certificates || []);

        const authorities = [
          ...new Set(
            response.data.data.certificates.map(
              (cert: Certificate) => cert.authorityAddress,
            ),
          ),
        ];
        const authorityData: Record<string, string> = {};

        for (const authority of authorities) {
          try {
            const authResponse = await axios.get(`/api/user/${authority}`);
            if (authResponse.data && authResponse.data.success) {
              authorityData[authority] = authResponse.data.data.name;
            }
          } catch (error) {
            console.error(
              `Failed to fetch authority name for ${authority}:`,
              error,
            );
            authorityData[authority] = "Unknown Authority";
          }
        }

        setAuthorityNames(authorityData);
      } else {
        setCertificates([]);
        setError("Failed to load certificates");
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
      setError("Failed to load certificates. Please try again.");
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetAddress) {
      loadCertificates();
    }
  }, [targetAddress]);

  const getFilteredCertificates = () => {
    if (selectedTab === "all") return certificates;
    if (selectedTab === "verified")
      return certificates.filter((cert) => cert.isVerified);
    if (selectedTab === "pending")
      return certificates.filter((cert) => !cert.isVerified);

    const typeNumber = parseInt(selectedTab, 10);
    return certificates.filter((cert) => cert.certificateType === typeNumber);
  };

  const downloadCertificate = (ipfsHash: string, certificateId: string) => {
    const url = getIPFSGatewayURL(ipfsHash);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-8 text-center">
        <XCircle className="mx-auto mb-2 h-10 w-10 text-red-500" />
        <p className="font-medium text-red-700">{error}</p>
        <Button onClick={loadCertificates} variant="outline" className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const filteredCertificates = getFilteredCertificates();

  return (
    <div className="space-y-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Certificates</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="0">Income</TabsTrigger>
          <TabsTrigger value="2">Identity</TabsTrigger>
          <TabsTrigger value="3">Education</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          {filteredCertificates.length === 0 ? (
            <div className="rounded-md bg-gray-50 p-8 text-center">
              <FileText className="mx-auto mb-2 h-10 w-10 text-gray-400" />
              <p className="font-medium text-gray-600">No certificates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredCertificates.map((certificate) => (
                <Card
                  key={`${certificate.certificateId}-${certificate.timestamp}`}
                  className="overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge
                        className={
                          certificate.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {certificate.isVerified ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" /> Verified
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" /> Pending
                          </>
                        )}
                      </Badge>
                      <Badge variant="outline">
                        {(certificateTypes as any)[
                          certificate.certificateType
                        ] || "Unknown"}
                      </Badge>
                    </div>
                    <CardTitle className="mt-2 text-lg">
                      Certificate #{certificate.certificateId}
                    </CardTitle>
                    <CardDescription>
                      Issued on{" "}
                      {new Date(certificate.issuanceDate).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm">
                        <div className="mb-1 text-gray-500">Authority</div>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {authorityNames[certificate.authorityAddress]
                                ?.substring(0, 2)
                                .toUpperCase() || "AU"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate font-medium">
                            {authorityNames[certificate.authorityAddress] ||
                              "Unknown Authority"}
                          </span>
                        </div>
                      </div>

                      {certificate.ipfsHash && (
                        <div className="rounded-md bg-gray-50 p-2 text-sm">
                          <div className="truncate text-gray-500">
                            IPFS: {certificate.ipfsHash.substring(0, 15)}...
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2 pt-0">
                    <Button
                      onClick={() =>
                        downloadCertificate(
                          certificate.ipfsHash,
                          certificate.certificateId,
                        )
                      }
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      View Document
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2"
                      onClick={() =>
                        window.open(
                          getIPFSGatewayURL(certificate.ipfsHash),
                          "_blank",
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
