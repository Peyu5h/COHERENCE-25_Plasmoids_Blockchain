"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Upload } from "lucide-react";
import { usePinata } from "~/hooks/usePinata";

export default function PinataPage() {
  const { upload, isUploading, ipfsUrl } = usePinata();
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      await upload(file);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-md space-y-6">
        <div className="space-y-4">
          <Input
            type="file"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        <Button
          className="w-full"
          onClick={handleUpload}
          disabled={isUploading || !file}
        >
          {isUploading ? "Uploading..." : "Upload to IPFS"}
          <Upload className="ml-2 h-4 w-4" />
        </Button>

        {ipfsUrl && (
          <div className="rounded-md border p-4">
            <p className="mb-2 font-semibold">IPFS URL:</p>
            <a
              href={ipfsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all text-blue-500 hover:underline"
            >
              {ipfsUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
