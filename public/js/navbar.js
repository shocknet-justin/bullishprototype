import pkg from '../../package.json' assert { type: 'json' };

export const navbarHtml = `
<style>
  .navbar-expand-lg .navbar-collapse:not(.show) {
    display: none !important;
  }
  .navbar-expand-lg .navbar-toggler {
    display: block !important;
  }
  
  /* Fullscreen overlay styles */
  .navbar-collapse.show {
    position: fixed !important;
    top: 0 !important;
    right: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background-color: #000 !important;
    z-index: 1050 !important;
    display: flex !important;
    align-items: flex-start !important;
    justify-content: flex-end !important;
    padding: 2rem !important;
  }
  
  .navbar-collapse.show .navbar-nav {
    flex-direction: column !important;
    align-items: flex-end !important;
    gap: 0.25rem !important;
    margin-top: 2rem !important;
  }
  
  .navbar-collapse.show .close-btn {
    position: absolute !important;
    top: 1rem !important;
    right: 1rem !important;
    background: none !important;
    border: none !important;
    color: white !important;
    font-size: 2rem !important;
    cursor: pointer !important;
    z-index: 1051 !important;
    width: 3rem !important;
    height: 3rem !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: color 0.3s ease !important;
  }
  
  .navbar-collapse.show .close-btn:hover {
    color: #ff9900 !important;
  }
  
  .navbar-collapse.show .nav-link {
    color: white !important;
    font-size: 1.5rem !important;
    font-weight: 300 !important;
    text-decoration: none !important;
    transition: color 0.3s ease !important;
    padding: 0 !important;
  }
  
  .navbar-collapse.show .nav-link:hover {
    color: #ff9900 !important;
  }
  
  .navbar-collapse.show .nav-link.active {
    color: #ff9900 !important;
    font-weight: 600 !important;
  }
</style>
<nav class="navbar navbar-expand-lg bg-body-tertiary w-100" style="--bs-navbar-toggler-border-color: rgba(255, 255, 255, 0.1);">
    <div class="container-fluid">
      <a class="navbar-brand" href="index.html">bullishPrototype <small class="text-muted" style="font-size: 0.6em;">v${pkg.version}</small></a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
        aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <button class="close-btn" onclick="document.getElementById('navbarSupportedContent').classList.remove('show')" aria-label="Close menu">×</button>
        <ul class="navbar-nav mb-2 mb-lg-0">
          <li class="nav-item"><a class="nav-link" href="twentyuno.html">TwentyUno</a></li>
          <li class="nav-item"><a class="nav-link" href="bitcoin-connect.html">Bitcoin Connect</a></li>
          <li class="nav-item"><a class="nav-link" href="bitcoin-qr.html">Bitcoin QR</a></li>
          <li class="nav-item"><a class="nav-link" href="ndk.html">NDK Demo</a></li>
          <li class="nav-item"><a class="nav-link" href="lnurl-verify.html">LNURL-verify</a></li>
          <!-- <li class="nav-item"><a class="nav-link" href="nwc.html">Nostr Wallet Connect</a></li> -->
        </ul>
      </div>
    </div>
  </nav>
`;

export function injectNavbar() {
    const navbarContainer = document.getElementById('navbar');
    if (navbarContainer) {
        navbarContainer.innerHTML = navbarHtml;
        
        // Set active link based on current page
        const currentPage = window.location.pathname.split('/').pop();
        const navItems = document.querySelectorAll('nav ul li a');
        navItems.forEach(item => {
            if (item.getAttribute('href') === currentPage) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
} 