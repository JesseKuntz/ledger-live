import { DeviceModelId } from "@ledgerhq/devices";
import { isBootloaderVersionSupported } from "./isBootloaderVersionSupported";

const { nanoS, nanoSP, nanoX, stax } = DeviceModelId;

test("isBootloaderVersionSupported", () => {
  /**
   * Nano S
   * */
  expect(isBootloaderVersionSupported("1.9.0", nanoS)).toBe(false);
  expect(isBootloaderVersionSupported("1.9.0-whatever0", nanoS)).toBe(false);

  expect(isBootloaderVersionSupported("2.0.0", nanoS)).toBe(true);
  expect(isBootloaderVersionSupported("2.0.0-rc1", nanoS)).toBe(true);
  expect(isBootloaderVersionSupported("2.0.1", nanoS)).toBe(true);
  expect(isBootloaderVersionSupported("2.0.1-whatever0", nanoS)).toBe(true);
  expect(isBootloaderVersionSupported("2.1.0", nanoS)).toBe(true);
  expect(isBootloaderVersionSupported("2.1.0-whatever0", nanoS)).toBe(true);
  expect(isBootloaderVersionSupported("3.0.0", nanoS)).toBe(true);
  expect(isBootloaderVersionSupported("3.0.0-whatever0", nanoS)).toBe(true);

  /**
   * Nano X
   * */
  expect(isBootloaderVersionSupported("1.9.0", nanoX)).toBe(false);
  expect(isBootloaderVersionSupported("1.9.0-whatever0", nanoX)).toBe(false);

  expect(isBootloaderVersionSupported("2.0.0", nanoX)).toBe(true);
  expect(isBootloaderVersionSupported("2.0.0-rc1", nanoX)).toBe(true);
  expect(isBootloaderVersionSupported("2.0.1", nanoX)).toBe(true);
  expect(isBootloaderVersionSupported("2.0.1-whatever0", nanoX)).toBe(true);
  expect(isBootloaderVersionSupported("2.1.0", nanoX)).toBe(true);
  expect(isBootloaderVersionSupported("2.1.0-whatever0", nanoX)).toBe(true);
  expect(isBootloaderVersionSupported("3.0.0", nanoX)).toBe(true);
  expect(isBootloaderVersionSupported("3.0.0-whatever0", nanoX)).toBe(true);

  /**
   * Nano SP
   * */
  expect(isBootloaderVersionSupported("0.9.0", nanoSP)).toBe(false);
  expect(isBootloaderVersionSupported("0.9.0-whatever0", nanoSP)).toBe(false);

  expect(isBootloaderVersionSupported("1.0.0", nanoSP)).toBe(true);
  expect(isBootloaderVersionSupported("1.0.0-rc1", nanoSP)).toBe(true);
  expect(isBootloaderVersionSupported("1.0.1", nanoSP)).toBe(true);
  expect(isBootloaderVersionSupported("1.0.1-whatever0", nanoSP)).toBe(true);
  expect(isBootloaderVersionSupported("1.1.0", nanoSP)).toBe(true);
  expect(isBootloaderVersionSupported("1.1.0-whatever0", nanoSP)).toBe(true);
  expect(isBootloaderVersionSupported("1.0.0", nanoSP)).toBe(true);
  expect(isBootloaderVersionSupported("1.0.0-whatever0", nanoSP)).toBe(true);

  /**
   * Stax
   * */
  expect(isBootloaderVersionSupported("0.9.0", stax)).toBe(false);
  expect(isBootloaderVersionSupported("1.0.0", stax)).toBe(true);
  expect(isBootloaderVersionSupported("1.0.0-whatever0", stax)).toBe(true);
});
