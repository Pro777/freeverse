// Freeverse dev proxy support (Caddy)
// Allow requests when running behind a local reverse proxy like freeverse.local.

/** @type {import('vite').UserConfig} */
export default {
  server: {
    allowedHosts: ["freeverse.local"],
  },
};
