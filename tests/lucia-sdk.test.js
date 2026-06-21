import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it, mock } from "node:test";

import LuciaSDK from "../src/index.js";

function createLocalStorage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    clear() {
      values.clear();
    },
  };
}

function installBrowserEnvironment() {
  const localStorage = createLocalStorage();
  const calls = [];

  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorage,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
    cookie: "",
    referrer: "https://referrer.example/",
    createElement(tagName) {
      assert.equal(tagName, "canvas");
      return {
        id: "",
        getContext() {
          return {
            fillStyle: "",
            shadowBlur: 0,
            shadowColor: "",
            textBaseline: "",
            font: "",
            beginPath() {},
            rect() {},
            fill() {},
            stroke() {},
            closePath() {},
            arc() {},
            rotate() {},
            fillText() {},
            fillRect() {},
          };
        },
        toDataURL() {
          return "data:image/png;base64,lucia";
        },
      };
    },
    createEvent(type) {
      if (type === "TouchEvent") return {};
      throw new Error(`unsupported event ${type}`);
    },
    },
  });
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: {
    plugins: [{ name: "PDF Viewer" }],
    deviceMemory: 8,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    hardwareConcurrency: 12,
    language: "en-US",
    permissions: {
      webglVersion: "WebGL 2",
      RENDERER: "ANGLE",
      geolocation: "prompt",
    },
    platform: "Win32",
    },
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
    screen: {
      colorDepth: 24,
      width: 1920,
      height: 1080,
      availHeight: 1040,
      availWidth: 1920,
      orientation: {
        type: "landscape-primary",
        angle: 0,
      },
    },
    localStorage,
    openDatabase: undefined,
    location: {
      search: "?lid=campaign-123",
    },
    devicePixelRatio: 1,
    ethereum: {
      selectedAddress: "0xabc",
      isMetaMask: true,
      isConnected: () => true,
      send: () => {},
    },
    },
  });

  globalThis.fetch = mock.fn(async (url, options) => {
    calls.push({ url, options });
    return {
      async json() {
        return { lid: "lid-from-api" };
      },
    };
  });

  return { localStorage, calls };
}

async function waitForFetchCalls(count) {
  for (let attempt = 0; attempt < 25; attempt += 1) {
    if (globalThis.fetch.mock.callCount() >= count) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.equal(globalThis.fetch.mock.callCount(), count);
}

describe("LuciaSDK", () => {
  beforeEach(() => {
    mock.reset();
    installBrowserEnvironment();
  });

  afterEach(() => {
    delete globalThis.document;
    delete globalThis.fetch;
    delete globalThis.localStorage;
    delete globalThis.navigator;
    delete globalThis.window;
  });

  it("initializes browser-only methods and records a new session", async () => {
    LuciaSDK.init({
      clientId: "client-1",
      baseURL: "https://api.example.test",
      api_key: "secret-key",
      username: "alice",
    });
    await waitForFetchCalls(1);

    assert.equal(typeof LuciaSDK.authenticate, "function");
    assert.equal(typeof LuciaSDK.pageView, "function");
    assert.equal(typeof LuciaSDK.checkMetaMaskConnection, "function");
    assert.match(globalThis.localStorage.getItem("luci_session"), /"id":/);

    await LuciaSDK.authenticate();

    assert.equal(globalThis.fetch.mock.callCount(), 2);
    assert.equal(
      globalThis.fetch.mock.calls[1].arguments[0],
      "https://api.example.test/api/key/auth/",
    );
    assert.deepEqual(
      JSON.parse(globalThis.fetch.mock.calls[1].arguments[1].body),
      { user: "client-1", key: "secret-key" },
    );
  });

  it("sends page and conversion events with client, session, and lid context", async () => {
    LuciaSDK.init({
      clientId: "client-2",
      baseURL: "https://api.example.test",
      api_key: "secret-key",
      username: "bob",
    });
    await waitForFetchCalls(1);

    await LuciaSDK.pageView("/pricing");
    await LuciaSDK.trackConversion("purchase", 49, { plan: "pro" });

    assert.equal(globalThis.fetch.mock.callCount(), 3);

    const pageCall = globalThis.fetch.mock.calls[1].arguments;
    assert.equal(pageCall[0], "https://api.example.test/api/sdk/page/");
    const pageBody = JSON.parse(pageCall[1].body);
    assert.equal(pageBody.client, "client-2");
    assert.equal(pageBody.page, "/pricing");
    assert.equal(pageBody.lid, "lid-from-api");
    assert.equal(pageBody.user.name, "bob");
    assert.ok(pageBody.session.id);

    const conversionCall = globalThis.fetch.mock.calls[2].arguments;
    assert.equal(
      conversionCall[0],
      "https://api.example.test/api/sdk/conversion/",
    );
    const conversionBody = JSON.parse(conversionCall[1].body);
    assert.equal(conversionBody.tag, "purchase");
    assert.equal(conversionBody.amount, 49);
    assert.deepEqual(conversionBody.event, { plan: "pro" });
  });

  it("detects a connected MetaMask wallet", async () => {
    LuciaSDK.init({
      clientId: "client-3",
      baseURL: "https://api.example.test",
      api_key: "secret-key",
    });
    await waitForFetchCalls(1);

    assert.equal(LuciaSDK.checkMetaMaskConnection(), true);

    globalThis.window.ethereum.selectedAddress = "";

    assert.equal(LuciaSDK.checkMetaMaskConnection(), false);
  });
});
