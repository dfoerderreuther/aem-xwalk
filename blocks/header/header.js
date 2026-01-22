import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Determines the nav path based on the current page location.
 * Uses hierarchical resolution - looks for nav at the locale level.
 * For AEM paths like /language-masters/locale/page, looks for nav at locale level.
 * Examples:
 *   /a -> /nav
 *   /language-masters/en -> /language-masters/en/nav (locale root)
 *   /language-masters/en/about -> /language-masters/en/nav (subpage)
 *   /language-masters/en/our-journeys -> /language-masters/en/nav (subpage)
 * @returns {string} The nav path to use
 */
function getNavPath() {
  const { pathname } = window.location;
  const segments = pathname.split('/').filter(Boolean);

  // Remove .html extension if present
  if (segments.length > 0) {
    const lastIdx = segments.length - 1;
    segments[lastIdx] = segments[lastIdx].replace(/\.html$/, '');
  }

  if (segments.length >= 3) {
    // For paths like /language-masters/en/about, use /language-masters/en/nav
    // Take the first two segments (language-masters/locale)
    const navSegments = segments.slice(0, 2);
    return `/${navSegments.join('/')}/nav`;
  }

  if (segments.length === 2) {
    // For paths like /language-masters/en, use /language-masters/en/nav
    return `/${segments.join('/')}/nav`;
  }

  // Fallback to root nav
  return '/nav';
}

/**
 * Loads the nav fragment.
 * @param {string|null} navMeta Optional nav metadata override
 * @returns {Promise<HTMLElement|null>} The loaded nav fragment
 */
async function loadNavFragment(navMeta) {
  // If nav metadata is explicitly set, use it directly
  if (navMeta) {
    const navPath = new URL(navMeta, window.location).pathname;
    return loadFragment(navPath);
  }

  const navPath = getNavPath();
  return loadFragment(navPath);
}

/**
 * Loads and decorates the language navigation dropdown
 * @param {Element} nav The nav element to append the language nav to
 */
async function loadLangNav(nav) {
  const langNavPath = '/lang-nav.plain.html';
  try {
    const resp = await fetch(langNavPath);
    if (!resp.ok) {
      // eslint-disable-next-line no-console
      console.warn('Lang nav not found at', langNavPath);
      return;
    }

    const html = await resp.text();

    // Create container
    const langNav = document.createElement('div');
    langNav.className = 'nav-lang';

    // Create the dropdown trigger button
    const trigger = document.createElement('button');
    trigger.className = 'nav-lang-trigger';
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'true');
    trigger.setAttribute('aria-label', 'Select language');
    trigger.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
      <span class="nav-lang-label">Language</span>
    `;

    // Create dropdown and parse HTML
    const dropdown = document.createElement('div');
    dropdown.className = 'nav-lang-dropdown';
    dropdown.innerHTML = html;

    // Build final structure
    langNav.appendChild(trigger);
    langNav.appendChild(dropdown);

    // Toggle dropdown on click
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!expanded));
      dropdown.classList.toggle('open', !expanded);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!langNav.contains(e.target)) {
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('open');
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape') {
        trigger.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('open');
      }
    });

    nav.appendChild(langNav);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error loading lang nav:', error);
  }
}

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  const navDrops = navSections.querySelectorAll('.nav-drop');
  if (isDesktop.matches) {
    navDrops.forEach((drop) => {
      if (!drop.hasAttribute('tabindex')) {
        drop.setAttribute('tabindex', 0);
        drop.addEventListener('focus', focusNavSection);
      }
    });
  } else {
    navDrops.forEach((drop) => {
      drop.removeAttribute('tabindex');
      drop.removeEventListener('focus', focusNavSection);
    });
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment using hierarchical path resolution
  const navMeta = getMetadata('nav');
  const fragment = await loadNavFragment(navMeta);

  if (!fragment) {
    // No nav fragment found in any location
    return;
  }

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  // Nav fragment now has 3 sections: logo, sections, tools
  const classes = ['logo', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  // Decorate logo section
  const navLogo = nav.querySelector('.nav-logo');
  if (navLogo) {
    const logoImg = navLogo.querySelector('img');
    if (logoImg) {
      logoImg.width = 166;
      logoImg.setAttribute('height', 'auto');
    }
    const logoLink = navLogo.querySelector('a');
    if (logoLink) {
      logoLink.setAttribute('aria-label', 'Home');
    } else {
      // If no link exists, wrap the image in a link
      const img = navLogo.querySelector('img');
      if (img) {
        const link = document.createElement('a');
        link.href = '/';
        link.setAttribute('aria-label', 'Home');
        link.appendChild(img.cloneNode(true));
        img.replaceWith(link);
      }
    }
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });

      // Mark active page
      const link = navSection.querySelector('a');
      if (link) {
        const linkPath = new URL(link.href).pathname;
        const currentPath = window.location.pathname;
        if (linkPath === currentPath
          || (currentPath.endsWith('.html') && linkPath === currentPath.replace('.html', ''))
          || (linkPath.endsWith('.html') && currentPath === linkPath.replace('.html', ''))) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      }
    });
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Load language navigation dropdown
  await loadLangNav(nav);

  // Handle scroll to shrink header
  const handleScroll = () => {
    const { scrollY } = window;
    if (scrollY > 50) {
      navWrapper.classList.add('scrolled');
    } else {
      navWrapper.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial check
  handleScroll();
}
