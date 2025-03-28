"use client";

import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMTc3ZTRmNy05MmYxLTQ5MWEtYTBkNi1jMWJkNmIwZjJhZTgiLCJlbWFpbCI6InBpeXVzaHZiYWd1bDkxNkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNGZmNjRhZWI4NmQ2OWExMzRkZTYiLCJzY29wZWRLZXlTZWNyZXQiOiJhMzFjMGQ1Zjc2YzFlZWY1YTk2MzM1NTJhMmNkNjU5Mzk0NzBhOTNkM2QwMTM4OTQzODk0YWI4MDQ5NGM0MTM1IiwiZXhwIjoxNzc0NzE3NTIzfQ.lk1A7JYMwbL9Ijbj7pjLCxrM5IFOD1_1eJuIIVXm-vw";

export const getIPFSGatewayURL = (hash: string): string => {
  if (hash.startsWith("https://gateway.pinata.cloud/ipfs/")) {
    return hash;
  }
  const cleanHash = hash.replace("ipfs://", "").replace("/ipfs/", "");
  return `https://gateway.pinata.cloud/ipfs/${cleanHash}`;
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
