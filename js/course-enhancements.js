// Course Page Enhancements for Young Audience

document.addEventListener('DOMContentLoaded', function() {
  // Reading Progress Bar
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
  document.body.insertBefore(progressBar, document.body.firstChild);

  const progressBarInner = progressBar.querySelector('.reading-progress-bar');

  function updateProgressBar() {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBarInner.style.width = scrollPercent + '%';
  }

  window.addEventListener('scroll', updateProgressBar);
  updateProgressBar(); // Initial call

  // Smooth Accordion Animations
  const accordionLinks = document.querySelectorAll('a[data-toggle="collapse"]');

  accordionLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();

      const target = document.querySelector(this.getAttribute('data-target'));
      const isCollapsed = this.classList.contains('collapsed');

      if (isCollapsed) {
        // Expand
        target.style.display = 'block';
        target.style.maxHeight = '0px';
        target.style.opacity = '0';

        setTimeout(() => {
          target.style.maxHeight = target.scrollHeight + 'px';
          target.style.opacity = '1';
        }, 10);

        setTimeout(() => {
          target.style.maxHeight = 'none';
          this.classList.remove('collapsed');
        }, 300);
      } else {
        // Collapse
        target.style.maxHeight = target.scrollHeight + 'px';

        setTimeout(() => {
          target.style.maxHeight = '0px';
          target.style.opacity = '0';
        }, 10);

        setTimeout(() => {
          target.style.display = 'none';
          this.classList.add('collapsed');
        }, 300);
      }
    });
  });

  // Exercise Completion Tracking
  const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');

  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const exercise = this.closest('.tehtava');
      if (exercise) {
        if (this.checked) {
          exercise.style.borderColor = '#059669';
          exercise.style.boxShadow = '0 0 0 2px rgba(5, 150, 105, 0.2)';
        } else {
          exercise.style.borderColor = '#e5e7eb';
          exercise.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.08)';
        }
      }
    });
  });

  // Keyboard Navigation for Accordions
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const focusedElement = document.activeElement;
      if (focusedElement && focusedElement.matches('a[data-toggle="collapse"]')) {
        e.preventDefault();
        focusedElement.click();
      }
    }
  });

  // Lazy Load Images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));

  // Only answers remain collapsible; show all other content.
  const baseurl = "{{ site.baseurl | default: '' }}";

  document.querySelectorAll('.collapse').forEach(section => {
    const id = (section.id || '').toLowerCase();
    const isAnswer = id.endsWith('_v') || id.includes('vastaus');
    if (!isAnswer) {
      section.classList.remove('collapse');
      section.style.display = 'block';
      section.style.maxHeight = 'none';
      section.style.opacity = '1';
    }
  });

  document.querySelectorAll('a[data-toggle="collapse"]').forEach(link => {
    const target = document.querySelector(link.getAttribute('data-target'));
    const targetid = target ? (target.id || '').toLowerCase() : '';
    const shouldPersist = targetid.endsWith('_v') || targetid.includes('vastaus');
    if (!shouldPersist) {
      link.removeAttribute('data-toggle');
      link.classList.remove('collapsed');
      link.style.cursor = 'default';
    }
  });

  document.querySelectorAll('.close-section').forEach(el => {
    el.style.display = 'none';
  });

  // Apply baseurl prefix for absolute internal links and images.
  if (baseurl) {
    document.querySelectorAll('a[href^="/"]').forEach(a => {
      const href = a.getAttribute('href');
      if (href && !href.startsWith('//')) {
        a.setAttribute('href', baseurl + href);
      }
    });
    document.querySelectorAll('img[src^="/"]').forEach(img => {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('//')) {
        img.setAttribute('src', baseurl + src);
      }
    });
  }

  // MathJax Enhancement (if MathJax is loaded)
  if (typeof MathJax !== 'undefined') {
    MathJax.Hub.Queue(function() {
      // Add styling to math elements
      const mathElements = document.querySelectorAll('.MathJax');
      mathElements.forEach(el => {
        el.style.transition = 'all 0.2s ease';
      });
    });
  }

  // Touch Gestures for Mobile
  let touchStartY = 0;
  let touchEndY = 0;

  document.addEventListener('touchstart', function(e) {
    touchStartY = e.changedTouches[0].screenY;
  });

  document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].screenY;
    const diff = touchStartY - touchEndY;

    // Swipe up to scroll to next section
    if (Math.abs(diff) > 50 && diff > 0) {
      const currentSection = getCurrentVisibleSection();
      const nextSection = currentSection.nextElementSibling;
      if (nextSection && nextSection.matches('section.panel, .tehtava')) {
        nextSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  function getCurrentVisibleSection() {
    const sections = document.querySelectorAll('section.panel, .tehtava');
    for (let section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
        return section;
      }
    }
    return sections[0];
  }

  // Accessibility: Skip to main content
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Siirry pääsisältöön';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #2563eb;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 1000;
    transition: top 0.3s;
  `;
  skipLink.addEventListener('focus', () => skipLink.style.top = '6px');
  skipLink.addEventListener('blur', () => skipLink.style.top = '-40px');

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main content ID
  const mainArticle = document.querySelector('article');
  if (mainArticle) {
    mainArticle.id = 'main-content';
  }
});