import { LightningAddress } from "@getalby/lightning-tools";

class LNURLVerifyDemo {
    constructor() {
        this.currentInvoice = null;
        this.verificationInterval = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.log("LNURL Verify Demo initialized");
    }

    bindEvents() {
        // Create invoice form
        document.getElementById('invoiceForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createInvoice();
        });

        // Copy payment request
        document.getElementById('copyPaymentRequest').addEventListener('click', () => {
            this.copyToClipboard('paymentRequest');
        });

        // Verify payment
        document.getElementById('verifyPaymentBtn').addEventListener('click', () => {
            this.verifyPayment();
        });


    }

    async createInvoice() {
        const lightningAddress = document.getElementById('lightningAddress').value.trim();
        const amount = parseInt(document.getElementById('amount').value);

        if (!lightningAddress) {
            this.showError('Please enter a lightning address');
            return;
        }

        if (!amount || amount <= 0) {
            this.showError('Please enter a valid amount');
            return;
        }

        this.setLoading('createInvoiceBtn', true);
        this.log(`Creating invoice for ${lightningAddress} - ${amount} sats`);

        try {
            const ln = new LightningAddress(lightningAddress);
            await ln.fetch();
            
            this.currentInvoice = await ln.requestInvoice({ satoshi: amount });
            
            this.displayInvoiceDetails();
            this.log(`Invoice created successfully`);
            this.log(`Payment Request: ${this.currentInvoice.paymentRequest}`);
            this.log(`Payment Hash: ${this.currentInvoice.paymentHash}`);
            
        } catch (error) {
            this.showError(`Failed to create invoice: ${error.message}`);
            this.log(`Error: ${error.message}`);
        } finally {
            this.setLoading('createInvoiceBtn', false);
        }
    }

    displayInvoiceDetails() {
        if (!this.currentInvoice) return;

        // Show invoice details
        document.getElementById('invoiceDetails').classList.remove('d-none');
        document.getElementById('noInvoice').classList.add('d-none');

        // Populate fields
        document.getElementById('paymentRequest').value = this.currentInvoice.paymentRequest;
        document.getElementById('paymentHash').value = this.currentInvoice.paymentHash;
        document.getElementById('invoiceAmount').value = `${this.currentInvoice.satoshi} sats`;

        // Show payment status section
        document.getElementById('paymentStatus').classList.remove('d-none');
        document.getElementById('noStatus').classList.add('d-none');
        document.getElementById('statusText').textContent = 'Invoice created - waiting for payment';
        document.getElementById('paymentResult').classList.add('d-none');
    }

    async verifyPayment() {
        if (!this.currentInvoice) {
            this.showError('No invoice to verify');
            return;
        }

        this.setLoading('verifyPaymentBtn', true);
        this.log('Verifying payment...');

        try {
            const paid = await this.currentInvoice.verifyPayment();
            
            if (paid) {
                this.showPaymentSuccess();
                this.log('Payment verified successfully!');
                this.log(`Preimage: ${this.currentInvoice.preimage}`);
            } else {
                this.showPaymentPending();
                this.log('Payment not yet received');
            }
        } catch (error) {
            this.showError(`Payment verification failed: ${error.message}`);
            this.log(`Verification error: ${error.message}`);
        } finally {
            this.setLoading('verifyPaymentBtn', false);
        }
    }

    showPaymentSuccess() {
        document.getElementById('statusText').textContent = 'Payment verified!';
        document.getElementById('paymentResult').classList.remove('d-none');
        document.getElementById('preimage').textContent = this.currentInvoice.preimage || 'N/A';
        
        // Update status alert
        const statusAlert = document.querySelector('#paymentStatus .alert');
        statusAlert.className = 'alert alert-success';
    }

    showPaymentPending() {
        document.getElementById('statusText').textContent = 'Payment not yet received';
        document.getElementById('paymentResult').classList.add('d-none');
        
        // Update status alert
        const statusAlert = document.querySelector('#paymentStatus .alert');
        statusAlert.className = 'alert alert-warning';
    }

    showError(message) {
        // Create a temporary error alert
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        // Insert at the top of the container
        const container = document.querySelector('.container');
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    async copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        try {
            await navigator.clipboard.writeText(element.value);
            this.log('Copied to clipboard');
            
            // Show temporary success message
            const button = document.getElementById('copyPaymentRequest');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.className = 'btn btn-success';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.className = 'btn btn-outline-secondary';
            }, 2000);
        } catch (error) {
            this.showError('Failed to copy to clipboard');
        }
    }

    setLoading(buttonId, loading) {
        const button = document.getElementById(buttonId);
        const spinner = button.querySelector('.spinner-border');
        
        if (loading) {
            button.disabled = true;
            spinner.classList.remove('d-none');
        } else {
            button.disabled = false;
            spinner.classList.add('d-none');
        }
    }

    log(message) {
        const logElement = document.getElementById('log');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        
        logElement.innerHTML += `<div>${logEntry}</div>`;
        logElement.scrollTop = logElement.scrollHeight;
    }
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LNURLVerifyDemo();
}); 