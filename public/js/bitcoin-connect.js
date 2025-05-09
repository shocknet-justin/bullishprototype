import { launchModal } from 'https://esm.sh/@getalby/bitcoin-connect@3.2.2';

// Connect wallet button handler
document.getElementById('connect-wallet').addEventListener('click', async () => {
    try {
        const result = await launchModal();
        const walletStatus = document.getElementById('wallet-status');
        
        if (result) {
            walletStatus.className = 'alert alert-success';
            walletStatus.textContent = 'Wallet connected successfully!';
        } else {
            walletStatus.className = 'alert alert-warning';
            walletStatus.textContent = 'Wallet connection cancelled.';
        }
    } catch (error) {
        const walletStatus = document.getElementById('wallet-status');
        walletStatus.className = 'alert alert-danger';
        walletStatus.textContent = 'Error connecting wallet: ' + error.message;
    }
}); 