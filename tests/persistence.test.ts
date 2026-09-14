import { beforeEach, expect, test, spyOn } from "bun:test";
import { IDBFactory } from "fake-indexeddb";
import { loadDraft, saveDraft } from "../lib/dmgly/persistence";
import { createComposition } from "../lib/dmgly/model";

beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

test("a draft round-trips with uploaded assets and hidden layer settings", async () => {
  expect(await loadDraft()).toBeNull();
  const design = createComposition();
  design.text.visible = false;
  design.text.content = "Install → Café";
  design.app.image = {
    name: "icon.png",
    width: 1,
    height: 1,
    data: "data:image/png;base64,iVBORw0KGgo=",
  };
  await saveDraft(design);
  expect(await loadDraft()).toEqual(design);
});

test("unavailable storage rejects with a recoverable editing message", async () => {
  const unavailable = spyOn(indexedDB, "open").mockImplementation(() => {
    throw new Error("blocked");
  });
  try {
    await expect(loadDraft()).rejects.toThrow("You can still edit and export");
  } finally {
    unavailable.mockRestore();
  }
});

test("invalid data never replaces the last valid draft", async () => {
  const design = createComposition();
  await saveDraft(design);
  await expect(
    saveDraft({ ...design, app: { ...design.app, name: "bad/name" } }),
  ).rejects.toThrow();
  expect(await loadDraft()).toEqual(design);
});
