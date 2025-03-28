"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
  Shield,
  FileCheck,
} from "lucide-react";

type VerificationData = {
  verifierId: string;
  conditions: {
    age?: {
      value: number;
      operator: string;
    };
    income?: {
      value: number;
      operator: string;
    };
    city?: {
      value: string;
      operator: string;
    };
    education?: {
      value: string;
      operator: string;
    };
  };
};

type VerificationResult = {
  success: boolean;
  results: {
    age?: {
      verified: boolean;
      proof: string;
    };
    income?: {
      verified: boolean;
      proof: string;
    };
    city?: {
      verified: boolean;
      proof: string;
    };
    education?: {
      verified: boolean;
      proof: string;
    };
  };
  userAddress: string;
  verifierId: string;
  timestamp: string;
};

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const [userAddress, setUserAddress] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verificationData: VerificationData = {
    verifierId: searchParams.get("verifierId") || "",
    conditions: {},
  };

  const autoAddress = searchParams.get("address");

  useEffect(() => {
    if (autoAddress && autoAddress.startsWith("0x")) {
      setUserAddress(autoAddress);
      handleVerify(autoAddress);
    }
  }, [autoAddress]);

  //pasrsing age
  if (searchParams.get("ageValue") && searchParams.get("ageOperator")) {
    verificationData.conditions.age = {
      value: parseInt(searchParams.get("ageValue") || "0"),
      operator: searchParams.get("ageOperator") || "greaterThan",
    };
  }

  //parsing income
  if (searchParams.get("incomeValue") && searchParams.get("incomeOperator")) {
    verificationData.conditions.income = {
      value: parseInt(searchParams.get("incomeValue") || "0"),
      operator: searchParams.get("incomeOperator") || "greaterThan",
    };
  }

  //parsing city
  if (searchParams.get("cityValue")) {
    verificationData.conditions.city = {
      value: searchParams.get("cityValue") || "",
      operator: "equals",
    };
  }

  //todo education
  // if (searchParams.get("educationValue")) {
  //   verificationData.conditions.education = {
  //     value: searchParams.get("educationValue") || "",
  //     operator: "equals",
  //   };
  // }

  const handleVerify = async (addressToVerify?: string) => {
    const targetAddress = addressToVerify || userAddress;

    if (!targetAddress || !targetAddress.startsWith("0x")) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    if (!verificationData.verifierId) {
      toast.error("Invalid verification request");
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress: targetAddress,
          verifierId: verificationData.verifierId,
          conditions: verificationData.conditions,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Verification failed");
        toast.error("Verification failed");
      } else {
        setVerificationResult(data.data);
        toast.success("Verification completed");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred during verification");
      toast.error("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  const renderOperator = (operator: string) => {
    switch (operator) {
      case "greaterThan":
        return ">";
      case "lessThan":
        return "<";
      case "equals":
        return "=";
      default:
        return operator;
    }
  };

  const renderRequirements = () => {
    const conditions = verificationData.conditions;
    const requirements = [];

    if (conditions.age) {
      requirements.push(
        <li key="age">
          Age {renderOperator(conditions.age.operator)} {conditions.age.value}
        </li>,
      );
    }

    if (conditions.income) {
      requirements.push(
        <li key="income">
          Income {renderOperator(conditions.income.operator)} ₹
          {conditions.income.value}
        </li>,
      );
    }

    if (conditions.city) {
      requirements.push(<li key="city">Location: {conditions.city.value}</li>);
    }

    if (conditions.education) {
      requirements.push(
        <li key="education">Education: {conditions.education.value}</li>,
      );
    }

    return requirements.length ? (
      <ul className="list-disc space-y-1 pl-5">{requirements}</ul>
    ) : (
      <p className="text-muted-foreground">
        No verification requirements specified
      </p>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Credential Verification</CardTitle>
            <CardDescription>
              Verify your credentials without revealing personal information
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
              <h3 className="mb-2 flex items-center font-medium">
                <Shield className="text-primary mr-2 h-4 w-4" />
                Verification Requirements
              </h3>
              {renderRequirements()}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userAddress">Your Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="userAddress"
                    placeholder="0x..."
                    value={userAddress}
                    onChange={(e) => setUserAddress(e.target.value)}
                    disabled={isVerifying}
                  />
                  <Button
                    onClick={() => handleVerify()}
                    disabled={isVerifying || !userAddress}
                  >
                    {isVerifying ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Verifying
                      </>
                    ) : (
                      "Verify"
                    )}
                  </Button>
                </div>
                {autoAddress && (
                  <p className="text-muted-foreground mt-2 text-sm">
                    Auto-verifying address: {autoAddress}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive flex items-start rounded-md p-3">
                  <AlertCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0" />
                  <div>{error}</div>
                </div>
              )}
            </div>

            {verificationResult && (
              <div className="space-y-6">
                <Separator />

                <div>
                  <h3 className="mb-2 flex items-center text-lg font-medium">
                    <FileCheck className="text-primary mr-2 h-5 w-5" />
                    Verification Results
                  </h3>

                  <div className="overflow-hidden rounded-md border">
                    <div className="bg-muted grid grid-cols-3 border-b p-3 font-medium">
                      <div>Requirement</div>
                      <div>Status</div>
                      <div>Proof</div>
                    </div>

                    <div className="divide-y">
                      {verificationResult.results.age && (
                        <div className="grid grid-cols-3 items-center p-3">
                          <div>Age Requirement</div>
                          <div>
                            {verificationResult.results.age.verified ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </div>
                          <div
                            className="truncate font-mono text-xs"
                            title={verificationResult.results.age.proof}
                          >
                            {verificationResult.results.age.proof.substring(
                              0,
                              18,
                            )}
                            ...
                          </div>
                        </div>
                      )}

                      {verificationResult.results.income && (
                        <div className="grid grid-cols-3 items-center p-3">
                          <div>Income Requirement</div>
                          <div>
                            {verificationResult.results.income.verified ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </div>
                          <div
                            className="truncate font-mono text-xs"
                            title={verificationResult.results.income.proof}
                          >
                            {verificationResult.results.income.proof.substring(
                              0,
                              18,
                            )}
                            ...
                          </div>
                        </div>
                      )}

                      {verificationResult.results.city && (
                        <div className="grid grid-cols-3 items-center p-3">
                          <div>Location Requirement</div>
                          <div>
                            {verificationResult.results.city.verified ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </div>
                          <div
                            className="truncate font-mono text-xs"
                            title={verificationResult.results.city.proof}
                          >
                            {verificationResult.results.city.proof.substring(
                              0,
                              18,
                            )}
                            ...
                          </div>
                        </div>
                      )}

                      {verificationResult.results.education && (
                        <div className="grid grid-cols-3 items-center p-3">
                          <div>Education Requirement</div>
                          <div>
                            {verificationResult.results.education.verified ? (
                              <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Failed
                              </Badge>
                            )}
                          </div>
                          <div
                            className="truncate font-mono text-xs"
                            title={verificationResult.results.education.proof}
                          >
                            {verificationResult.results.education.proof.substring(
                              0,
                              18,
                            )}
                            ...
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 space-y-2 rounded-md border p-4">
                  <div className="flex items-center">
                    <div
                      className={
                        verificationResult.success
                          ? "text-emerald-500"
                          : "text-destructive"
                      }
                    >
                      {verificationResult.success ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <XCircle className="h-6 w-6" />
                      )}
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium">
                        {verificationResult.success
                          ? "All requirements verified successfully!"
                          : "Some requirements could not be verified"}
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        Verification ID:{" "}
                        {verificationResult.timestamp.substring(0, 10)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="text-muted-foreground flex justify-center text-sm">
            <div className="max-w-md text-center">
              This verification uses privacy-preserving zero-knowledge proofs.
              Your personal data remains private.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
