import type { Resolver } from "../../hw/getAddress/types";

import Near from "./hw-app-near";

const resolver: Resolver = async (transport, { path }) => {
  const near = new Near(transport);

  const r = await near.getAddress(path);

  return {
    address: r.address,
    publicKey: r.publicKey,
    path,
  };
};

export default resolver;
