/** แปลงลิงก์วิดีโอ/ไลฟ์ เป็นลิงก์สำหรับฝังในหน้าเว็บ (Facebook / YouTube / TikTok คลิป) */
export type VideoSource = { src: string; vertical: boolean; provider: string; file?: boolean };

export function embedVideo(url: string | null | undefined): VideoSource | null {
  if (!url) return null;
  const raw = url.trim();
  // ไฟล์วิดีโอบนเว็บเราเอง (/media/videos/xxx.mp4) → เล่นด้วย <video>
  if (/^\/media\//.test(raw) || /\.(mp4|webm|mov)(\?|$)/i.test(raw)) {
    return { src: raw.replace(/^https?:\/\/(www\.)?ikssa\.io/, ''), vertical: false, provider: 'ไฟล์วิดีโอ', file: true };
  }
  let u: URL;
  try { u = new URL(raw); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  if (host === 'facebook.com' || host === 'fb.watch' || host === 'fb.com') {
    return { src: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(u.toString())}&show_text=false&allowfullscreen=true`, vertical: u.pathname.includes('/reel/'), provider: 'Facebook' };
  }
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'youtube-nocookie.com') {
    const id = host === 'youtu.be' ? u.pathname.slice(1)
      : u.searchParams.get('v') ?? u.pathname.match(/\/(?:live|embed|shorts)\/([\w-]{6,})/)?.[1];
    if (!id) return null;
    return { src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`, vertical: u.pathname.startsWith('/shorts/'), provider: 'YouTube' };
  }
  if (host === 'tiktok.com') {
    const id = u.pathname.match(/\/video\/(\d+)/)?.[1];
    if (!id) return null;
    return { src: `https://www.tiktok.com/player/v1/${id}`, vertical: true, provider: 'TikTok' };
  }
  return null;
}
