"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const JWT = process.env.PINATA_JWT;

export const getIPFSGatewayURL = (hash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

const pinataApi = axios.create({
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export const uploadToPinata = async (file: File): Promise<string | null> => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    formData.append(
      "pinataMetadata",
      JSON.stringify({
        name: file.name,
      }),
    );

    formData.append(
      "pinataOptions",
      JSON.stringify({
        cidVersion: 1,
      }),
    );

    const response = await pinataApi.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
    );

    const { IpfsHash } = response.data;
    const gatewayUrl = getIPFSGatewayURL(IpfsHash);

    toast.success(`Successfully uploaded to IPFS`);
    return gatewayUrl;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    toast.error("Failed to upload to IPFS");
    return null;
  }
};

export function usePinata() {
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);

  const upload = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadToPinata(file);
      if (result) {
        setIpfsUrl(result);
      }
      return result;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
    ipfsUrl,
  };
}
