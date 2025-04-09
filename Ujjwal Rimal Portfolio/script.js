document.addEventListener('DOMContentLoaded', function() {

    const siteHeader = document.querySelector('.site-header'); // Cache header element

    // --- Mobile Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.main-nav .nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navMenu.classList.toggle('nav-active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            const icon = navToggle.querySelector('i');
            if(icon) {
                icon.classList.toggle('fa-bars', !isExpanded);
                icon.classList.toggle('fa-times', isExpanded);
            }
            document.body.classList.toggle('nav-open', isExpanded); // Toggle body class
        });

        // Close nav if clicking outside header/nav area OR on a nav link
        document.addEventListener('click', function(event) {
            if (navMenu.classList.contains('nav-active')) {
                const isClickInsideNav = navMenu.contains(event.target);
                const isClickOnToggle = navToggle.contains(event.target);
                const isClickInsideHeader = siteHeader?.contains(event.target); // Check header too

                // Close if click is outside nav & toggle OR if it's a link inside the nav
                if ((!isClickInsideNav && !isClickOnToggle && !isClickInsideHeader) || event.target.closest('.main-nav a')) {
                    closeMobileNav();
                }
            }
        });
    }

    function closeMobileNav() {
         if (navMenu && navMenu.classList.contains('nav-active')) {
            navMenu.classList.remove('nav-active');
            if (navToggle) {
                navToggle.setAttribute('aria-expanded', 'false');
                const icon = navToggle.querySelector('i');
                if(icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
            document.body.classList.remove('nav-open');
        }
    }

    // --- Footer Year ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Intersection Observer for Fade-in Sections ---
    const fadeSections = document.querySelectorAll('.fade-in-section');
    if ('IntersectionObserver' in window) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
             entries.forEach(entry => {
                 if (entry.isIntersecting) {
                     entry.target.classList.add('is-visible');
                     observer.unobserve(entry.target); // Stop observing once visible
                 }
             });
         }, {
            rootMargin: '0px',
            threshold: 0.1  // Trigger when 10% is visible
         });
         fadeSections.forEach(section => {
             sectionObserver.observe(section);
         });
    } else { // Fallback for older browsers
        console.log("Intersection Observer not supported, showing all sections.");
        fadeSections.forEach(section => section.classList.add('is-visible'));
    }

    // --- Video Placeholder Click Handler ---
    const videoPlaceholders = document.querySelectorAll('.video-placeholder');
    videoPlaceholders.forEach(placeholder => {
        const videoId = placeholder.getAttribute('data-video-id');
        if (videoId) {
            const indicator = placeholder.querySelector('.video-loading-indicator');

            const loadVideo = () => { // Use named function for easy removal
                placeholder.removeEventListener('click', loadVideo); // Prevent multiple clicks
                if (indicator) placeholder.classList.add('is-loading'); // Show spinner

                const iframe = document.createElement('iframe');
                // Use more privacy-friendly options if desired (nocookie domain, modestbranding)
                iframe.setAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0`);
                iframe.setAttribute('title', 'YouTube video player');
                iframe.setAttribute('frameborder', '0');
                iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
                iframe.setAttribute('allowfullscreen', '');
                iframe.setAttribute('loading', 'lazy');

                iframe.onload = () => {
                    if (indicator) placeholder.classList.remove('is-loading');
                    placeholder.innerHTML = ''; // Clear placeholder content
                    placeholder.appendChild(iframe);
                    placeholder.classList.remove('video-placeholder');
                    placeholder.classList.add('video-wrapper-loaded'); // Signify load complete
                    placeholder.closest('.vlog-card')?.classList.add('video-loaded');
                };

                iframe.onerror = () => { // Handle potential loading errors
                     console.error(`Failed to load YouTube video: ${videoId}`);
                     if (indicator) placeholder.classList.remove('is-loading');
                     // Optionally display an error message in the placeholder
                     placeholder.innerHTML = '<p style="color: red; text-align: center; padding: 20px;">Video could not be loaded.</p>';
                };

                // Append the iframe to start loading (even if hidden)
                // It will replace placeholder content upon successful load via iframe.onload
                 // Safety timeout to remove spinner if onload fails
                 setTimeout(() => {
                     if (indicator) placeholder.classList.remove('is-loading');
                 }, 7000); // 7 seconds
            };
            placeholder.addEventListener('click', loadVideo);
        }
    });


    // --- Back to Top Button ---
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateButtonVisibility = () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            lastScrollY = window.scrollY;
            if (!ticking) {
                window.requestAnimationFrame(updateButtonVisibility);
                ticking = true;
            }
        });

        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault(); // Good practice for button clicks triggering actions
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Smooth Scrolling for Internal Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Ensure it's a valid internal link (at least # + one character)
            if (!href || href.length < 2 || href.charAt(0) !== '#') return;

            try {
                const targetElement = document.getElementById(href.substring(1)); // More specific: Use ID
                if (targetElement) {
                    e.preventDefault();
                    // Use getBoundingClientRect for accurate position relative to viewport
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const headerOffset = siteHeader?.offsetHeight || 75; // Use cached header or default
                    const offsetPosition = window.pageYOffset + elementPosition - headerOffset - 15; // 15px buffer

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });

                    // Close mobile nav if a nav link was clicked inside the menu
                    if (this.closest('.main-nav .nav-menu')) {
                         closeMobileNav();
                    }
                } else {
                    console.warn(`Smooth scroll target element not found for ID: ${href.substring(1)}`);
                }
            } catch (error) {
                 console.error(`Error during smooth scroll for ${href}:`, error);
            }
        });
    });


    // --- VLOG FILTERING LOGIC ---
    const filterContainer = document.getElementById('vlog-filter-buttons');
    const vlogGrid = document.getElementById('vlog-grid-items');
    const noVlogsMessage = document.getElementById('no-vlogs-message');

    if (filterContainer && vlogGrid && noVlogsMessage) {
        const vlogItems = Array.from(vlogGrid.querySelectorAll('.vlog-card')); // Get static NodeList as Array

        filterContainer.addEventListener('click', function(event) {
            const targetButton = event.target.closest('.filter-btn'); // Handle clicks inside button too
            if (targetButton) {
                event.preventDefault();
                const filterValue = targetButton.getAttribute('data-filter');

                // Update active button state
                const currentActive = filterContainer.querySelector('.filter-btn.active');
                if (currentActive) currentActive.classList.remove('active');
                targetButton.classList.add('active');

                let visibleCount = 0;
                vlogItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    const shouldShow = (filterValue === 'all' || filterValue === itemCategory);

                    // Use classes for hiding/showing
                    item.classList.toggle('hide', !shouldShow);

                    if (shouldShow) {
                        visibleCount++;
                        // Ensure visible items are also marked for fade-in if observer hasn't run
                        if (!item.classList.contains('is-visible') && 'IntersectionObserver' in window === false) {
                            item.classList.add('is-visible');
                        }
                    }
                });

                // Show/hide the 'no results' message
                noVlogsMessage.classList.toggle('hide', visibleCount > 0);
            }
        });
    }


    // --- Basic Contact Form Submission Feedback ---
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('contact-form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Always prevent default initially

            const formData = new FormData(contactForm);
            const formAction = contactForm.getAttribute('action');

            // Basic validation example (can be expanded)
            const name = formData.get('name')?.trim();
            const email = formData.get('email')?.trim();
            const message = formData.get('message')?.trim();
            if (!name || !email || !message) {
                 formStatus.textContent = 'Please fill out all required fields.';
                 formStatus.className = 'form-status error';
                 return; // Stop submission
            }

            // Show sending message
            formStatus.textContent = 'Sending...';
            formStatus.className = 'form-status sending';
            contactForm.querySelector('button[type="submit"]').disabled = true; // Disable button

            // ** ACTUAL FORM SUBMISSION (using Fetch API) **
            // Replace the placeholder setTimeout logic with this fetch block
            // Make sure 'formAction' is set correctly in your HTML form tag

            fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json' // Formspree and others often prefer JSON response
                }
            })
            .then(response => {
                if (response.ok) { // Check if response status is 2xx
                    formStatus.textContent = 'Message Sent! Thanks for reaching out.';
                    formStatus.className = 'form-status success';
                    contactForm.reset(); // Clear form
                } else {
                    // Try to get error message from response if possible (depends on service)
                    response.json().then(data => {
                        formStatus.textContent = data.error || 'Oops! Something went wrong. Please try again.';
                        formStatus.className = 'form-status error';
                    }).catch(() => {
                        // Fallback error message
                        formStatus.textContent = `Oops! Server error (${response.status}). Please try again later.`;
                        formStatus.className = 'form-status error';
                    });
                }
            })
            .catch(error => { // Handle network errors
                console.error('Form submission error:', error);
                formStatus.textContent = 'Network error. Please check connection and try again.';
                formStatus.className = 'form-status error';
            })
            .finally(() => {
                // Re-enable button regardless of outcome
                 contactForm.querySelector('button[type="submit"]').disabled = false;
                 // Optional: Hide status message after a few seconds
                 setTimeout(() => {
                    if(formStatus.classList.contains('success') || formStatus.classList.contains('error')){
                       formStatus.textContent = '';
                       formStatus.className = 'form-status';
                    }
                 }, 6000);
            });

            /* --- Remove or Comment Out the Simulation Below ---
            // Simulate network delay (Remove this block when using fetch above)
             setTimeout(() => {
                 const success = Math.random() > 0.2; // Simulate 80% success rate
                 if (success) {
                     formStatus.textContent = 'Message Sent! Thanks for reaching out.';
                     formStatus.className = 'form-status success';
                     contactForm.reset();
                 } else {
                     formStatus.textContent = 'Oops! Something went wrong. Please try again later.';
                     formStatus.className = 'form-status error';
                 }
                 contactForm.querySelector('button[type="submit"]').disabled = false; // Re-enable button
             }, 1500);
            --- End Simulation --- */
        });
    }

}); // End DOMContentLoaded