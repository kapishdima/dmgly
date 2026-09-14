"use client";
import { useEffect, useRef, useState } from "react";
import { ImageAsset } from "@/lib/dmgly/model";
import { readImageAsset } from "@/lib/dmgly/images";
export function AssetUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ImageAsset | null;
  onChange: (value: ImageAsset | null) => void;
}) {
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  }, [onChange]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const revision = useRef(0);
  async function upload(file?: File) {
    if (!file) return;
    const id = ++revision.current;
    setBusy(true);
    setError("");
    try {
      const asset = await readImageAsset(file);
      if (id === revision.current) callback.current(asset);
    } catch (e) {
      if (id === revision.current) setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      if (id === revision.current) setBusy(false);
    }
  }
  return (
    <div
      className="asset-upload"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void upload(e.dataTransfer.files[0]);
      }}
    >
      <label className="upload-label">
        {value ? (
          <span className="upload-file">{value.name}</span>
        ) : (
          <>
            <span className="upload-plus">+</span>
            <span>{label}</span>
          </>
        )}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label={label}
          disabled={busy}
          onChange={(e) => {
            void upload(e.currentTarget.files?.[0]);
            e.currentTarget.value = "";
          }}
        />
      </label>
      <span className="upload-hint">
        {busy ? "Opening image…" : "PNG, JPEG or WebP · up to 10 MB"}
      </span>
      {value && (
        <button
          className="secondary-button"
          onClick={() => {
            revision.current++;
            setBusy(false);
            onChange(null);
          }}
        >
          Remove image
        </button>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
