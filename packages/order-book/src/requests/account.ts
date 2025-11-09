import type { BaseClient } from "../base-client.ts";

export class AccountRequests {
  constructor(private readonly client: BaseClient) {}

  /**
   * Get balance and allowance for a token
   */
  async getBalanceAllowance(
    tokenId: string,
    address: string,
  ): Promise<BalanceAllowanceResponse> {
    return this.client.request<BalanceAllowanceResponse>({
      method: "GET",
      path: "/balance-allowance",
      auth: { kind: "l2" },
      options: {
        params: { token_id: tokenId, address },
      },
    });
  }
}

export type BalanceAllowanceResponse = {
  balance: string;
  allowance: string;
};
