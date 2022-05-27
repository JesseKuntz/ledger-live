import type Transport from "@ledgerhq/hw-transport";
import { createClient } from "near-ledger-js";
import { PublicKey } from "near-api-js/lib/utils";
import { KeyType } from "near-api-js/lib/utils/key_pair";

export default class Near {
  transport: Transport;

  constructor(transport: Transport) {
    this.transport = transport;
  }

  async getAddress(path: string): Promise<{
    publicKey: string;
    address: string;
  }> {
    const client = await createClient(this.transport);
    const rawPublicKey = await client.getPublicKey(path);

    const publicKey = new PublicKey({
      keyType: KeyType.ED25519,
      data: rawPublicKey,
    });

    return {
      address: rawPublicKey.toString("hex"),
      publicKey: publicKey.toString(),
    };
  }

  async signTransaction(
    transaction: Uint8Array,
    path: string
  ): Promise<string> {
    const client = await createClient(this.transport);
    const signature = await client.sign(transaction, path);

    return signature;
  }
}
