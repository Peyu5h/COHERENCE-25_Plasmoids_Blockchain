"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserRole, UserRole } from "~/hooks/useUserRole";
import { useUser } from "~/hooks/useUser";
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
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Switch = ({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: () => void;
}) => {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-primary" : "bg-muted"}`}
      onClick={onCheckedChange}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        className={`bg-background pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
};

const verificationHistory = [
  {
    id: 1,
    userId: "0x1234...7890",
    userName: "John Doe",
    verificationType: "Age Verification",
    condition: "Age > 21",
    result: "Verified",
    timestamp: "2023-10-15 14:30",
  },
  {
    id: 2,
    userId: "0x2345...8901",
    userName: "Jane Smith",
    verificationType: "Income Verification",
    condition: "Income > ₹500,000",
    result: "Failed",
    timestamp: "2023-10-14 11:20",
  },
  {
    id: 3,
    userId: "0x3456...9012",
    userName: "Alice Johnson",
    verificationType: "Location Verification",
    condition: "City = Mumbai",
    result: "Verified",
    timestamp: "2023-10-12 09:45",
  },
  {
    id: 4,
    userId: "0x4567...0123",
    userName: "Robert Williams",
    verificationType: "Education Verification",
    condition: "Degree = Bachelor's",
    result: "Verified",
    timestamp: "2023-10-10 16:15",
  },
];

export default function VerifierDashboard() {
  const { address, isConnected } = useAccount();
  const { name: roleName, role, isLoading: roleLoading } = useUserRole(address);
  const { user, isLoading: userLoading, age } = useUser(address);

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
  const [activeTab, setActiveTab] = useState("create");

  useEffect(() => {
    if (activeTab === "create") {
      generateQrCode();
    }
  }, [conditions, activeTab]);

  const generateQrCode = () => {
    const verificationData = {
      verifierId: address,
      timestamp: new Date().toISOString(),
      conditions: {
        ...(conditions.ageCheck && {
          age: {
            value: parseInt(conditions.ageValue),
            operator: conditions.ageOperator,
          },
        }),
        ...(conditions.incomeCheck && {
          income: {
            value: parseInt(conditions.incomeValue),
            operator: conditions.incomeOperator,
          },
        }),
        ...(conditions.cityCheck && {
          city: {
            value: conditions.cityValue,
            operator: "equals",
          },
        }),
        ...(conditions.educationCheck && {
          education: {
            value: conditions.educationValue,
            operator: "equals",
          },
        }),
      },
    };

    const qrData = JSON.stringify(verificationData);
    setGeneratedQrUrl(
      `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
        qrData,
      )}&size=200x200`,
    );
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
                    <Home className="text-primary/70 mt-0.5 h-12 w-12" />
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
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="age-check"
                                checked={conditions.ageCheck}
                                onCheckedChange={() =>
                                  handleToggleCondition("ageCheck")
                                }
                              />
                              <Label
                                htmlFor="age-check"
                                className="font-medium"
                              >
                                Age Verification
                              </Label>
                            </div>
                          </div>

                          {conditions.ageCheck && (
                            <div className="ml-7 grid grid-cols-2 gap-2">
                              <Select
                                value={conditions.ageOperator}
                                onValueChange={(value) =>
                                  handleInputChange("ageOperator", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="greaterThan">
                                    Greater Than ({">"})
                                  </SelectItem>
                                  <SelectItem value="lessThan">
                                    Less Than ({"<"})
                                  </SelectItem>
                                  <SelectItem value="equals">
                                    Equals (=)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                placeholder="Age"
                                value={conditions.ageValue}
                                onChange={(e) =>
                                  handleInputChange("ageValue", e.target.value)
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
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
                                Income Verification
                              </Label>
                            </div>
                          </div>

                          {conditions.incomeCheck && (
                            <div className="ml-7 grid grid-cols-2 gap-2">
                              <Select
                                value={conditions.incomeOperator}
                                onValueChange={(value) =>
                                  handleInputChange("incomeOperator", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="greaterThan">
                                    Greater Than ({">"})
                                  </SelectItem>
                                  <SelectItem value="lessThan">
                                    Less Than ({"<"})
                                  </SelectItem>
                                  <SelectItem value="equals">
                                    Equals (=)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                type="number"
                                placeholder="Income (₹)"
                                value={conditions.incomeValue}
                                onChange={(e) =>
                                  handleInputChange(
                                    "incomeValue",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="city-check"
                                checked={conditions.cityCheck}
                                onCheckedChange={() =>
                                  handleToggleCondition("cityCheck")
                                }
                              />
                              <Label
                                htmlFor="city-check"
                                className="font-medium"
                              >
                                City/Location Verification
                              </Label>
                            </div>
                          </div>

                          {conditions.cityCheck && (
                            <div className="ml-7">
                              <Input
                                type="text"
                                placeholder="City name"
                                value={conditions.cityValue}
                                onChange={(e) =>
                                  handleInputChange("cityValue", e.target.value)
                                }
                              />
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
                      <div className="text-muted-foreground text-center text-sm">
                        <p>
                          Users can scan this code to verify their credentials
                          against your specified conditions
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-center gap-4">
                      <Button
                        onClick={handleDownloadQR}
                        className="w-full"
                        disabled={!generatedQrUrl}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download QR Code
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
                    <div className="rounded-md border">
                      <div className="bg-muted/40 grid grid-cols-6 border-b p-4 font-medium">
                        <div className="col-span-2">User</div>
                        <div>Verification Type</div>
                        <div>Condition</div>
                        <div>Result</div>
                        <div>Date & Time</div>
                      </div>
                      <div className="divide-y">
                        {verificationHistory.map((record) => (
                          <div
                            key={record.id}
                            className="hover:bg-muted/30 grid grid-cols-6 items-center p-4 transition-colors"
                          >
                            <div className="col-span-2">
                              <div className="font-medium">
                                {record.userName}
                              </div>
                              <div className="text-muted-foreground text-sm">
                                {record.userId}
                              </div>
                            </div>
                            <div>{record.verificationType}</div>
                            <div>{record.condition}</div>
                            <div>
                              <Badge
                                variant={
                                  record.result === "Verified"
                                    ? "default"
                                    : "destructive"
                                }
                                className={
                                  record.result === "Verified"
                                    ? "bg-emerald-500 hover:bg-emerald-600"
                                    : ""
                                }
                              >
                                {record.result === "Verified" && (
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                )}
                                {record.result === "Failed" && (
                                  <XCircle className="mr-1 h-3 w-3" />
                                )}
                                {record.result}
                              </Badge>
                            </div>
                            <div className="text-sm">{record.timestamp}</div>
                          </div>
                        ))}
                      </div>
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
