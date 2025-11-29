import { decodeBech32, SendNofferRequest, SimplePool } from "https://esm.sh/@shocknet/clink-sdk";
import QRCode from 'https://esm.sh/qrcode';
import { clientPrivateKey } from "./utils.js";

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    initClink();
});

function initClink() {
    // DOM Elements
    const nofferInput = document.getElementById('nofferInput');
    const decodeOfferButton = document.getElementById('decodeOfferButton');
    const offerActions = document.getElementById('offer-actions');
    const amountInput = document.getElementById('amountInput');
    const getInvoiceButton = document.getElementById('getInvoiceButton');
    const resultsSection = document.getElementById('offer-result-section');
    const resultHeader = document.getElementById('result-header');
    const resultData = document.getElementById('result-data');
    const qrPlaceholder = document.getElementById('qr-placeholder');
    const qrCanvas = document.getElementById('qrCanvas');

    // Address Checker DOM Elements
    const lnAddressInput = document.getElementById('lnAddressInput');
    const checkAddressButton = document.getElementById('checkAddressButton');
    const addressResultSection = document.getElementById('address-result-section');
    const addressResultHeader = document.getElementById('address-result-header');
    const addressResultData = document.getElementById('address-result-data');

    const DEFAULT_NOFFER = 'noffer1qvqsyqjqxsmrjc3hv9jrvcejv5mkvv33xajnsvfexyex2vfj8yervdr98ymrjwphxajnqe3exenxxdryxvmrsdfn89skvepevg6rvwpkxycnzvsprfmhxue69uhhxarjvee8jtnndphkx6ewdejhgam0wf4sqgrka4zlqr820wk9nkxsklfqfpy02vva0wtvzs8lkm7t424s5y75fcce7yd3';

    // State
    const pool = new SimplePool();
    let decodedOffer = null;
    let isInvoiceDisplayed = false;

    function resetUI() {
        resultsSection.style.display = 'none';
        decodeOfferButton.style.display = 'block';
        offerActions.style.display = 'none';
        qrCanvas.style.display = 'none';
        qrPlaceholder.style.display = 'block';
        decodedOffer = null;
        isInvoiceDisplayed = false;
        decodeOfferButton.textContent = 'Decode Offer';
        nofferInput.disabled = false;
    }

    function showQr(show) {
        qrPlaceholder.style.display = show ? 'none' : 'inline';
        qrCanvas.style.display = show ? 'block' : 'none';
    }

    function scrollIntoView() {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function scrollIntoViewElement(el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Event Handlers
    const decodeOffer = () => {
        const nofferStr = nofferInput.value.trim();
        if (!nofferStr) {
            alert("Please provide an offer string.");
            return;
        }

        resultsSection.style.display = 'block';
        qrPlaceholder.style.display = 'none';
        qrCanvas.style.display = 'none';

        try {
            const decoded = decodeBech32(nofferStr);
            if (decoded.type !== 'noffer') throw new Error("Invalid string: Expected an 'noffer'.");
            
            decodedOffer = decoded.data;
            resultHeader.textContent = 'Decoded Offer';
            resultData.textContent = JSON.stringify(decodedOffer, null, 2);
            
            decodeOfferButton.style.display = 'none';
            offerActions.style.display = 'block';
        } catch (error) {
            console.error("Error decoding offer:", error);
            resultHeader.textContent = 'Error';
            resultData.textContent = `${error instanceof Error ? error.message : String(error)}`;
            decodeOfferButton.style.display = 'block';
            offerActions.style.display = 'none';
            qrPlaceholder.style.display = 'block';
        }
        setTimeout(scrollIntoView, 100);
    };

    const handleGetInvoice = async () => {
        if (!decodedOffer) {
            alert("Offer data is missing. Please decode a new offer first.");
            return;
        }

        nofferInput.disabled = true;
        offerActions.style.display = 'none';
        resultHeader.textContent = 'Invoice';
        resultData.textContent = 'Requesting invoice...';

        try {
            const amountSats = amountInput.value ? parseInt(amountInput.value, 10) : undefined;

            // Use the CLINK SDK to send a request for an invoice from the offer provider.
            // This request is sent over Nostr and signed with our ephemeral client key.
            const response = await SendNofferRequest(
                pool, clientPrivateKey, [decodedOffer.relay], decodedOffer.pubkey,
                { offer: decodedOffer.offer, amount_sats: amountSats }
            );

            if ('bolt11' in response && typeof response.bolt11 === 'string') {
                resultData.textContent = response.bolt11;
                qrCanvas.style.display = 'block';
                QRCode.toCanvas(qrCanvas, response.bolt11.toUpperCase(), { width: 256, margin: 1 });
            } else {
                resultHeader.textContent = 'Error Response';
                resultData.textContent = JSON.stringify(response, null, 2);
            }
        } catch (error) {
            console.error("Error getting invoice:", error);
            resultHeader.textContent = 'Error';
            resultData.textContent = `Error: ${error instanceof Error ? error.message : String(error)}`;
        } finally {
            isInvoiceDisplayed = true;
            decodeOfferButton.textContent = 'Reset';
            decodeOfferButton.style.display = 'block';
            scrollIntoView();
        }
    };

    const handleDecodeOrReset = () => {
        if (isInvoiceDisplayed) {
            nofferInput.value = DEFAULT_NOFFER;
            resetUI();
        } else {
            let nofferStr = nofferInput.value.trim();
            if (!nofferStr && nofferInput.placeholder) {
                nofferStr = nofferInput.placeholder.trim();
                nofferInput.value = nofferStr;
            }
            decodeOffer();
        }
    };

    async function checkLightningAddress() {
        let addr = lnAddressInput.value.trim();
        if (!addr && lnAddressInput.placeholder) {
            addr = lnAddressInput.placeholder.trim();
            lnAddressInput.value = addr; // populate field so user sees used value
        }
        if (!addr || !addr.includes('@')) {
            alert('Please enter a valid Lightning address (e.g., alice@example.com)');
            return;
        }

        const [name, domain] = addr.split('@');
        const url = `https://${domain}/.well-known/nostr.json?name=${encodeURIComponent(name)}`;

        addressResultHeader.textContent = 'Checking…';
        addressResultData.textContent = `GET ${url}`;
        addressResultSection.style.display = 'block';

        try {
            const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();

            let offer = null;
            if (typeof data.clink_offer === 'string') {
                offer = data.clink_offer;
            } else if (data.clink_offer && typeof data.clink_offer === 'object') {
                offer = data.clink_offer[name] ?? null;
            }

            if (offer) {
                addressResultHeader.textContent = 'CLINK Enabled 🎉';
                nofferInput.value = offer;
                decodeOffer();
            } else {
                addressResultHeader.textContent = 'No CLINK Offer Found';
            }

            addressResultData.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Address check failed:', error);
            addressResultHeader.textContent = 'Error';
            addressResultData.textContent = `${error instanceof Error ? error.message : String(error)}`;
        }

        setTimeout(() => scrollIntoViewElement(addressResultSection), 100);
    }

    // Event Listeners
    decodeOfferButton.addEventListener('click', handleDecodeOrReset);
    getInvoiceButton.addEventListener('click', handleGetInvoice);

    nofferInput.addEventListener('input', resetUI);

    // Address Checker Event Listeners
    checkAddressButton.addEventListener('click', checkLightningAddress);

    // Initial State
    nofferInput.value = DEFAULT_NOFFER;
    resetUI();
}

