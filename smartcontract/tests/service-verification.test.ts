import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

/**
 * Service Verification Contract Tests
 * 
 * Tests for the SCredence service verification system
 */

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const issuer1 = accounts.get("wallet_1")!;
const issuer2 = accounts.get("wallet_2")!;
// Use deployer as participant1 since we only have 3 default accounts in this simnet plan
const participant1 = accounts.get("deployer")!;
// Use wallet_1 as participant2 (avoid using it as issuer in tests involving participant2)
const participant2 = accounts.get("wallet_1")!;

const CONTRACT_NAME = "service-verification";

// Service type constants
const SERVICE_TYPE_INTERNSHIP = 1;
const SERVICE_TYPE_NYSC = 2;
const SERVICE_TYPE_VOLUNTEERING = 3;
const SERVICE_TYPE_APPRENTICESHIP = 4;
const SERVICE_TYPE_TRAINING = 5;
const SERVICE_TYPE_CDS = 6;

// Test credential hash (32 bytes)
const TEST_CREDENTIAL_HASH = new Uint8Array(32).fill(1);

// Simnet default timestamp (deterministic)
const EXPECTED_TIMESTAMP = 1769112603;

describe("Service Verification Contract Tests", () => {
  
  describe("Initialization", () => {
    it("should set contract owner to deployer", () => {
      const owner = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-contract-owner",
        [],
        deployer
      );
      expect(owner.result).toBeOk(Cl.principal(deployer));
    });

    it("should initialize with zero issuers and proofs", () => {
      const stats = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-statistics",
        [],
        deployer
      );
      
      expect(stats.result).toBeOk(
        Cl.tuple({
          "total-issuers": Cl.uint(0),
          "total-proofs": Cl.uint(0)
        })
      );
    });
  });

  describe("Issuer Registration", () => {
    it("should allow contract owner to register issuer", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should fail if non-owner tries to register issuer", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        issuer2  // Not the owner
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("should fail if issuer already exists", () => {
      // First registration
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );

      // Try to register same issuer again
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Another Org"),
          Cl.stringAscii("Different Type")
        ],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(102)); // ERR_ISSUER_ALREADY_EXISTS
    });

    it("should increment total issuers count", () => {
      // Register first issuer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );

      // Register second issuer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer2),
          Cl.stringAscii("Tech4Dev"),
          Cl.stringAscii("NGO")
        ],
        deployer
      );

      const stats = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-statistics",
        [],
        deployer
      );

      expect(stats.result).toBeOk(
        Cl.tuple({
          "total-issuers": Cl.uint(2),
          "total-proofs": Cl.uint(0)
        })
      );
    });
  });

  describe("Issuer Authorization Check", () => {
    beforeEach(() => {
      // Register issuer1
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );
    });

    it("should return true for authorized issuer", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-authorized-issuer",
        [Cl.principal(issuer1)],
        deployer
      );

      expect(result.result).toBeBool(true);
    });

    it("should return false for non-authorized address", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-authorized-issuer",
        [Cl.principal(issuer2)],
        deployer
      );

      expect(result.result).toBeBool(false);
    });
  });

  describe("Issuer Revocation", () => {
    beforeEach(() => {
      // Register issuer1
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );
    });

    it("should allow owner to revoke issuer", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-issuer",
        [Cl.principal(issuer1)],
        deployer
      );

      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should set issuer as inactive after revocation", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-issuer",
        [Cl.principal(issuer1)],
        deployer
      );

      const isAuthorized = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-authorized-issuer",
        [Cl.principal(issuer1)],
        deployer
      );

      expect(isAuthorized.result).toBeBool(false);
    });

    it("should fail if non-owner tries to revoke issuer", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-issuer",
        [Cl.principal(issuer1)],
        issuer2
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });
  });

  describe("Service Proof Issuance", () => {
    beforeEach(() => {
      // Register issuer1
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );
    });

    it("should allow authorized issuer to issue proof", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),  // start date
          Cl.uint(1656547200),  // end date
          Cl.uint(180),         // duration days
          Cl.none(),            // expiry date
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );

      expect(result.result).toBeOk(Cl.uint(1)); // First proof ID
    });

    it("should fail if non-authorized address tries to issue proof", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer2  // Not authorized
      );

      expect(result.result).toBeErr(Cl.uint(101)); // ERR_ISSUER_NOT_AUTHORIZED
    });

    it("should fail with invalid service type", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(999),  // Invalid service type
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );

      expect(result.result).toBeErr(Cl.uint(105)); // ERR_INVALID_SERVICE_TYPE
    });

    it("should fail with zero duration", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(0),  // Zero duration
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );

      expect(result.result).toBeErr(Cl.uint(106)); // ERR_INVALID_DURATION
    });

    it("should fail if end date is before start date", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1656547200),  // Later date as start
          Cl.uint(1640995200),  // Earlier date as end
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );

      expect(result.result).toBeErr(Cl.uint(106)); // ERR_INVALID_DURATION
    });

    it("should increment total proofs count", () => {
      // Issue first proof
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );

      const stats = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-statistics",
        [],
        deployer
      );

      expect(stats.result).toBeOk(
        Cl.tuple({
          "total-issuers": Cl.uint(1),
          "total-proofs": Cl.uint(1)
        })
      );
    });

    it("should support all service types", () => {
      const serviceTypes = [
        SERVICE_TYPE_INTERNSHIP,
        SERVICE_TYPE_NYSC,
        SERVICE_TYPE_VOLUNTEERING,
        SERVICE_TYPE_APPRENTICESHIP,
        SERVICE_TYPE_TRAINING,
        SERVICE_TYPE_CDS
      ];

      serviceTypes.forEach((serviceType) => {
        const result = simnet.callPublicFn(
          CONTRACT_NAME,
          "issue-service-proof",
          [
            Cl.principal(participant1),
            Cl.uint(serviceType),
            Cl.buffer(TEST_CREDENTIAL_HASH),
            Cl.uint(1640995200),
            Cl.uint(1656547200),
            Cl.uint(180),
            Cl.none(), // expiry
            Cl.some(Cl.stringAscii("ipfs://Qm..."))
          ],
          issuer1
        );

        expect(result.result).toBeOk(Cl.uint(serviceType));
      });
    });
  });

  describe("Service Proof Retrieval", () => {
    beforeEach(() => {
      // Register issuer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );

      // Issue a proof
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm123"))
        ],
        issuer1
      );
    });

    it("should retrieve service proof by ID", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-service-proof",
        [Cl.uint(1)],
        deployer
      );

      // Verify response structure and fields (ignoring exact timestamp)
      expect(result.result).toBeOk(expect.anything());
      // Access tuple fields using .value property (based on debug output)
      const proof = (result.result as any).value.value.value;
      
      expect(proof["participant"]).toEqual(Cl.principal(participant1));
      expect(proof["issuer"]).toEqual(Cl.principal(issuer1));
      expect(proof["service-type"]).toEqual(Cl.uint(SERVICE_TYPE_INTERNSHIP));
      expect(proof["credential-hash"]).toEqual(Cl.buffer(TEST_CREDENTIAL_HASH));
      expect(proof["duration-days"]).toEqual(Cl.uint(180));
      expect(proof["issued-at"].type).toBe("uint"); // Simnet returns string type "uint"
      expect(proof["metadata-uri"]).toEqual(Cl.some(Cl.stringAscii("ipfs://Qm123")));
    });

    it("should return none for non-existent proof", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-service-proof",
        [Cl.uint(999)],
        deployer
      );

      expect(result.result).toBeOk(Cl.none());
    });
  });

  describe("Participant Proof Management", () => {
    beforeEach(() => {
      // Register issuer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );
    });

    it("should track participant proof count", () => {
      // Issue first proof
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );

      const count = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant-proof-count",
        [Cl.principal(participant1)],
        deployer
      );

      expect(count.result).toBeOk(Cl.uint(1));
    });

    it("should retrieve participant proof by index", () => {
      // Issue proof
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );

      const proof = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-participant-proof-by-index",
        [Cl.principal(participant1), Cl.uint(0)],
        deployer
      );

      // Verify response structure and fields
      expect(proof.result).toBeOk(expect.anything());
      const proofData = (proof.result as any).value.value.value;
      
      expect(proofData["participant"]).toEqual(Cl.principal(participant1));
      expect(proofData["issuer"]).toEqual(Cl.principal(issuer1));
      expect(proofData["service-type"]).toEqual(Cl.uint(SERVICE_TYPE_INTERNSHIP));
      expect(proofData["credential-hash"]).toEqual(Cl.buffer(TEST_CREDENTIAL_HASH));
      expect(proofData["issued-at"].type).toBe("uint"); // Simnet returns string type
    });
  });

  describe("Proof Verification", () => {
    beforeEach(() => {
      // Register issuer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );

      // Issue proof
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );
    });

    it("should verify proof with correct hash", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "verify-proof",
        [Cl.uint(1), Cl.buffer(TEST_CREDENTIAL_HASH)],
        deployer
      );

      // Verify response structure
      expect(result.result).toBeOk(expect.anything());
      const data = (result.result as any).value.value;
      
      expect(data["is-valid"]).toEqual(Cl.bool(true));
      expect(data["participant"]).toEqual(Cl.principal(participant1));
      expect(data["issuer"]).toEqual(Cl.principal(issuer1));
      expect(data["service-type"]).toEqual(Cl.uint(SERVICE_TYPE_INTERNSHIP));
      expect(data["issued-at"].type).toBe("uint"); // Simnet returns string type
    });

    it("should fail verification with incorrect hash", () => {
      const wrongHash = new Uint8Array(32).fill(255);
      
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "verify-proof",
        [Cl.uint(1), Cl.buffer(wrongHash)],
        deployer
      );

      // Verify response structure
      expect(result.result).toBeOk(expect.anything());
      const data = (result.result as any).value.value;
      
      expect(data["is-valid"]).toEqual(Cl.bool(false));
      expect(data["participant"]).toEqual(Cl.principal(participant1));
      expect(data["issuer"]).toEqual(Cl.principal(issuer1));
      expect(data["service-type"]).toEqual(Cl.uint(SERVICE_TYPE_INTERNSHIP));
      expect(data["issued-at"].type).toBe("uint"); // Simnet returns string type
    });

    it("should return error for non-existent proof", () => {
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "verify-proof",
        [Cl.uint(999), Cl.buffer(TEST_CREDENTIAL_HASH)],
        deployer
      );

      expect(result.result).toBeErr(Cl.uint(104)); // ERR_PROOF_NOT_FOUND
    });
  });

  describe("Proof Revocation", () => {
    beforeEach(() => {
      // Register issuer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );

      // Issue proof
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(), // expiry
          Cl.some(Cl.stringAscii("ipfs://Qm..."))
        ],
        issuer1
      );
    });

    it("should allow issuer to revoke their own proof", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-service-proof",
        [Cl.uint(1), Cl.stringAscii("Incorrect information provided")],
        issuer1
      );

      expect(result.result).toBeOk(Cl.bool(true));
      
      const isRevoked = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-proof-revoked",
        [Cl.uint(1)],
        deployer
      );
      expect(isRevoked.result).toBeBool(true);
    });

    it("should fail if non-issuer tries to revoke proof", () => {
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-service-proof",
        [Cl.uint(1), Cl.stringAscii("Unauthorized attempt")],
        issuer2 // Not the issuer
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });

    it("should fail verification for revoked proof", () => {
      // Revoke the proof
      simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-service-proof",
        [Cl.uint(1), Cl.stringAscii("Revoked for testing")],
        issuer1
      );

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "verify-proof",
        [Cl.uint(1), Cl.buffer(TEST_CREDENTIAL_HASH)],
        deployer
      );

      const data = (result.result as any).value.value;
      expect(data["is-valid"]).toEqual(Cl.bool(false));
      expect(data["is-revoked"]).toEqual(Cl.bool(true));
    });

    it("should return revocation details", () => {
      const reason = "Administrative error";
      simnet.callPublicFn(
        CONTRACT_NAME,
        "revoke-service-proof",
        [Cl.uint(1), Cl.stringAscii(reason)],
        issuer1
      );

      const details = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-revocation-details",
        [Cl.uint(1)],
        deployer
      );

      expect(details.result).toBeSome(expect.anything());
      const data = (details.result as any).value.value;
      expect(data["reason"]).toEqual(Cl.stringAscii(reason));
      expect(data["revoked-at"].type).toBe("uint");
    });
  });

  describe("Proof Expiration & Renewal", () => {
    beforeEach(() => {
      // Register issuer
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-issuer",
        [
          Cl.principal(issuer1),
          Cl.stringAscii("Andela Nigeria"),
          Cl.stringAscii("Tech Training")
        ],
        deployer
      );
    });

    it("should allow issuing a proof with an expiry date", () => {
      const expiry = 1800000000;
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.some(Cl.uint(expiry)),
          Cl.none()
        ],
        issuer1
      );

      expect(result.result).toBeOk(Cl.uint(1));
      
      const proof = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-service-proof",
        [Cl.uint(1)],
        deployer
      );
      const proofData = (proof.result as any).value.value.value;
      expect(proofData["expiry-date"]).toEqual(Cl.some(Cl.uint(expiry)));
    });

    it("should fail verification for expired proof", () => {
      // Issue proof with expiry in the past relative to current simnet time
      // Current simnet time is roughly 1769112603
      const pastExpiry = 1700000000;
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.some(Cl.uint(pastExpiry)),
          Cl.none()
        ],
        issuer1
      );

      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "verify-proof",
        [Cl.uint(1), Cl.buffer(TEST_CREDENTIAL_HASH)],
        deployer
      );

      const data = (result.result as any).value.value;
      expect(data["is-valid"]).toEqual(Cl.bool(false));
      expect(data["is-expired"]).toEqual(Cl.bool(true));
    });

    it("should allow issuer to renew proof", () => {
      // Issue proof
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(),
          Cl.none()
        ],
        issuer1
      );

      const newExpiry = 2000000000;
      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "renew-service-proof",
        [Cl.uint(1), Cl.uint(newExpiry)],
        issuer1
      );

      expect(result.result).toBeOk(Cl.bool(true));

      const proof = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-service-proof",
        [Cl.uint(1)],
        deployer
      );
      const proofData = (proof.result as any).value.value.value;
      expect(proofData["expiry-date"]).toEqual(Cl.some(Cl.uint(newExpiry)));
    });

    it("should fail renewal if not original issuer", () => {
      simnet.callPublicFn(
        CONTRACT_NAME,
        "issue-service-proof",
        [
          Cl.principal(participant1),
          Cl.uint(SERVICE_TYPE_INTERNSHIP),
          Cl.buffer(TEST_CREDENTIAL_HASH),
          Cl.uint(1640995200),
          Cl.uint(1656547200),
          Cl.uint(180),
          Cl.none(),
          Cl.none()
        ],
        issuer1
      );

      const result = simnet.callPublicFn(
        CONTRACT_NAME,
        "renew-service-proof",
        [Cl.uint(1), Cl.uint(2000000000)],
        issuer2 // Not the issuer
      );

      expect(result.result).toBeErr(Cl.uint(100)); // ERR_UNAUTHORIZED
    });
  });
});
