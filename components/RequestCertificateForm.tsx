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
import { Search, Upload, File, FileText } from "lucide-react";
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
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const { upload, isUploading } = usePinata();

  const { writeAsync, isLoading } = useTransaction({
    successMessage: "Certificate request submitted successfully!",
  });

  const certificateTypes = [
    { value: 0, label: "Income Certificate" },
    { value: 1, label: "Address Certificate" },
    { value: 2, label: "Identity Certificate" },
    { value: 3, label: "Education Certificate" },
    { value: 4, label: "Employment Certificate" },
    { value: 5, label: "Other Certificate" },
  ];

  const validationSchema = Yup.object({
    authorityAddress: Yup.string().required("Authority is required"),
    certificateId: Yup.string().required("Certificate ID is required"),
    issuanceDate: Yup.string().required("Issuance date is required"),
    certificateType: Yup.number().required("Certificate type is required"),
  });

  const formik = useFormik({
    initialValues: {
      authorityAddress: "",
      certificateId: "",
      issuanceDate: new Date().toISOString().split("T")[0],
      certificateType: 0,
      certificateDetails: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isConnected || !address || !selectedFile) {
        return;
      }

      setIsSubmitting(true);
      try {
        // Upload file to IPFS
        const ipfsUrl = await upload(selectedFile);

        if (!ipfsUrl) {
          throw new Error("Failed to upload file to IPFS");
        }

        // Create metadata for the certificate
        const metadata = {
          userAddress: address,
          authorityAddress: values.authorityAddress,
          certificateId: values.certificateId,
          issuanceDate: values.issuanceDate,
          certificateType: values.certificateType,
          details: values.certificateDetails,
          timestamp: Date.now(),
        };

        // Convert metadata to JSON string
        const metadataStr = JSON.stringify(metadata);
        // In a real app, we would upload this metadata to IPFS too
        // For simplicity, we'll just use it directly

        // Extract the hash from the IPFS URL
        const ipfsHash = ipfsUrl.split("/").pop() || "";

        await writeAsync({
          address: userRegistryAddress,
          abi: userRegistryAbi,
          functionName: "requestCertificate",
          args: [
            values.authorityAddress as `0x${string}`,
            values.certificateId,
            values.issuanceDate,
            ipfsHash,
            metadataStr,
            values.certificateType,
          ],
        });

        // Reset form after successful submission
        formik.resetForm();
        setSelectedFile(null);
        setFilePreview(null);
      } catch (error) {
        console.error("Certificate request error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchAuthorities = async () => {
    try {
      setIsSearching(true);
      const response = await axios.get(
        `/api/certificates/authorities/search?query=${searchQuery}`,
      );

      if (
        response.data &&
        response.data.success &&
        response.data.data.authorities
      ) {
        setAuthorities(response.data.data.authorities);
      } else {
        setAuthorities([]);
      }
    } catch (error) {
      console.error("Error searching authorities:", error);
      setAuthorities([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    // Load authorities when component mounts
    searchAuthorities();
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
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Authority Search */}
          <div className="space-y-2">
            <Label>Search Authority</Label>
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or department"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={searchAuthorities}
                disabled={isSearching}
              >
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
          </div>

          {/* Authority Selection */}
          <div className="space-y-2">
            <Label htmlFor="authorityAddress">Select Authority</Label>
            <Select
              name="authorityAddress"
              value={formik.values.authorityAddress}
              onValueChange={(value) =>
                formik.setFieldValue("authorityAddress", value)
              }
            >
              <SelectTrigger
                className={
                  formik.touched.authorityAddress &&
                  formik.errors.authorityAddress
                    ? "border-red-300"
                    : ""
                }
              >
                <SelectValue placeholder="Select an authority" />
              </SelectTrigger>
              <SelectContent>
                {authorities.length > 0 ? (
                  authorities.map((authority) => (
                    <SelectItem
                      key={authority.address}
                      value={authority.address}
                    >
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
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No authorities found
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {formik.touched.authorityAddress &&
              formik.errors.authorityAddress && (
                <p className="text-sm text-red-500">
                  {formik.errors.authorityAddress}
                </p>
              )}
          </div>

          {/* Certificate Type */}
          <div className="space-y-2">
            <Label htmlFor="certificateType">Certificate Type</Label>
            <Select
              name="certificateType"
              value={String(formik.values.certificateType)}
              onValueChange={(value) =>
                formik.setFieldValue("certificateType", Number(value))
              }
            >
              <SelectTrigger
                className={
                  formik.touched.certificateType &&
                  formik.errors.certificateType
                    ? "border-red-300"
                    : ""
                }
              >
                <SelectValue placeholder="Select certificate type" />
              </SelectTrigger>
              <SelectContent>
                {certificateTypes.map((type) => (
                  <SelectItem key={type.value} value={String(type.value)}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.certificateType &&
              formik.errors.certificateType && (
                <p className="text-sm text-red-500">
                  {formik.errors.certificateType}
                </p>
              )}
          </div>

          {/* Certificate ID */}
          <div className="space-y-2">
            <Label htmlFor="certificateId">Certificate ID</Label>
            <Input
              id="certificateId"
              name="certificateId"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.certificateId}
              className={
                formik.touched.certificateId && formik.errors.certificateId
                  ? "border-red-300"
                  : ""
              }
              placeholder="Enter the certificate ID"
            />
            {formik.touched.certificateId && formik.errors.certificateId && (
              <p className="text-sm text-red-500">
                {formik.errors.certificateId}
              </p>
            )}
          </div>

          {/* Issuance Date */}
          <div className="space-y-2">
            <Label htmlFor="issuanceDate">Issuance Date</Label>
            <Input
              id="issuanceDate"
              name="issuanceDate"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.issuanceDate}
              className={
                formik.touched.issuanceDate && formik.errors.issuanceDate
                  ? "border-red-300"
                  : ""
              }
            />
            {formik.touched.issuanceDate && formik.errors.issuanceDate && (
              <p className="text-sm text-red-500">
                {formik.errors.issuanceDate}
              </p>
            )}
          </div>

          {/* Certificate Details */}
          <div className="space-y-2">
            <Label htmlFor="certificateDetails">Certificate Details</Label>
            <Textarea
              id="certificateDetails"
              name="certificateDetails"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.certificateDetails}
              placeholder="Enter additional details about this certificate"
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="certificateFile">Upload Certificate Image</Label>
            <div className="flex cursor-pointer items-center justify-center rounded-md border-2 border-dashed p-6 transition-colors hover:bg-gray-50">
              <label
                htmlFor="certificateFile"
                className="flex cursor-pointer flex-col items-center space-y-2"
              >
                {filePreview ? (
                  <>
                    <div className="relative mb-2 h-40 w-full">
                      <img
                        src={filePreview}
                        alt="Certificate preview"
                        className="mx-auto h-full object-contain"
                      />
                    </div>
                    <div className="flex items-center text-sm text-blue-600">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{selectedFile?.name}</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Click to change file
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-400" />
                    <p className="text-sm font-medium">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or PDF (max. 10MB)
                    </p>
                  </>
                )}
                <input
                  id="certificateFile"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>
            {!selectedFile && (
              <p className="text-sm text-amber-600">
                A certificate image is required
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={
              isSubmitting ||
              isLoading ||
              isUploading ||
              !isConnected ||
              !selectedFile
            }
            className="w-full"
          >
            {isSubmitting || isLoading || isUploading ? (
              <>
                <span className="mr-2 animate-spin">
                  <Upload className="h-4 w-4" />
                </span>
                {isUploading ? "Uploading to IPFS..." : "Submitting Request..."}
              </>
            ) : (
              "Submit Certificate Request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
