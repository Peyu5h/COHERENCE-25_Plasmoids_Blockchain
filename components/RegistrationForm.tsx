"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useTransaction } from "~/hooks/useTransaction";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import { cn } from "~/lib/utils";
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

interface RegistrationFormProps {
  formType: "user" | "authority" | "verifier";
}

export default function RegistrationForm({ formType }: RegistrationFormProps) {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { writeAsync, isLoading } = useTransaction({
    successMessage: `${
      formType === "user"
        ? "User"
        : formType === "authority"
          ? "Authority"
          : "Verifier"
    } registration successful!`,
    onSuccess: () => {
      if (formType === "user") {
        router.push("/dashboard");
      } else if (formType === "authority") {
        router.push("/authority");
      } else if (formType === "verifier") {
        router.push("/verifier");
      }
    },
  });

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required"),
    dob: Yup.string().required("Date of birth is required"),
    gender: Yup.string().required("Gender is required"),
    address: Yup.string().required("Address is required"),
    mobileNumber: Yup.string()
      .required("Mobile number is required")
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(10, "Must be at least 10 digits"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      dob: "",
      gender: "",
      address: "",
      mobileNumber: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!isConnected || !address) {
        return;
      }

      setIsSubmitting(true);
      try {
        let functionName = "";
        if (formType === "user") {
          functionName = "registerUser";
        } else if (formType === "authority") {
          functionName = "registerAuthority";
        } else if (formType === "verifier") {
          functionName = "registerVerifier";
        }

        await writeAsync({
          address: userRegistryAddress,
          abi: userRegistryAbi,
          functionName,
          args: [
            values.name,
            values.dob,
            values.gender,
            values.address,
            values.mobileNumber,
          ],
          _meta: {
            successMessage: `${
              formType === "user"
                ? "User"
                : formType === "authority"
                  ? "Authority"
                  : "Verifier"
            } registration successful!`,
          },
        });
      } catch (error) {
        console.error("Registration error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const roleColors = {
    user: "bg-blue-50 border-blue-200",
    authority: "bg-purple-50 border-purple-200",
    verifier: "bg-indigo-50 border-indigo-200",
  };

  return (
    <Card className={cn("mx-auto w-full max-w-md", roleColors[formType])}>
      <CardHeader>
        <CardTitle className="text-center capitalize">
          {formType} Registration
        </CardTitle>
        <CardDescription className="text-center">
          Complete the form below to register your {formType} account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              className={cn(
                formik.touched.name && formik.errors.name
                  ? "border-red-300 focus-visible:ring-red-300"
                  : "",
              )}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-sm text-red-500">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.dob}
              className={cn(
                formik.touched.dob && formik.errors.dob
                  ? "border-red-300 focus-visible:ring-red-300"
                  : "",
              )}
            />
            {formik.touched.dob && formik.errors.dob && (
              <p className="text-sm text-red-500">{formik.errors.dob}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              name="gender"
              onValueChange={(value) => formik.setFieldValue("gender", value)}
              defaultValue={formik.values.gender}
            >
              <SelectTrigger
                className={cn(
                  formik.touched.gender && formik.errors.gender
                    ? "border-red-300 focus-visible:ring-red-300"
                    : "",
                )}
              >
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {formik.touched.gender && formik.errors.gender && (
              <p className="text-sm text-red-500">{formik.errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
              className={cn(
                formik.touched.address && formik.errors.address
                  ? "border-red-300 focus-visible:ring-red-300"
                  : "",
              )}
              rows={3}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-sm text-red-500">{formik.errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber">Mobile Number</Label>
            <Input
              id="mobileNumber"
              name="mobileNumber"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.mobileNumber}
              className={cn(
                formik.touched.mobileNumber && formik.errors.mobileNumber
                  ? "border-red-300 focus-visible:ring-red-300"
                  : "",
              )}
            />
            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
              <p className="text-sm text-red-500">
                {formik.errors.mobileNumber}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isLoading || !isConnected}
            className={cn(
              "w-full",
              isSubmitting || isLoading || !isConnected
                ? "cursor-not-allowed opacity-70"
                : "",
              formType === "user"
                ? "bg-blue-600 hover:bg-blue-700"
                : formType === "authority"
                  ? "bg-purple-600 hover:bg-purple-700"
                  : "bg-indigo-600 hover:bg-indigo-700",
            )}
          >
            {isSubmitting || isLoading
              ? "Processing..."
              : `Register as ${
                  formType === "user"
                    ? "User"
                    : formType === "authority"
                      ? "Authority"
                      : "Verifier"
                }`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
