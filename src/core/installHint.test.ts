import { describe, expect, it } from "vitest";
import { detectInstallHintPlatform } from "./installHint";

const IPHONE_SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Mobile/15E148 Safari/604.1";
const IPHONE_CHROME_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 19_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.0.0 Mobile/15E148 Safari/604.1";
const ANDROID_CHROME_UA =
  "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36";
const MAC_SAFARI_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/19.0 Safari/605.1.15";

describe("detectInstallHintPlatform", () => {
  it("suggests iOS instructions on iPhone browsers (Safari and Chrome alike)", () => {
    expect(detectInstallHintPlatform(IPHONE_SAFARI_UA, false)).toBe("ios");
    expect(detectInstallHintPlatform(IPHONE_CHROME_UA, false)).toBe("ios");
  });

  it("suggests Android instructions on Android", () => {
    expect(detectInstallHintPlatform(ANDROID_CHROME_UA, false)).toBe("android");
  });

  it("shows nothing on desktop", () => {
    expect(detectInstallHintPlatform(MAC_SAFARI_UA, false)).toBeNull();
  });

  it("shows nothing when already running from the home screen", () => {
    expect(detectInstallHintPlatform(IPHONE_SAFARI_UA, true)).toBeNull();
    expect(detectInstallHintPlatform(ANDROID_CHROME_UA, true)).toBeNull();
  });
});
