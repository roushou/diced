import { describe, expect, test } from "bun:test";
import { type Method, Signer } from "./signer.ts";

// Test credentials - using base64-encoded "test-secret-key"
const testCredentials = {
  key: "test-api-key",
  secret: Buffer.from("test-secret-key").toString("base64"),
  passphrase: "test-passphrase",
};

describe("Signer", () => {
  describe("Basic Signature Generation", () => {
    test("should create a valid header payload with all required fields", () => {
      const signer = new Signer(testCredentials);
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: 1234567890,
        body: undefined,
      });

      expect(payload).toHaveProperty("timestamp");
      expect(payload).toHaveProperty("signature");
      expect(payload).toHaveProperty("key");
      expect(payload).toHaveProperty("passphrase");
      expect(payload.timestamp).toBe(1234567890);
      expect(payload.key).toBe(testCredentials.key);
      expect(payload.passphrase).toBe(testCredentials.passphrase);
      expect(typeof payload.signature).toBe("string");
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should generate consistent signatures for identical inputs", () => {
      const signer = new Signer(testCredentials);
      const options = {
        method: "POST" as Method,
        path: "/api/orders",
        body: '{"amount":100}',
        timestamp: 1234567890,
      };

      const payload1 = signer.createHeaderPayload(options);
      const payload2 = signer.createHeaderPayload(options);

      expect(payload1.signature).toBe(payload2.signature);
    });

    test("should generate different signatures for different inputs", () => {
      const signer = new Signer(testCredentials);
      const timestamp = 1234567890;

      const payload1 = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp,
        body: undefined,
      });
      const payload2 = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        timestamp,
        body: undefined,
      });

      expect(payload1.signature).not.toBe(payload2.signature);
    });
  });

  describe("Timestamp Handling", () => {
    test("should use provided timestamp when given", () => {
      const signer = new Signer(testCredentials);
      const customTimestamp = 1609459200; // 2021-01-01 00:00:00 UTC
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: customTimestamp,
        body: undefined,
      });

      expect(payload.timestamp).toBe(customTimestamp);
    });

    test("should generate current timestamp when not provided", () => {
      const signer = new Signer(testCredentials);
      const beforeTimestamp = Math.floor(Date.now() / 1000);
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: undefined,
        body: undefined,
      });
      const afterTimestamp = Math.floor(Date.now() / 1000);

      expect(payload.timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(payload.timestamp).toBeLessThanOrEqual(afterTimestamp);
    });

    test("should use timestamp in signature calculation", () => {
      const signer = new Signer(testCredentials);

      const payload1 = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: 1000000,
        body: undefined,
      });
      const payload2 = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: 2000000,
        body: undefined,
      });

      expect(payload1.signature).not.toBe(payload2.signature);
    });
  });

  describe("HTTP Method Variations", () => {
    test("should generate different signatures for different methods", () => {
      const signer = new Signer(testCredentials);
      const timestamp = 1234567890;
      const path = "/api/test";
      const methods: Method[] = ["GET", "POST", "DELETE"];

      const signatures = methods.map(
        (method) =>
          signer.createHeaderPayload({
            method,
            path,
            timestamp,
            body: undefined,
          }).signature,
      );

      // All signatures should be unique
      const uniqueSignatures = new Set(signatures);
      expect(uniqueSignatures.size).toBe(methods.length);
    });
  });

  describe("Request Body Handling", () => {
    test("should include body in signature when provided", () => {
      const signer = new Signer(testCredentials);
      const timestamp = 1234567890;

      const payloadWithoutBody = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        timestamp,
        body: undefined,
      });
      const payloadWithBody = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        body: '{"test":true}',
        timestamp,
      });

      expect(payloadWithoutBody.signature).not.toBe(payloadWithBody.signature);
    });

    test("should work correctly without body (undefined)", () => {
      const signer = new Signer(testCredentials);
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: 1234567890,
        body: undefined,
      });

      expect(payload.signature).toBeDefined();
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should handle empty string body", () => {
      const signer = new Signer(testCredentials);
      const timestamp = 1234567890;

      const payloadUndefined = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        timestamp,
        body: undefined,
      });
      const payloadEmptyString = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        body: "",
        timestamp,
      });

      // Empty string and undefined produce the same signature (empty string appends nothing)
      expect(payloadUndefined.signature).toBe(payloadEmptyString.signature);
    });

    test("should handle JSON stringified bodies", () => {
      const signer = new Signer(testCredentials);
      const body = JSON.stringify({ amount: 100, currency: "USD" });

      const payload = signer.createHeaderPayload({
        method: "POST",
        path: "/api/orders",
        body,
        timestamp: 1234567890,
      });

      expect(payload.signature).toBeDefined();
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should handle large bodies", () => {
      const signer = new Signer(testCredentials);
      const largeBody = "x".repeat(10000); // 10KB body

      const payload = signer.createHeaderPayload({
        method: "POST",
        path: "/api/upload",
        body: largeBody,
        timestamp: 1234567890,
      });

      expect(payload.signature).toBeDefined();
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should generate different signatures for different bodies", () => {
      const signer = new Signer(testCredentials);
      const timestamp = 1234567890;

      const payload1 = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        body: '{"a":1}',
        timestamp,
      });
      const payload2 = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        body: '{"a":2}',
        timestamp,
      });

      expect(payload1.signature).not.toBe(payload2.signature);
    });
  });

  describe("Request Path Variations", () => {
    test("should handle simple paths", () => {
      const signer = new Signer(testCredentials);
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/api/endpoint",
        timestamp: 1234567890,
        body: undefined,
      });

      expect(payload.signature).toBeDefined();
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should handle paths with query parameters", () => {
      const signer = new Signer(testCredentials);
      const timestamp = 1234567890;

      const payloadWithoutQuery = signer.createHeaderPayload({
        method: "GET",
        path: "/api/endpoint",
        timestamp,
        body: undefined,
      });
      const payloadWithQuery = signer.createHeaderPayload({
        method: "GET",
        path: "/api/endpoint?foo=bar",
        timestamp,
        body: undefined,
      });

      expect(payloadWithQuery.signature).toBeDefined();
      expect(payloadWithoutQuery.signature).not.toBe(
        payloadWithQuery.signature,
      );
    });

    test("should handle paths with special characters", () => {
      const signer = new Signer(testCredentials);
      const specialPaths = [
        "/api/test%20space",
        "/api/test-dash",
        "/api/test_underscore",
        "/api/test.dot",
      ];

      for (const path of specialPaths) {
        const payload = signer.createHeaderPayload({
          method: "GET",
          path,
          timestamp: 1234567890,
          body: undefined,
        });
        expect(payload.signature).toBeDefined();
        expect(payload.signature.length).toBeGreaterThan(0);
      }
    });

    test("should handle root path", () => {
      const signer = new Signer(testCredentials);
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/",
        timestamp: 1234567890,
        body: undefined,
      });

      expect(payload.signature).toBeDefined();
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should generate different signatures for different paths", () => {
      const signer = new Signer(testCredentials);
      const timestamp = 1234567890;

      const payload1 = signer.createHeaderPayload({
        method: "GET",
        path: "/api/endpoint1",
        timestamp,
        body: undefined,
      });
      const payload2 = signer.createHeaderPayload({
        method: "GET",
        path: "/api/endpoint2",
        timestamp,
        body: undefined,
      });

      expect(payload1.signature).not.toBe(payload2.signature);
    });
  });

  describe("URL-Safe Base64 Encoding", () => {
    test("should only contain URL-safe characters", () => {
      const signer = new Signer(testCredentials);
      const payload = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        body: '{"data":"test"}',
        timestamp: 1234567890,
      });

      // URL-safe base64 should only contain: A-Z, a-z, 0-9, -, _, =
      const urlSafePattern = /^[A-Za-z0-9\-_=]+$/;
      expect(urlSafePattern.test(payload.signature)).toBe(true);
    });

    test("should not contain '+' characters", () => {
      const signer = new Signer(testCredentials);

      // Generate multiple signatures to increase chance of encountering '+'
      for (let i = 0; i < 100; i++) {
        const payload = signer.createHeaderPayload({
          method: "POST",
          path: `/api/test${i}`,
          body: `{"data":"${i}"}`,
          timestamp: 1234567890 + i,
        });
        expect(payload.signature).not.toContain("+");
      }
    });

    test("should not contain '/' characters", () => {
      const signer = new Signer(testCredentials);

      // Generate multiple signatures to increase chance of encountering '/'
      for (let i = 0; i < 100; i++) {
        const payload = signer.createHeaderPayload({
          method: "POST",
          path: `/api/test${i}`,
          body: `{"data":"${i}"}`,
          timestamp: 1234567890 + i,
        });
        expect(payload.signature).not.toContain("/");
      }
    });

    test("should contain '-' or '_' (replaced from + or /)", () => {
      const signer = new Signer(testCredentials);
      let foundDash = false;
      let foundUnderscore = false;

      // Generate multiple signatures to find replacements
      for (let i = 0; i < 100; i++) {
        const payload = signer.createHeaderPayload({
          method: "POST",
          path: `/api/test${i}`,
          body: `{"data":"${i}"}`,
          timestamp: 1234567890 + i,
        });
        if (payload.signature.includes("-")) foundDash = true;
        if (payload.signature.includes("_")) foundUnderscore = true;
      }

      // At least one of these should be true (very likely both)
      expect(foundDash || foundUnderscore).toBe(true);
    });
  });

  describe("Security Tests", () => {
    test("should generate different signatures with different secrets", () => {
      const credentials1 = {
        ...testCredentials,
        secret: Buffer.from("secret1").toString("base64"),
      };
      const credentials2 = {
        ...testCredentials,
        secret: Buffer.from("secret2").toString("base64"),
      };

      const signer1 = new Signer(credentials1);
      const signer2 = new Signer(credentials2);

      const options = {
        method: "GET" as Method,
        path: "/api/test",
        timestamp: 1234567890,
        body: undefined,
      };

      const payload1 = signer1.createHeaderPayload(options);
      const payload2 = signer2.createHeaderPayload(options);

      expect(payload1.signature).not.toBe(payload2.signature);
    });

    test("should correctly decode base64-encoded secrets", () => {
      const secretText = "my-secret-key-12345";
      const base64Secret = Buffer.from(secretText).toString("base64");
      const credentials = { ...testCredentials, secret: base64Secret };

      const signer = new Signer(credentials);
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: 1234567890,
        body: undefined,
      });

      // Should successfully create signature without errors
      expect(payload.signature).toBeDefined();
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should handle secrets of varying lengths", () => {
      const secretLengths = [8, 16, 32, 64];

      for (const length of secretLengths) {
        const secret = "x".repeat(length);
        const credentials = {
          ...testCredentials,
          secret: Buffer.from(secret).toString("base64"),
        };
        const signer = new Signer(credentials);
        const payload = signer.createHeaderPayload({
          method: "GET",
          path: "/api/test",
          timestamp: 1234567890,
          body: undefined,
        });

        expect(payload.signature).toBeDefined();
        expect(payload.signature.length).toBeGreaterThan(0);
      }
    });

    test("tampering with any component should invalidate signature", () => {
      const signer = new Signer(testCredentials);
      const timestamp = 1234567890;
      const body = '{"amount":100}';

      const originalPayload = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        body,
        timestamp,
      });

      // Tamper with each component
      const tamperedMethod = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        body,
        timestamp,
      });
      const tamperedPath = signer.createHeaderPayload({
        method: "POST",
        path: "/api/other",
        body,
        timestamp,
      });
      const tamperedBody = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        body: '{"amount":200}',
        timestamp,
      });
      const tamperedTimestamp = signer.createHeaderPayload({
        method: "POST",
        path: "/api/test",
        body,
        timestamp: timestamp + 1,
      });

      expect(originalPayload.signature).not.toBe(tamperedMethod.signature);
      expect(originalPayload.signature).not.toBe(tamperedPath.signature);
      expect(originalPayload.signature).not.toBe(tamperedBody.signature);
      expect(originalPayload.signature).not.toBe(tamperedTimestamp.signature);
    });
  });

  describe("Edge Cases", () => {
    test("should handle very long paths (>1000 characters)", () => {
      const signer = new Signer(testCredentials);
      const longPath = `/api/${"a".repeat(1500)}`;
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: longPath,
        timestamp: 1234567890,
        body: undefined,
      });

      expect(payload.signature).toBeDefined();
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should handle very long bodies (>10KB)", () => {
      const signer = new Signer(testCredentials);
      const largeBody = "x".repeat(50000); // 50KB
      const payload = signer.createHeaderPayload({
        method: "POST",
        path: "/api/upload",
        body: largeBody,
        timestamp: 1234567890,
      });

      expect(payload.signature).toBeDefined();
      expect(payload.signature.length).toBeGreaterThan(0);
    });

    test("should handle paths with Unicode characters", () => {
      const signer = new Signer(testCredentials);
      const unicodePaths = ["/api/test/café", "/api/test/你好", "/api/test/🚀"];

      for (const path of unicodePaths) {
        const payload = signer.createHeaderPayload({
          method: "GET",
          path,
          timestamp: 1234567890,
          body: undefined,
        });
        expect(payload.signature).toBeDefined();
        expect(payload.signature.length).toBeGreaterThan(0);
      }
    });

    test("should handle bodies with special characters", () => {
      const signer = new Signer(testCredentials);
      const specialBodies = [
        '{"message":"Hello\nWorld"}', // newline
        '{"message":"Quote: \\"test\\""}', // quotes
        '{"message":"Tab:\there"}', // tab
        '{"emoji":"🎉"}', // emoji
      ];

      for (const body of specialBodies) {
        const payload = signer.createHeaderPayload({
          method: "POST",
          path: "/api/test",
          body,
          timestamp: 1234567890,
        });
        expect(payload.signature).toBeDefined();
        expect(payload.signature.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Credentials Validation", () => {
    test("should store credentials correctly", () => {
      const signer = new Signer(testCredentials);

      expect(signer.credentials.key).toBe(testCredentials.key);
      expect(signer.credentials.secret).toBe(testCredentials.secret);
      expect(signer.credentials.passphrase).toBe(testCredentials.passphrase);
    });

    test("should use correct key in output", () => {
      const signer = new Signer(testCredentials);
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: 1234567890,
        body: undefined,
      });

      expect(payload.key).toBe(testCredentials.key);
    });

    test("should use correct passphrase in output", () => {
      const signer = new Signer(testCredentials);
      const payload = signer.createHeaderPayload({
        method: "GET",
        path: "/api/test",
        timestamp: 1234567890,
        body: undefined,
      });

      expect(payload.passphrase).toBe(testCredentials.passphrase);
    });
  });
});
