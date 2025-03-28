import { Hono } from "hono";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { userRegistryAbi, userRegistryAddress } from "~/lib/abi/userRegistry";
import { success, err } from "~/lib/api/utils";

const certificates = new Hono();

interface Certificate {
  userAddress: string;
  authorityAddress: string;
  certificateId: string;
  issuanceDate: string;
  ipfsHash: string;
  metadataHash: string;
  certificateType: number;
  isVerified: boolean;
  timestamp: number;
  userName?: string;
}

const getPublicClient = () => {
  return createPublicClient({
    chain: sepolia,
    transport: http(),
  });
};

certificates.get("/:address", async (c) => {
  try {
    const address = c.req.param("address");

    if (!address || !address.startsWith("0x")) {
      return c.json(err("Invalid address format", { status: 400 }));
    }
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 10000);
    });

    const publicClient = getPublicClient();

    const fetchDataPromise = publicClient.readContract({
      address: userRegistryAddress,
      abi: userRegistryAbi,
      functionName: "getUserCertificates",
      args: [address as `0x${string}`],
    });

    const certificatesData = await Promise.race([
      fetchDataPromise,
      timeoutPromise,
    ]);

    if (
      !certificatesData ||
      (Array.isArray(certificatesData) && certificatesData.length === 0)
    ) {
      return c.json(success({ certificates: [] }));
    }

    const formattedCertificates = Array.isArray(certificatesData)
      ? certificatesData.map((cert: any) => ({
          userAddress: cert[0],
          authorityAddress: cert[1],
          certificateId: cert[2],
          issuanceDate: cert[3],
          ipfsHash: cert[4],
          metadataHash: cert[5],
          certificateType: Number(cert[6]),
          isVerified: cert[7],
          timestamp: Number(cert[8]),
        }))
      : [];

    return c.json(success({ certificates: formattedCertificates }));
  } catch (error) {
    console.error("Error fetching certificate data:", error);
    const errorMessage =
      error instanceof Error
        ? `Failed to fetch certificate data: ${error.message}`
        : "Failed to fetch certificate data";

    return c.json(
      err(errorMessage, {
        status:
          error instanceof Error && error.message === "Request timeout"
            ? 504
            : 500,
        code:
          error instanceof Error && error.message === "Request timeout"
            ? "TIMEOUT"
            : "SERVER_ERROR",
      }),
    );
  }
});

export default certificates;
