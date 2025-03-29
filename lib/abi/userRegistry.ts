import { Abi } from "viem";

export const userRegistryAddress =
  "0xD498d67E539E941c4D079a3E94F168E039248f0B" as const;

export const userRegistryAbi = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "authorityAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "AuthorityVerified",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "certificateId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "CertificateMockApproved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "certificateId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "reason",
        type: "string",
      },
    ],
    name: "CertificateMockRejected",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "certificateId",
        type: "string",
      },
      {
        indexed: false,
        internalType: "enum UserRegistry.CertificateType",
        name: "certificateType",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
    ],
    name: "CertificateUploaded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum UserRegistry.Role",
        name: "previousRole",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "enum UserRegistry.Role",
        name: "newRole",
        type: "uint8",
      },
    ],
    name: "UserPromoted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "enum UserRegistry.Role",
        name: "role",
        type: "uint8",
      },
    ],
    name: "UserRegistered",
    type: "event",
  },
  {
    inputs: [],
    name: "admin",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_authorityAddress",
        type: "address",
      },
    ],
    name: "approveAuthority",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "authorityDepartment",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "authorityLocation",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllUsers",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllUsersCertificates",
    outputs: [
      {
        internalType: "address[]",
        name: "userAddrs",
        type: "address[]",
      },
      {
        components: [
          {
            internalType: "address",
            name: "userAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "certificateId",
            type: "string",
          },
          {
            internalType: "string",
            name: "issuanceDate",
            type: "string",
          },
          {
            internalType: "string",
            name: "ipfsHash",
            type: "string",
          },
          {
            internalType: "enum UserRegistry.CertificateType",
            name: "certificateType",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "isVerified",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "metadata",
            type: "string",
          },
        ],
        internalType: "struct UserRegistry.Certificate[][]",
        name: "certificates",
        type: "tuple[][]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_authorityAddress",
        type: "address",
      },
    ],
    name: "getAuthorityDetails",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "department",
        type: "string",
      },
      {
        internalType: "string",
        name: "location",
        type: "string",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentUserData",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "dob",
        type: "string",
      },
      {
        internalType: "string",
        name: "gender",
        type: "string",
      },
      {
        internalType: "string",
        name: "physicalAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "mobileNumber",
        type: "string",
      },
      {
        internalType: "enum UserRegistry.Role",
        name: "role",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPendingAuthorities",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPendingCertificates",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "userAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "certificateId",
            type: "string",
          },
          {
            internalType: "string",
            name: "issuanceDate",
            type: "string",
          },
          {
            internalType: "string",
            name: "ipfsHash",
            type: "string",
          },
          {
            internalType: "enum UserRegistry.CertificateType",
            name: "certificateType",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "isVerified",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "metadata",
            type: "string",
          },
        ],
        internalType: "struct UserRegistry.Certificate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
    ],
    name: "getUserCertificates",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "userAddress",
            type: "address",
          },
          {
            internalType: "string",
            name: "certificateId",
            type: "string",
          },
          {
            internalType: "string",
            name: "issuanceDate",
            type: "string",
          },
          {
            internalType: "string",
            name: "ipfsHash",
            type: "string",
          },
          {
            internalType: "enum UserRegistry.CertificateType",
            name: "certificateType",
            type: "uint8",
          },
          {
            internalType: "bool",
            name: "isVerified",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "timestamp",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "metadata",
            type: "string",
          },
        ],
        internalType: "struct UserRegistry.Certificate[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
    ],
    name: "getUserData",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "dob",
        type: "string",
      },
      {
        internalType: "string",
        name: "gender",
        type: "string",
      },
      {
        internalType: "string",
        name: "physicalAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "mobileNumber",
        type: "string",
      },
      {
        internalType: "enum UserRegistry.Role",
        name: "role",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
    ],
    name: "getUserRole",
    outputs: [
      {
        internalType: "enum UserRegistry.Role",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
    ],
    name: "isUserVerified",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "_certificateId",
        type: "string",
      },
    ],
    name: "mockApproveCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "_certificateId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_reason",
        type: "string",
      },
    ],
    name: "mockRejectCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "pendingAuthorities",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "pendingCertificates",
    outputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "certificateId",
        type: "string",
      },
      {
        internalType: "string",
        name: "issuanceDate",
        type: "string",
      },
      {
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        internalType: "enum UserRegistry.CertificateType",
        name: "certificateType",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_userAddress",
        type: "address",
      },
      {
        internalType: "enum UserRegistry.Role",
        name: "_newRole",
        type: "uint8",
      },
    ],
    name: "promoteUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_dob",
        type: "string",
      },
      {
        internalType: "string",
        name: "_gender",
        type: "string",
      },
      {
        internalType: "string",
        name: "_physicalAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "_mobileNumber",
        type: "string",
      },
    ],
    name: "registerAuthority",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_dob",
        type: "string",
      },
      {
        internalType: "string",
        name: "_gender",
        type: "string",
      },
      {
        internalType: "string",
        name: "_physicalAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "_mobileNumber",
        type: "string",
      },
    ],
    name: "registerUser",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_dob",
        type: "string",
      },
      {
        internalType: "string",
        name: "_gender",
        type: "string",
      },
      {
        internalType: "string",
        name: "_physicalAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "_mobileNumber",
        type: "string",
      },
    ],
    name: "registerVerifier",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "searchAuthorities",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_department",
        type: "string",
      },
      {
        internalType: "string",
        name: "_location",
        type: "string",
      },
    ],
    name: "updateAuthorityDetails",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_certificateIndex",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_newMetadata",
        type: "string",
      },
    ],
    name: "updateCertificateMetadata",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_name",
        type: "string",
      },
      {
        internalType: "string",
        name: "_dob",
        type: "string",
      },
      {
        internalType: "string",
        name: "_gender",
        type: "string",
      },
      {
        internalType: "string",
        name: "_physicalAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "_mobileNumber",
        type: "string",
      },
    ],
    name: "updateUserProfile",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "_certificateId",
        type: "string",
      },
      {
        internalType: "string",
        name: "_issuanceDate",
        type: "string",
      },
      {
        internalType: "string",
        name: "_ipfsHash",
        type: "string",
      },
      {
        internalType: "string",
        name: "_metadata",
        type: "string",
      },
    ],
    name: "uploadCertificate",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userAddresses",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "userCertificates",
    outputs: [
      {
        internalType: "address",
        name: "userAddress",
        type: "address",
      },
      {
        internalType: "string",
        name: "certificateId",
        type: "string",
      },
      {
        internalType: "string",
        name: "issuanceDate",
        type: "string",
      },
      {
        internalType: "string",
        name: "ipfsHash",
        type: "string",
      },
      {
        internalType: "enum UserRegistry.CertificateType",
        name: "certificateType",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "timestamp",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "metadata",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "users",
    outputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "dob",
        type: "string",
      },
      {
        internalType: "string",
        name: "gender",
        type: "string",
      },
      {
        internalType: "string",
        name: "physicalAddress",
        type: "string",
      },
      {
        internalType: "string",
        name: "mobileNumber",
        type: "string",
      },
      {
        internalType: "enum UserRegistry.Role",
        name: "role",
        type: "uint8",
      },
      {
        internalType: "bool",
        name: "isVerified",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "exists",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const satisfies Abi;
