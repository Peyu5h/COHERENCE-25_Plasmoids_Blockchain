import { Hono } from "hono";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { userRegistryAbi, userRegistryAddress } from "~/lib/abi/userRegistry";
import { success, err, validationErr } from "~/lib/api/utils";

const verify = new Hono();

type VerificationRequest = {
  userAddress: string;
  verifierId: string;
  conditions: {
    age?: {
      value: number;
      operator: "greaterThan" | "lessThan" | "equals";
    };
    income?: {
      value: number;
      operator: "greaterThan" | "lessThan" | "equals";
    };
    city?: {
      value: string;
      operator: "equals";
    };
    education?: {
      value: string;
      operator: "equals";
    };
  };
  timestamp: string;
};

type VerificationResult = {
  success: boolean;
  results: {
    age?: {
      verified: boolean;
      proof: string;
    };
    income?: {
      verified: boolean;
      proof: string;
    };
    city?: {
      verified: boolean;
      proof: string;
    };
    education?: {
      verified: boolean;
      proof: string;
    };
  };
  userAddress: string;
  verifierId: string;
  timestamp: string;
};

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function extractCity(address: string): string {
  return address;
}

function compareValues(a: any, b: any, operator: string): boolean {
  switch (operator) {
    case "greaterThan":
      return a > b;
    case "lessThan":
      return a < b;
    case "equals":
      return a === b;
    default:
      return false;
  }
}

function generateProof(value: any, condition: any, result: boolean): string {
  const data = {
    value: value,
    condition: condition,
    result: result,
    nonce: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
  };

  return btoa(JSON.stringify(data));
}

verify.post("/", async (c) => {
  try {
    // Parse the request body
    const reqData: VerificationRequest = await c.req.json();

    if (!reqData.userAddress || !reqData.userAddress.startsWith("0x")) {
      //@ts-expect-error - bruh
      return c.json(validationErr("Invalid user address format"));
    }

    if (!reqData.verifierId || !reqData.verifierId.startsWith("0x")) {
      //@ts-expect-error - bruh
      return c.json(validationErr("Invalid verifier ID format"));
    }

    const result: VerificationResult = {
      success: false,
      results: {},
      userAddress: reqData.userAddress,
      verifierId: reqData.verifierId,
      timestamp: new Date().toISOString(),
    };

    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(),
    });

    const userData = await publicClient.readContract({
      address: userRegistryAddress,
      abi: userRegistryAbi,
      functionName: "getUserData",
      args: [reqData.userAddress as `0x${string}`],
    });

    if (!userData) {
      return c.json(err("User not found", { status: 404 }));
    }

    const [name, dob, gender, physicalAddress, mobileNumber, role, isVerified] =
      userData as any;

    let certificates = null;
    if (reqData.conditions.income) {
      certificates = await publicClient.readContract({
        address: userRegistryAddress,
        abi: userRegistryAbi,
        functionName: "getUserCertificates",
        args: [reqData.userAddress as `0x${string}`],
      });
    }

    let allVerificationsSuccessful = true;

    if (reqData.conditions.age && dob) {
      const userAge = calculateAge(dob);
      const isVerified = compareValues(
        userAge,
        reqData.conditions.age.value,
        reqData.conditions.age.operator,
      );

      result.results.age = {
        verified: isVerified,
        proof: generateProof(userAge, reqData.conditions.age, isVerified),
      };

      if (!isVerified) allVerificationsSuccessful = false;
    }

    if (
      reqData.conditions.income &&
      certificates &&
      Array.isArray(certificates) &&
      certificates.length > 0
    ) {
      let highestIncome = 0;

      for (const cert of certificates) {
        try {
          const metadata = JSON.parse(cert.metadata || "{}");
          if (metadata.amount && !isNaN(metadata.amount)) {
            const amount = parseInt(metadata.amount);
            if (amount > highestIncome) {
              highestIncome = amount;
            }
          }
        } catch (e) {
          console.error("Error parsing certificate metadata:", e);
        }
      }

      const isVerified = compareValues(
        highestIncome,
        reqData.conditions.income.value,
        reqData.conditions.income.operator,
      );

      result.results.income = {
        verified: isVerified,
        proof: generateProof(
          highestIncome,
          reqData.conditions.income,
          isVerified,
        ),
      };

      if (!isVerified) allVerificationsSuccessful = false;
    }

    if (reqData.conditions.city && physicalAddress) {
      const addressString = extractCity(physicalAddress);
      const isVerified = Boolean(
        addressString
          ?.toLowerCase()
          .includes(reqData.conditions.city.value.toLowerCase()),
      );

      result.results.city = {
        verified: isVerified,
        proof: generateProof(
          addressString || "",
          reqData.conditions.city,
          isVerified,
        ),
      };

      if (!isVerified) allVerificationsSuccessful = false;
    }

    if (reqData.conditions.education) {
      const isVerified = false;

      result.results.education = {
        verified: isVerified,
        proof: generateProof(null, reqData.conditions.education, isVerified),
      };

      if (!isVerified) allVerificationsSuccessful = false;
    }

    //todo DB-integration

    result.success = allVerificationsSuccessful;
    return c.json(success(result));
  } catch (error) {
    console.error("Error in verification:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      err(`Verification failed: ${errorMessage}`, {
        status: 500,
        code: "VERIFICATION_ERROR",
      }),
    );
  }
});

export default verify;
