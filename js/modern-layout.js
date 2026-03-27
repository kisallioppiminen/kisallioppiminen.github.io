// Modern Layout JavaScript
// Handles filtering and interactive features for course cards

(function() {
  'use strict';

  // Initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    initializeCurriculumFilters();
    initializeCardInteractions();
  });

  /**
   * Initialize curriculum filter tabs
   */
  function initializeCurriculumFilters() {
    const filterButtons = document.querySelectorAll('.tab-btn');
    const courseCards = document.querySelectorAll('.course-card');

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filterValue = this.getAttribute('data-filter');
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');

        // Filter course cards
        courseCards.forEach(card => {
          if (filterValue === 'all') {
            card.style.display = 'block';
            // Trigger animation
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 10);
          } else {
            const curriculum = card.getAttribute('data-curriculum');
            if (curriculum === filterValue) {
              card.style.display = 'block';
              setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }, 10);
            } else {
              card.style.opacity = '0';
              card.style.transform = 'translateY(10px)';
              setTimeout(() => {
                card.style.display = 'none';
              }, 150);
            }
          }
        });
      });
    });
  }

  /**
   * Initialize interactive card features
   */
  function initializeCardInteractions() {
    const courseCards = document.querySelectorAll('.course-card');

    courseCards.forEach(card => {
      // Add keyboard accessibility
      card.setAttribute('tabindex', '0');
      
      // Handle Enter key on cards
      card.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          const ctaButton = this.querySelector('.course-cta');
          if (ctaButton) {
            ctaButton.click();
          }
        }
      });

      // Track card hover for analytics potential
      card.addEventListener('mouseenter', function() {
        this.style.zIndex = '10';
      });

      card.addEventListener('mouseleave', function() {
        this.style.zIndex = '1';
      });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('.chapter-list a').forEach(link => {
      link.addEventListener('click', function(e) {
        // Allow default navigation to course pages
        // This ensures courses load properly without smooth scroll interference
      });
    });
  }

  /**
   * Export for potential use in other contexts
   */
  window.ModernLayout = {
    filterCourses: function(filter) {
      const button = document.querySelector(`[data-filter="${filter}"]`);
      if (button) {
        button.click();
      }
    }
  };
})();
