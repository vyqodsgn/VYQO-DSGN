document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================================================
     0. PAGE LOADER WITH CURIOSITY STATUS TICKER
     ========================================================================== */
  const pageLoader = document.getElementById('pageLoader');
  const loaderProgress = document.getElementById('loaderProgress');
  const loaderPercent = document.getElementById('loaderPercent');
  const loaderStatus = document.getElementById('loaderStatus');

  if (pageLoader && loaderProgress && loaderPercent && loaderStatus) {
    // 0.1 Prevent body scrolling during loading phase
    document.body.style.overflow = 'hidden';

    let progress = 0;
    const circumference = 339.3; // 2 * Math.PI * 54
    let loadingInterval;
    let isFullyLoaded = false;

    // Define status texts matching progress intervals to build curiosity
    const getStatusText = (prog) => {
      if (prog < 20) {
        return "INITIATING STUDIOS...";
      } else if (prog < 40) {
        return "CRAFTING BRAND IDENTITIES...";
      } else if (prog < 65) {
        return "ENGINEERING WEB EXPERIENCES...";
      } else if (prog < 85) {
        return "INJECTING CREATIVE ARTISTRY...";
      } else if (prog < 98) {
        return "OPTIMIZING USER EXPERIENCE...";
      } else {
        return "PREPARING INTERFACE...";
      }
    };

    const updateProgress = (value) => {
      progress = Math.min(Math.max(value, 0), 100);
      
      // Update text indicators
      loaderPercent.textContent = `${Math.round(progress)} %`;
      
      // Update SVG circular arc fill offset
      const offset = circumference - (progress / 100) * circumference;
      loaderProgress.style.strokeDashoffset = offset;

      // Update curiosity status message
      const statusText = getStatusText(progress);
      if (loaderStatus.textContent !== statusText) {
        loaderStatus.style.opacity = 0;
        setTimeout(() => {
          loaderStatus.textContent = statusText;
          loaderStatus.style.opacity = 0.8;
        }, 150);
      }

      if (progress >= 100) {
        clearInterval(loadingInterval);
        
        // Hide loader overlay with transition
        setTimeout(() => {
          pageLoader.classList.add('fade-out');
          document.body.style.overflow = ''; // Restore page scrolling
          
          // Clean up DOM after transition completes (600ms)
          setTimeout(() => {
            pageLoader.remove();
          }, 600);
        }, 400);
      }
    };

    // Smooth loading simulator with variable progress increments (adjusted for slower progression)
    let currentStep = 0;
    loadingInterval = setInterval(() => {
      if (isFullyLoaded) {
        // Accelerate loading once window finishes loading assets
        currentStep += Math.random() * 3 + 1.5;
        updateProgress(currentStep);
      } else {
        // Smooth simulated loading
        if (currentStep < 30) {
          currentStep += Math.random() * 1.5 + 0.5;
        } else if (currentStep < 60) {
          currentStep += Math.random() * 1.0 + 0.3;
        } else if (currentStep < 88) {
          currentStep += Math.random() * 0.5 + 0.1;
        } else if (currentStep < 97) {
          currentStep += Math.random() * 0.15 + 0.02;
        } else {
          // Hold at 97% until window load event fires
          currentStep = 97;
        }
        updateProgress(currentStep);
      }
    }, 65);

    // Track when all styles, images, and resources are fully loaded
    window.addEventListener('load', () => {
      isFullyLoaded = true;
    });

    // Fallback: in case page assets fail to fire load event, force complete
    setTimeout(() => {
      isFullyLoaded = true;
    }, 7000);
  }

  /* ==========================================================================
     1. SCROLL TRACKING & PROGRESS BAR
     ========================================================================== */
  const scrollProgressBar = document.querySelector('.scroll-progress-bar');
  const headerNav = document.querySelector('.header-nav');
  
  window.addEventListener('scroll', () => {
    // 1.1 Calculate scroll progress percentage
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    if (scrollProgressBar) {
      scrollProgressBar.style.width = scrolled + '%';
    }
    
    // 1.2 Fixed Nav Background Transition on Scroll
    if (winScroll > 50) {
      headerNav.classList.add('scrolled');
    } else {
      headerNav.classList.remove('scrolled');
    }

    // 1.3 Active Navigation Highlight (Scroll Spy)
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (winScroll >= sectionTop && winScroll < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  /* ==========================================================================
     2. MOBILE NAVIGATION HAMBURGER MENU
     ========================================================================== */
  const hamburger = document.querySelector('.hamburger');
  const navLinksList = document.querySelector('.nav-links');
  const navItems = document.querySelectorAll('.nav-link');

  if (hamburger && navLinksList) {
    // Toggle menu visibility
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinksList.classList.toggle('active');
    });

    // Close menu when clicking a link
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinksList.classList.remove('active');
      });
    });
  }

  /* ==========================================================================
     3. ABOUT US TAB SWITCHER
     ========================================================================== */
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');
      
      // Reset button states
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Swap content blocks
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.getAttribute('id') === targetTab) {
          content.classList.add('active');
        }
      });
    });
  });

  /* ==========================================================================
     4. PORTFOLIO INTERACTIVE CATEGORY FILTER
     ========================================================================== */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.getAttribute('data-filter');
      
      // Update active filter button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show/Hide project cards
      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
          card.classList.remove('hidden');
          // Restart entrance animation
          card.style.animation = 'none';
          card.offsetHeight; // Trigger reflow to restart animation
          card.style.animation = 'card-reveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });

  /* ==========================================================================
     5. SCROLL-TRIGGERED METRICS / SKILLS
     ========================================================================== */
  const skillsSection = document.getElementById('skills');
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const radialBars = document.querySelectorAll('.radial-progress');
  const radialTexts = document.querySelectorAll('.radial-text-val');
  
  let animationTriggered = false;

  const animateSkills = () => {
    if (!skillsSection) return;
    
    const sectionPos = skillsSection.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;
    
    // Trigger when the skills section is visible in the viewport
    if (sectionPos < screenHeight * 0.75 && !animationTriggered) {
      animationTriggered = true;
      
      // 5.1 Fill horizontal skill bars
      skillBars.forEach(bar => {
        const targetPercent = bar.getAttribute('data-percent');
        bar.style.width = targetPercent + '%';
      });

      // 5.2 Fill circular radial skill meters
      radialBars.forEach(bar => {
        const targetPercent = parseFloat(bar.getAttribute('data-percent')) || 0;
        const radius = parseFloat(bar.getAttribute('r')) || 40;
        const circumference = 2 * Math.PI * radius; // 251.2 for r=40
        const strokeDashOffset = circumference - (targetPercent / 100) * circumference;
        bar.style.strokeDashoffset = strokeDashOffset;
      });

      // 5.3 Animate text percentage numbers counting up
      radialTexts.forEach(text => {
        const targetNum = parseInt(text.getAttribute('data-target'), 10) || 0;
        if (targetNum <= 0) {
          text.textContent = "0";
          return;
        }
        let currentNum = 0;
        const duration = 1800; // Match CSS transitions
        const stepTime = Math.abs(Math.floor(duration / targetNum)) || 10;
        
        const counterInterval = setInterval(() => {
          currentNum++;
          text.textContent = currentNum;
          if (currentNum >= targetNum) {
            text.textContent = targetNum;
            clearInterval(counterInterval);
          }
        }, stepTime);
      });
    }
  };

  // Run on load and scroll
  window.addEventListener('scroll', animateSkills);
  animateSkills();

  /* ==========================================================================
     6. THE WOW-FACTOR INTERACTIVE RATE ESTIMATOR
     ========================================================================== */
  // 6.1 Calculator Variables & Factors
  const baseRate = 3499;          // Base development package cost (1 Landing Page) in INR
  const ratePerPage = 750;      // Cost per additional page in INR
  const timelineBase = 6;       // Base timeline in days (1 Page)
  const timelinePerPage = 1;    // Days added per page

  // 6.2 Elements
  const pagesSlider = document.getElementById('calc-pages');
  const pagesValueLabel = document.getElementById('calc-pages-val');
  
  const logoCheckbox = document.getElementById('addon-logo');
  const uiuxCheckbox = document.getElementById('addon-uiux');
  const animCheckbox = document.getElementById('addon-anim');
  const seoCheckbox = document.getElementById('addon-seo');
  
  const finalPriceLabel = document.getElementById('estimated-price-val');
  const finalTimelineLabel = document.getElementById('estimated-timeline-val');

  // 6.3 Recalculator Function
  const updateProjectEstimate = () => {
    if (!pagesSlider) return;

    const pagesCount = parseInt(pagesSlider.value, 10);
    pagesValueLabel.textContent = pagesCount;

    // Calculate total price
    let totalPrice = baseRate + (pagesCount - 1) * ratePerPage;
    
    // Add feature pricing
    if (logoCheckbox && logoCheckbox.checked) totalPrice += parseInt(logoCheckbox.value, 10);
    if (uiuxCheckbox && uiuxCheckbox.checked) totalPrice += parseInt(uiuxCheckbox.value, 10);
    if (animCheckbox && animCheckbox.checked) totalPrice += parseInt(animCheckbox.value, 10);
    if (seoCheckbox && seoCheckbox.checked) totalPrice += parseInt(seoCheckbox.value, 10);

    // Calculate estimated timeline (in days)
    let totalTimeline = timelineBase + (pagesCount - 1) * timelinePerPage;
    let extraDays = 0;
    if (logoCheckbox && logoCheckbox.checked) extraDays += 3;
    if (uiuxCheckbox && uiuxCheckbox.checked) extraDays += 2;
    if (animCheckbox && animCheckbox.checked) extraDays += 2;
    if (seoCheckbox && seoCheckbox.checked) extraDays += 1;
    
    totalTimeline += extraDays;

    // Smooth counting effect for price update
    animateValue(finalPriceLabel, parseInt(finalPriceLabel.textContent.replace(/,/g, ''), 10) || 0, totalPrice, 400);

    // Update timeline label
    finalTimelineLabel.textContent = `~${totalTimeline} business days`;
  };

  // Helper function for animated digit ticker
  const animateValue = (element, start, end, duration) => {
    if (!element) return;
    if (start === end) {
      element.textContent = end.toLocaleString();
      return;
    }
    const range = end - start;
    let current = start;
    const increment = end > start ? Math.ceil(range / 20) : Math.floor(range / 20);
    const stepTime = Math.abs(Math.floor(duration / 20));
    
    const timer = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = current.toLocaleString();
    }, stepTime);
  };

  // 6.4 Event Listeners for Estimator
  const calculatorElements = [pagesSlider, logoCheckbox, uiuxCheckbox, animCheckbox, seoCheckbox];
  calculatorElements.forEach(element => {
    if (element) {
      element.addEventListener('input', updateProjectEstimate);
      element.addEventListener('change', updateProjectEstimate);
    }
  });

  // Run initial calculation
  updateProjectEstimate();

  /* ==========================================================================
     7. CONTACT FORM SUBMISSION WITH GLASSMORPHIC OVERLAY
     ========================================================================== */
  const contactForm = document.getElementById('contactForm');
  const successOverlay = document.querySelector('.success-overlay');
  const closeSuccessBtn = document.getElementById('btn-close-success');

  if (contactForm && successOverlay) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Perform minor visual validation
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (name && email && message) {
        // Change submit button state to show sending
        const submitBtn = contactForm.querySelector('.contact-submit-btn');
        const originalBtnHTML = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';

        const formData = new FormData();
        formData.append('entry.699984163', name);
        formData.append('entry.1609817512', email);
        formData.append('entry.1353138042', document.getElementById('contact-project').value.trim());
        formData.append('entry.404548235', message);

        fetch('https://docs.google.com/forms/u/0/d/e/1FAIpQLScwQ-5ybWNzlzLmwnyS72xD1uBUSrBTTg0mLKz_V6vXVpC2LQ/formResponse', {
          method: 'POST',
          mode: 'no-cors',
          body: formData
        })
        .then(() => {
          // Show success animation overlay inside the glass container
          successOverlay.classList.add('active');
          // Reset form input fields
          contactForm.reset();
        })
        .catch((error) => {
          console.error('Submission error:', error);
          alert('There was an issue submitting your request. Please try again or WhatsApp us.');
        })
        .finally(() => {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        });
      }
    });

    // Close success overlay on button click
    if (closeSuccessBtn) {
      closeSuccessBtn.addEventListener('click', () => {
        successOverlay.classList.remove('active');
      });
    }
  }

  /* ==========================================================================
     8. DYNAMIC AMBIENT MESH GRID MOUSE-FOLLOW (WOW OPTIMIZATION)
     ========================================================================== */
  const gridContainer = document.querySelector('.ambient-grid');
  
  if (gridContainer) {
    window.addEventListener('mousemove', (e) => {
      // Calculate cursor position coordinates as percentage of viewport
      const xPercent = (e.clientX / window.innerWidth) * 100;
      const yPercent = (e.clientY / window.innerHeight) * 100;
      
      // Warp grid masking center dynamically based on cursor coordinate coordinates
      gridContainer.style.backgroundImage = `
        linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)
      `;
      gridContainer.style.maskImage = `radial-gradient(ellipse 50% 50% at ${xPercent}% ${yPercent}%, #000 30%, transparent 100%)`;
      gridContainer.style.webkitMaskImage = `radial-gradient(ellipse 50% 50% at ${xPercent}% ${yPercent}%, #000 30%, transparent 100%)`;
    });
  }

});
