"use client";
import { Upload01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "./icon";
import { useEffect, useId, useRef, useState } from "react";
import { ImageAsset } from "@/lib/dmgly/model";
import { readImageAsset } from "@/lib/dmgly/images";
export function AssetUpload({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description?: string;
  value: ImageAsset | null;
  onChange: (value: ImageAsset | null) => void;
}) {
  const hintId = useId();
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
            <Icon icon={Upload01Icon} size={24} />
            <span>{label}</span>
          </>
        )}
        <span className="upload-details" id={hintId}>
          <span className="upload-hint">
            {busy ? "Opening image…" : "PNG, JPEG or WebP up to 10 MB"}
          </span>
          {description && <span className="upload-hint">{description}</span>}
        </span>
        <input
          name={label}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          aria-label={label}
          aria-describedby={hintId}
          disabled={busy}
          onChange={(e) => {
            void upload(e.currentTarget.files?.[0]);
            e.currentTarget.value = "";
          }}
        />
      </label>
      {value && (
        <button
          type="button"
          className="secondary-button"
          onClick={() => {
            revision.current++;
            setBusy(false);
            onChange(null);
          }}
        >
          <Icon icon={Cancel01Icon} size={16} />
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
