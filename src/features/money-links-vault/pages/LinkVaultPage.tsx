"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Check,
  Copy,
  ExternalLink,
  ImageIcon,
  Link2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { brand } from "@/config/brand.config";
import { isFeatureEnabled } from "@/config/features.config";
import {
  emptyLinkForm,
  type MoneyLink,
  type MoneyLinkForm,
} from "@/features/money-links-vault/types";
import { clsx } from "clsx";

interface GeneratedImageOption {
  id: string;
  prompt: string;
  image_url: string;
}

function getImageUrl(link: MoneyLink): string | null {
  const nested = link.generated_images;
  if (nested && typeof nested === "object" && "image_url" in nested) {
    return nested.image_url;
  }
  return null;
}

export default function LinkVaultPage() {
  const [links, setLinks] = useState<MoneyLink[]>([]);
  const [images, setImages] = useState<GeneratedImageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MoneyLinkForm>(emptyLinkForm);

  const loadLinks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/links");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load links");
      setLinks(data.links ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load links");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadImages = useCallback(async () => {
    if (!isFeatureEnabled("image-forge")) return;
    try {
      const res = await fetch("/api/generated-images");
      const data = await res.json();
      if (res.ok) setImages(data.images ?? []);
    } catch {
      // optional attachment source
    }
  }, []);

  useEffect(() => {
    loadLinks();
    loadImages();
  }, [loadLinks, loadImages]);

  const resetForm = () => {
    setForm(emptyLinkForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (link: MoneyLink) => {
    setEditingId(link.id);
    setForm({
      label: link.label,
      url: link.url,
      niche: link.niche || "",
      notes: link.notes || "",
      imageId: link.image_id,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/links", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          label: form.label,
          url: form.url,
          niche: form.niche,
          notes: form.notes,
          imageId: form.imageId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save link");

      if (editingId) {
        setLinks((prev) => prev.map((l) => (l.id === editingId ? data.link : l)));
      } else {
        setLinks((prev) => [data.link, ...prev]);
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save link");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      const res = await fetch(`/api/links?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete link");
      setLinks((prev) => prev.filter((l) => l.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete link");
    }
  };

  const handleCopy = async (link: MoneyLink) => {
    await navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-text-muted">
            {brand.productName} · Link Vault
          </p>
          <h1 className="brand-font text-2xl sm:text-3xl text-text-primary">Your affiliate links</h1>
          <p className="text-text-secondary text-sm max-w-2xl">
            Save links with labels and niches. Copy in one click when you are ready to promote.
          </p>
        </div>
        {!showForm && (
          <button type="button" onClick={() => setShowForm(true)} className="btn-primary shrink-0">
            <Plus size={18} />
            Add Link
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>
      )}

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card-base flex flex-col gap-4"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="brand-font text-lg text-text-primary">
              {editingId ? "Edit link" : "Add link"}
            </h2>
            <button type="button" onClick={resetForm} className="text-text-muted hover:text-text-primary">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Label</span>
              <input
                type="text"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Weight loss offer"
                className="input-base"
                required
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Niche</span>
              <input
                type="text"
                value={form.niche}
                onChange={(e) => setForm({ ...form, niche: e.target.value })}
                placeholder="e.g. Health"
                className="input-base"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Affiliate URL</span>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="https://..."
              className="input-base"
              required
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Optional reminders about this offer"
              rows={2}
              className="input-base resize-none"
            />
          </label>

          {isFeatureEnabled("image-forge") && images.length > 0 && (
            <label className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-muted uppercase tracking-widest">
                Attach image (optional)
              </span>
              <select
                value={form.imageId || ""}
                onChange={(e) => setForm({ ...form, imageId: e.target.value || null })}
                className="input-base"
              >
                <option value="">No image</option>
                {images.map((img) => (
                  <option key={img.id} value={img.id}>
                    {img.prompt.slice(0, 60)}
                  </option>
                ))}
              </select>
            </label>
          )}

          {isFeatureEnabled("image-forge") && images.length === 0 && (
            <p className="text-xs text-text-muted">
              Generate images in{" "}
              <Link href="/image-forge" className="text-accent hover:underline">
                Image Forge
              </Link>{" "}
              to attach visuals to links.
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {editingId ? "Update Link" : "Save Link"}
                </>
              )}
            </button>
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          </div>
        </motion.form>
      )}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link2 size={18} className="text-accent" />
          <h2 className="brand-font text-xl text-text-primary">
            Saved links ({links.length})
          </h2>
        </div>
        <button type="button" onClick={loadLinks} className="btn-secondary py-2 px-3 text-sm">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-text-muted text-sm py-8">
          <Loader2 className="animate-spin" size={18} />
          Loading links...
        </div>
      ) : links.length === 0 ? (
        <div className="card-base text-center py-12 flex flex-col items-center gap-4">
          <Link2 size={32} className="text-text-muted/30" />
          <p className="text-sm text-text-muted">No links saved yet. Add your first affiliate URL above.</p>
          {!showForm && (
            <button type="button" onClick={() => setShowForm(true)} className="btn-primary">
              <Plus size={18} />
              Add Link
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {links.map((link) => {
            const imageUrl = getImageUrl(link);
            return (
              <motion.div
                key={link.id}
                layout
                className="card-base flex flex-col gap-4 p-0 overflow-hidden"
              >
                {imageUrl && (
                  <div className="aspect-video bg-page">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageUrl} alt={link.label} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="brand-font text-lg text-text-primary truncate">{link.label}</h3>
                      {link.niche && (
                        <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded">
                          {link.niche}
                        </span>
                      )}
                    </div>
                    {!imageUrl && link.image_id && (
                      <ImageIcon size={16} className="text-text-muted shrink-0" />
                    )}
                  </div>

                  <p className="text-xs text-text-muted break-all line-clamp-2">{link.url}</p>
                  {link.notes && (
                    <p className="text-xs text-text-secondary line-clamp-2">{link.notes}</p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCopy(link)}
                      className={clsx(
                        "btn-primary flex-1 py-2 text-xs",
                        copiedId === link.id && "bg-green-600 border-green-600"
                      )}
                    >
                      {copiedId === link.id ? (
                        <>
                          <Check size={14} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copy URL
                        </>
                      )}
                    </button>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-2 px-3"
                      aria-label="Open link"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => startEdit(link)}
                      className="btn-secondary py-2 px-3"
                      aria-label="Edit link"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(link.id)}
                      className="btn-secondary py-2 px-3 text-red-400 hover:text-red-300"
                      aria-label="Delete link"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
