import { Relay } from 'nostr-tools/relay';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';

document.getElementById('connectButton').addEventListener('click', async () => {
    // Generate a new secret key and public key
    const secretKey = generateSecretKey();
    const publicKey = getPublicKey(secretKey);

    // Connect to the relay
    const relay = await Relay.connect('wss://relay.0xchat.com');
    console.log(`Connected to ${relay.url}`);

    // Display connection status
    document.getElementById('output').innerText += `Connected to ${relay.url}\n`;

    // Subscribe to events
    relay.subscribe([
        {
            kinds: [4],
            authors: [publicKey],
        },
    ], {
        onevent(event) {
            console.log('Got event:', event);
            // Display the event in the output div
            document.getElementById('output').innerText += `Got event: ${JSON.stringify(event)}\n`;
        }
    });
});
