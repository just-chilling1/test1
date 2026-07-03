"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Download,
  ImageIcon,
  Library,
  Link2,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import { imageForgeTemplates } from "@/features/image-forge/config/image-forge.config";
import type { GeneratedImage } from "@/features/image-forge/types";
import { clsx } from "clsx";

export default function ImageForgePage() {
  const [prompt, setPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewPrompt, setPreviewPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<GeneratedImage[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(true);

  const loadLibrary = useCallback(async () => {
    setLoadingLibrary(true);
    try {
      const res = await fetch("/api/generated-images");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load library");
      setLibrary(data.images ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load library");
    } finally {
      setLoadingLibrary(false);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const applyTemplate = (templateId: string) => {
    const template = imageForgeTemplates.find((t) => t.id === templateId);
    if (!template) return;
    setSelectedTemplate(templateId);
    setPrompt(template.promptPrefix);
  };

  const handleGenerate = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setGenerating(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");

      setPreviewUrl(data.imageUrl);
      setPreviewPrompt(data.prompt || trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!previewUrl || !previewPrompt) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/generated-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: previewPrompt,
          imageUrl: previewUrl,
          templateId: selectedTemplate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save image");

      setSaved(true);
      setLibrary((prev) => [data.image, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save image");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (url: string, filename = "image-forge.png") => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/generated-images?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete image");
      setLibrary((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete image");
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
          {brand.productName} · Image Forge
        </p>
        <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Generate marketing images</h1>
        <p className="text-text-secondary text-sm max-w-2xl">
          Enter a prompt or pick a template, generate a preview, then save to your library or download.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base flex flex-col gap-5"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Wand2 size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="brand-font text-lg text-text-primary">Prompt or template</h2>
            <p className="text-sm text-text-secondary">Describe the image you want to create.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {imageForgeTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => applyTemplate(template.id)}
              className={clsx(
                "px-3 py-2 rounded-lg border text-left transition-all",
                selectedTemplate === template.id
                  ? "border-accent/50 bg-accent/10 text-text-primary"
                  : "border-border-dim/40 bg-page text-text-muted hover:border-accent/30 hover:text-text-primary"
              )}
            >
              <span className="block text-xs font-bold">{template.label}</span>
              <span className="block text-[10px] text-text-muted mt-0.5">{template.description}</span>
            </button>
          ))}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setSelectedTemplate(null);
          }}
          placeholder='e.g. "Minimal fitness app promo on a dark gradient background"'
          rows={4}
          className="input-base w-full resize-none"
        />

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating || !prompt.trim()}
          className="btn-primary w-full sm:w-fit"
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Image
            </>
          )}
        </button>
      </motion.div>

      {(previewUrl || generating) && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-base flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <ImageIcon size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="brand-font text-lg text-text-primary">Preview</h2>
              <p className="text-sm text-text-secondary line-clamp-2">{previewPrompt || prompt}</p>
            </div>
          </div>

          <div className="aspect-square max-w-lg rounded-xl border border-border-dim bg-page overflow-hidden flex items-center justify-center">
            {generating ? (
              <div className="flex flex-col items-center gap-3 text-text-muted">
                <Loader2 className="animate-spin" size={28} />
                <span className="text-xs uppercase tracking-widest">Creating image...</span>
              </div>
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Generated preview" className="w-full h-full object-cover" />
            ) : null}
          </div>

          {previewUrl && !generating && (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleSave} disabled={saving || saved} className="btn-primary">
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Save size={18} />
                    Saved
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save to Library
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleDownload(previewUrl)}
                className="btn-secondary"
              >
                <Download size={18} />
                Download
              </button>
              <button type="button" onClick={handleGenerate} disabled={generating} className="btn-secondary">
                <RefreshCw size={18} />
                Regenerate
              </button>
              {isFeatureEnabled("money-links-vault") && (
                <Link href="/link-vault" className="btn-secondary">
                  <Link2 size={18} />
                  Attach in Link Vault
                </Link>
              )}
            </div>
          )}
        </motion.div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Library size={18} className="text-accent" />
            <h2 className="brand-font text-xl text-text-primary">Your library</h2>
          </div>
          <button type="button" onClick={loadLibrary} className="btn-secondary py-2 px-3 text-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {loadingLibrary ? (
          <div className="flex items-center gap-3 text-text-muted text-sm py-8">
            <Loader2 className="animate-spin" size={18} />
            Loading library...
          </div>
        ) : library.length === 0 ? (
          <div className="card-base text-center py-10 text-text-muted text-sm">
            No saved images yet. Generate one and click Save to Library.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {library.map((image) => (
              <div key={image.id} className="card-base flex flex-col gap-3 p-0 overflow-hidden">
                <div className="aspect-square bg-page">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.image_url} alt={image.prompt} className="w-full h-full object-cover" />
                </div>
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <p className="text-xs text-text-secondary line-clamp-2">{image.prompt}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownload(image.image_url, `image-forge-${image.id.slice(0, 8)}.png`)}
                      className="btn-secondary flex-1 py-2 text-xs"
                    >
                      <Download size={14} />
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(image.id)}
                      className="btn-secondary py-2 px-3 text-red-400 hover:text-red-300"
                      aria-label="Delete image"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
