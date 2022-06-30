import * as nearAPI from "near-api-js";
import network from "../../../network";
import { getEnv } from "../../../env";
import { getStakingDeposits } from "./index";
import {
  NearAccessKey,
  NearProtocolConfig,
  NearStakingPosition,
} from "./sdk.types";
import BigNumber from "bignumber.js";

export const getProtocolConfig = async (): Promise<NearProtocolConfig> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "EXPERIMENTAL_protocol_config",
      params: {
        finality: "final",
      },
    },
  });

  return data.result;
};

export const getGasPrice = async (): Promise<string> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "gas_price",
      params: [null],
    },
  });

  return data?.result?.gas_price;
};

export const getAccessKey = async ({
  address,
  publicKey,
}: {
  address: string;
  publicKey: string;
}): Promise<NearAccessKey> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "query",
      params: {
        request_type: "view_access_key",
        finality: "final",
        account_id: address,
        public_key: publicKey,
      },
    },
  });

  return data.result || {};
};

export const broadcastTransaction = async (
  transaction: string
): Promise<string> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "broadcast_tx_async",
      params: [transaction],
    },
  });

  return data.result;
};

export const getStakingPositions = async (
  address: string
): Promise<NearStakingPosition[]> => {
  const stakingDeposits = await getStakingDeposits(address);

  const { connect, keyStores } = nearAPI;

  const config = {
    networkId: "mainnet",
    keyStore: new keyStores.InMemoryKeyStore(),
    nodeUrl: getEnv("API_NEAR_ARCHIVE_NODE"),
    headers: {},
  };

  const near = await connect(config);
  const account = await near.account(address);

  const stakingPositions = await Promise.all(
    stakingDeposits.map(async ({ validator_id: validatorId }) => {
      const contract = new nearAPI.Contract(account, validatorId, {
        viewMethods: ["get_account_staked_balance"],
        changeMethods: [],
      });

      // Method is dynamically added
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const amount = await contract.get_account_staked_balance({
        account_id: address,
      });

      return {
        amount: new BigNumber(amount),
        validatorId,
      };
    })
  );

  return stakingPositions;
};
