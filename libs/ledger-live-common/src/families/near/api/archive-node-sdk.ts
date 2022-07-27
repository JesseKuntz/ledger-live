import * as nearAPI from "near-api-js";
import network from "../../../network";
import { getEnv } from "../../../env";
import { getStakingDeposits } from "./index";
import {
  NearAccessKey,
  NearProtocolConfig,
  NearStakingPosition,
  NearRawValidator,
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
): Promise<{
  stakingPositions: NearStakingPosition[];
  totalStaked: BigNumber;
  totalAvailable: BigNumber;
  totalPending: BigNumber;
}> => {
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

  let totalStaked = new BigNumber(0);
  let totalAvailable = new BigNumber(0);
  let totalPending = new BigNumber(0);

  const stakingPositions = await Promise.all(
    stakingDeposits.map(async ({ validator_id: validatorId, deposit }) => {
      const contract = new nearAPI.Contract(account, validatorId, {
        viewMethods: [
          "get_account_staked_balance",
          "get_account_unstaked_balance",
          "is_account_unstaked_balance_available",
          "get_account_total_balance",
        ],
        changeMethods: [],
      });

      // Methods are dynamically added
      /* eslint-disable @typescript-eslint/ban-ts-comment */
      // @ts-ignore
      const rawStaked = await contract.get_account_staked_balance({
        account_id: address,
      });
      // @ts-ignore
      const rawUnstaked = await contract.get_account_unstaked_balance({
        account_id: address,
      });
      // @ts-ignore
      const isAvailable = await contract.is_account_unstaked_balance_available({
        account_id: address,
      });
      // @ts-ignore
      const rawTotal = await contract.get_account_total_balance({
        account_id: address,
      });
      /* eslint-enable */

      const unstaked = new BigNumber(rawUnstaked);

      let available = new BigNumber(0);
      let pending = unstaked;
      if (isAvailable) {
        available = unstaked;
        pending = new BigNumber(0);
      }
      let rewards = new BigNumber(0);

      const staked = new BigNumber(rawStaked);
      available = new BigNumber(available);
      pending = new BigNumber(pending);
      rewards = new BigNumber(rawTotal).minus(deposit);

      totalStaked = totalStaked.plus(staked);
      totalAvailable = totalAvailable.plus(available);
      totalPending = totalPending.plus(pending);

      return {
        staked,
        available,
        pending,
        rewards,
        validatorId,
      };
    })
  );

  return { stakingPositions, totalStaked, totalAvailable, totalPending };
};

export const getValidators = async (): Promise<NearRawValidator[]> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "validators",
      params: [null],
    },
  });

  return data?.result?.current_validators || [];
};

export const getCommission = async (
  address: string
): Promise<number | null> => {
  const { data } = await network({
    method: "POST",
    url: getEnv("API_NEAR_ARCHIVE_NODE"),
    data: {
      jsonrpc: "2.0",
      id: "id",
      method: "query",
      params: {
        request_type: "call_function",
        account_id: address,
        method_name: "get_reward_fee_fraction",
        args_base64: "e30=",
        finality: "optimistic",
      },
    },
  });

  const result = data?.result?.result;

  if (Array.isArray(result) && result.length) {
    const parsedResult = JSON.parse(String.fromCharCode.apply(null, result));

    return +((parsedResult.numerator / parsedResult.denominator) * 100).toFixed(
      2
    );
  }

  return null;
};
