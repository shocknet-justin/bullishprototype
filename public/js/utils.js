import { generateSecretKey } from 'https://esm.sh/nostr-tools/pure';

// Generate or retrieve a client private key
// In a production app, you'd want to persist this in localStorage or similar
let cachedPrivateKey = null;

export function getClientPrivateKey() {
    if (!cachedPrivateKey) {
        // Check if we have a stored key in localStorage
        const stored = localStorage.getItem('cllink_client_private_key');
        if (stored) {
            cachedPrivateKey = new Uint8Array(JSON.parse(stored));
        } else {
            // Generate a new key
            cachedPrivateKey = generateSecretKey();
            // Store it for future use
            localStorage.setItem('cllink_client_private_key', JSON.stringify(Array.from(cachedPrivateKey)));
        }
    }
    return cachedPrivateKey;
}

// Export as clientPrivateKey for compatibility with the original code
export const clientPrivateKey = getClientPrivateKey();

