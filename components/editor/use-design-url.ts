"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryState } from "nuqs";
import {
  Composition,
  compositionSchema,
  createComposition,
  type ImageAsset,
} from "@/lib/dmgly/model";
import { loadAsset, saveAsset } from "@/lib/dmgly/persistence";
import {
  compositionSettings,
  DEFAULT_BACKGROUND_ID,
  defaultSettings,
  parseSettings,
  serializeSettings,
  settingsParser,
  type AssetReference,
  type UrlSettings,
} from "@/lib/dmgly/url-state";

type Binding = { asset: ImageAsset | null; reference: AssetReference };
const matches = (a: ImageAsset | null, b: ImageAsset | null) =>
  a === b || (!!a && !!b && a.data === b.data);
const starter = createComposition();
const defaultKey = serializeSettings(defaultSettings);

export function useDesignUrl(
  document: Composition,
  restore: (d: Composition) => void,
) {
  const [settings, setSettings] = useQueryState("design", settingsParser);
  const key = serializeSettings(settings);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Opening design…");
  const saved = useRef<Composition | null>(null);
  const lastWritten = useRef<string | null>(null);
  const loading = useRef(true);
  const revision = useRef(0);
  const bindings = useRef<{ app: Binding; background: Binding }>({
    app: { asset: null, reference: null },
    background: {
      asset: starter.background.image,
      reference: DEFAULT_BACKGROUND_ID,
    },
  });
  const missing = useRef(false);
  const snapshots = useRef(
    new WeakMap<Composition, { app: Binding; background: Binding }>(),
  );

  useEffect(() => {
    if (key === lastWritten.current) return;
    lastWritten.current = null;
    let cancelled = false;
    const current = ++revision.current;
    loading.current = true;
    setReady(false);
    async function hydrate() {
      let unavailable = false;
      async function image(
        reference: AssetReference,
      ): Promise<ImageAsset | null> {
        if (!reference) return null;
        if (reference === DEFAULT_BACKGROUND_ID)
          return starter.background.image;
        const asset = await loadAsset(reference).catch(() => null);
        if (!asset) unavailable = true;
        return asset;
      }
      const [appImage, backgroundImage] = await Promise.all([
        image(settings.app.image),
        image(settings.background.image),
      ]);
      if (cancelled || current !== revision.current) return;
      const value: Composition = {
        ...settings,
        app: { ...settings.app, image: appImage },
        background: { ...settings.background, image: backgroundImage },
      };
      bindings.current = {
        app: { asset: appImage, reference: settings.app.image },
        background: {
          asset: backgroundImage,
          reference: settings.background.image,
        },
      };
      missing.current = unavailable;
      snapshots.current.set(value, bindings.current);
      saved.current = value;
      restore(value);
      loading.current = false;
      setReady(true);
      const raw = new URLSearchParams(window.location.search).get("design");
      setStatus(
        unavailable
          ? "Some images are missing on this device. Upload them again."
          : raw && !parseSettings(raw)
            ? "This design link is invalid. Showing the default design."
            : hasLocalImages(settings)
              ? "Settings in URL. Images saved on this device."
              : "Settings saved in URL",
      );
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [key, settings, restore]);

  useEffect(() => {
    if (!ready || loading.current || saved.current === document) return;
    let cancelled = false;
    const current = ++revision.current;
    setStatus("Updating link…");
    const timer = setTimeout(async () => {
      if (!compositionSchema.safeParse(document).success) {
        setStatus("Complete the app name to update the link.");
        return;
      }
      async function reference(
        asset: ImageAsset | null,
        binding: Binding,
        background = false,
      ): Promise<AssetReference> {
        if (matches(asset, binding.asset)) return binding.reference;
        if (!asset) return null;
        if (background && matches(asset, starter.background.image))
          return DEFAULT_BACKGROUND_ID;
        return saveAsset(asset);
      }
      try {
        const previous = snapshots.current.get(document) ?? bindings.current;
        const [appImage, backgroundImage] = await Promise.all([
          reference(document.app.image, previous.app),
          reference(document.background.image, previous.background, true),
        ]);
        if (cancelled || current !== revision.current) return;
        const next = compositionSettings(
          document,
          appImage as UrlSettings["app"]["image"],
          backgroundImage,
        );
        lastWritten.current = serializeSettings(next);
        saved.current = document;
        bindings.current = {
          app: { asset: document.app.image, reference: appImage },
          background: {
            asset: document.background.image,
            reference: backgroundImage,
          },
        };
        missing.current = !!(
          (appImage && !document.app.image) ||
          (backgroundImage && !document.background.image)
        );
        snapshots.current.set(document, bindings.current);
        await setSettings(next);
        if (cancelled || current !== revision.current) return;
        setStatus(
          missing.current
            ? "Some images are missing on this device. Upload them again."
            : hasLocalImages(next)
              ? "Settings in URL. Images saved on this device."
              : "Settings saved in URL",
        );
      } catch {
        if (!cancelled && current === revision.current)
          setStatus("Could not save the link or images. You can still export.");
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      cancelled = true;
    };
  }, [document, ready, setSettings]);

  const reset = useCallback(
    (value: Composition) => {
      revision.current++;
      loading.current = false;
      missing.current = false;
      lastWritten.current = defaultKey;
      saved.current = value;
      bindings.current = {
        app: { asset: null, reference: null },
        background: {
          asset: value.background.image,
          reference: DEFAULT_BACKGROUND_ID,
        },
      };
      setReady(true);
      setStatus("Settings saved in URL");
      void setSettings(null).catch(() =>
        setStatus("Could not clear the design link. Try Reset again."),
      );
    },
    [setSettings],
  );

  return { ready, status, reset };
}

function hasLocalImages(settings: {
  app: { image: AssetReference };
  background: { image: AssetReference };
}) {
  return (
    settings.app.image?.startsWith("local:") ||
    settings.background.image?.startsWith("local:")
  );
}
