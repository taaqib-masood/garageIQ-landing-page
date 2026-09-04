document.addEventListener('DOMContentLoaded', () => {

    // ── Conversion instrumentation ────────────────────────────────────────
    // Vercel Analytics was loaded but never called, so a waitlist that failed
    // on every submission looked identical to a page nobody scrolled to.
    // These events make the funnel visible: view -> focus -> submit -> result.
    //
    // Events go to our own Postgres rather than Vercel Web Analytics, which is
    // not enabled on this project and cannot be switched on through the API.
    // Owning the data also means the funnel is a SQL query, not a dashboard.
    // The window.va call is kept as a no-op-safe secondary sink in case Web
    // Analytics is ever turned on.
    //
    // Deliberately no PII here: emails live in public.waitlist. These rows are
    // anonymous steps stitched together by a per-tab session id.
    const SUPABASE_URL = 'https://zbqtaiozkhfscwynddjd.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpicXRhaW96a2hmc2N3eW5kZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODkzNjcsImV4cCI6MjA5NDI2NTM2N30.alfx8gruhDhJr1L_zwNt0xrzAaxJdkcgIFnyZdtofa0';

    const sessionId = (() => {
        try {
            let id = sessionStorage.getItem('giq_sid');
            if (!id) {
                id = (crypto.randomUUID?.() || String(Date.now()) + Math.random()).slice(0, 64);
                sessionStorage.setItem('giq_sid', id);
            }
            return id;
        } catch (_) {
            return null;   // private mode, blocked storage
        }
    })();

    // Referrer host only — never the full URL, which can carry query strings.
    const referrerHost = (() => {
        try {
            return document.referrer ? new URL(document.referrer).hostname.slice(0, 255) : null;
        } catch (_) {
            return null;
        }
    })();

    function trackEvent(name, data) {
        const payload = data || {};

        // Secondary sink; silently does nothing while Web Analytics is off.
        try {
            window.va?.('event', { name, ...payload });
        } catch (_) { /* analytics must never break the page */ }

        // Primary sink. Fire-and-forget with keepalive so it still leaves the
        // page if the visitor navigates away mid-request; never awaited, so it
        // cannot slow down a form submission.
        try {
            const body = JSON.stringify({
                name,
                session_id: sessionId,
                persona: payload.persona || null,
                emirate: payload.emirate || null,
                referrer: referrerHost
            });
            fetch(`${SUPABASE_URL}/rest/v1/landing_events`, {
                method: 'POST',
                keepalive: true,
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body
            }).catch(() => { /* a dropped analytics beat is not worth a retry */ });
        } catch (_) { /* never break the page for a metric */ }
    }

    // Query typed into the hero search, carried down to the waitlist submit.
    let pendingHeroQuery = '';

    // Declared once, up here, because several features below need it and a
    // `const` further down would be in the temporal dead zone for all of them.
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 0. The "Ink Ring" Custom Cursor
    const cursor = document.getElementById('brutalist-cursor');
    const cursorMediaQuery = window.matchMedia('(any-hover: hover) and (any-pointer: fine)');

    if (cursor) {
        const root = document.documentElement;
        const nativeCursorSelector = 'textarea, select, [contenteditable="true"]';
        let cursorFrame = null;
        let cursorX = 0;
        let cursorY = 0;
        let pageZoom = 1;

        const resetCursorState = () => {
            cursor.classList.remove('is-visible', 'cta-hover', 'text-hover', 'input-hover');
        };

        const syncCursorCapability = () => {
            if (!cursorMediaQuery.matches) {
                root.classList.remove('custom-cursor-enabled');
            }
            resetCursorState();
        };

        const syncPageZoom = () => {
            pageZoom = parseFloat(window.getComputedStyle(root).zoom) || 1;
        };

        const renderCursor = () => {
            // Root-level CSS zoom scales transforms as well as layout. Convert
            // viewport coordinates back into the cursor's local coordinate space.
            cursor.style.transform = `translate(calc(${cursorX / pageZoom}px - 50%), calc(${cursorY / pageZoom}px - 50%))`;
            cursorFrame = null;
        };

        document.addEventListener('pointermove', (event) => {
            if (!cursorMediaQuery.matches || event.pointerType !== 'mouse') return;

            if (event.target instanceof Element && event.target.closest(nativeCursorSelector)) {
                cursor.classList.remove('is-visible');
                return;
            }

            // Wait for a real mouse event before replacing the native cursor.
            root.classList.add('custom-cursor-enabled');
            cursorX = event.clientX;
            cursorY = event.clientY;
            cursor.classList.add('is-visible');

            if (cursorFrame === null) {
                cursorFrame = window.requestAnimationFrame(renderCursor);
            }
        }, { passive: true });

        // Hide the ring when the pointer or page is no longer active.
        document.addEventListener('mouseleave', resetCursorState);
        window.addEventListener('mouseout', (event) => {
            if (!event.relatedTarget) resetCursorState();
        });
        window.addEventListener('blur', resetCursorState);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) resetCursorState();
        });

        // Large cursor states are reserved for controls users can activate.
        document.querySelectorAll('a[href]:not(.interactive-text), button:not(:disabled), [role="button"]').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cta-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cta-hover'));
        });

        // A small cursor state remains available for deliberately subtle links.
        document.querySelectorAll('a.interactive-text[href]').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('text-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('text-hover'));
        });

        // Use an animated I-beam over text fields without sacrificing precision.
        document.querySelectorAll('input:not([type="button"]):not([type="submit"]):not([type="reset"])').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('input-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('input-hover'));
        });

        cursorMediaQuery.addEventListener('change', syncCursorCapability);
        window.addEventListener('resize', syncPageZoom, { passive: true });
        syncPageZoom();
        syncCursorCapability();
    }

    // 1. Scroll-Progress Hairline
    const scrollProgress = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
        if(scrollProgress) scrollProgress.style.transform = `scaleX(${scrollPercent})`;
    });

    // 2. Brutalist Parallax Numerals
    const parallaxNumerals = document.querySelectorAll('.parallax-numeral');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        parallaxNumerals.forEach(numeral => {
            const speed = parseFloat(numeral.getAttribute('data-speed')) || 0.2;
            const yPos = -(scrollY * speed);
            numeral.style.transform = `translateY(${yPos}px)`;
        });
    });

    // 3. Staggered Delays for Structural Elements
    // Mechanical Text reveals
    document.querySelectorAll('.mechanical-reveal').forEach(container => {
        const spans = container.querySelectorAll('span');
        spans.forEach((span, index) => {
            // Apply delay based on index
            span.style.transitionDelay = `${index * 0.08}s`;
        });
    });

    // Grid Footer Draw reveals
    document.querySelectorAll('.footer-grid').forEach(grid => {
        const cells = grid.querySelectorAll('.fg-cell');
        // Shuffle the delays for a chaotic random-draw feel or keep it linear
        cells.forEach((cell, index) => {
            cell.style.transitionDelay = `${index * 0.05}s`;
        });
    });

    // 4. Intersection Observer for Reveals
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.grid-container, .grid-footer-container, .monolith-container').forEach(container => {
        sectionObserver.observe(container);
    });

    // 4.2 Dynamic Image Switcher — Auto-cycle while visible.
    //     The 3D chassis and dot styling are main's design and unchanged. What
    //     is restored here is the control layer: the dots are real buttons, the
    //     slide change is announced, autoplay pauses on hover/focus, and it does
    //     not run at all under prefers-reduced-motion.
    const switchers = document.querySelectorAll('.image-switcher');
    const switcherIntervals = new Map();
    const reduceCarouselMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CAROUSEL_INTERVAL = 3000;

    const activeIndexOf = (container) => {
        const slides = [...container.querySelectorAll('.mockup-slide')];
        const i = slides.findIndex(s => s.classList.contains('active'));
        return i < 0 ? 0 : i;
    };

    const showSlide = (container, requestedIndex) => {
        const slides = [...container.querySelectorAll('.mockup-slide')];
        const dots = [...container.querySelectorAll('.iphone-dots .dot')];
        if (slides.length <= 1) return;

        const currentIndex = activeIndexOf(container);
        const nextIndex = (requestedIndex + slides.length) % slides.length;

        slides.forEach(s => s.classList.remove('active', 'prev'));
        if (currentIndex !== nextIndex) slides[currentIndex].classList.add('prev');
        slides[nextIndex].classList.add('active');

        dots.forEach((dot, i) => {
            const isActive = i === nextIndex;
            dot.classList.toggle('active', isActive);
            if (dot.hasAttribute('aria-current')) dot.setAttribute('aria-current', String(isActive));
        });

        const status = container.querySelector('#carousel-status');
        if (status) {
            const label = slides[nextIndex].dataset.label || `Screen ${nextIndex + 1}`;
            status.textContent = `${label}, screen ${nextIndex + 1} of ${slides.length}`;
        }
    };

    const stopCarousel = (container) => {
        if (!switcherIntervals.has(container)) return;
        clearInterval(switcherIntervals.get(container));
        switcherIntervals.delete(container);
    };

    const startCarousel = (container) => {
        if (reduceCarouselMotion || switcherIntervals.has(container)) return;
        switcherIntervals.set(container, setInterval(
            () => showSlide(container, activeIndexOf(container) + 1), CAROUSEL_INTERVAL));
    };

    // Restart only if it was already running, so a paused carousel stays paused.
    const restartCarousel = (container) => {
        if (!switcherIntervals.has(container)) return;
        stopCarousel(container);
        startCarousel(container);
    };

    const switcherObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) startCarousel(entry.target);
            else stopCarousel(entry.target);
        });
    }, { root: null, rootMargin: '0px', threshold: 0.3 });

    switchers.forEach(s => {
        switcherObserver.observe(s);

        // Dots are buttons: click and keyboard both work for free.
        s.querySelectorAll('.iphone-dots .dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(s, Number(dot.dataset.slide) || 0);
                restartCarousel(s);
            });
        });

        // Tap anywhere on the frame still advances, as before.
        const advance = () => { showSlide(s, activeIndexOf(s) + 1); restartCarousel(s); };
        s.style.cursor = 'pointer';
        s.addEventListener('click', (e) => {
            if (e.target.closest('.iphone-dots')) return;
            advance();
        });

        // Swipe, with direction — a horizontal drag now goes the way you dragged.
        let touchStartX = 0;
        let touchStartY = 0;

        s.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        s.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX - touchStartX;
            const dy = e.changedTouches[0].screenY - touchStartY;
            if (Math.abs(dx) < 30 || Math.abs(dx) <= Math.abs(dy)) return;
            showSlide(s, activeIndexOf(s) + (dx < 0 ? 1 : -1));
            restartCarousel(s);
        }, { passive: true });

        // Arrow keys on the dot group, which is what the tablist role promises.
        // Focus follows selection so the dot you land on is the slide you see.
        const dots = [...s.querySelectorAll('.iphone-dots .dot')];
        s.querySelector('.iphone-dots')?.addEventListener('keydown', (e) => {
            const current = activeIndexOf(s);
            let next = null;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = current + 1;
            else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = current - 1;
            else if (e.key === 'Home') next = 0;
            else if (e.key === 'End') next = dots.length - 1;
            if (next === null) return;

            e.preventDefault();
            const idx = (next + dots.length) % dots.length;
            showSlide(s, idx);
            dots[idx]?.focus();
            restartCarousel(s);
        });

        // Don't move the thing someone is reading or tabbing through.
        s.addEventListener('mouseenter', () => stopCarousel(s));
        s.addEventListener('mouseleave', () => startCarousel(s));
        s.addEventListener('focusin', () => stopCarousel(s));
        s.addEventListener('focusout', (e) => {
            if (!s.contains(e.relatedTarget)) startCarousel(s);
        });
    });
    // 4.5. FAQ Accordion Logic
    //
    // The buttons carried no aria-expanded, so a screen reader announced eight
    // identical-sounding buttons with no way to tell open from closed. Each
    // question also now owns a stable id, which makes individual answers
    // linkable (#faq-...) and therefore shareable.
    const faqItems = [...document.querySelectorAll('.faq-item')];

    const slugify = (text) => text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 48);

    const setFaqOpen = (item, open) => {
        item.classList.toggle('is-open', open);
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        btn?.setAttribute('aria-expanded', String(open));
        // Not `hidden`: the answer collapses via a grid-template-rows 0fr->1fr
        // transition, and display:none would kill the animation outright.
        // `inert` takes the collapsed text out of the a11y tree and tab order
        // while leaving the layout — and therefore the transition — intact.
        if (answer) answer.inert = !open;
    };

    faqItems.forEach((item) => {
        const btn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!btn || !answer) return;

        const slug = 'faq-' + slugify(btn.textContent || '');
        item.id = slug;
        answer.id = slug + '-answer';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', answer.id);
        answer.inert = true;

        btn.addEventListener('click', () => {
            const willOpen = !item.classList.contains('is-open');
            // Brutalist: instantly close others
            faqItems.forEach(other => setFaqOpen(other, false));
            setFaqOpen(item, willOpen);
            if (willOpen) {
                // Make the open question linkable without adding a history entry
                // for every toggle.
                history.replaceState(null, '', '#' + slug);
            }
        });
    });

    // 4.6 Back to top — the page has no navigation and runs ~16 screens on a
    //     phone, so this is the only way back to the CTA without a long scroll.
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        const THRESHOLD = () => window.innerHeight * 2;
        let shown = false;

        const syncBackToTop = () => {
            const should = window.scrollY > THRESHOLD();
            if (should === shown) return;
            shown = should;
            if (should) {
                backToTop.hidden = false;
                // Next frame, so the transition has a start value to animate from.
                requestAnimationFrame(() => backToTop.classList.add('is-visible'));
            } else {
                backToTop.classList.remove('is-visible');
                // Only truly hide once the fade has finished.
                setTimeout(() => { if (!shown) backToTop.hidden = true; },
                           reduceMotion ? 0 : 250);
            }
        };

        window.addEventListener('scroll', syncBackToTop, { passive: true });
        syncBackToTop();

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            // Send focus somewhere sensible instead of leaving it on a button
            // that is about to disappear.
            document.querySelector('.skip-link')?.focus();
        });
    }

    // Deep link: /#faq-how-does-garageiq-calculate-trust-scores opens that answer.
    const openFaqFromHash = () => {
        const hash = decodeURIComponent(location.hash.slice(1));
        if (!hash.startsWith('faq-')) return;
        const target = faqItems.find(i => i.id === hash);
        if (!target) return;
        faqItems.forEach(other => setFaqOpen(other, false));
        setFaqOpen(target, true);
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    };
    openFaqFromHash();
    window.addEventListener('hashchange', openFaqFromHash);

    // 5. Magnetic Hover Effect for CTAs (Preserved but brutalized)
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(magneticBtn => {
        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const pullX = x * 0.3;
            const pullY = y * 0.3;
            magneticBtn.style.transform = `translate(${pullX}px, ${pullY}px)`;
        });
        magneticBtn.addEventListener('mouseleave', () => {
            magneticBtn.style.transform = `translate(0px, 0px)`;
            magneticBtn.style.transition = `transform 0.4s cubic-bezier(0.83, 0, 0.17, 1)`;
        });
        magneticBtn.addEventListener('mouseenter', () => {
            magneticBtn.style.transition = 'none';
        });
    });

    // 6. Hero search — a real input whose placeholder cycles example queries.
    //    It used to be a <div> with a typewriter animation and no way to type
    //    into it, which meant the most inviting element on the page did nothing.
    const heroSearchForm = document.getElementById('hero-search');
    const heroSearchInput = document.getElementById('hero-search-input');
    const heroSearchNote = document.getElementById('hero-search-note');
    const queries = [
        "BMW AC repair in Al Quoz",
        "Cheap tyres in Sharjah",
        "Lexus battery replacement"
    ];
    let queryIndex = 0;
    let wordIndex = 0;
    let typewriterStopped = false;

    // reduceMotion is declared at the top of this file: under it, the hero
    // shows a complete example query instead of animating one.

    function stopTypewriter() {
        typewriterStopped = true;
        if (heroSearchInput) heroSearchInput.placeholder = '';
    }

    function streamWords() {
        if (!heroSearchInput || typewriterStopped) return;
        const currentWords = queries[queryIndex].split(' ');

        if (wordIndex < currentWords.length) {
            heroSearchInput.placeholder = currentWords.slice(0, wordIndex + 1).join(' ');
            wordIndex++;
            setTimeout(streamWords, 300);
        } else {
            setTimeout(() => {
                if (typewriterStopped) return;
                wordIndex = 0;
                queryIndex = (queryIndex + 1) % queries.length;
                heroSearchInput.placeholder = '';
                setTimeout(streamWords, 400);
            }, 3000);
        }
    }

    // ── Live parse readout ──────────────────────────────────────────────────
    // The hero's whole argument is that a messy sentence contains structure.
    // Rather than assert that, the field demonstrates it: as you type, the
    // fields the real search API returns (vehicle_brand, service_type,
    // location_text, price_band) light up underneath.
    //
    // Matched client-side against a deliberately small vocabulary. This is a
    // preview of the idea, not the actual resolver — it recognises the common
    // cases and stays quiet on everything else, which is the honest failure
    // mode for a demo standing in front of a product that has not launched.
    const readoutExamples = document.getElementById('readout-examples');
    const readoutTags = document.getElementById('readout-tags');

    const VOCAB = {
        brand: ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Nissan', 'Lexus', 'Honda',
                'Porsche', 'Range Rover', 'Land Rover', 'Jeep', 'Hyundai', 'Kia',
                'Mitsubishi', 'Chevrolet', 'Volkswagen', 'Mazda', 'Infiniti',
                'GMC', 'Tesla', 'Ford', 'Patrol', 'Land Cruiser'],
        service: ['AC repair', 'air conditioning', 'oil change', 'brakes', 'brake pads',
                  'tyres', 'tires', 'battery', 'gearbox', 'transmission', 'suspension',
                  'bodywork', 'body shop', 'engine', 'clutch', 'radiator',
                  'alignment', 'detailing', 'paint', 'service'],
        area: ['Al Quoz', 'Deira', 'Jumeirah', 'Al Barsha', 'Mussafah', 'Al Qusais',
               'Business Bay', 'Motor City', 'Sheikh Zayed Road', 'Al Ain',
               'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah',
               'Fujairah', 'Umm Al Quwain']
    };

    // Longest first, so "Land Cruiser" wins over "Land Rover"'s prefix and
    // "brake pads" over "brakes".
    Object.keys(VOCAB).forEach(k => VOCAB[k].sort((a, b) => b.length - a.length));

    const findTerm = (haystack, list) =>
        list.find(term => haystack.includes(term.toLowerCase())) || null;

    const parseQuery = (raw) => {
        const q = raw.toLowerCase();
        const found = [];

        const brand = findTerm(q, VOCAB.brand);
        if (brand) found.push(['brand', brand]);

        const service = findTerm(q, VOCAB.service);
        if (service) {
            // Present the two spellings and the long form under one label.
            const label = /tire/.test(service) ? 'Tyres'
                        : /air conditioning/.test(service) ? 'AC repair'
                        : service;
            found.push(['service', label.charAt(0).toUpperCase() + label.slice(1)]);
        }

        const area = findTerm(q, VOCAB.area);
        if (area) found.push(['area', area]);

        // The API calls this price_band, so the label is "price" and the value
        // is the band — "BUDGET Budget" read as a stutter.
        const capped = q.match(/(?:under|below|max|less than)\s*(\d{2,5})/);
        if (capped) {
            found.push(['price', `Under ${capped[1]} AED`]);
        } else if (/\b(cheap|budget|affordable|inexpensive)\b/.test(q)) {
            found.push(['price', 'Budget']);
        }
        return found;
    };

    const renderReadout = (value) => {
        if (!readoutTags || !readoutExamples) return;
        const tags = parseQuery(value.trim());

        if (!value.trim()) {
            readoutTags.hidden = true;
            readoutTags.replaceChildren();
            readoutExamples.hidden = false;
            return;
        }

        readoutExamples.hidden = true;

        // Rebuild only when the result actually changed, so tags do not
        // re-animate on every keystroke.
        const signature = tags.map(t => t.join(':')).join('|');
        if (readoutTags.dataset.signature === signature) return;
        readoutTags.dataset.signature = signature;

        readoutTags.replaceChildren();
        readoutTags.hidden = tags.length === 0;

        tags.forEach(([label, val], i) => {
            const li = document.createElement('li');
            li.className = 'readout-tag';
            if (!reduceMotion) li.style.animationDelay = `${i * 45}ms`;

            const l = document.createElement('span');
            l.className = 'readout-tag-label';
            l.textContent = label;

            const v = document.createElement('span');
            v.className = 'readout-tag-value';
            v.textContent = val;   // textContent, never innerHTML — this is user input

            li.append(l, v);
            readoutTags.append(li);
        });
    };

    readoutExamples?.querySelectorAll('.readout-example').forEach(btn => {
        btn.addEventListener('click', () => {
            heroSearchInput.value = btn.textContent.trim();
            stopTypewriter();
            heroSearchForm.classList.add('has-input');
            renderReadout(heroSearchInput.value);
            heroSearchInput.focus();
            trackEvent('hero_example_used');
        });
    });

    if (heroSearchInput) {
        if (reduceMotion) {
            heroSearchInput.placeholder = queries[0];
        } else {
            setTimeout(streamWords, 1200);
        }

        // Once the visitor engages, stop cycling — a moving placeholder under a
        // caret is disorienting, and their own text is what matters now.
        heroSearchInput.addEventListener('focus', stopTypewriter, { once: true });
        heroSearchInput.addEventListener('input', () => {
            stopTypewriter();
            heroSearchForm.classList.toggle('has-input', heroSearchInput.value.trim() !== '');
            renderReadout(heroSearchInput.value);
        });
    }

    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = heroSearchInput.value.trim();

            trackEvent('hero_search_submit', query ? { has_query: 'yes' } : { has_query: 'no' });

            // Search itself isn't live yet. Rather than pretend, carry the query
            // down to the waitlist so it is captured with the signup — that is
            // the most useful thing we can do with real intent right now.
            if (query) {
                pendingHeroQuery = query;
                if (heroSearchNote) {
                    heroSearchNote.textContent =
                        `We'll look for "${query}" when we launch. Leave your email and we'll tell you what we find.`;
                    heroSearchNote.classList.add('is-confirmed');
                }
            }

            const waitlist = document.getElementById('waitlist');
            if (waitlist) {
                waitlist.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
                setTimeout(() => document.getElementById('waitlist-email')?.focus(),
                           reduceMotion ? 0 : 700);
            }
        });
    }

    // 7. Live Data Strip Counters
    const garageCountEl = document.getElementById('garage-count');
    const reviewCountEl = document.getElementById('review-count');
    
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Use brutalist custom ease approximation for counters? EaseOutCubic is fine here.
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            const currentVal = Math.floor(easeOutCubic * (end - start) + start);
            obj.innerHTML = currentVal.toLocaleString();
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Live-verified against the GarageIQ DB on 2026-08-13 (docs/36 §1.1):
    //   8,083   = garages a user can actually find (is_active), not 8,374 total
    //   505,453 = review rows carrying real written text, of 538,745 stored
    //
    // Previously 8,396 and 55,214. The review figure was wrong by a factor of
    // ten and undersold the single most impressive asset in the product. These
    // counters are animated in JS, so editing index.html alone leaves the page
    // still rendering the old numbers — change them here.
    setTimeout(() => {
        if(garageCountEl) animateValue(garageCountEl, 0, 8083, 2000);
        if(reviewCountEl) animateValue(reviewCountEl, 0, 505453, 2500);
    }, 800);

    // 8. Fixed-Perspective Neural Pulse — 3D network inside UAE silhouette
    //
    // three.js is 118 KB and was measured at 1587 ms on Slow 4G — 44% of the
    // page's bytes — fetched immediately at load for a decorative map that sits
    // about four screens down and that most visitors never scroll to. Together
    // with uae-paths.js (14 KB, used only here) it is now fetched on approach
    // instead, so it costs nothing on first paint.
    //
    // The body below is unchanged; it simply runs once the library has arrived.
    const canvas = document.getElementById('pixel-map');

    const loadScriptOnce = (src) => new Promise((resolve, reject) => {
        if (document.querySelector(`script[data-lazy="${src}"]`)) return resolve();
        const el = document.createElement('script');
        el.src = src;
        el.async = true;
        el.dataset.lazy = src;
        el.onload = () => resolve();
        el.onerror = () => reject(new Error(`failed to load ${src}`));
        document.head.appendChild(el);
    });

    function initPixelMap() {
    if (canvas && typeof THREE !== 'undefined' && typeof UAE_PATHS !== 'undefined') {
        const container = canvas.parentElement;
        
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const scene = new THREE.Scene();
        // Mobile needs a long camera distance to fit the wide UAE silhouette.
        // Keep the far plane beyond that distance so the map is not clipped away.
        const camera = new THREE.PerspectiveCamera(45, 1, 1, 5000);

        const group = new THREE.Group();
        // Fixed 15-degree tilt for depth perception, never changes
        group.rotation.x = -0.12;
        scene.add(group);

        const canvasLabels = document.querySelectorAll('.canvas-label');
        const labelAnchors = Array.from(canvasLabels).map(label => ({
            label,
            point: new THREE.Vector3(
                parseFloat(label.dataset.mapX),
                parseFloat(label.dataset.mapY),
                2
            )
        }));
        
        // Define virtual coordinate system for the map (always 800x500)
        const VIRTUAL_W = 800;
        const VIRTUAL_H = 500;
        let mapBounds = null;
        
        function updateMapLayout() {
            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || 500;
            const isMobile = window.innerWidth < 768;
            
            renderer.setSize(width, height);
            
            const aspect = width / height;
            camera.aspect = aspect;
            
            // On mobile, fit the actual UAE silhouette instead of the larger virtual
            // canvas around it. This keeps the map readable without cropping it.
            if (isMobile && mapBounds) {
                const centerX = (mapBounds.minX + mapBounds.maxX) / 2;
                const centerY = (mapBounds.minY + mapBounds.maxY) / 2;
                const mapWidth = mapBounds.maxX - mapBounds.minX;
                const mapHeight = mapBounds.maxY - mapBounds.minY;
                const verticalFov = THREE.MathUtils.degToRad(camera.fov);
                const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * aspect);
                const heightDistance = (mapHeight / 2) / Math.tan(verticalFov / 2);
                const widthDistance = (mapWidth / 2) / Math.tan(horizontalFov / 2);
                // Leave a little horizontal room for the labels that sit beside
                // the small northern emirates.
                const distance = Math.max(heightDistance, widthDistance) * 1.18;

                camera.position.set(centerX, centerY + 50, distance);
                camera.lookAt(centerX, centerY, 0);
            } else {
                camera.position.set(0, 80, aspect < 1.6 ? 580 * (1.6 / aspect) : 580);
                camera.lookAt(0, 0, 0);
            }
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld(true);
            group.updateMatrixWorld(true);

            labelAnchors.forEach(({ label, point }) => {
                const projected = point.clone()
                    .applyMatrix4(group.matrixWorld)
                    .project(camera);
                label.style.left = `${(projected.x * 0.5 + 0.5) * 100}%`;
                label.style.top = `${(-projected.y * 0.5 + 0.5) * 100}%`;
            });
        }
        
        window.addEventListener('resize', updateMapLayout);

        function monolithEase(t) {
            if (t <= 0) return 0;
            if (t >= 1) return 1;
            return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        }

        // --- UAE shape from real SVG paths (viewBox: 0 0 760 613) ---
        const svgW = 760, svgH = 613;
        
        // Lock point generation scale to the virtual 800x500 canvas
        const scaleRatio = Math.min(VIRTUAL_W / svgW, VIRTUAL_H / svgH) * 0.95;
        
        // Explicitly center and shift for desktop alignment with HTML labels
        const offsetX = ((VIRTUAL_W - svgW * scaleRatio) / 2) - 40; 
        const offsetY = ((VIRTUAL_H - svgH * scaleRatio) / 2);

        const hiddenCanvas = document.createElement('canvas');
        hiddenCanvas.width = VIRTUAL_W;
        hiddenCanvas.height = VIRTUAL_H;
        const hCtx = hiddenCanvas.getContext('2d');
        
        const emiratePaths = [];
        UAE_PATHS.forEach(pathStr => {
            const matrix = new DOMMatrix();
            matrix.translateSelf(offsetX, offsetY);
            matrix.scaleSelf(scaleRatio, scaleRatio);
            const transformed = new Path2D();
            transformed.addPath(new Path2D(pathStr), matrix);
            emiratePaths.push(transformed);
        });

        // Find a real geographic anchor inside every emirate path. The SVG paths
        // can be irregular or split into multiple pieces, so use their visual
        // centroid and snap it back to the nearest point that is actually inside.
        function getPathMetrics(path) {
            const samples = [];
            let minX = VIRTUAL_W;
            let minY = VIRTUAL_H;
            let maxX = 0;
            let maxY = 0;
            let sumX = 0;
            let sumY = 0;

            for (let y = 1; y < VIRTUAL_H; y += 2) {
                for (let x = 1; x < VIRTUAL_W; x += 2) {
                    if (!hCtx.isPointInPath(path, x, y)) continue;
                    samples.push({ x, y });
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                    sumX += x;
                    sumY += y;
                }
            }

            if (samples.length === 0) return null;

            const centroidX = sumX / samples.length;
            const centroidY = sumY / samples.length;
            let anchor = samples[0];
            let nearestDistance = Infinity;

            samples.forEach(sample => {
                const distance = Math.hypot(sample.x - centroidX, sample.y - centroidY);
                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    anchor = sample;
                }
            });

            return { minX, minY, maxX, maxY, anchor };
        }

        const pathMetrics = emiratePaths.map(getPathMetrics);
        const validMetrics = pathMetrics.filter(Boolean);

        if (validMetrics.length) {
            mapBounds = {
                minX: Math.min(...validMetrics.map(metric => metric.minX)) - (VIRTUAL_W / 2),
                maxX: Math.max(...validMetrics.map(metric => metric.maxX)) - (VIRTUAL_W / 2),
                minY: (VIRTUAL_H / 2) - Math.max(...validMetrics.map(metric => metric.maxY)),
                maxY: (VIRTUAL_H / 2) - Math.min(...validMetrics.map(metric => metric.minY))
            };
        }

        labelAnchors.forEach(({ label, point }) => {
            const pathIndex = parseInt(label.dataset.target, 10);
            const metric = pathMetrics[pathIndex];
            if (!metric) return;

            const mapX = metric.anchor.x - (VIRTUAL_W / 2);
            const mapY = (VIRTUAL_H / 2) - metric.anchor.y;
            point.set(mapX, mapY, 2);
            label.dataset.mapX = mapX.toFixed(1);
            label.dataset.mapY = mapY.toFixed(1);
        });

        // The first layout now uses measured silhouette bounds and anchors.
        updateMapLayout();
        
        hCtx.fillStyle = '#000';
        emiratePaths.forEach(p => { hCtx.fill(p); });
        
        // UAE outline texture
        const outlineCanvas = document.createElement('canvas');
        outlineCanvas.width = 800;
        outlineCanvas.height = 500;
        const oCtx = outlineCanvas.getContext('2d');
        oCtx.lineWidth = 2;
        oCtx.strokeStyle = 'rgba(255, 255, 255, 0.62)';
        oCtx.lineJoin = 'round';
        emiratePaths.forEach(p => { oCtx.stroke(p); });

        const outlineTexture = new THREE.CanvasTexture(outlineCanvas);
        const outlineMesh = new THREE.Mesh(
            new THREE.PlaneGeometry(800, 500),
            new THREE.MeshBasicMaterial({ map: outlineTexture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
        );
        outlineMesh.position.z = 0;
        group.add(outlineMesh);

        // --- Node generation inside UAE shape ---
        const nodes = [];
        const gridSize = 15;
        const positions = [];
        const nodeAlphas = [];   // per-node alpha for pulse glow
        const nodeScales = [];   // per-node scale for pulse glow
        
        for (let x = -400; x <= 400; x += gridSize) {
            for (let y = -250; y <= 250; y += gridSize) {
                let canvasX = x + 400;
                let canvasY = -y + 250;
                let inside = false;
                let matchedPath = -1;
                for (let p = 0; p < emiratePaths.length; p++) {
                    if (hCtx.isPointInPath(emiratePaths[p], canvasX, canvasY)) { 
                        inside = true; 
                        matchedPath = p;
                        break; 
                    }
                }
                if (inside) {
                    for (let z = -50; z <= 50; z += gridSize) {
                        let densityThreshold = 0.3;
                        // Increase density for RAK (3), UAQ (4), Fujairah (5), and Ajman (6)
                        if ([3, 4, 5, 6].includes(matchedPath)) {
                            densityThreshold = 0.9;
                        }
                        if (Math.random() < densityThreshold) {
                            nodes.push({
                                x, y, z,
                                index: nodes.length,
                                pathIndex: matchedPath,
                                popped: false,
                                popTime: 0,
                                glowUntil: 0     // timestamp when glow expires
                            });
                            positions.push(x, y, z);
                            nodeAlphas.push(0.78); // default semi-transparent
                            nodeScales.push(0);   // starts at 0, scanner pops them
                        }
                    }
                }
            }
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aAlpha', new THREE.Float32BufferAttribute(nodeAlphas, 1));
        geometry.setAttribute('aScale', new THREE.Float32BufferAttribute(nodeScales, 1));
        
        const material = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float aAlpha;
                attribute float aScale;
                varying float vAlpha;
                void main() {
                    vAlpha = aAlpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 4.5 * aScale * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vAlpha;
                void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha); }
            `,
            transparent: true,
            depthWrite: false
        });

        const pointCloud = new THREE.Points(geometry, material);
        group.add(pointCloud);

        // --- Network connections (static lines, full opacity 0.15 by default) ---
        const lineEdges = [];
        // Build adjacency list for pulse routing
        const adjacency = new Map(); // nodeIndex -> [{ edgeIdx, neighborIdx }]
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                // ONLY connect if they are in the same emirate cluster
                if (nodes[i].pathIndex === nodes[j].pathIndex) {
                    let d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y, nodes[i].z - nodes[j].z);
                    if (d > 0 && d <= gridSize * 1.8 && Math.random() < 0.4) {
                        const edgeIdx = lineEdges.length;
                        lineEdges.push({
                            i: nodes[i].index, j: nodes[j].index,
                            drawDelay: Math.random() * 500,
                            pulseProgress: -1,
                            pulseDir: 1
                        });
                        if (!adjacency.has(i)) adjacency.set(i, []);
                        if (!adjacency.has(j)) adjacency.set(j, []);
                        adjacency.get(i).push({ edgeIdx, neighborIdx: j });
                        adjacency.get(j).push({ edgeIdx, neighborIdx: i });
                    }
                }
            }
        }
        
        // Static line geometry — all lines fully drawn, low opacity
        const linePositions = [];
        lineEdges.forEach(edge => {
            let n1 = nodes[edge.i], n2 = nodes[edge.j];
            linePositions.push(n1.x, n1.y, n1.z, n2.x, n2.y, n2.z);
        });
        const linesGeom = new THREE.BufferGeometry();
        linesGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false });
        const lineMesh = new THREE.LineSegments(linesGeom, lineMat);
        group.add(lineMesh);

        // --- Pulse particles (travel along edges) ---
        const MAX_PULSES = 30;
        const pulseGeo = new THREE.BufferGeometry();
        const pulsePositions = new Float32Array(MAX_PULSES * 3);
        const pulseAlphas = new Float32Array(MAX_PULSES);
        pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePositions, 3));
        pulseGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pulseAlphas, 1));
        
        const pulseMat = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float aAlpha;
                varying float vAlpha;
                void main() {
                    vAlpha = aAlpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = 7.0 * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying float vAlpha;
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    float fade = 1.0 - smoothstep(0.0, 0.5, dist);
                    gl_FragColor = vec4(1.0, 1.0, 1.0, vAlpha * fade);
                }
            `,
            transparent: true,
            depthWrite: false
        });
        const pulseCloud = new THREE.Points(pulseGeo, pulseMat);
        group.add(pulseCloud);

        // Active pulses array
        const activePulses = [];
        
        function spawnPulse() {
            if (activePulses.length >= MAX_PULSES || lineEdges.length === 0) return;
            const edgeIdx = Math.floor(Math.random() * lineEdges.length);
            const edge = lineEdges[edgeIdx];
            activePulses.push({
                edgeIdx: edgeIdx,
                fromIdx: edge.i,
                toIdx: edge.j,
                progress: 0,       // 0 to 1
                speed: 0.8 + Math.random() * 1.2  // varied speeds
            });
        }

        // --- Scan plane for initial reveal ---
        const scanPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(800, 800),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
        );
        scanPlane.rotation.x = Math.PI / 2;
        scanPlane.position.y = 200;
        group.add(scanPlane);

        let mapVisible = false;
        let startTime = null;
        let introComplete = false;
        let lastPulseSpawn = 0;
        
        function renderMap(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            
            if (!mapVisible) {
                requestAnimationFrame(renderMap);
                return;
            }

            // --- Phase 1: Initial scanner reveal (0–2500ms) ---
            let scanProgress = Math.min(elapsed / 2500, 1);
            let curY = 200 - 400 * monolithEase(scanProgress);
            
            if (scanProgress < 1) {
                scanPlane.position.y = curY;
                scanPlane.visible = true;
            } else {
                scanPlane.visible = false;
            }

            // Pop nodes as scanner passes
            const scalesArr = geometry.attributes.aScale.array;
            const alphasArr = geometry.attributes.aAlpha.array;
            
            nodes.forEach((node, idx) => {
                if (curY <= node.y && !node.popped) {
                    node.popped = true;
                    node.popTime = elapsed;
                }

                if (node.popped) {
                    let popProgress = Math.min((elapsed - node.popTime) / 200, 1);
                    let glowing = elapsed < node.glowUntil;
                    
                    if (hoveredPathIndex !== -1) {
                        // Hover mode active
                        if (node.pathIndex === hoveredPathIndex) {
                            scalesArr[idx] = 1.2;
                            alphasArr[idx] = 1.0;
                        } else {
                            scalesArr[idx] = popProgress * 0.8;
                            alphasArr[idx] = 0.15; // Dim non-hovered nodes
                        }
                    } else if (glowing) {
                        let glowFade = 1.0 - Math.min((elapsed - (node.glowUntil - 300)) / 300, 1);
                        scalesArr[idx] = 1.0 + 0.5 * glowFade;  // scale up to 1.5
                        alphasArr[idx] = 0.6 + 0.4 * glowFade;  // alpha up to 1.0
                    } else {
                        scalesArr[idx] = popProgress;
                        alphasArr[idx] = 0.78;  // default semi-transparent
                    }
                }
            });
            geometry.attributes.aScale.needsUpdate = true;
            geometry.attributes.aAlpha.needsUpdate = true;

            // --- Phase 2: Draw lines (3500ms+) ---
            if (elapsed > 3500 && !introComplete) {
                // Instantly reveal all lines
                lineMesh.visible = true;
                introComplete = true;
            }
            if (elapsed <= 3500) {
                lineMesh.visible = false;
            }

            // --- Phase 3: Neural Pulses (after intro) ---
            if (introComplete) {
                // Spawn new pulses at random intervals
                if (elapsed - lastPulseSpawn > 80 + Math.random() * 150) {
                    spawnPulse();
                    lastPulseSpawn = elapsed;
                }

                // Update pulse positions
                const pPos = pulseGeo.attributes.position.array;
                const pAlp = pulseGeo.attributes.aAlpha.array;
                
                // Clear all pulse slots
                for (let k = 0; k < MAX_PULSES; k++) {
                    pAlp[k] = 0;
                }

                for (let p = activePulses.length - 1; p >= 0; p--) {
                    const pulse = activePulses[p];
                    pulse.progress += pulse.speed * 0.016; // ~60fps
                    
                    if (pulse.progress >= 1) {
                        // Pulse arrived — flash the destination node
                        const destNode = nodes[pulse.toIdx];
                        if (destNode) destNode.glowUntil = elapsed + 300;
                        
                        // Chain: pick a random adjacent edge to continue
                        const neighbors = adjacency.get(pulse.toIdx);
                        if (neighbors && neighbors.length > 0 && Math.random() < 0.5) {
                            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                            pulse.edgeIdx = next.edgeIdx;
                            pulse.fromIdx = pulse.toIdx;
                            pulse.toIdx = next.neighborIdx;
                            pulse.progress = 0;
                            pulse.speed = 0.8 + Math.random() * 1.2;
                        } else {
                            activePulses.splice(p, 1);
                            continue;
                        }
                    }
                    
                    if (p < MAX_PULSES) {
                        const n1 = nodes[pulse.fromIdx];
                        const n2 = nodes[pulse.toIdx];
                        if (n1 && n2) {
                            const t = pulse.progress;
                            pPos[p * 3]     = n1.x + (n2.x - n1.x) * t;
                            pPos[p * 3 + 1] = n1.y + (n2.y - n1.y) * t;
                            pPos[p * 3 + 2] = n1.z + (n2.z - n1.z) * t;
                            pAlp[p] = 1.0;
                        }
                    }
                }
                
                pulseGeo.attributes.position.needsUpdate = true;
                pulseGeo.attributes.aAlpha.needsUpdate = true;
            }

            // NO rotation — camera is permanently frozen
            renderer.render(scene, camera);
            requestAnimationFrame(renderMap);
        }
        
        requestAnimationFrame(renderMap);

        let hoveredPathIndex = -1;
        const hudRows = document.querySelectorAll('.hud-row');
        hudRows.forEach((row) => {
            const pIdx = parseInt(row.getAttribute('data-emirate-idx'), 10);
            row.addEventListener('mouseenter', () => { 
                hoveredPathIndex = pIdx; 
                canvasLabels.forEach(l => {
                    if (parseInt(l.getAttribute('data-target'), 10) === pIdx) l.classList.add('is-active');
                });
            });
            row.addEventListener('mouseleave', () => { 
                hoveredPathIndex = -1; 
                canvasLabels.forEach(l => l.classList.remove('is-active'));
            });
        });
        
        let labelsAnimated = false;
        function animateLabels() {
            if (labelsAnimated) return;
            labelsAnimated = true;
            
            const counts = document.querySelectorAll('.e-count');
            
            const countUp = (el) => {
                const target = parseInt(el.getAttribute('data-val'), 10);
                const duration = 500;
                const start = performance.now();
                const step = (timestamp) => {
                    const progress = Math.min((timestamp - start) / duration, 1);
                    const current = Math.floor(target * monolithEase(progress));
                    el.textContent = current.toLocaleString();
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        el.textContent = target.toLocaleString();
                    }
                };
                requestAnimationFrame(step);
            };

            // Trigger count-up staggered with the row slide-ins
            setTimeout(() => {
                counts.forEach((c, idx) => setTimeout(() => countUp(c), idx * 50));
            }, 1600);
        }

        const mapObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                mapVisible = true;
                startTime = performance.now();
                animateLabels();
                mapObserver.disconnect();
            }
        }, { threshold: 0.2 });
        mapObserver.observe(canvas);
    }
    }

    // Fetch the map's libraries when the section is within ~600px of the
    // viewport, so they are usually there by the time it scrolls in. If either
    // request fails the guard inside initPixelMap simply declines to run and
    // the rest of the page is unaffected — the canvas is decorative.
    if (canvas) {
        const mapSection = document.getElementById('intelligence-network') || canvas;
        const mapLoader = new IntersectionObserver((entries) => {
            if (!entries.some((e) => e.isIntersecting)) return;
            mapLoader.disconnect();
            Promise.all([
                loadScriptOnce('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'),
                loadScriptOnce('uae-paths.js'),
            ])
                .then(initPixelMap)
                .catch((err) => console.warn('[map] skipped:', err.message));
        }, { rootMargin: '600px 0px' });
        mapLoader.observe(mapSection);
    }

    // 9. Supabase Waitlist Integration
    // Credentials are declared once at the top, alongside the funnel sink.
    // (SUPABASE_URL / SUPABASE_ANON_KEY are declared at the top of this file and
    // used directly by both the funnel sink and the waitlist insert.)
    
    const waitlistForm = document.querySelector('.waitlist-form');

    if (waitlistForm) {
        const emailInput = waitlistForm.querySelector('input[type="email"]');
        const emirateSelect = waitlistForm.querySelector('select[name="emirate"]');
        const btn = waitlistForm.querySelector('button[type="submit"]');
        const errorEl = waitlistForm.querySelector('.waitlist-error');

        // Fire once when the signup section actually comes into view.
        const waitlistSection = document.getElementById('waitlist');
        if (waitlistSection) {
            const viewObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        trackEvent('waitlist_view');
                        obs.disconnect();
                    }
                });
            }, { threshold: 0.4 });
            viewObserver.observe(waitlistSection);
        }

        emailInput?.addEventListener('focus', () => trackEvent('waitlist_focus'), { once: true });

        // Remember the emirate across visits. Small thing, but this is the one
        // field a returning visitor would otherwise re-pick every time.
        try {
            const saved = localStorage.getItem('giq_emirate');
            if (saved && emirateSelect && [...emirateSelect.options].some(o => o.value === saved)) {
                emirateSelect.value = saved;
            }
            emirateSelect?.addEventListener('change', () => {
                try { localStorage.setItem('giq_emirate', emirateSelect.value); } catch (_) {}
            });
        } catch (_) {
            /* private mode: not worth a fallback */
        }

        const showError = (message) => {
            if (!errorEl) return;
            errorEl.textContent = message;
            errorEl.hidden = false;
        };

        const renderSuccess = () => {
            waitlistForm.classList.add('is-success');
            waitlistForm.innerHTML = `
                <div class="waitlist-success" role="status" aria-live="polite">
                    <div class="waitlist-success-inner">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" style="margin: 0 auto 12px auto; display: block;" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <h3 class="mt-2" style="font-size: 1.5rem;">You're on the list!</h3>
                        <p class="waitlist-microcopy mt-2">We'll notify you at launch.</p>
                    </div>
                </div>
            `;
        };

        waitlistForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = (emailInput?.value || '').trim();
            const persona = waitlistForm.querySelector('input[name="persona"]:checked')?.value || null;
            const emirate = emirateSelect?.value || null;

            if (errorEl) errorEl.hidden = true;

            // novalidate on the form, so validate here to control the message.
            if (!email || !emailInput.checkValidity()) {
                showError('That email address does not look right. Mind checking it?');
                emailInput?.focus();
                return;
            }

            trackEvent('waitlist_submit', { persona: persona || 'unknown' });

            const restore = () => {
                btn.textContent = 'Get Early Access';
                btn.style.opacity = '';
                btn.style.pointerEvents = '';
            };

            btn.textContent = 'Joining...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            // If the Supabase CDN script was blocked, the old code attached no
            // handler at all and the form did a native GET, putting the address
            const row = { email };
            if (persona) row.persona = persona;
            if (emirate) row.emirate = emirate;
            if (pendingHeroQuery) row.first_query = pendingHeroQuery.slice(0, 200);

            // Plain fetch against PostgREST rather than the Supabase SDK. The SDK
            // was 54 KB and a measured 1044 ms on Slow 4G to perform this one
            // INSERT — 20% of the page's bytes for a single request. trackEvent()
            // above already talks to /rest/v1 this way; this is the same shape.
            let res;
            try {
                res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify(row)
                });
            } catch (networkError) {
                // Previously this branch caught "the SDK script was blocked". The
                // failure it really guards against is the request not completing,
                // which is what this now detects directly.
                restore();
                showError("We couldn't reach the signup service. Please try again in a moment.");
                trackEvent('waitlist_error', { code: 'network_error' });
                console.error('[waitlist] request failed:', networkError);
                return;
            }

            // 409 is PostgREST's unique violation (Postgres 23505) — already signed
            // up, which is a success from the visitor's point of view. Anything
            // else that is not 2xx is a real failure and must be surfaced.
            if (!res.ok && res.status !== 409) {
                restore();
                let code = String(res.status);
                try {
                    const body = await res.json();
                    if (body && body.code) code = body.code;
                    console.error('[waitlist] insert failed:', res.status, body);
                } catch (_) {
                    console.error('[waitlist] insert failed:', res.status);
                }
                showError("That didn't go through. Please try again.");
                trackEvent('waitlist_error', { code });
                return;
            }

            trackEvent('waitlist_success', {
                persona: persona || 'unknown',
                emirate: emirate || 'unspecified',
                from_search: pendingHeroQuery ? 'yes' : 'no'
            });
            renderSuccess();
        });
    }

    // 10. Embedded Terms of Use dialog
    const termsDialog = document.getElementById('terms-of-use');
    const termsOpenButton = document.querySelector('[data-open-terms]');
    const termsCloseButton = document.querySelector('[data-close-terms]');

    if (termsDialog && termsOpenButton && termsCloseButton) {
        const closeTerms = () => {
            if (termsDialog.open) termsDialog.close();
        };

        termsOpenButton.addEventListener('click', (event) => {
            event.preventDefault();
            termsDialog.showModal();
            document.documentElement.classList.add('legal-dialog-open');
        });

        termsCloseButton.addEventListener('click', closeTerms);
        termsDialog.addEventListener('click', (event) => {
            if (event.target === termsDialog) closeTerms();
        });
        termsDialog.addEventListener('close', () => {
            document.documentElement.classList.remove('legal-dialog-open');
        });
    }
});
