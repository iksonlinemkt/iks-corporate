'use client';

import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import type { VideoSource } from '@/lib/video';

/** กรอบวิดีโอที่ปรับสัดส่วนตามคลิปจริง (แนวตั้ง/แนวนอน) */
export function FlexVideo({ video, title, poster, vertical, className = '' }: {
  video: VideoSource; title: string; poster?: string | null; vertical?: boolean; className?: string;
}) {
  const [ratio, setRatio] = useState<number | null>(null);
  const r = ratio ?? (video.vertical || vertical ? 9 / 16 : 16 / 9);
  const tall = r < 1;
  return (
    <div className={`overflow-hidden rounded-[var(--radius-card)] bg-navy-950 shadow-[0_24px_50px_-30px_rgb(12_35_70/0.6)] ${tall ? 'mx-auto w-full max-w-[400px]' : 'w-full'} ${className}`}
      style={{ aspectRatio: String(r) }}>
      <VideoPlayer video={video} title={title} poster={poster} onMeta={(w, h) => setRatio(w / h)} />
    </div>
  );
}
