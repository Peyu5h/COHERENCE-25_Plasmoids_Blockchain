"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserRole, UserRole } from "~/hooks/useUserRole";
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
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
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
} from "lucide-react";

// Create Switch component
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
      className={`relative inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${checked ? "bg-indigo-500" : "bg-slate-200"}`}
      onClick={onCheckedChange}
    >
      <span
        data-state={checked ? "checked" : "unchecked"}
        className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
};

// Mock verification history data
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

// Mock certificate templates
const certificateTemplates = [
  {
    id: 1,
    name: "Age Verification",
    description: "Verify if a user is above a specified age",
    conditions: ["age"],
  },
  {
    id: 2,
    name: "Income Verification",
    description: "Verify if a user's income is above a specified amount",
    conditions: ["income"],
  },
  {
    id: 3,
    name: "Location Verification",
    description: "Verify if a user lives in a specific city or region",
    conditions: ["city"],
  },
  {
    id: 4,
    name: "Education Verification",
    description: "Verify if a user has a specific educational qualification",
    conditions: ["education"],
  },
];

export default function VerifierDashboard() {
  const { address } = useAccount();
  const { name, isLoading } = useUserRole(address);

  // States for QR code generation
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
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

  // Update QR code when conditions change
  useEffect(() => {
    if (activeTab === "create") {
      generateQrCode();
    }
  }, [conditions, activeTab]);

  // Generate QR code
  const generateQrCode = () => {
    // Create the verification request data
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

    // Generate a data URL for the QR code
    // In a real application, this would likely be done server-side
    // Here we're just encoding the JSON data
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

  return (
    <RoleProtectedRoute requiredRole={UserRole.Verifier}>
      <div className="p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Verifier Dashboard</h1>
          <Badge
            variant="outline"
            className="bg-indigo-100 px-4 py-2 text-base text-indigo-800 hover:bg-indigo-100"
          >
            {isLoading ? "Loading..." : `Welcome, ${name}`}
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Your verifier account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-indigo-200 text-indigo-800">
                    {name?.substring(0, 2).toUpperCase() || "VR"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-medium">{name || "Verifier"}</p>
                  <p className="text-muted-foreground truncate font-mono text-sm">
                    {address}
                  </p>
                  <Badge className="mt-2 bg-indigo-500 hover:bg-indigo-600">
                    Verifier
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Verification Dashboard</CardTitle>
              <CardDescription>
                Create verification QR codes and view verification history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue="create"
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">
                    <QrCode className="mr-2 h-4 w-4" />
                    Create Verification QR
                  </TabsTrigger>
                  <TabsTrigger value="history">
                    <Clock className="mr-2 h-4 w-4" />
                    Verification History
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Verification Conditions</CardTitle>
                        <CardDescription>
                          Set the conditions for verification
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
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
                              <Label htmlFor="age-check">
                                Age Verification
                              </Label>
                            </div>
                          </div>

                          {conditions.ageCheck && (
                            <div className="ml-6 grid grid-cols-2 gap-2">
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
                              <Label htmlFor="income-check">
                                Income Verification
                              </Label>
                            </div>
                          </div>

                          {conditions.incomeCheck && (
                            <div className="ml-6 grid grid-cols-2 gap-2">
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
                              <Label htmlFor="city-check">
                                City/Location Verification
                              </Label>
                            </div>
                          </div>

                          {conditions.cityCheck && (
                            <div className="ml-6">
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

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="education-check"
                                checked={conditions.educationCheck}
                                onCheckedChange={() =>
                                  handleToggleCondition("educationCheck")
                                }
                              />
                              <Label htmlFor="education-check">
                                Education Verification
                              </Label>
                            </div>
                          </div>

                          {conditions.educationCheck && (
                            <div className="ml-6">
                              <Select
                                value={conditions.educationValue}
                                onValueChange={(value) =>
                                  handleInputChange("educationValue", value)
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Education Level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="High School">
                                    High School
                                  </SelectItem>
                                  <SelectItem value="Bachelors">
                                    Bachelor&apos;s Degree
                                  </SelectItem>
                                  <SelectItem value="Masters">
                                    Master&apos;s Degree
                                  </SelectItem>
                                  <SelectItem value="PhD">PhD</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Generated QR Code</CardTitle>
                        <CardDescription>
                          Share this QR code for verification
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center space-y-4">
                        {generatedQrUrl ? (
                          <div className="rounded-lg bg-white p-4">
                            <img
                              src={generatedQrUrl}
                              alt="Verification QR Code"
                              className="h-48 w-48"
                            />
                          </div>
                        ) : (
                          <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed border-gray-300">
                            <p className="text-muted-foreground text-sm">
                              Set conditions to generate QR
                            </p>
                          </div>
                        )}
                        <div className="text-muted-foreground text-center text-sm">
                          <p>
                            Users can scan this code to verify their credentials
                          </p>
                          <p>against your specified conditions</p>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-center">
                        <Button
                          variant="outline"
                          disabled={!generatedQrUrl}
                          onClick={() =>
                            window.open(generatedQrUrl || "", "_blank")
                          }
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download QR Code
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="history">
                  <Card>
                    <CardHeader>
                      <CardTitle>Verification History</CardTitle>
                      <CardDescription>
                        Recent verifications performed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                              className="grid grid-cols-6 items-center p-4"
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
                                >
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
            </CardContent>
          </Card>
        </div>
      </div>
    </RoleProtectedRoute>
  );
}
