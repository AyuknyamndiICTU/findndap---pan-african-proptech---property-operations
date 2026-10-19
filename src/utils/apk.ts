export interface ApkBuild {
  url: string;
  version: string;
}

function readBuild(url: string | undefined, version: string | undefined): ApkBuild | null {
  const trimmed = (url || '').trim();
  // Only real download locations: absolute http(s) URLs or files served from /public.
  if (!/^https?:\/\//i.test(trimmed) && !trimmed.startsWith('/')) return null;
  return { url: trimmed, version: (version || '').trim() };
}

/** Android builds configured at build time via .env. Null when no real APK has been published. */
export const APK_BUILDS: { stable: ApkBuild | null; rc: ApkBuild | null } = {
  stable: readBuild(import.meta.env.VITE_APK_URL, import.meta.env.VITE_APK_VERSION),
  rc: readBuild(import.meta.env.VITE_APK_RC_URL, import.meta.env.VITE_APK_RC_VERSION)
};

/** Starts the download of a configured build. Returns false when no build is configured. */
export function downloadApk(build: ApkBuild | null = APK_BUILDS.stable): boolean {
  if (!build) return false;
  const a = document.createElement('a');
  a.href = build.url;
  a.rel = 'noopener';
  // Same-origin files download directly; external URLs open the hosting page.
  if (build.url.startsWith('/')) a.download = '';
  else a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}
