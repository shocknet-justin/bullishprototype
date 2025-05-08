import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    root: 'public',
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'public/index.html'),
                ndk: resolve(__dirname, 'public/ndk.html'),
                nwc: resolve(__dirname, 'public/nwc.html'),
                nostr: resolve(__dirname, 'public/nostr.html'),
                bitcoinConnect: resolve(__dirname, 'public/bitcoin-connect.html'),
                bitcoinQr: resolve(__dirname, 'public/bitcoin-qr.html'),
                twentyuno: resolve(__dirname, 'public/twentyuno.html')
            }
        }
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        }
    },
    server: {
        port: 5173
    }
}); 