// Jewel of Virar - AV Pearl Landing Page Interactivity

document.addEventListener('DOMContentLoaded', () => {

  // ----------------------------------------------------
  // 1. Hero Banner Image Slider with Touch & Auto-play
  // ----------------------------------------------------
  const heroSliders = document.querySelectorAll('.hero-slider');
  const slideDuration = 5000; // 5 seconds per slide

  heroSliders.forEach(slider => {
    const slides = slider.querySelectorAll('.slide');
    const sliderPrev = slider.querySelector('.slider-arrow.prev');
    const sliderNext = slider.querySelector('.slider-arrow.next');
    const sliderDots = slider.querySelector('.slider-dots');

    let currentSlide = 0;
    let slideInterval;

    if (slides.length > 0 && sliderDots) {
      // Generate dot indicators dynamically
      slides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        dot.setAttribute('aria-label', `Slide ${idx + 1}`);
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
          goToSlide(idx);
          resetAutoSlide();
        });
        sliderDots.appendChild(dot);
      });

      const dots = sliderDots.querySelectorAll('.dot');

      function updateSlideClasses() {
        slides.forEach((slide, idx) => {
          slide.classList.toggle('active', idx === currentSlide);
        });
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentSlide);
        });
      }

      function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        updateSlideClasses();
      }

      function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        updateSlideClasses();
      }

      function goToSlide(idx) {
        currentSlide = idx;
        updateSlideClasses();
      }

      function startAutoSlide() {
        slideInterval = setInterval(nextSlide, slideDuration);
      }

      function stopAutoSlide() {
        clearInterval(slideInterval);
      }

      function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
      }

      if (sliderNext) {
        sliderNext.addEventListener('click', () => {
          nextSlide();
          resetAutoSlide();
        });
      }

      if (sliderPrev) {
        sliderPrev.addEventListener('click', () => {
          prevSlide();
          resetAutoSlide();
        });
      }

      // Pause on hover
      slider.addEventListener('mouseenter', stopAutoSlide);
      slider.addEventListener('mouseleave', startAutoSlide);

      // Touch / Swipe Support for Mobile
      let touchStartX = 0;
      let touchEndX = 0;

      slider.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
      }, { passive: true });

      function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
          nextSlide();
          resetAutoSlide();
        }
        if (touchEndX > touchStartX + 50) {
          prevSlide();
          resetAutoSlide();
        }
      }

      // Start auto slider on load
      startAutoSlide();
    }
  });

  // ----------------------------------------------------
  // 2. Mobile Menu Toggle
  // ----------------------------------------------------
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });

    // Close menu when clicking a nav link
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // ----------------------------------------------------
  // 3. Sticky Navbar Effect on Scroll
  // ----------------------------------------------------
  const mainHeader = document.getElementById('mainHeader');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      mainHeader.classList.add('scrolled');
    } else {
      mainHeader.classList.remove('scrolled');
    }
  });

  // ----------------------------------------------------
  // 4. Lead Modal Handling
  // ----------------------------------------------------
  const leadModal = document.getElementById('leadModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDynamicTitle = document.getElementById('modalDynamicTitle');
  const modalActionType = document.getElementById('modalActionType');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  function openModal(title, actionType) {
    if (modalDynamicTitle && title) {
      modalDynamicTitle.textContent = title;
    }
    if (modalActionType && actionType) {
      modalActionType.value = actionType;
    }
    if (leadModal) {
      leadModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (leadModal) {
      leadModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  // Event delegation for all elements with .open-modal-btn
  document.addEventListener('click', (e) => {
    const modalBtn = e.target.closest('.open-modal-btn');
    if (modalBtn) {
      e.preventDefault();
      const title = modalBtn.getAttribute('data-modal-title') || 'Enquire Now';
      const action = modalBtn.getAttribute('data-modal-action') || 'General Enquiry';
      openModal(title, action);
    }
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (leadModal) {
    leadModal.addEventListener('click', (e) => {
      if (e.target === leadModal) {
        closeModal();
      }
    });
  }

  // ----------------------------------------------------
  // 5. Form Submissions with WhatsApp Integration & Feedback
  // ----------------------------------------------------
  const heroForm = document.getElementById('heroLeadForm');
  const popupForm = document.getElementById('popupLeadForm');

  const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyWj8jNdbccyTOLjd5fbwuNNWPV9xlTSHFCz5eWbVJrLOBGURImO_qNrwGmoybVTAHtMw/exec'; // <-- Paste your Web App URL here

  function handleFormSubmit(e, formType) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const name = formData.get('name') || 'Valued Customer';
    const email = formData.get('email') || '';
    const config = formData.get('configuration') || '1 & 2 BHK';
    const action = formData.get('action_type') || formData.get('source') || 'Site Enquiry';

    // Combine country code and phone for Hero Form
    let phone = formData.get('phone') || '';
    const countryCode = formData.get('country_code');
    if (countryCode && phone && !phone.startsWith('+')) {
      phone = countryCode + ' ' + phone;
    }

    // 1. Prepare data for Google Sheets
    const sheetData = new URLSearchParams();
    sheetData.append('Date', new Date().toLocaleString());
    sheetData.append('Name', name);
    sheetData.append('Phone', phone);
    sheetData.append('Email', email);
    sheetData.append('Configuration', config);
    sheetData.append('Request_Type', action);
    sheetData.append('Form_Type', formType);

    // Change button state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>SAVING...</span> <i class="fa-solid fa-spinner fa-spin" style="margin-left: 8px;"></i>';
    submitBtn.disabled = true;

    // 2. Send to Google Sheets if configured
    if (GOOGLE_SHEETS_WEB_APP_URL && GOOGLE_SHEETS_WEB_APP_URL.startsWith('http')) {
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: 'POST',
        mode: 'no-cors', // Crucial for Google Apps Script in local environments
        body: sheetData
      })
        .then(response => {
          // With no-cors, the response is opaque. We proceed on success.
          completeSubmission(form, originalBtnText, submitBtn, name, phone, email, config, action);
        })
        .catch(error => {
          console.error('Error saving to sheets:', error);
          completeSubmission(form, originalBtnText, submitBtn, name, phone, email, config, action); // fallback
        });
    } else {
      completeSubmission(form, originalBtnText, submitBtn, name, phone, email, config, action);
    }
  }

  function completeSubmission(form, originalBtnText, submitBtn, name, phone, email, config, action) {
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;

    // Track successful lead form submission in Google Tag Manager / dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'event': 'lead_form_submit' });

    // Show Thank you Alert (without WhatsApp redirection)
    alert(`Thank you, ${name}! Your enquiry for "${config}" has been submitted successfully. Our sales team will contact you shortly.`);

    closeModal();
    form.reset();
  }

  if (heroForm) {
    heroForm.addEventListener('submit', (e) => handleFormSubmit(e, 'Hero Form'));
  }
  if (popupForm) {
    popupForm.addEventListener('submit', (e) => handleFormSubmit(e, 'Popup Form'));
  }

  // ----------------------------------------------------
  // 6. Smart EMI Calculator
  // ----------------------------------------------------
  const loanAmountSlider = document.getElementById('loanAmount');
  const interestRateSlider = document.getElementById('interestRate');
  const loanTenureSlider = document.getElementById('loanTenure');

  const loanAmountDisplay = document.getElementById('loanAmountDisplay');
  const interestRateDisplay = document.getElementById('interestRateDisplay');
  const loanTenureDisplay = document.getElementById('loanTenureDisplay');

  const emiOutput = document.getElementById('emiOutput');
  const principalDisplay = document.getElementById('principalDisplay');
  const totalInterestDisplay = document.getElementById('totalInterestDisplay');
  const totalPayableDisplay = document.getElementById('totalPayableDisplay');

  function formatIndianCurrency(num) {
    return '₹ ' + Math.round(num).toLocaleString('en-IN');
  }

  function calculateEMI() {
    if (!loanAmountSlider || !interestRateSlider || !loanTenureSlider) return;

    const P = parseFloat(loanAmountSlider.value);
    const annualRate = parseFloat(interestRateSlider.value);
    const years = parseFloat(loanTenureSlider.value);

    // Displays
    loanAmountDisplay.textContent = formatIndianCurrency(P);
    interestRateDisplay.textContent = annualRate.toFixed(1) + ' %';
    loanTenureDisplay.textContent = years + ' Years';

    const r = annualRate / (12 * 100); // monthly interest rate
    const n = years * 12; // total months

    // EMI formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    const totalInterest = totalPayment - P;

    emiOutput.textContent = formatIndianCurrency(emi) + ' / month';
    principalDisplay.textContent = formatIndianCurrency(P);
    totalInterestDisplay.textContent = formatIndianCurrency(totalInterest);
    totalPayableDisplay.textContent = formatIndianCurrency(totalPayment);
  }

  if (loanAmountSlider && interestRateSlider && loanTenureSlider) {
    loanAmountSlider.addEventListener('input', calculateEMI);
    interestRateSlider.addEventListener('input', calculateEMI);
    loanTenureSlider.addEventListener('input', calculateEMI);
    calculateEMI();
  }

  // ----------------------------------------------------
  // ----------------------------------------------------
  // 7. Filterable Gallery, Load More & Lightbox Modal with Next/Prev
  // ----------------------------------------------------
  const galleryFilterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const galleryLoadMoreBtn = document.getElementById('galleryLoadMoreBtn');
  const loadMoreBtnText = document.getElementById('loadMoreBtnText');
  const loadMoreBtnIcon = document.getElementById('loadMoreBtnIcon');
  const loadMoreWrapper = document.querySelector('.gallery-load-more-wrapper');

  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  const INITIAL_VISIBLE_COUNT = 8;
  let currentCategory = 'all';
  let isGalleryExpanded = false;
  let currentActiveItems = [];
  let currentLightboxIndex = 0;

  // Function to apply filtering and pagination
  function updateGalleryDisplay() {
    // 1. Find items matching current category
    const matchingItems = galleryItems.filter(item => {
      const cat = item.getAttribute('data-category');
      return currentCategory === 'all' || cat === currentCategory;
    });

    currentActiveItems = matchingItems;

    // 2. Hide items that don't match category
    galleryItems.forEach(item => {
      const cat = item.getAttribute('data-category');
      if (currentCategory !== 'all' && cat !== currentCategory) {
        item.classList.add('hide-item');
        item.classList.remove('show-item', 'collapsed-item');
      } else {
        item.classList.remove('hide-item');
      }
    });

    // 3. Apply pagination (initial 8 vs expanded)
    if (matchingItems.length <= INITIAL_VISIBLE_COUNT) {
      // All fit, hide load more button
      matchingItems.forEach(item => {
        item.classList.remove('collapsed-item');
        item.classList.add('show-item');
      });
      if (loadMoreWrapper) loadMoreWrapper.style.display = 'none';
    } else {
      if (loadMoreWrapper) loadMoreWrapper.style.display = 'block';

      if (isGalleryExpanded) {
        matchingItems.forEach(item => {
          item.classList.remove('collapsed-item');
          item.classList.add('show-item');
        });
        if (loadMoreBtnText) loadMoreBtnText.textContent = 'View Less Photos';
        if (loadMoreBtnIcon) {
          loadMoreBtnIcon.classList.remove('fa-chevron-down');
          loadMoreBtnIcon.classList.add('fa-chevron-up');
        }
      } else {
        const remaining = matchingItems.length - INITIAL_VISIBLE_COUNT;
        matchingItems.forEach((item, idx) => {
          if (idx < INITIAL_VISIBLE_COUNT) {
            item.classList.remove('collapsed-item');
            item.classList.add('show-item');
          } else {
            item.classList.add('collapsed-item');
            item.classList.remove('show-item');
          }
        });
        if (loadMoreBtnText) loadMoreBtnText.textContent = `View More Photos (${remaining} More)`;
        if (loadMoreBtnIcon) {
          loadMoreBtnIcon.classList.remove('fa-chevron-up');
          loadMoreBtnIcon.classList.add('fa-chevron-down');
        }
      }
    }
  }

  // Filter button clicks
  if (galleryFilterBtns.length > 0) {
    galleryFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        galleryFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentCategory = btn.getAttribute('data-filter') || 'all';
        isGalleryExpanded = false; // reset expand state on filter change
        updateGalleryDisplay();
      });
    });
  }

  // Load more button click
  if (galleryLoadMoreBtn) {
    galleryLoadMoreBtn.addEventListener('click', () => {
      if (isGalleryExpanded) {
        isGalleryExpanded = false;
        updateGalleryDisplay();
        const gallerySection = document.getElementById('gallery');
        if (gallerySection) {
          gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else {
        isGalleryExpanded = true;
        updateGalleryDisplay();
      }
    });
  }

  // Initial gallery setup
  updateGalleryDisplay();

  // Lightbox Navigation Functions
  function openLightboxByIndex(index) {
    if (!currentActiveItems || currentActiveItems.length === 0) {
      currentActiveItems = galleryItems;
    }

    if (index < 0) {
      index = currentActiveItems.length - 1;
    } else if (index >= currentActiveItems.length) {
      index = 0;
    }

    currentLightboxIndex = index;
    const targetItem = currentActiveItems[currentLightboxIndex];
    const fullSrc = targetItem.getAttribute('data-full') || targetItem.querySelector('img').src;
    const caption = targetItem.getAttribute('data-caption') || '';

    if (lightboxImg && lightboxModal) {
      lightboxImg.src = fullSrc;
      if (lightboxCaption) lightboxCaption.textContent = caption;
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentLightboxIndex + 1} / ${currentActiveItems.length}`;
      }
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function nextLightbox() {
    openLightboxByIndex(currentLightboxIndex + 1);
  }

  function prevLightbox() {
    openLightboxByIndex(currentLightboxIndex - 1);
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }

  // Attach click to gallery items
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const idx = currentActiveItems.indexOf(item);
      openLightboxByIndex(idx !== -1 ? idx : 0);
    });
  });

  // Lightbox controls
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Keyboard navigation for Lightbox & Modal
  document.addEventListener('keydown', (e) => {
    if (lightboxModal && lightboxModal.classList.contains('active')) {
      if (e.key === 'ArrowRight') nextLightbox();
      if (e.key === 'ArrowLeft') prevLightbox();
      if (e.key === 'Escape') closeLightbox();
    } else if (leadModal && leadModal.classList.contains('active')) {
      if (e.key === 'Escape') closeModal();
    }
  });

  // Touch Swipe on Lightbox
  if (lightboxModal) {
    let lbTouchStartX = 0;
    let lbTouchEndX = 0;

    lightboxModal.addEventListener('touchstart', (e) => {
      lbTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxModal.addEventListener('touchend', (e) => {
      lbTouchEndX = e.changedTouches[0].screenX;
      if (lbTouchEndX < lbTouchStartX - 45) {
        nextLightbox(); // Swipe Left -> Next
      } else if (lbTouchEndX > lbTouchStartX + 45) {
        prevLightbox(); // Swipe Right -> Prev
      }
    }, { passive: true });
  }

  // ----------------------------------------------------
  // 8. Live Toast Social Proof Simulation (if element exists)
  // ----------------------------------------------------
  const liveToast = document.getElementById('liveToast');
  const toastUser = document.getElementById('toastUser');
  const toastAction = document.getElementById('toastAction');

  if (liveToast && !liveToast.classList.contains('d-none')) {
    const socialProofData = [
      { name: 'Prashant K. from Kandivali', action: 'just downloaded the 2 BHK Floor Plan' },
      { name: 'Snehal M. from Borivali', action: 'booked a VIP Site Visit with Cab' },
      { name: 'Rajesh V. from Vasai Road', action: 'requested pricing for 1 BHK' },
      { name: 'Vikas G. from Andheri West', action: 'enquired for Commercial Shop space' },
      { name: 'Deepa S. from Virar West', action: 'scheduled a site visit for Sunday' }
    ];

    let toastIndex = 0;
    function showNextToast() {
      if (!liveToast || !toastUser || !toastAction) return;

      const data = socialProofData[toastIndex];
      toastUser.textContent = data.name;
      toastAction.textContent = data.action;

      liveToast.classList.add('show');

      setTimeout(() => {
        liveToast.classList.remove('show');
      }, 4500);

      toastIndex = (toastIndex + 1) % socialProofData.length;
    }

    setTimeout(() => {
      showNextToast();
      setInterval(showNextToast, 18000);
    }, 4000);
  }

  // ----------------------------------------------------
  // 9. Auto-highlight Active Navigation Link on Scroll
  // ----------------------------------------------------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ----------------------------------------------------
  // 10. Floor Plans Filter Handling & View More
  // ----------------------------------------------------
  const floorFilterBtns = document.querySelectorAll('.floor-filter-btn');
  const floorPlanCards = Array.from(document.querySelectorAll('.floor-plan-card'));
  const floorLoadMoreBtn = document.getElementById('floorPlansLoadMoreBtn');
  const floorLoadMoreBtnText = document.getElementById('floorLoadMoreBtnText');
  const floorLoadMoreBtnIcon = document.getElementById('floorLoadMoreBtnIcon');
  const floorLoadMoreWrapper = document.querySelector('.floor-plans-load-more-wrapper');

  const INITIAL_FLOOR_COUNT = 6;
  let currentFloorFilter = 'all';
  let isFloorExpanded = false;

  function updateFloorDisplay() {
    const matching = floorPlanCards.filter(card => {
      const category = card.getAttribute('data-floor-category') || '';
      return currentFloorFilter === 'all' || category.includes(currentFloorFilter);
    });

    floorPlanCards.forEach(card => {
      card.classList.add('hide-plan');
      card.classList.remove('show-plan');
    });

    if (matching.length <= INITIAL_FLOOR_COUNT) {
      matching.forEach(card => { card.classList.remove('hide-plan'); card.classList.add('show-plan'); });
      if (floorLoadMoreWrapper) floorLoadMoreWrapper.style.display = 'none';
    } else {
      if (floorLoadMoreWrapper) floorLoadMoreWrapper.style.display = 'block';
      if (isFloorExpanded) {
        matching.forEach(card => { card.classList.remove('hide-plan'); card.classList.add('show-plan'); });
        if (floorLoadMoreBtnText) floorLoadMoreBtnText.textContent = 'View Less Floor Plans';
        if (floorLoadMoreBtnIcon) { floorLoadMoreBtnIcon.classList.remove('fa-chevron-down'); floorLoadMoreBtnIcon.classList.add('fa-chevron-up'); }
      } else {
        const remaining = matching.length - INITIAL_FLOOR_COUNT;
        matching.forEach((card, idx) => {
          if (idx < INITIAL_FLOOR_COUNT) {
            card.classList.remove('hide-plan'); card.classList.add('show-plan');
          }
        });
        if (floorLoadMoreBtnText) floorLoadMoreBtnText.textContent = `View More Floor Plans (${remaining} More)`;
        if (floorLoadMoreBtnIcon) { floorLoadMoreBtnIcon.classList.remove('fa-chevron-up'); floorLoadMoreBtnIcon.classList.add('fa-chevron-down'); }
      }
    }
  }

  if (floorFilterBtns.length > 0) {
    floorFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        floorFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFloorFilter = btn.getAttribute('data-floor-filter') || 'all';
        isFloorExpanded = false;
        updateFloorDisplay();
      });
    });
  }

  if (floorLoadMoreBtn) {
    floorLoadMoreBtn.addEventListener('click', () => {
      isFloorExpanded = !isFloorExpanded;
      updateFloorDisplay();
      if (!isFloorExpanded) {
        const fpSection = document.getElementById('floor-plans');
        if (fpSection) fpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (floorPlanCards.length > 0) {
    updateFloorDisplay();
  }

  // ----------------------------------------------------
  // 11. Amenities Category Filter Handling & View More
  // ----------------------------------------------------
  const amenityFilterBtns = document.querySelectorAll('.amenity-filter-btn');
  const allAmenities = Array.from(document.querySelectorAll('.amenity-new-card'));
  const amenityLoadMoreBtn = document.getElementById('amenitiesLoadMoreBtn');
  const amenityLoadMoreBtnText = document.getElementById('amenitiesLoadMoreBtnText');
  const amenityLoadMoreBtnIcon = document.getElementById('amenitiesLoadMoreBtnIcon');
  const amenityLoadMoreWrapper = document.querySelector('.amenities-load-more-wrapper');

  const INITIAL_AMENITY_COUNT = 6;
  let currentAmenityFilter = 'all';
  let isAmenityExpanded = false;

  function updateAmenityDisplay() {
    const matching = allAmenities.filter(card => {
      const category = card.getAttribute('data-amenity-category') || '';
      return currentAmenityFilter === 'all' || category.includes(currentAmenityFilter);
    });

    allAmenities.forEach(card => {
      card.classList.add('hide-amenity');
      card.classList.remove('show-amenity');
    });

    if (matching.length <= INITIAL_AMENITY_COUNT) {
      matching.forEach(card => { card.classList.remove('hide-amenity'); card.classList.add('show-amenity'); });
      if (amenityLoadMoreWrapper) amenityLoadMoreWrapper.style.display = 'none';
    } else {
      if (amenityLoadMoreWrapper) amenityLoadMoreWrapper.style.display = 'block';
      if (isAmenityExpanded) {
        matching.forEach(card => { card.classList.remove('hide-amenity'); card.classList.add('show-amenity'); });
        if (amenityLoadMoreBtnText) amenityLoadMoreBtnText.textContent = 'View Less Amenities';
        if (amenityLoadMoreBtnIcon) { amenityLoadMoreBtnIcon.classList.remove('fa-chevron-down'); amenityLoadMoreBtnIcon.classList.add('fa-chevron-up'); }
      } else {
        const remaining = matching.length - INITIAL_AMENITY_COUNT;
        matching.forEach((card, idx) => {
          if (idx < INITIAL_AMENITY_COUNT) {
            card.classList.remove('hide-amenity'); card.classList.add('show-amenity');
          }
        });
        if (amenityLoadMoreBtnText) amenityLoadMoreBtnText.textContent = `View More Amenities (${remaining} More)`;
        if (amenityLoadMoreBtnIcon) { amenityLoadMoreBtnIcon.classList.remove('fa-chevron-up'); amenityLoadMoreBtnIcon.classList.add('fa-chevron-down'); }
      }
    }
  }

  if (amenityFilterBtns.length > 0) {
    amenityFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        amenityFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentAmenityFilter = btn.getAttribute('data-amenity-filter') || 'all';
        isAmenityExpanded = false;
        updateAmenityDisplay();
      });
    });
  }

  if (amenityLoadMoreBtn) {
    amenityLoadMoreBtn.addEventListener('click', () => {
      isAmenityExpanded = !isAmenityExpanded;
      updateAmenityDisplay();
      if (!isAmenityExpanded) {
        const amSection = document.getElementById('amenities');
        if (amSection) amSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  if (allAmenities.length > 0) {
    updateAmenityDisplay();
  }

  // ----------------------------------------------------
  // 12. Page Onload Animation, Scroll-Reveal & Auto-Popup on Load
  // ----------------------------------------------------
  // Create top load progress bar indicator
  const loadBar = document.createElement('div');
  loadBar.className = 'page-load-progress';
  document.body.prepend(loadBar);

  setTimeout(() => {
    loadBar.style.width = '70%';
  }, 50);

  setTimeout(() => {
    loadBar.style.width = '100%';
    document.body.classList.add('page-loaded');
    setTimeout(() => {
      loadBar.classList.add('completed');
    }, 300);
  }, 150);

  // Automatic Modal Popup on Website Open
  setTimeout(() => {
    // Check that lightbox is not currently open
    if (!lightboxModal || !lightboxModal.classList.contains('active')) {
      openModal('Register For Exclusive VIP Access', 'Instant Website Onload');
    }
  }, 900);

  // Automatic Scroll Reveal Observer for Sections & Cards
  const revealTargets = document.querySelectorAll(
    '.section-title-wrapper, .stat-box, .luxury-pricing-card, .floor-plan-card, .bento-card, .amenity-feature-box, .proximity-item, .developer-badge-card, .developer-info-col, .gallery-item, .story-image-wrap, .story-text-wrap'
  );

  revealTargets.forEach((el, index) => {
    el.classList.add('reveal');
    if (el.classList.contains('stat-box') || el.classList.contains('gallery-item') || el.classList.contains('luxury-pricing-card') || el.classList.contains('floor-plan-card') || el.classList.contains('bento-card') || el.classList.contains('proximity-item')) {
      const delayNum = (index % 4) + 1;
      el.classList.add(`delay-${delayNum}`);
    }
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
  }
});
