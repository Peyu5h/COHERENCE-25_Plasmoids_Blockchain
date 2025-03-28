"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAccount } from "wagmi";
import { useTransaction } from "~/hooks/useTransaction";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import { usePinata } from "~/hooks/usePinata";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { Search, Upload, CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import axios from "axios";

type Authority = {
  address: string;
  name: string;
  department: string;
  location: string;
  isVerified: boolean;
};

export default function RequestCertificateForm() {
  const { address, isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const { upload, isUploading } = usePinata();

  const { writeAsync, isLoading } = useTransaction({
    successMessage: "Certificate requested successfully!",
  });

  const validationSchema = Yup.object({
    authorityAddress: Yup.string().required("Please select an authority"),
    certificateType: Yup.string().required("Please select certificate type"),
    certificateId: Yup.string().required("Certificate ID is required"),
    issuanceDate: Yup.date().required("Issuance date is required"),
    details: Yup.string().required("Certificate details are required"),
  });

  const formik = useFormik({
    initialValues: {
      authorityAddress: "",
      certificateType: "",
      certificateId: "",
      issuanceDate: new Date(),
      details: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!file) {
        setFileError("Please upload a certificate document");
        return;
      }

      if (!isConnected || !address) {
        alert("Please connect your wallet");
        return;
      }

      try {
        setIsSubmitting(true);

        // Upload the document to IPFS
        const ipfsResult = await upload(file);

        if (!ipfsResult) {
          throw new Error("Failed to upload to IPFS");
        }

        // Create metadata
        const metadata = {
          userAddress: address,
          authorityAddress: values.authorityAddress,
          certificateType: values.certificateType,
          certificateId: values.certificateId,
          issuanceDate: format(values.issuanceDate, "yyyy-MM-dd"),
          details: values.details,
          documentIpfsHash: ipfsResult.split("/").pop() || "",
          timestamp: new Date().toISOString(),
        };

        const metadataStr = JSON.stringify(metadata);

        await writeAsync({
          address: userRegistryAddress,
          abi: userRegistryAbi,
          functionName: "requestCertificate",
          args: [
            values.authorityAddress as `0x${string}`,
            values.certificateId,
            format(values.issuanceDate, "yyyy-MM-dd"),
            ipfsResult.split("/").pop() || "",
            metadataStr,
            parseInt(values.certificateType),
          ],
        });

        formik.resetForm();
        setFile(null);
        setFilePreview(null);
      } catch (error) {
        console.error("Error submitting certificate request:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const searchAuthorities = async (query: string) => {
    try {
      const response = await axios.get("/api/certificates/authorities", {
        params: { query },
      });

      if (response.data && response.data.success) {
        setAuthorities(response.data.data || []);
      } else {
        setAuthorities([
          {
            address: "0x1234567890123456789012345678901234567890",
            name: "Department of Education",
            department: "Education",
            location: "City Center",
            isVerified: true,
          },
          {
            address: "0x2345678901234567890123456789012345678901",
            name: "Income Tax Office",
            department: "Finance",
            location: "Downtown",
            isVerified: true,
          },
          {
            address: "0x3456789012345678901234567890123456789012",
            name: "Municipal Corporation",
            department: "City Administration",
            location: "Civic Center",
            isVerified: true,
          },
        ]);
      }
    } catch (error) {
      console.error("Error searching authorities:", error);
      setAuthorities([]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);

    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError("File size exceeds 5MB limit");
        return;
      }

      setFile(selectedFile);

      // Create a preview for image files
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  useEffect(() => {
    // Load initial set of authorities when component mounts
    searchAuthorities("");
  }, []);

  return (
    <Card className="mx-auto w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-center">Request Certificate</CardTitle>
        <CardDescription className="text-center">
          Fill in the details to request a certificate from an authority
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Search Authority</Label>
            <div className="relative">
              <Input
                placeholder="Search by name or address"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchAuthorities(e.target.value);
                }}
                className="pr-10"
              />
              <Search className="absolute top-2.5 right-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorityAddress">Select Authority</Label>
            <Select
              value={formik.values.authorityAddress}
              onValueChange={(value) => {
                formik.setFieldValue("authorityAddress", value);
              }}
            >
              <SelectTrigger id="authorityAddress">
                <SelectValue placeholder="Select an authority" />
              </SelectTrigger>
              <SelectContent>
                {authorities.map((authority) => (
                  <SelectItem key={authority.address} value={authority.address}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {authority.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{authority.name}</span>
                      {authority.department && (
                        <span className="text-xs text-gray-500">
                          ({authority.department})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.authorityAddress &&
              formik.errors.authorityAddress && (
                <p className="text-sm text-red-500">
                  {formik.errors.authorityAddress}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificateType">Certificate Type</Label>
            <Select
              value={formik.values.certificateType}
              onValueChange={(value) => {
                formik.setFieldValue("certificateType", value);
              }}
            >
              <SelectTrigger id="certificateType">
                <SelectValue placeholder="Select certificate type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Income Certificate</SelectItem>
                <SelectItem value="1">Address Proof</SelectItem>
                <SelectItem value="2">Identity Certificate</SelectItem>
                <SelectItem value="3">Education Certificate</SelectItem>
                <SelectItem value="4">Employment Certificate</SelectItem>
                <SelectItem value="5">Other</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.certificateType &&
              formik.errors.certificateType && (
                <p className="text-sm text-red-500">
                  {formik.errors.certificateType}
                </p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificateId">Certificate ID</Label>
            <Input
              id="certificateId"
              placeholder="Enter certificate ID"
              {...formik.getFieldProps("certificateId")}
            />
            {formik.touched.certificateId && formik.errors.certificateId && (
              <p className="text-sm text-red-500">
                {formik.errors.certificateId}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuanceDate">Issuance Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="issuanceDate"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formik.values.issuanceDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formik.values.issuanceDate ? (
                    format(formik.values.issuanceDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formik.values.issuanceDate}
                  onSelect={(date) => {
                    if (date) formik.setFieldValue("issuanceDate", date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formik.touched.issuanceDate && formik.errors.issuanceDate && (
              <p className="text-sm text-red-500">
                {String(formik.errors.issuanceDate)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Certificate Details</Label>
            <Textarea
              id="details"
              placeholder="Provide additional details about the certificate"
              rows={4}
              {...formik.getFieldProps("details")}
            />
            {formik.touched.details && formik.errors.details && (
              <p className="text-sm text-red-500">{formik.errors.details}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-upload">Upload Certificate Document</Label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="document-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 focus-within:outline-none hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="document-upload"
                      name="document-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF, DOC up to 5MB
                </p>
                {file && (
                  <p className="text-sm text-green-600">
                    Selected: {file.name}
                  </p>
                )}
                {filePreview && (
                  <div className="mt-2">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="mx-auto h-32 w-auto object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
            {fileError && <p className="text-sm text-red-500">{fileError}</p>}
          </div>

          <Button
            type="button"
            className="w-full"
            disabled={isSubmitting}
            onClick={() => formik.handleSubmit()}
          >
            {isSubmitting ? "Submitting..." : "Request Certificate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
