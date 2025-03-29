"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserRole, UserRole } from "~/hooks/useUserRole";
import { useUser } from "~/hooks/useUser";
import { pusherClient } from "~/lib/pusher";
import RoleProtectedRoute from "~/components/RoleProtectedRoute";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  BarChart3,
  FileCheck,
  QrCode,
  UserCheck,
  Clock,
  Filter,
  Sliders,
  Download,
  User,
  Phone,
  Home,
  Calendar,
  Shield,
  Briefcase,
  MapPin,
  CheckCircle,
  XCircle,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type VerificationHistoryItem = {
  id: string;
  userAddress: string;
  timestamp: string;
  success: boolean;
  proofs: {
    id: string;
    verificationType: string;
    condition: string;
    verified: boolean;
  }[];
};

export default function VerifierDashboard() {
  const { address, isConnected } = useAccount();
  const { name: roleName, role, isLoading: roleLoading } = useUserRole(address);
  const { user, isLoading: userLoading, age } = useUser(address);
  const [verificationHistory, setVerificationHistory] = useState<
    VerificationHistoryItem[]
  >([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [conditions, setConditions] = useState({
    ageCheck: true,
    ageValue: "18",
    ageOperator: "greaterThan",
    incomeCheck: false,
    incomeValue: "500000",
    incomeOperator: "greaterThan",
    cityCheck: false,
    cityValue: "",
    educationCheck: false,
    educationValue: "Bachelor's",
  });
  const [generatedQrUrl, setGeneratedQrUrl] = useState<string | null>(null);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("create");

  useEffect(() => {
    if (activeTab === "create") {
      generateQrCode();
    }
  }, [conditions, activeTab]);

  useEffect(() => {
    if (address && activeTab === "history") {
      fetchVerificationHistory();

      const channelName = `verifier-${address}`;
      const channel = pusherClient.subscribe(channelName);

      const handleNewVerification = (data: VerificationHistoryItem) => {
        console.log("Received new verification:", data);
        setVerificationHistory((prev) => [data, ...prev]);
        toast.success("New verification received");
      };

      channel.bind("new-verification", handleNewVerification);

      return () => {
        channel.unbind("new-verification", handleNewVerification);
        pusherClient.unsubscribe(channelName);
      };
    }
  }, [address, activeTab]);

  const generateQrCode = () => {
    const baseUrl = window.location.origin + "/verify";

    const params = new URLSearchParams();
    params.append("verifierId", address || "");

    if (conditions.ageCheck) {
      params.append("ageValue", conditions.ageValue);
      params.append("ageOperator", conditions.ageOperator);
    }

    if (conditions.incomeCheck) {
      params.append("incomeValue", conditions.incomeValue);
      params.append("incomeOperator", conditions.incomeOperator);
    }

    if (conditions.cityCheck && conditions.cityValue) {
      params.append("cityValue", conditions.cityValue);
    }

    if (conditions.educationCheck && conditions.educationValue) {
      params.append("educationValue", conditions.educationValue);
    }

    const verificationEndpoint = `${baseUrl}?${params.toString()}`;
    setVerificationUrl(verificationEndpoint);

    setGeneratedQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        verificationEndpoint,
      )}&size=200x200`,
    );
  };

  const fetchVerificationHistory = async () => {
    if (!address) return;

    setIsLoadingHistory(true);
    try {
      const response = await fetch(`/api/verify/history?verifierId=${address}`);
      const data = await response.json();

      if (data.success) {
        setVerificationHistory(data.data);
      } else {
        toast.error("Failed to load verification history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load verification history");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleToggleCondition = (condition: string) => {
    setConditions({
      ...conditions,
      [condition]: !conditions[condition as keyof typeof conditions],
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setConditions({
      ...conditions,
      [field]: value,
    });
  };

  const handleDownloadQR = () => {
    if (generatedQrUrl) {
      const link = document.createElement("a");
      link.href = generatedQrUrl;
      link.download = "verification-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("QR code downloaded successfully");
    }
  };

  const copyVerificationUrl = () => {
    if (verificationUrl) {
      navigator.clipboard.writeText(verificationUrl);
      toast.success("Verification URL copied to clipboard");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-center">Connect Wallet</CardTitle>
            <CardDescription className="text-center">
              Please connect your wallet to access the verifier dashboard
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <w3m-account-button />
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isLoading = roleLoading || userLoading;

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

  function formatDID(did: string) {
    if (!did) return "";
    return `${did.slice(0, 12)}...${did.slice(-12)}`;
  }

  const renderOperatorText = (operator: string) => {
    switch (operator) {
      case "greaterThan":
        return "Greater Than (>)";
      case "lessThan":
        return "Less Than (<)";
      case "equals":
        return "Equals (=)";
      default:
        return operator;
    }
  };

  return (
    <RoleProtectedRoute requiredRole={UserRole.Verifier}>
      <div className="from-background/40 to-background/60 flex h-screen flex-col overflow-hidden bg-gradient-to-b lg:flex-row">
        <div className="border-border/60 bg-background/80 hidden shrink-0 border-r pt-4 pl-8 backdrop-blur-sm lg:block lg:w-80 xl:w-96">
          <div className="flex h-full flex-col p-6">
            <div className="flex flex-col items-center justify-center space-y-4 pb-6">
              {userLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "Verifier"}`}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {user?.name?.substring(0, 2).toUpperCase() || "VR"}
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
                    Verifier
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
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="container h-full w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Verifier Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  Create verification requests and manage verification history
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
              <TabsList className="mb-6 grid w-full grid-cols-2">
                <TabsTrigger value="create">
                  <QrCode className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Create Verification</span>
                  <span className="sm:hidden">Create</span>
                </TabsTrigger>
                <TabsTrigger value="history">
                  <Clock className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Verification History</span>
                  <span className="sm:hidden">History</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="create"
                className="scrollbar h-full overflow-auto pb-6"
              >
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Card className="flex min-h-[600px] flex-col">
                    <CardHeader>
                      <CardTitle>Verification Conditions</CardTitle>
                      <CardDescription>
                        Set the conditions for credential verification
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-6">
                      <div className="bg-muted/5 rounded-md border p-4">
                        <h3 className="mb-4 flex items-center gap-2 font-medium">
                          <UserCheck className="text-primary h-4 w-4" />
                          Age Verification
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="age-check"
                              checked={conditions.ageCheck}
                              onCheckedChange={() =>
                                handleToggleCondition("ageCheck")
                              }
                            />
                            <Label htmlFor="age-check" className="font-medium">
                              Enable Age Verification
                            </Label>
                          </div>

                          {conditions.ageCheck && (
                            <div className="bg-background border-border/30 mt-4 ml-0 grid grid-cols-2 gap-3 rounded-md border p-3">
                              <div className="space-y-2">
                                <Label htmlFor="age-operator">Condition</Label>
                                <Select
                                  value={conditions.ageOperator}
                                  onValueChange={(value) =>
                                    handleInputChange("ageOperator", value)
                                  }
                                >
                                  <SelectTrigger id="age-operator">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="greaterThan">
                                      Greater Than {">"}
                                    </SelectItem>
                                    <SelectItem value="lessThan">
                                      Less Than {"<"}
                                    </SelectItem>
                                    <SelectItem value="equals">
                                      Equals {" = "}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="age-value">Age (Years)</Label>
                                <Input
                                  id="age-value"
                                  type="number"
                                  placeholder="Age"
                                  value={conditions.ageValue}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "ageValue",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-muted/5 rounded-md border p-4">
                        <h3 className="mb-4 flex items-center gap-2 font-medium">
                          <FileCheck className="text-primary h-4 w-4" />
                          Income Verification
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="income-check"
                              checked={conditions.incomeCheck}
                              onCheckedChange={() =>
                                handleToggleCondition("incomeCheck")
                              }
                            />
                            <Label
                              htmlFor="income-check"
                              className="font-medium"
                            >
                              Enable Income Verification
                            </Label>
                          </div>

                          {conditions.incomeCheck && (
                            <div className="bg-background border-border/30 mt-4 ml-0 grid grid-cols-2 gap-3 rounded-md border p-3">
                              <div className="space-y-2">
                                <Label htmlFor="income-operator">
                                  Condition
                                </Label>
                                <Select
                                  value={conditions.incomeOperator}
                                  onValueChange={(value) =>
                                    handleInputChange("incomeOperator", value)
                                  }
                                >
                                  <SelectTrigger id="income-operator">
                                    <SelectValue placeholder="Select" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="greaterThan">
                                      Greater Than {">"}
                                    </SelectItem>
                                    <SelectItem value="lessThan">
                                      Less Than {"<"}
                                    </SelectItem>
                                    <SelectItem value="equals">
                                      Equals {" = "}
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="income-value">Income (₹)</Label>
                                <Input
                                  id="income-value"
                                  type="number"
                                  placeholder="Income"
                                  value={conditions.incomeValue}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "incomeValue",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-muted/5 rounded-md border p-4">
                        <h3 className="mb-4 flex items-center gap-2 font-medium">
                          <MapPin className="text-primary h-4 w-4" />
                          Location Verification
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="city-check"
                              checked={conditions.cityCheck}
                              onCheckedChange={() =>
                                handleToggleCondition("cityCheck")
                              }
                            />
                            <Label htmlFor="city-check" className="font-medium">
                              Enable Location Verification
                            </Label>
                          </div>

                          {conditions.cityCheck && (
                            <div className="bg-background border-border/30 mt-4 ml-0 rounded-md border p-3">
                              <div className="space-y-2">
                                <Label htmlFor="city-value">City Name</Label>
                                <Input
                                  id="city-value"
                                  type="text"
                                  placeholder="e.g. Mumbai"
                                  value={conditions.cityValue}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "cityValue",
                                      e.target.value,
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="flex min-h-[600px] flex-col">
                    <CardHeader>
                      <CardTitle>Generated QR Code</CardTitle>
                      <CardDescription>
                        Share this QR code for verification
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-grow flex-col items-center justify-center space-y-6">
                      {generatedQrUrl ? (
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                          <img
                            src={generatedQrUrl}
                            alt="Verification QR Code"
                            className="h-48 w-48"
                          />
                        </div>
                      ) : (
                        <div className="border-muted flex h-48 w-48 items-center justify-center rounded-lg border border-dashed text-center">
                          <p className="text-muted-foreground text-sm">
                            Set conditions to generate QR
                          </p>
                        </div>
                      )}

                      <div className="w-full space-y-4">
                        <div className="text-muted-foreground text-center text-sm">
                          <p>
                            Users can scan this code to verify their credentials
                            without revealing personal data
                          </p>
                        </div>

                        <div className="bg-muted/5 rounded-md border p-3">
                          <h4 className="text-muted-foreground mb-2 text-xs font-medium">
                            VERIFICATION REQUIREMENTS
                          </h4>
                          <div className="space-y-2">
                            {conditions.ageCheck && (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-background"
                                >
                                  Age{" "}
                                  {renderOperatorText(conditions.ageOperator)}{" "}
                                  {conditions.ageValue}
                                </Badge>
                              </div>
                            )}

                            {conditions.incomeCheck && (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-background"
                                >
                                  Income{" "}
                                  {renderOperatorText(
                                    conditions.incomeOperator,
                                  )}{" "}
                                  ₹{conditions.incomeValue}
                                </Badge>
                              </div>
                            )}

                            {conditions.cityCheck && conditions.cityValue && (
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="bg-background"
                                >
                                  Location: {conditions.cityValue}
                                </Badge>
                              </div>
                            )}

                            {!conditions.ageCheck &&
                              !conditions.incomeCheck &&
                              (!conditions.cityCheck ||
                                !conditions.cityValue) && (
                                <div className="text-muted-foreground text-sm">
                                  No verification conditions set
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="grid grid-cols-2 flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={handleDownloadQR}
                        className="w-full"
                        disabled={!generatedQrUrl}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download QR
                      </Button>

                      <Button
                        variant="outline"
                        onClick={copyVerificationUrl}
                        className="w-full"
                        disabled={!verificationUrl}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Copy Verify URL
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent
                value="history"
                className="h-full overflow-auto pb-6"
              >
                <Card className="border-muted/60 bg-card/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Verification History</CardTitle>
                    <CardDescription>
                      Recent verification requests and their results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-h-[500px]">
                    {isLoadingHistory ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-muted/40 h-16 animate-pulse rounded-md"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-hidden rounded-md border">
                        <div className="bg-muted/40 grid grid-cols-6 border-b p-4 font-medium">
                          <div className="col-span-2">User</div>
                          <div>Verification Type</div>
                          <div>Condition</div>
                          <div>Result</div>
                          <div>Date & Time</div>
                        </div>
                        <div className="divide-y">
                          {verificationHistory.map((record) =>
                            record.proofs.map((proof) => (
                              <div
                                key={proof.id}
                                className="hover:bg-muted/30 grid grid-cols-6 items-center p-4 transition-colors"
                              >
                                <div className="col-span-2">
                                  <div className="text-muted-foreground text-sm">
                                    {record.userAddress}
                                  </div>
                                </div>
                                <div>{proof.verificationType}</div>
                                <div>{proof.condition}</div>
                                <div>
                                  <Badge
                                    variant={
                                      proof.verified ? "default" : "destructive"
                                    }
                                    className={
                                      proof.verified
                                        ? "bg-emerald-500 hover:bg-emerald-600"
                                        : ""
                                    }
                                  >
                                    {proof.verified ? (
                                      <CheckCircle className="mr-1 h-3 w-3" />
                                    ) : (
                                      <XCircle className="mr-1 h-3 w-3" />
                                    )}
                                    {proof.verified ? "Verified" : "Failed"}
                                  </Badge>
                                </div>
                                <div className="text-sm">
                                  {format(new Date(record.timestamp), "PPp")}
                                </div>
                              </div>
                            )),
                          )}

                          {verificationHistory.length === 0 && (
                            <div className="text-muted-foreground p-8 text-center">
                              No verification history found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
