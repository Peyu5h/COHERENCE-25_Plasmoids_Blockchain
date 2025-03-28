import { Hono } from "hono";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { userRegistryAbi, userRegistryAddress } from "~/lib/abi/userRegistry";
import { success, err } from "~/lib/api/utils";

const user = new Hono();

user.get("/:address", async (c) => {
  try {
    const address = c.req.param("address");

    if (!address || !address.startsWith("0x")) {
      return c.json(err("Invalid address format", { status: 400 }));
    }

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout")), 5000);
    });

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const fetchDataPromise = publicClient.readContract({
      address: userRegistryAddress,
      abi: userRegistryAbi,
      functionName: "getUserData",
      args: [address as `0x${string}`],
    });

    const userData = await Promise.race([fetchDataPromise, timeoutPromise]);

    if (!userData) {
      return c.json(err("User not found", { status: 404 }));
    }

    const [name, dob, gender, physicalAddress, mobileNumber, role, isVerified] =
      userData as any;

    return c.json(
      success({
        name,
        dob,
        gender,
        physicalAddress,
        mobileNumber,
        role,
        isVerified,
      }),
    );
  } catch (error) {
    console.error("Error fetching user data:", error);
    const errorMessage =
      error instanceof Error
        ? `Failed to fetch user data: ${error.message}`
        : "Failed to fetch user data";

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

export default user;
