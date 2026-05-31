'use client';

import { useDropzone } from 'react-dropzone';
import { useState } from 'react';
import { UploadCloud, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function MediaUploader({ onUploaded }: { onUploaded: (urls: string[]) => void }) {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  const onDrop = async (accepted: File[]) => {
    if (!accepted.length) return;

    setUploadError(null);
    setUploaded(false);
    setUploading(true);

    const previews = accepted.map((f) =>
      Object.assign(f, { preview: URL.createObjectURL(f) })
    );
    setFiles(previews);

    try {
      const fd = new FormData();
      accepted.forEach((f) => fd.append('files', f));

      const res = await fetch('/api/upload', { method: 'POST', body: fd });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed (${res.status}): ${text}`);
      }

      const json = await res.json();

      if (!json?.data?.urls || !Array.isArray(json.data.urls)) {
        throw new Error('Server returned an unexpected response. No URLs received.');
      }

      onUploaded(json.data.urls);
      setUploaded(true);
    } catch (err: any) {
      console.error('[MediaUploader] Upload error:', err);
      setUploadError(err?.message || 'Upload failed. Please try again.');
      setFiles([]);
      onUploaded([]);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    disabled: uploading,
  });

  return (
    <Card>
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-xl border border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-blue-400/80 bg-blue-400/5'
            : uploading
            ? 'border-slate-600/40 cursor-not-allowed opacity-60'
            : 'border-blue-400/40 hover:border-blue-400/60'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="mx-auto text-blue-300 animate-spin" size={28} />
            <p className="text-slate-400 text-sm">Uploading media, please wait…</p>
          </div>
        ) : (
          <>
            <UploadCloud className="mx-auto mb-3 text-blue-300" />
            <p className="text-slate-300 text-sm font-medium">
              Drag &amp; drop images/videos or click to upload
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Evidence media is <span className="text-amber-400 font-semibold">required</span> to submit a complaint
            </p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
          <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400">{uploadError}</p>
        </div>
      )}

      {uploaded && !uploadError && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2">
          <CheckCircle size={15} className="text-emerald-400 shrink-0" />
          <p className="text-xs text-emerald-400">{files.length} file(s) uploaded successfully.</p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {files.map((f) => (
            <div key={f.name} className="text-xs">
              {f.type.startsWith('video') ? (
                <video src={f.preview} className="h-24 w-full rounded object-cover" controls={false} />
              ) : (
                <img src={f.preview} className="h-24 w-full rounded object-cover" alt={f.name} />
              )}
              <p className="truncate mt-1 text-slate-400">{f.name}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
