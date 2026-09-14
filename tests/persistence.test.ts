import { beforeEach, expect, test, spyOn } from "bun:test";
import { IDBFactory } from "fake-indexeddb";
import { loadAsset, saveAsset } from "../lib/dmgly/persistence";

const image = () => ({
  name: "icon.png",
  width: 1,
  height: 1,
  data: "data:image/png;base64,iVBORw0KGgo=",
});
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

test("uploaded images round-trip by stable content reference", async () => {
  const asset = image();
  const id = await saveAsset(asset);
  expect(id).toMatch(/^local:[a-f0-9]{64}$/);
  expect(await loadAsset(id)).toEqual(asset);
  expect(await saveAsset({ ...asset })).toBe(id);
  expect(await loadAsset(`local:${"0".repeat(64)}`)).toBeNull();
});

test("unavailable image storage permits retry after recovery", async () => {
  const asset = image();
  const unavailable = spyOn(indexedDB, "open").mockImplementation(() => {
    throw new Error("blocked");
  });
  try {
    await expect(saveAsset(asset)).rejects.toThrow(
      "You can still edit and export",
    );
  } finally {
    unavailable.mockRestore();
  }
  expect(await loadAsset(await saveAsset(asset))).toEqual(asset);
});

test("invalid assets never enter storage", async () => {
  await expect(
    saveAsset({ ...image(), data: "https://example.com/image.png" }),
  ).rejects.toThrow();
});

test("upgrading a legacy database preserves its draft without restoring or updating it", async () => {
  await new Promise<void>((resolve) => {
    const request = indexedDB.open("dmgly", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction("drafts", "readwrite");
      transaction.objectStore("drafts").put({ legacy: true }, "current");
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
    };
  });
  const id = await saveAsset(image());
  expect(await loadAsset(id)).toEqual(image());
  const legacy = await new Promise((resolve) => {
    const request = indexedDB.open("dmgly", 2);
    request.onsuccess = () => {
      const db = request.result;
      const read = db
        .transaction("drafts")
        .objectStore("drafts")
        .get("current");
      read.onsuccess = () => {
        resolve(read.result);
        db.close();
      };
    };
  });
  expect(legacy).toEqual({ legacy: true });
});
