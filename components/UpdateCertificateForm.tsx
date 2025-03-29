import { useFormik } from "formik";
import * as Yup from "yup";
import { useTransaction } from "~/hooks/useTransaction";
import { userRegistryAddress, userRegistryAbi } from "~/lib/abi/userRegistry";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";

interface UpdateCertificateFormProps {
  isOpen: boolean;
  onClose: () => void;
  certificateIndex: number;
}

export default function UpdateCertificateForm({
  isOpen,
  onClose,
  certificateIndex,
}: UpdateCertificateFormProps) {
  const { writeAsync, isLoading } = useTransaction({
    successMessage: "Certificate updated successfully!",
    onSuccess: () => {
      onClose();
    },
  });

  const formik = useFormik({
    initialValues: {
      metadata: "",
    },
    validationSchema: Yup.object({
      metadata: Yup.string().required("New metadata is required"),
    }),
    onSubmit: async (values) => {
      try {
        await writeAsync({
          address: userRegistryAddress,
          abi: userRegistryAbi,
          functionName: "updateCertificateMetadata",
          args: [certificateIndex, values.metadata],
        });
      } catch (error) {
        console.error("Update certificate error:", error);
      }
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Certificate</DialogTitle>
          <DialogDescription>
            Update the metadata for your certificate
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metadata">New Metadata</Label>
            <Textarea
              id="metadata"
              name="metadata"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.metadata}
              rows={4}
              placeholder="Enter new metadata for the certificate"
            />
            {formik.touched.metadata && formik.errors.metadata && (
              <p className="text-destructive text-sm">
                {String(formik.errors.metadata)}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Certificate"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
