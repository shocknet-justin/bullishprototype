import pkg from '../../package.json' assert { type: 'json' };

export const navbarHtml = `
<nav class="navbar navbar-expand-lg bg-body-tertiary w-100">
    <div class="container-fluid">
      <a class="navbar-brand" href="index.html">bullishPrototype <small class="text-muted" style="font-size: 0.6em;">v${pkg.version}</small></a>
      <button class="navbar-toggler" type="button" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <button class="close-btn" aria-label="Close menu">×</button>
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
        
        // Add mobile menu functionality
        setupMobileMenu();
    }
}

function setupMobileMenu() {
    const navbarCollapse = document.getElementById('navbarSupportedContent');
    const closeBtn = document.querySelector('.close-btn');
    const navbarToggler = document.querySelector('.navbar-toggler');
    
    if (!navbarCollapse || !closeBtn || !navbarToggler) return;
    
    // Toggle menu when clicking hamburger button
    navbarToggler.addEventListener('click', () => {
        if (window.innerWidth < 992) {
            if (navbarCollapse.classList.contains('show')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        }
    });
    
    // Close menu when clicking the close button
    closeBtn.addEventListener('click', () => {
        closeMobileMenu();
    });
    
    // Close menu when clicking on a nav link (mobile only)
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                closeMobileMenu();
            }
        });
    });
    
    // Close menu when clicking outside (mobile only)
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 992 && 
            !navbarCollapse.contains(e.target) && 
            !navbarToggler.contains(e.target) &&
            navbarCollapse.classList.contains('show')) {
            closeMobileMenu();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992 && navbarCollapse.classList.contains('show')) {
            closeMobileMenu();
        }
    });
    
    function openMobileMenu() {
        navbarCollapse.classList.add('show');
        navbarToggler.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
    
    function closeMobileMenu() {
        navbarCollapse.classList.remove('show');
        navbarToggler.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = ''; // Restore scrolling
    }
} 