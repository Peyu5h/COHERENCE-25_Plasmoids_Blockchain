import { Hono } from "hono";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { userRegistryAbi, userRegistryAddress } from "~/lib/abi/userRegistry";
import { success, err } from "~/lib/api/utils";

const certificates = new Hono();

// Get all certificates for a user
certificates.get("/:address", async (c) => {
  try {
    const address = c.req.param("address");

    if (!address || !address.startsWith("0x")) {
      return c.json(err("Invalid address format", { status: 400 }));
    }

    // Use a timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 5000);
    });

    // Create a public client for sepolia
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    // Get user certificates
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

    // Transform the raw contract data into a more usable format
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

// Get all pending certificates for an authority
certificates.get("/pending/:address", async (c) => {
  try {
    const address = c.req.param("address");

    if (!address || !address.startsWith("0x")) {
      return c.json(err("Invalid address format", { status: 400 }));
    }

    // Create a public client for sepolia
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    // Get pending certificates (only works if called by the authority)
    // For API, we'll just fetch all users and filter for pending certificates
    const fetchAllUsersPromise = publicClient.readContract({
      address: userRegistryAddress,
      abi: userRegistryAbi,
      functionName: "getAllUsers",
    });

    const allUsers = await fetchAllUsersPromise;

    // This is a workaround since we can't directly call getPendingCertificates as it's restricted to the caller
    // In a real application, this would be better handled through events or a backend service
    // For demo purposes, we're just returning a message that this endpoint would normally provide pending certificates

    return c.json(
      success({
        message:
          "This endpoint would return pending certificates for the authority. In a production environment, this would be implemented using events or a dedicated backend service that has authority permissions.",
        pendingCertificates: [],
      }),
    );
  } catch (error) {
    console.error("Error fetching pending certificates:", error);
    const errorMessage =
      error instanceof Error
        ? `Failed to fetch pending certificates: ${error.message}`
        : "Failed to fetch pending certificates";

    return c.json(
      err(errorMessage, {
        status: 500,
        code: "SERVER_ERROR",
      }),
    );
  }
});

// Search authorities
certificates.get("/authorities/search", async (c) => {
  try {
    const query = c.req.query("query") || "";

    // Create a public client for sepolia
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    // Get all users first (since we need to filter locally)
    const fetchAllUsersPromise = publicClient.readContract({
      address: userRegistryAddress,
      abi: userRegistryAbi,
      functionName: "getAllUsers",
    });

    const allUserAddresses = (await fetchAllUsersPromise) as `0x${string}`[];

    if (!allUserAddresses || allUserAddresses.length === 0) {
      return c.json(success({ authorities: [] }));
    }

    // Now fetch user data for each address to check if they're authorities
    const authorities = [];

    for (const address of allUserAddresses) {
      try {
        const userData = (await publicClient.readContract({
          address: userRegistryAddress,
          abi: userRegistryAbi,
          functionName: "getUserData",
          args: [address],
        })) as any;

        // Check if user is an authority (role 2)
        if (userData && Number(userData[5]) === 2) {
          const name = userData[0];

          // Filter by query if provided
          if (!query || name.toLowerCase().includes(query.toLowerCase())) {
            // Get more authority details
            const authorityDetails = (await publicClient.readContract({
              address: userRegistryAddress,
              abi: userRegistryAbi,
              functionName: "getAuthorityDetails",
              args: [address],
            })) as any;

            authorities.push({
              address,
              name,
              department: authorityDetails ? authorityDetails[1] : "",
              location: authorityDetails ? authorityDetails[2] : "",
              isVerified: authorityDetails ? authorityDetails[3] : false,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching data for address ${address}:`, error);
        // Continue with the next address
      }
    }

    return c.json(success({ authorities }));
  } catch (error) {
    console.error("Error searching authorities:", error);
    const errorMessage =
      error instanceof Error
        ? `Failed to search authorities: ${error.message}`
        : "Failed to search authorities";

    return c.json(
      err(errorMessage, {
        status: 500,
        code: "SERVER_ERROR",
      }),
    );
  }
});

export default certificates;
