import type { Credentials } from "@polys/signer";
import type { BaseClient } from "../base-client.ts";

export class AuthRequests {
  constructor(private readonly client: BaseClient) {}

  /**
   * List all credentials associated with a Polygon address
   */
  async listApiKeys(): Promise<Credentials[]> {
    const response = await this.client.request<{ apiKeys: Credentials[] }>({
      method: "GET",
      path: "/auth/api-keys",
      auth: { kind: "l2" },
    });
    return response.apiKeys;
  }

  /**
   * Creates a new API key
   */
  async createApiKey(nonce: number): Promise<Credentials> {
    return this.client.request<Credentials>({
      method: "POST",
      path: "/auth/api-key",
      auth: {
        kind: "l1",
        nonce,
      },
    });
  }

  /**
   * Derive an existing API key for an address and nonce
   */
  async deriveApiKey(nonce: number): Promise<string> {
    const response = await this.client.request<{
      apiKey: string;
      secret: string;
      passphrase: string;
    }>({
      method: "GET",
      path: "/auth/derive-api-key",
      auth: {
        kind: "l1",
        nonce,
      },
    });
    return response.apiKey;
  }

  /**
   * Delete an API key
   */
  async deleteApiKey(): Promise<void> {
    return this.client.request({
      method: "DELETE",
      path: "/auth/api-key",
      auth: { kind: "l2" },
    });
  }

  /**
   * Retrieve the closed-only mode flag status
   */
  async getClosedOnlyMode(): Promise<void> {
    return this.client.request({
      method: "GET",
      path: "/auth/ban-status/closed-only",
      auth: { kind: "l2" },
    });
  }
}
