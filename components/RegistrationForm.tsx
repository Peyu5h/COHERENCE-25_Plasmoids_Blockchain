"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useTransaction } from "~/hooks/useTransaction";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import { cn } from "~/lib/utils";
import { format } from "date-fns";
import { Calendar } from "~/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { CalendarIcon, Link2Icon } from "lucide-react";
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
  isOpen: boolean;
  onClose: () => void;
}

export default function RegistrationForm({
  formType,
  isOpen,
  onClose,
}: RegistrationFormProps) {
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
      setIsSubmitting(false);
      onClose();
      // Add a small delay before navigation to allow the success toast to show
      setTimeout(() => {
        if (formType === "user") {
          router.push("/dashboard");
        } else if (formType === "authority") {
          router.push("/authority");
        } else if (formType === "verifier") {
          router.push("/verifier");
        }
      }, 1500);
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
        setIsSubmitting(false);
      }
    },
  });

  const linkAadhar = () => {
    formik.setValues({
      name: "Piyush",
      dob: "2004-12-08",
      gender: "Male",
      address:
        "Happy Homes Society, Sarvodaya Nagar, Bhandup west\n401 C-wing, Happy Homes Society, J.M. road",
      mobileNumber: "8928937191",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center capitalize">
            {formType} Registration
          </DialogTitle>
          <DialogDescription className="text-center">
            Complete the form below to register your {formType} account
            {formType === "user" && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 w-full py-4"
                onClick={linkAadhar}
              >
                <Link2Icon className="mr-2 h-4 w-4" />
                Link my Aadhar
              </Button>
            )}
          </DialogDescription>
        </DialogHeader>

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
                  ? "border-destructive focus-visible:ring-destructive"
                  : "",
              )}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-destructive text-sm">{formik.errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dob"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formik.values.dob && "text-muted-foreground",
                    formik.touched.dob &&
                      formik.errors.dob &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formik.values.dob ? (
                    format(new Date(formik.values.dob), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={
                    formik.values.dob ? new Date(formik.values.dob) : undefined
                  }
                  onSelect={(date) => {
                    if (date) {
                      formik.setFieldValue("dob", format(date, "yyyy-MM-dd"));
                    }
                  }}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {formik.touched.dob && formik.errors.dob && (
              <p className="text-destructive text-sm">{formik.errors.dob}</p>
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
                    ? "border-destructive focus-visible:ring-destructive"
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
              <p className="text-destructive text-sm">{formik.errors.gender}</p>
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
                  ? "border-destructive focus-visible:ring-destructive"
                  : "",
              )}
              rows={3}
            />
            {formik.touched.address && formik.errors.address && (
              <p className="text-destructive text-sm">
                {formik.errors.address}
              </p>
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
                  ? "border-destructive focus-visible:ring-destructive"
                  : "",
              )}
            />
            {formik.touched.mobileNumber && formik.errors.mobileNumber && (
              <p className="text-destructive text-sm">
                {formik.errors.mobileNumber}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || isLoading || !isConnected}
              className={cn(
                "w-full",
                isSubmitting || isLoading || !isConnected
                  ? "cursor-not-allowed opacity-70"
                  : "",
                "bg-primary hover:bg-primary/90",
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
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
