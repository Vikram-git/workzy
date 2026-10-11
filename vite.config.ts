import { networkInterfaces } from 'node:os';
import { env } from 'node:process';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

function workzyPhoneShare(): import('vite').Plugin {
  return {
    name: 'workzy-phone-share',
    configureServer(server) {
      server.middlewares.use('/__workzy/lan-url', (request, response, next) => {
        if (request.url?.split('?')[0] !== '/') return next();
        if (request.method !== 'GET') {
          response.statusCode = 405;
          response.setHeader('Allow', 'GET');
          response.end();
          return;
        }

        const securePreviewUrl = env.WORKZY_PUBLIC_PREVIEW_URL?.trim();
        if (securePreviewUrl) {
          try {
            const parsedUrl = new URL(securePreviewUrl);
            if (parsedUrl.protocol === 'https:' && parsedUrl.hostname.endsWith('.trycloudflare.com')) {
              response.setHeader('Content-Type', 'application/json');
              response.setHeader('Cache-Control', 'no-store');
              response.end(JSON.stringify({ url: new URL('/', parsedUrl).toString() }));
              return;
            }
          } catch {
            // Fall through to the private Wi-Fi URL when the optional override is invalid.
          }
        }

        const listenHost = server.config.server.host;
        if (listenHost !== '0.0.0.0' && listenHost !== '::' && listenHost !== true) {
          response.statusCode = 503;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ message: 'Start WORKZY with `bun run dev:lan` to share it with a phone.' }));
          return;
        }

        const isPrivateIPv4 = (address: string) =>
          /^10\./.test(address) || /^192\.168\./.test(address) || /^172\.(1[6-9]|2\d|3[01])\./.test(address);
        const candidates = Object.entries(networkInterfaces()).flatMap(([name, addresses]) =>
          (addresses ?? [])
            .filter((address) => address.family === 'IPv4' && !address.internal && isPrivateIPv4(address.address))
            .map((address) => ({ name, ip: address.address })),
        );
        candidates.sort((a, b) => Number(!/^en0$|^wlan0$|^Wi-Fi$/i.test(a.name)) - Number(!/^en0$|^wlan0$|^Wi-Fi$/i.test(b.name)));

        const lanAddress = candidates[0]?.ip;
        if (!lanAddress) {
          response.statusCode = 503;
          response.setHeader('Content-Type', 'application/json');
          response.end(JSON.stringify({ message: 'No private Wi-Fi address was found. Connect the Mac and phone to the same Wi-Fi.' }));
          return;
        }

        const boundAddress = server.httpServer?.address();
        const port = typeof boundAddress === 'object' && boundAddress ? boundAddress.port : server.config.server.port;
        const protocol = 'encrypted' in request.socket && request.socket.encrypted ? 'https' : 'http';
        response.setHeader('Content-Type', 'application/json');
        response.setHeader('Cache-Control', 'no-store');
        response.end(JSON.stringify({ url: `${protocol}://${lanAddress}:${port}/` }));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), workzyPhoneShare(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['workzy-app-icon.png', 'apple-touch-icon.png'],
    manifest: {
      id: '/',
      name: 'WORKZY · Local Services',
      short_name: 'WORKZY',
      description: 'Find the right local worker. Book with confidence.',
      lang: 'en-IN',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      background_color: '#f6f8f7',
      theme_color: '#f6f8f7',
      categories: ['lifestyle', 'business'],
      icons: [
        { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
  })],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('lucide-react')) return 'icons';
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react';
        },
      },
    },
  },
});
