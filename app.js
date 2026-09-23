document.addEventListener('DOMContentLoaded', () => {
  
  // Initialize visual systems and interaction upgrades immediately to avoid visual lag
  splitHeroHeadline();
  initHeroParticles();
  initMagneticButtons();

  /* ==========================================================================
     0. RIVE INTRO ANIMATION
     ========================================================================== */
  const riveOverlay = document.getElementById('riveIntro');
  const riveCanvas = document.getElementById('riveCanvas');
  const riveSkipBtn = document.getElementById('riveSkipBtn');

  // Determine whether to show intro
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadyShown = sessionStorage.getItem('vyqo_intro_shown') === '1';
  const shouldSkipIntro = reducedMotion || alreadyShown || !riveOverlay || !riveCanvas;

  if (shouldSkipIntro) {
    // Remove overlay immediately, show site
    if (riveOverlay) riveOverlay.remove();
    triggerHeroAnimations();
  } else {
    // Lock scroll and focus during intro
    document.body.style.overflow = 'hidden';
    let introDismissed = false;
    let riveInstance = null;
    let resizeHandler = null;
    let failsafeTimer = null;
    let animationTimer = null;

    // Focus the skip button for keyboard users
    riveSkipBtn.focus({ preventScroll: true });

    // Trap focus within overlay while visible
    const trapFocus = (e) => {
      if (!riveOverlay.contains(document.activeElement) && !introDismissed) {
        e.stopPropagation();
        riveSkipBtn.focus({ preventScroll: true });
      }
    };
    document.addEventListener('focus', trapFocus, true);

    // Canvas sizing respecting devicePixelRatio
    function sizeRiveCanvas() {
      if (!riveCanvas || introDismissed) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = riveCanvas.clientWidth;
      const cssH = riveCanvas.clientHeight;
      const bufW = Math.round(cssW * dpr);
      const bufH = Math.round(cssH * dpr);
      if (riveCanvas.width !== bufW || riveCanvas.height !== bufH) {
        riveCanvas.width = bufW;
        riveCanvas.height = bufH;
      }
    }

    // Dismiss the intro overlay
    function dismissIntro() {
      if (introDismissed) return;
      introDismissed = true;

      // Mark as shown for this tab session
      sessionStorage.setItem('vyqo_intro_shown', '1');

      // Clear timers
      if (failsafeTimer) clearTimeout(failsafeTimer);
      if (animationTimer) clearTimeout(animationTimer);

      // Fade out overlay
      riveOverlay.classList.add('fade-out');

      // Restore scroll
      document.body.style.overflow = '';

      // Trigger hero entrance animations
      triggerHeroAnimations();

      // Remove focus trap
      document.removeEventListener('focus', trapFocus, true);

      // Clean up after transition completes (300ms)
      setTimeout(() => {
        // Cleanup Rive instance
        if (riveInstance) {
          try { riveInstance.cleanup(); } catch (_) {}
          riveInstance = null;
        }
        // Remove resize listener
        if (resizeHandler) {
          window.removeEventListener('resize', resizeHandler);
          resizeHandler = null;
        }
        // Remove overlay from DOM
        if (riveOverlay && riveOverlay.parentNode) {
          riveOverlay.remove();
        }
      }, 350);
    }

    // Skip button handlers
    riveSkipBtn.addEventListener('click', dismissIntro);
    riveSkipBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        dismissIntro();
      }
    });

    // Escape key dismisses
    const escHandler = (e) => {
      if (e.key === 'Escape') dismissIntro();
    };
    document.addEventListener('keydown', escHandler);

    // Overall failsafe timeout (8 seconds)
    failsafeTimer = setTimeout(() => {
      if (!introDismissed) {
        console.warn('VYQO intro: failsafe timeout reached, dismissing.');
        dismissIntro();
      }
    }, 8000);

    // Initialize Rive
    try {
      if (typeof rive === 'undefined' || !rive.Rive) {
        throw new Error('Rive runtime not loaded');
      }

      sizeRiveCanvas();

      riveInstance = new rive.Rive({
        src: 'vyqo_\u2014_startup_reveal.riv',
        canvas: riveCanvas,
        artboard: 'VYQO Startup',
        stateMachines: 'State Machine 1',
        autoplay: true,
        useDevicePixelRatio: true,
        layout: new rive.Layout({
          fit: rive.Fit.Contain,
          alignment: rive.Alignment.Center
        }),
        onLoad: () => {
          sizeRiveCanvas();
          if (riveInstance) {
            riveInstance.resizeDrawingSurfaceToCanvas();
          }
          // Set animation completion timer (3.2s animation duration)
          animationTimer = setTimeout(() => {
            dismissIntro();
          }, 3200);
        },
        onLoadError: (err) => {
          console.warn('VYQO intro: Rive load error, dismissing.', err);
          dismissIntro();
        }
      });

      // Resize handler
      resizeHandler = () => {
        if (introDismissed) return;
        sizeRiveCanvas();
        if (riveInstance) {
          try { riveInstance.resizeDrawingSurfaceToCanvas(); } catch (_) {}
        }
      };
      window.addEventListener('resize', resizeHandler);

    } catch (err) {
      console.warn('VYQO intro: initialization failed, dismissing.', err);
      dismissIntro();
    }

    // Remove escape handler after dismiss
    const originalDismiss = dismissIntro;
    // (escape handler auto-cleaned via introDismissed guard)
  }

  /* ==========================================================================
     0.5 CUSTOM CURSOR SYSTEM
     ========================================================================== */
  // Create cursor elements dynamically
  const cursorDot = document.createElement('div');
  cursorDot.className = 'custom-cursor-dot';
  
  const cursorRing = document.createElement('div');
  cursorRing.className = 'custom-cursor-ring';
  
  const cursorText = document.createElement('span');
  cursorText.className = 'cursor-ring-text';
  cursorText.textContent = 'VIEW';
  
  cursorRing.appendChild(cursorText);
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorRing);

  // Mouse coordinate states
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let isFirstMove = true;
  const checkCursorVisibility = () => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth < 768;
    if (isTouch || isMobile) {
      cursorDot.style.display = 'none';
      cursorRing.style.display = 'none';
    } else {
      cursorDot.style.display = '';
      cursorRing.style.display = '';
    }
  };

  window.addEventListener('resize', checkCursorVisibility);
  checkCursorVisibility();

  // 1. Mousemove updates
  window.addEventListener('mousemove', (e) => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth < 768;
    if (isTouch || isMobile) return;

    mouseX = e.clientX;
    mouseY = e.clientY;

    // Update dot position instantly
    cursorDot.style.left = `${mouseX}px`;
    cursorDot.style.top = `${mouseY}px`;

    if (isFirstMove) {
      ringX = mouseX;
      ringY = mouseY;
      isFirstMove = false;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    }

    // 2. Hover states checks
    const target = e.target;
    if (target) {
      // Clear previous state classes
      cursorRing.classList.remove('hover-cta', 'hover-text', 'hover-project');
      cursorDot.classList.remove('hover-cta', 'hover-text', 'hover-project');

      // Check selectors
      if (
        target.closest('.btn') || 
        target.closest('.filter-btn') || 
        target.closest('.tab-btn') || 
        target.closest('.social-circle-btn') || 
        target.closest('button') || 
        target.closest('.nav-link') ||
        target.closest('a') ||
        target.closest('.checkbox-card') ||
        target.closest('input[type="submit"]') ||
        target.closest('.hamburger')
      ) {
        cursorRing.classList.add('hover-cta');
        cursorDot.classList.add('hover-cta');
      } else if (
        target.closest('.project-card') || 
        target.closest('img') || 
        target.closest('.canvas-container') ||
        target.closest('.about-visual')
      ) {
        cursorRing.classList.add('hover-project');
        cursorDot.classList.add('hover-project');
      } else if (
        target.closest('h1, h2, h3, h4, h5, h6, p, span, li')
      ) {
        // Avoid text hover trigger on elements inside buttons/cards
        if (!target.closest('.btn') && !target.closest('a') && !target.closest('button') && !target.closest('.project-card') && !target.closest('.checkbox-card')) {
          cursorRing.classList.add('hover-text');
          cursorDot.classList.add('hover-text');
        }
      }
    }
  });

  // 3. Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });
  
  document.addEventListener('mouseenter', () => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth < 768;
    if (isTouch || isMobile) return;

    if (!isFirstMove) {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    }
  });

  // 4. Smooth Lerp Animation Loop via requestAnimationFrame (easing factor 0.12)
  const updateRingPosition = () => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isMobile = window.innerWidth < 768;

    if (!isTouch && !isMobile) {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;

      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;
    }

    requestAnimationFrame(updateRingPosition);
  };
  requestAnimationFrame(updateRingPosition);

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
          card.style.transitionDelay = '0ms';
          card.classList.remove('animate-in');
          card.offsetHeight; // Force reflow
          card.classList.add('animate-in');
        } else {
          card.classList.add('hidden');
          card.classList.remove('animate-in');
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

  /* ==========================================================================
     9. SCROLL-TRIGGERED ENTRANCE ANIMATIONS (INTERSECTION OBSERVER)
     ========================================================================== */
  // 9.1 Set up Section Title animations
  const sectionTitles = document.querySelectorAll('.section-title');
  const titleObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        titleObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  sectionTitles.forEach(title => titleObserver.observe(title));

  // 9.2 Set up Divider Line animations
  const dividerLines = document.querySelectorAll('.divider-line');
  const dividerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        dividerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  dividerLines.forEach(line => dividerObserver.observe(line));

  // 9.3 Set up Card animations with dynamic staggering (80ms spacing)
  const animatedCards = document.querySelectorAll('.radial-skill-card, .skills-column, .project-card, .service-card');
  let cardStaggerDelay = 0;
  let staggerTimeout = null;

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        card.style.transitionDelay = `${cardStaggerDelay}ms`;
        card.classList.add('animate-in');
        cardStaggerDelay += 80; // Stagger each card by 80ms
        cardObserver.unobserve(card);

        // Reset the delay stack after cards in the current view are animated
        if (staggerTimeout) clearTimeout(staggerTimeout);
        staggerTimeout = setTimeout(() => {
          cardStaggerDelay = 0;
        }, 150);
      }
    });
  }, { threshold: 0.1 });
  animatedCards.forEach(card => cardObserver.observe(card));

  // 9.4 Set up Images/Visuals scale-in animations
  const animatedVisuals = document.querySelectorAll('.project-img, .canvas-card, .about-media');
  const visualObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        visualObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  animatedVisuals.forEach(visual => visualObserver.observe(visual));

  // 9.5 Set up Stat Numbers count up animation with easeOutExpo curve (1.4s)
  const statNumbers = document.querySelectorAll('.stat-num');
  
  const countUpValue = (el) => {
    const fullText = el.textContent.trim();
    // Parse target number
    const targetVal = parseInt(fullText.replace(/[^0-9]/g, ''), 10);
    if (isNaN(targetVal)) return;

    // Parse suffix (+ or %)
    const suffix = fullText.replace(/[0-9]/g, '');

    const duration = 1400; // 1.4s
    const startTime = performance.now();

    const animateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeOutExpo curve
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(easeProgress * targetVal);

      el.innerHTML = `${currentVal}<span>${suffix}</span>`;

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        el.innerHTML = `${targetVal}<span>${suffix}</span>`;
      }
    };
    requestAnimationFrame(animateCount);
  };

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        countUpValue(entry.target);
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  statNumbers.forEach(stat => statsObserver.observe(stat));

  /* ==========================================================================
     10. HERO EXTRAS (TEXT ENTRANCE & CANVAS PARTICLE SYSTEM)
     ========================================================================== */
  function splitHeroHeadline() {
    const title = document.querySelector('.hero-title');
    if (!title) return;

    const newContent = [];
    title.childNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        const words = node.textContent.split(/(\s+)/);
        words.forEach(word => {
          if (word.trim().length > 0) {
            newContent.push(`<span class="word-wrapper"><span class="word">${word}</span></span>`);
          } else {
            newContent.push(word);
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('gradient-text')) {
        const words = node.textContent.split(/(\s+)/);
        const spanWords = words.map(word => {
          if (word.trim().length > 0) {
            return `<span class="word-wrapper"><span class="word gradient-text">${word}</span></span>`;
          }
          return word;
        }).join('');
        newContent.push(spanWords);
      } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'BR') {
        newContent.push('<br>');
      } else {
        newContent.push(node.outerHTML);
      }
    });
    title.innerHTML = newContent.join('');
  }

  function triggerHeroAnimations() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const words = document.querySelectorAll('.hero-title .word');
    words.forEach((word, idx) => {
      setTimeout(() => {
        word.classList.add('animate-in');
      }, 300 + idx * 80); // Stagger 0.08s per word, starting 0.3s after load
    });

    const desc = document.querySelector('.hero-desc');
    if (desc) {
      setTimeout(() => {
        desc.classList.add('animate-in');
      }, 1100); // Delayed 1.1s
    }

    const actions = document.querySelector('.hero-actions');
    if (actions) {
      setTimeout(() => {
        actions.classList.add('animate-in');
      }, 1600); // Delayed 1.6s
    }
  }

  function initHeroParticles() {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const resizeCanvas = () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const isMobile = window.innerWidth < 768;
    const numParticles = isMobile ? 20 : 60;
    const repelRadius = 120;

    let mouse = { x: -1000, y: -1000 };

    const heroSection = document.getElementById('hero');
    if (heroSection) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
      });

      heroSection.addEventListener('mouseleave', () => {
        mouse.x = -1000;
        mouse.y = -1000;
      });
    }

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.r = 1;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 0.2 + 0.15;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.rx = 0;
        this.ry = 0;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        const dx = (this.x + this.rx) - mouse.x;
        const dy = (this.y + this.ry) - mouse.y;
        const dist = Math.hypot(dx, dy);

        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          const angle = Math.atan2(dy, dx);
          this.rx += Math.cos(angle) * force * 1.5;
          this.ry += Math.sin(angle) * force * 1.5;
        }

        this.rx *= 0.92;
        this.ry *= 0.92;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x + this.rx, this.y + this.ry, this.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.fill();
      }
    }

    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
      let currentX = 0;
      let currentY = 0;
      let isHovered = false;
      let rafId = null;

      // Mouse position relative to center of this button
      let targetX = 0;
      let targetY = 0;

      // Make sure children (text/icons) don't capture cursor coordinates directly
      button.querySelectorAll('*').forEach(child => {
        child.style.pointerEvents = 'none';
      });

      // Mousemove for spotlight positions relative to button
      button.addEventListener('mousemove', (e) => {
        if (window.innerWidth < 768) return;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        button.style.setProperty('--spotlight-x', `${x}px`);
        button.style.setProperty('--spotlight-y', `${y}px`);
      });

      const updatePosition = () => {
        if (!isHovered) return;
        
        // Lerp factor 0.2
        currentX += (targetX - currentX) * 0.2;
        currentY += (targetY - currentY) * 0.2;
        
        button.style.transform = `translate(${currentX}px, ${currentY}px)`;
        
        rafId = requestAnimationFrame(updatePosition);
      };

      const handleGlobalMouseMove = (e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        if (window.innerWidth < 768) return;

        const rect = button.getBoundingClientRect();
        // Since button translates, rect.left / rect.top moves. 
        // We find the original center by subtracting current translate coordinates!
        const centerX = rect.left - currentX + rect.width / 2;
        const centerY = rect.top - currentY + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const dist = Math.hypot(dx, dy);

        if (dist < 90) {
          // Inside 90px zone
          button.style.transition = 'none'; // Clear spring transition during active track
          isHovered = true;

          // Target is up to 10px in the direction of the cursor
          targetX = (dx / 90) * 10;
          targetY = (dy / 90) * 10;

          if (!rafId) {
            rafId = requestAnimationFrame(updatePosition);
          }
        } else {
          // Outside zone
          if (isHovered) {
            resetButton();
          }
        }
      };

      const resetButton = () => {
        isHovered = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        currentX = 0;
        currentY = 0;
        targetX = 0;
        targetY = 0;
        // Spring back with overshoot easing
        button.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        button.style.transform = 'translate(0px, 0px)';
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      
      button.addEventListener('mouseleave', () => {
        resetButton();
        button.style.setProperty('--spotlight-x', `-999px`);
        button.style.setProperty('--spotlight-y', `-999px`);
      });
    });
  }

});
