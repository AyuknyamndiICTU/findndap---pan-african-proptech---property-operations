/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public download URL of the stable Android build (https://… or a path under /public). */
  readonly VITE_APK_URL?: string;
  readonly VITE_APK_VERSION?: string;
  /** Optional release-candidate build. */
  readonly VITE_APK_RC_URL?: string;
  readonly VITE_APK_RC_VERSION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
