import NDK from "@nostr-dev-kit/ndk";

// Initialize NDK
const ndk = new NDK({
    explicitRelayUrls: [
        'wss://relay.damus.io',
        'wss://relay.nostr.band',
        'wss://relay.primal.net'
    ]
});

// Initialize markdown-it
const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true
});

// Cache for profile names
const profileCache = new Map();

// Function to fetch profile name
async function fetchProfileName(npub) {
    if (profileCache.has(npub)) {
        return profileCache.get(npub);
    }

    try {
        const user = ndk.getUser({ npub: npub });
        const profile = await user.fetchProfile();
        const name = profile.name || npub.substring(0, 8) + '...';
        profileCache.set(npub, name);
        return name;
    } catch (error) {
        console.error('Error fetching profile:', error);
        return npub.substring(0, 8) + '...';
    }
}

// Function to replace nostr:npub mentions with profile names
async function replaceNostrMentions(content) {
    const nostrMentionRegex = /nostr:npub1[a-zA-Z0-9]{58}/g;
    const mentions = content.match(nostrMentionRegex) || [];
    
    let processedContent = content;
    for (const mention of mentions) {
        const pubkey = mention.replace('nostr:npub1', 'npub1');
        const name = await fetchProfileName(pubkey);
        processedContent = processedContent.replace(mention, `@${name}`);
    }
    
    return processedContent;
}

// Connect button handler
document.getElementById('connectBtn').addEventListener('click', async () => {
    try {
        await ndk.connect();
        document.getElementById('connectionStatus').className = 'alert alert-success';
        document.getElementById('connectionStatus').textContent = 'Connected to NDK!';
        
        // Enable the fetch profile button
        document.getElementById('fetchProfileBtn').disabled = false;
        
        // Subscribe to some events after connection
        subscribeToEvents();
    } catch (error) {
        document.getElementById('connectionStatus').className = 'alert alert-danger';
        document.getElementById('connectionStatus').textContent = 'Connection failed: ' + error.message;
    }
});

// Fetch profile button handler
document.getElementById('fetchProfileBtn').addEventListener('click', async () => {
    try {
        const user = ndk.getUser({ pubkey: "a10260a2aa2f092d85e2c0b82e95eac5f8c60ea19c68e4898719b58ccaa23e3e" });
        const profile = await user.fetchProfile();
        
        // Update profile card
        const profileCard = document.getElementById('profileCard');
        const profileImage = document.getElementById('profileImage');
        const profileName = document.getElementById('profileName');
        const profileAbout = document.getElementById('profileAbout');
        const profileLinks = document.getElementById('profileLinks');
        
        // Set profile image
        if (profile.image) {
            profileImage.src = profile.image;
            profileImage.style.display = 'block';
        } else {
            profileImage.style.display = 'none';
        }
        
        // Set name
        profileName.textContent = profile.name || 'Anonymous';
        
        // Set about
        profileAbout.textContent = profile.about || '';
        
        // Set links
        profileLinks.innerHTML = '';
        if (profile.website) {
            const websiteLink = document.createElement('a');
            websiteLink.href = profile.website;
            websiteLink.className = 'btn btn-outline-primary me-2';
            websiteLink.textContent = 'Website';
            websiteLink.target = '_blank';
            profileLinks.appendChild(websiteLink);
        }
        
        if (profile.nip05) {
            const nip05Badge = document.createElement('span');
            nip05Badge.className = 'badge bg-secondary';
            nip05Badge.textContent = profile.nip05;
            profileLinks.appendChild(nip05Badge);
        }
        
        // Show the profile card
        profileCard.style.display = 'block';
        
    } catch (error) {
        document.getElementById('connectionStatus').className = 'alert alert-danger';
        document.getElementById('connectionStatus').textContent = 'Profile fetch failed: ' + error.message;
    }
});

// Function to subscribe to events
function subscribeToEvents() {
    ndk.subscribe(
        { kinds: [30023], authors: ['a10260a2aa2f092d85e2c0b82e95eac5f8c60ea19c68e4898719b58ccaa23e3e']}, // Subscribe to kind 30023 (blog posts)
        { closeOnEose: false },
        {
            onEvent: async (event) => {
                // Add new event to the list
                const eventsList = document.getElementById('eventsList');
                const eventElement = document.createElement('div');
                eventElement.className = 'blog-post';
                
                // Parse the content as JSON to get the title
                let title = 'Untitled';
                let content = event.content;
                try {
                    const parsedContent = JSON.parse(event.content);
                    title = parsedContent.title || 'Untitled';
                    content = parsedContent.content || event.content;
                } catch (e) {
                    // If parsing fails, use the first line of content as title
                    const lines = event.content.split('\n');
                    title = lines[0];
                    content = lines.slice(1).join('\n');
                }

                // Replace nostr:npub mentions with profile names
                content = await replaceNostrMentions(content);

                // Format the date
                const date = new Date(event.created_at * 1000);
                const formattedDate = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });

                eventElement.innerHTML = `
                    <div class="event-id">ID: ${event.id.substring(0, 8)}...</div>
                    <h5 class="mt-2 mb-3">${title}</h5>
                    <div class="content">${md.render(content)}</div>
                    <div class="author">
                        <div>Author: ${event.pubkey.substring(0, 8)}...</div>
                        <div class="text-muted">Posted on ${formattedDate}</div>
                    </div>
                `;
                eventsList.insertBefore(eventElement, eventsList.firstChild);
                
                // Keep only the last 10 events
                if (eventsList.children.length > 10) {
                    eventsList.removeChild(eventsList.lastChild);
                }
            }
        }
    );
} 