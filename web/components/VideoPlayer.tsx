'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { VideoSource } from '@/lib/video';

/** วิดีโอ: ไฟล์ของเรา = เล่นเองแบบปิดเสียงวนซ้ำ + ปุ่มเปิดเสียง · Facebook/YouTube = iframe */
export function VideoPlayer({ video, title, poster, className = '', onMeta }: {
  video: VideoSource; title: string; poster?: string | null; className?: string; onMeta?: (w: number, h: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.play().catch(() => {});
    // metadata อาจโหลดเสร็จก่อน React ผูก event → เช็กซ้ำตอน mount
    if (onMeta && v.readyState >= 1 && v.videoWidth) onMeta(v.videoWidth, v.videoHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!video.file) {
    return (
      <iframe src={video.src} title={`${title} (${video.provider})`} className={`h-full w-full border-0 ${className}`}
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowFullScreen />
    );
  }
  const toggle = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted) { v.currentTime = 0; v.play().catch(() => {}); }
    setMuted(v.muted);
  };
  return (
    <div className={`relative h-full w-full ${className}`}>
      <video ref={ref} src={video.src} poster={poster ?? undefined} autoPlay muted loop playsInline preload="metadata"
        controls={!muted} aria-label={title} className="h-full w-full bg-black object-contain"
        onLoadedMetadata={(e) => { const v = e.currentTarget; if (onMeta && v.videoWidth) onMeta(v.videoWidth, v.videoHeight); }} />
      {muted && (
        <button type="button" onClick={toggle}
          className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2.5 font-display text-[14px] font-semibold text-white backdrop-blur hover:bg-black/75">
          <VolumeX size={18} aria-hidden />แตะเพื่อเปิดเสียง
        </button>
      )}
      {!muted && (
        <button type="button" onClick={toggle} aria-label="ปิดเสียง"
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/75">
          <Volume2 size={18} aria-hidden />
        </button>
      )}
    </div>
  );
}
