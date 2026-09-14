import { compositionSchema, type ImageAsset } from "./model";

const assetSchema = compositionSchema.shape.app.shape.image.unwrap();
const references = new WeakMap<ImageAsset, Promise<string>>();

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open("dmgly", 2);
    } catch {
      reject(
        new Error(
          "Image storage is unavailable. You can still edit and export.",
        ),
      );
      return;
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("assets"))
        request.result.createObjectStore("assets");
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Close other Dmgly tabs to enable image saving."));
  });
}

export async function loadAsset(reference: string): Promise<ImageAsset | null> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction("assets")
        .objectStore("assets")
        .get(reference);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const parsed = assetSchema.safeParse(request.result);
        resolve(parsed.success ? parsed.data : null);
      };
    });
  } finally {
    db.close();
  }
}

export function saveAsset(asset: ImageAsset): Promise<string> {
  const cached = references.get(asset);
  if (cached) return cached;
  const saving = (async () => {
    const parsed = assetSchema.parse(asset);
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(parsed.data),
    );
    const reference = `local:${Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
    const db = await database();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("assets", "readwrite");
        transaction.objectStore("assets").put(parsed, reference);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
      return reference;
    } finally {
      db.close();
    }
  })();
  references.set(asset, saving);
  saving.catch(() => references.delete(asset));
  return saving;
}
