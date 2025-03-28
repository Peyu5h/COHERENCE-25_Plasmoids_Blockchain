"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { UserRole } from "~/hooks/useUserRole";
import { useWalletMiddleware } from "~/hooks/useWalletMiddleware";
import { useUser } from "~/hooks/useUser";
import { format } from "date-fns";
import RoleProtectedRoute from "~/components/RoleProtectedRoute";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import {
  IdCard,
  Shield,
  FileText,
  Plus,
  QrCode,
  Download,
  ClipboardCopy,
  Clock,
  User,
  Mail,
  Phone,
  Home,
  Calendar,
  Share2,
  Cake,
  CheckCircle,
  FileCheck,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import CertificatesList from "~/components/CertificatesList";
import RequestCertificateForm from "~/components/RequestCertificateForm";
import { toast } from "sonner";
import { useUserCertificates } from "~/hooks/useCertificates";

export default function UserDashboard() {
  const { address } = useAccount();
  const { user, isLoading, age } = useUser(address);
  const { certificates, isLoading: isLoadingCertificates } =
    useUserCertificates(address);
  useWalletMiddleware();

  const [activeTab, setActiveTab] = useState("certificates");

  const [qrValue, setQrValue] = useState("");

  const [sharingPreferences, setSharingPreferences] = useState({
    fullName: true,
    phone: false,
    aadhar: true,
    age: true,
    address: false,
  });

  const toggleSharingPreference = (
    preference: keyof typeof sharingPreferences,
  ) => {
    setSharingPreferences((prev) => ({
      ...prev,
      [preference]: !prev[preference],
    }));
  };

  const generateShareableQR = () => {
    if (!user) return;

    const shareableData = {
      did: user.didAddress,
      timestamp: new Date().toISOString(),
      sharedData: {
        ...(sharingPreferences.fullName && { name: user.name }),
        ...(sharingPreferences.phone && { phone: user.phone }),
        ...(sharingPreferences.aadhar && { aadharNumber: user.aadharNumber }),
        ...(sharingPreferences.age && { age }),
        ...(sharingPreferences.address && { address: user.address }),
      },
    };

    const qrData = JSON.stringify(shareableData);
    setQrValue(
      `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrData)}&size=250x250`,
    );
    toast.success("QR code generated successfully");
  };

  const generateActivityData = () => {
    if (!certificates || certificates.length === 0) return [];

    const activityData = [];
    const authorityAddress = "0xD7f6b69d601A84F19971A91f25c2224A4e29a6ed";

    for (const cert of certificates) {
      activityData.push({
        id: `${cert.certificateId}-upload`,
        action: "Certificate Uploaded",
        details: `Certificate ID: ${cert.certificateId} - ${cert.certificateType} Certificate`,
        timestamp: new Date(Number(cert.timestamp) * 1000).toLocaleString(),
        status: "completed",
        icon: <UploadCloud className="text-primary h-5 w-5" />,
      });

      if (cert.isVerified) {
        activityData.push({
          id: `${cert.certificateId}-verified`,
          action: "Certificate Verified",
          details: `Certificate ID: ${cert.certificateId} was approved by authority (${authorityAddress.substring(0, 6)}...${authorityAddress.substring(authorityAddress.length - 4)})`,
          timestamp: new Date(
            Number(cert.timestamp) * 1000 + 3600000,
          ).toLocaleString(),
          status: "success",
          icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
        });
      } else {
        activityData.push({
          id: `${cert.certificateId}-pending`,
          action: "Verification Pending",
          details: `Certificate ID: ${cert.certificateId} is awaiting verification`,
          timestamp: new Date(
            Number(cert.timestamp) * 1000 + 1800000,
          ).toLocaleString(),
          status: "pending",
          icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
        });
      }
    }
    return activityData.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  };

  const activityData = generateActivityData();

  return (
    <RoleProtectedRoute requiredRole={UserRole.User}>
      <div className="from-background/40 to-background/60 flex h-screen flex-col overflow-hidden bg-gradient-to-b lg:flex-row">
        <div className="border-border/60 bg-background/80 hidden shrink-0 border-r pt-4 pl-8 backdrop-blur-sm lg:block lg:w-80 xl:w-96">
          <div className="flex h-full flex-col p-6">
            <div className="flex flex-col items-center justify-center space-y-4 pb-6">
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user?.name?.substring(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
              )}

              {isLoading ? (
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
                    Individual User
                  </Badge>
                </>
              )}
            </div>

            <Separator className="my-4" />

            <div className="flex-1 space-y-6 overflow-auto pr-2">
              {isLoading ? (
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
                    <Cake className="text-primary/70 mt-0.5 h-5 w-5" />
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
                    <IdCard className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Aadhaar Number</p>
                      <p className="text-muted-foreground text-sm">
                        {user?.aadharNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="text-primary/70 mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">DID Address</p>
                      <p className="text-muted-foreground text-sm">
                        {user?.didAddress}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="container mx-auto h-full w-full max-w-full p-4 sm:p-6 lg:p-8 xl:px-16 2xl:px-32">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Individual Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your digital identity and verified documents
                </p>
              </div>
              <div className="flex w-full justify-end sm:w-auto">
                <w3m-account-button />
              </div>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex h-[calc(100%-3.5rem)] flex-col"
            >
              <TabsList className="mb-6 grid w-full grid-cols-3">
                <TabsTrigger value="certificates">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">My Certificates</span>
                  <span className="sm:hidden">Certificates</span>
                </TabsTrigger>
                <TabsTrigger value="share">
                  <Share2 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Share Credentials</span>
                  <span className="sm:hidden">Share</span>
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Activity Log</span>
                  <span className="sm:hidden">Activity</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="certificates"
                className="scrollbar mb-8 h-full overflow-auto px-2 pb-6"
              >
                <div className="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <h2 className="text-xl font-semibold">
                    Your Certificates & Documents
                  </h2>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">
                          Register Certificate
                        </span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register New Certificate</DialogTitle>
                        <DialogDescription>
                          Upload a new certificate to be verified and stored on
                          the blockchain.
                        </DialogDescription>
                      </DialogHeader>
                      <RequestCertificateForm />
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent className="p-4 sm:p-6">
                    <CertificatesList />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="share" className="h-full overflow-auto pb-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card className="flex min-h-[600px] flex-col">
                    <CardHeader>
                      <CardTitle>Control Your Data Sharing</CardTitle>
                      <CardDescription>
                        Select which information you want to share when your QR
                        code is scanned
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Full Name</h4>
                          <p className="text-muted-foreground text-sm">
                            Share your legal name
                          </p>
                        </div>
                        <Switch
                          checked={sharingPreferences.fullName}
                          onCheckedChange={() =>
                            toggleSharingPreference("fullName")
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Phone Number</h4>
                          <p className="text-muted-foreground text-sm">
                            Share your contact number
                          </p>
                        </div>
                        <Switch
                          checked={sharingPreferences.phone}
                          onCheckedChange={() =>
                            toggleSharingPreference("phone")
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Age</h4>
                          <p className="text-muted-foreground text-sm">
                            Share your age (calculated from date of birth)
                          </p>
                        </div>
                        <Switch
                          checked={sharingPreferences.age}
                          onCheckedChange={() => toggleSharingPreference("age")}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Residential Address</h4>
                          <p className="text-muted-foreground text-sm">
                            Share your physical address
                          </p>
                        </div>
                        <Switch
                          checked={sharingPreferences.address}
                          onCheckedChange={() =>
                            toggleSharingPreference("address")
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="font-medium">Aadhaar Number</h4>
                          <p className="text-muted-foreground text-sm">
                            Share your identity number
                          </p>
                        </div>
                        <Switch
                          checked={sharingPreferences.aadhar}
                          onCheckedChange={() =>
                            toggleSharingPreference("aadhar")
                          }
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={generateShareableQR}
                        className="w-full"
                        disabled={isLoading || !user}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR Code
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="flex min-h-[600px] flex-col">
                    <CardHeader>
                      <CardTitle>Your Portable Digital ID</CardTitle>
                      <CardDescription>
                        Scan this QR code to share your selected identity
                        information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col items-center justify-center p-4 sm:p-6">
                      {qrValue ? (
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                          <img
                            src={qrValue}
                            alt="Your Digital ID QR Code"
                            className="h-48 w-48 object-contain sm:h-64 sm:w-64"
                          />
                        </div>
                      ) : (
                        <div className="border-muted flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed sm:h-64 sm:w-64">
                          <p className="text-muted-foreground p-4 text-center">
                            Select your sharing preferences and generate a QR
                            code
                          </p>
                        </div>
                      )}
                      <p className="text-muted-foreground mt-4 text-center text-sm">
                        Scan this QR code to share your selected identity
                        information
                      </p>
                    </CardContent>
                    <CardFooter className="flex flex-col justify-center gap-4 sm:flex-row">
                      <Button
                        variant="outline"
                        disabled={!qrValue}
                        onClick={() => window.open(qrValue || "", "_blank")}
                        className="w-full sm:w-auto"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        disabled={!qrValue}
                        onClick={() => {
                          navigator.clipboard.writeText(qrValue);
                          toast.success("QR code link copied to clipboard");
                        }}
                        className="w-full sm:w-auto"
                      >
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        Copy Link
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="activity"
                className="scrollbar h-full overflow-auto px-2 pb-6"
              >
                <Card className="border-muted/60 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                      Recent certificate and verification activities on your
                      account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[500px]">
                    <div className="space-y-6">
                      {isLoadingCertificates || isLoading ? (
                        Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <div key={i} className="flex">
                              <div className="mr-4 flex-shrink-0">
                                <Skeleton className="h-10 w-10 rounded-full" />
                              </div>
                              <div className="border-muted flex-grow border-l pb-6 pl-6">
                                <div className="-mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                  <Skeleton className="h-5 w-36" />
                                  <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="mt-2 h-4 w-full" />
                              </div>
                            </div>
                          ))
                      ) : activityData.length > 0 ? (
                        activityData.map((activity) => (
                          <div key={activity.id} className="group flex">
                            <div className="mr-4 flex-shrink-0">
                              <div
                                className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                                  activity.status === "success"
                                    ? "bg-emerald-50 group-hover:bg-emerald-100 dark:bg-emerald-950/20 dark:group-hover:bg-emerald-950/30"
                                    : activity.status === "pending"
                                      ? "bg-amber-50 group-hover:bg-amber-100 dark:bg-amber-950/20 dark:group-hover:bg-amber-950/30"
                                      : "bg-primary/10 group-hover:bg-primary/20"
                                }`}
                              >
                                {activity.icon}
                              </div>
                            </div>
                            <div className="border-muted flex-grow border-l pb-6 pl-6">
                              <div className="-mt-1 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <h3 className="text-foreground/90 group-hover:text-foreground font-medium">
                                  {activity.action}
                                </h3>
                                <time className="bg-muted/50 text-muted-foreground flex-none rounded-full px-2 py-0.5 text-xs">
                                  {activity.timestamp}
                                </time>
                              </div>
                              <p className="text-muted-foreground mt-1 text-sm">
                                {activity.details}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <FileCheck className="text-muted-foreground/40 mb-4 h-12 w-12" />
                          <h3 className="mb-2 text-lg font-medium">
                            No Activity Yet
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            Your activity history will appear here when you
                            upload certificates or have them verified by
                            authorities.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
