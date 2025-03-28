"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAccount } from "wagmi";
import { useTransaction } from "~/hooks/useTransaction";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import { usePinata } from "~/hooks/usePinata";
import { useAllUsers } from "~/hooks/useAllUsers";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
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
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Upload } from "lucide-react";
import { cn } from "~/lib/utils";
import { Avatar } from "@radix-ui/react-avatar";
import { AvatarFallback } from "./ui/avatar";

export default function RequestCertificateForm() {
  const { address, isConnected } = useAccount();
  const { upload, isUploading } = usePinata();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const { writeAsync, isLoading } = useTransaction({
    successMessage: "Income certificate uploaded successfully!",
  });

  const validationSchema = Yup.object({
    certificateId: Yup.string().required("Certificate ID is required"),
    issuanceDate: Yup.date().required("Issuance date is required"),
    amount: Yup.number()
      .required("Amount is required")
      .positive("Amount must be positive")
      .integer("Amount must be a whole number"),
  });

  const formik = useFormik({
    initialValues: {
      certificateId: "",
      issuanceDate: new Date(),
      amount: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isConnected || !address) {
        alert("Please connect your wallet");
        return;
      }

      if (!file) {
        setFileError("Please upload an image");
        return;
      }

      try {
        const ipfsResult = await upload(file);
        if (!ipfsResult) {
          throw new Error("Failed to upload image");
        }

        const metadata = {
          amount: values.amount,
          currency: "INR",
          timestamp: new Date().toISOString(),
          imageUrl: ipfsResult,
        };

        const metadataStr = JSON.stringify(metadata);

        await writeAsync({
          address: userRegistryAddress,
          abi: userRegistryAbi,
          functionName: "uploadCertificate",
          args: [
            values.certificateId,
            format(values.issuanceDate, "yyyy-MM-dd"),
            ipfsResult,
            metadataStr,
          ],
        });

        formik.resetForm();
        setFile(null);
        setFilePreview(null);
      } catch (error) {
        console.error("Error uploading income certificate:", error);
      }
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFileError(null);

    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setFileError("File size exceeds 5MB limit");
        return;
      }

      if (!selectedFile.type.startsWith("image/")) {
        setFileError("Please upload an image file");
        return;
      }

      setFile(selectedFile);

      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };
  const { users, isLoading: isUsersLoading } = useAllUsers();

  return (
    <Card className="mx-auto w-full max-w-lg border-0">
      <CardHeader>
        <CardTitle className="text-center">Add Income Certificate</CardTitle>
        <CardDescription className="text-center">
          Enter your income certificate details
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="authorityAddress">Select Authority</Label>
            <Select>
              <SelectTrigger id="authorityAddress">
                <SelectValue placeholder="Select an authority" />
              </SelectTrigger>
              <SelectContent>
                {users.map((authority) => (
                  <SelectItem
                    key={authority.walletAddress}
                    value={authority.walletAddress}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {authority.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{authority.name}</span>
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
            <Label htmlFor="amount">Amount (in Rupees)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount in rupees"
              {...formik.getFieldProps("amount")}
            />
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-sm text-red-500">{formik.errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Upload Certificate Image</Label>
            <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer rounded-md font-medium text-blue-600 focus-within:outline-none hover:text-blue-500"
                  >
                    <span>Upload an image</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                {filePreview && (
                  <div className="mt-2">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="mx-auto h-32 w-auto object-contain"
                    />
                  </div>
                )}
                {fileError && (
                  <p className="text-sm text-red-500">{fileError}</p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isUploading || !isConnected}
          >
            {isLoading || isUploading
              ? "Uploading..."
              : "Upload Income Certificate"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
