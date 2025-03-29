import { Hono } from "hono";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { userRegistryAbi, userRegistryAddress } from "~/lib/abi/userRegistry";
import { success, err, validationErr } from "~/lib/api/utils";
import { prisma } from "~/lib/prisma";
import { pusherServer } from "~/lib/pusher";

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
    let highestIncome = 0;

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

    // Store verification result in database
    try {
      const verificationHistory = await prisma.verificationHistory.create({
        data: {
          userAddress: reqData.userAddress,
          verifierId: reqData.verifierId,
          timestamp: new Date(),
          success: allVerificationsSuccessful,
          conditions: reqData.conditions,
          results: result.results,
          proofs: {
            create: [
              ...(result.results.age
                ? [
                    {
                      verificationType: "Age",
                      condition: `Age ${reqData.conditions.age?.operator} ${reqData.conditions.age?.value}`,
                      value: String(calculateAge(dob)),
                      operator: reqData.conditions.age?.operator || "equals",
                      verified: result.results.age.verified,
                      proof: result.results.age.proof,
                    },
                  ]
                : []),
              ...(result.results.income
                ? [
                    {
                      verificationType: "Income",
                      condition: `Income ${reqData.conditions.income?.operator} ${reqData.conditions.income?.value}`,
                      value: String(highestIncome || 0),
                      operator: reqData.conditions.income?.operator || "equals",
                      verified: result.results.income.verified,
                      proof: result.results.income.proof,
                    },
                  ]
                : []),
              ...(result.results.city
                ? [
                    {
                      verificationType: "Location",
                      condition: `City = ${reqData.conditions.city?.value}`,
                      value: physicalAddress || "",
                      operator: "equals",
                      verified: result.results.city.verified,
                      proof: result.results.city.proof,
                    },
                  ]
                : []),
              ...(result.results.education
                ? [
                    {
                      verificationType: "Education",
                      condition: `Education = ${reqData.conditions.education?.value}`,
                      value: "",
                      operator: "equals",
                      verified: result.results.education.verified,
                      proof: result.results.education.proof,
                    },
                  ]
                : []),
            ],
          },
        },
        include: {
          proofs: true,
        },
      });

      // realtime-pusher
      await pusherServer.trigger(
        `verifier-${reqData.verifierId}`,
        "new-verification",
        {
          id: verificationHistory.id,
          userAddress: verificationHistory.userAddress,
          timestamp: verificationHistory.timestamp,
          success: verificationHistory.success,
          proofs: verificationHistory.proofs.map((proof) => ({
            id: proof.id,
            verificationType: proof.verificationType,
            condition: proof.condition,
            verified: proof.verified,
          })),
        },
      );

      console.log("Verification stored:", verificationHistory.id);
    } catch (dbError) {
      console.error("Failed to store verification:", dbError);
    }

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

verify.get("/history", async (c) => {
  try {
    const verifierId = c.req.query("verifierId");

    if (!verifierId || !verifierId.startsWith("0x")) {
      return c.json(validationErr("Invalid verifier ID format"));
    }

    const history = await prisma.verificationHistory.findMany({
      where: {
        verifierId: verifierId,
      },
      include: {
        proofs: true,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: 50,
    });

    return c.json(success(history));
  } catch (error) {
    console.error("Error fetching verification history:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return c.json(
      err(`Failed to fetch verification history: ${errorMessage}`, {
        status: 500,
        code: "FETCH_HISTORY_ERROR",
      }),
    );
  }
});

export default verify;
