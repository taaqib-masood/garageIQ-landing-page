document.addEventListener('DOMContentLoaded', () => {

    // 0. The "Ink Ring" Custom Cursor
    const cursor = document.getElementById('brutalist-cursor');
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);
    
    if (cursor) {
        if (isTouch) {
            cursor.style.display = 'none';
        } else {
            // Track mouse position globally
            document.addEventListener('mousemove', (e) => {
                cursor.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
            });

        // Hover states for CTAs
        document.querySelectorAll('.interactive-cta').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('cta-hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('cta-hover'));
        });

            // Hover states for text/links
            document.querySelectorAll('.interactive-text, h1, h2, h3, p').forEach(el => {
                el.addEventListener('mouseenter', () => cursor.classList.add('text-hover'));
                el.addEventListener('mouseleave', () => cursor.classList.remove('text-hover'));
            });
        }
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

    document.querySelectorAll('.grid-container, .grid-footer-container').forEach(container => {
        sectionObserver.observe(container);
    });

    // 4.5. FAQ Accordion Logic
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(q => {
        q.addEventListener('click', () => {
            const item = q.closest('.faq-item');
            const isOpen = item.classList.contains('is-open');
            
            // Brutalist: instantly close others
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('is-open'));
            
            if (!isOpen) {
                item.classList.add('is-open');
            }
        });
    });

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

    // 6. CLI-Style Hero Search Typewriter (Word by Word)
    const typewriterText = document.getElementById('typewriter-text');
    const queries = [
        "BMW AC repair in Al Quoz",
        "Cheap tyres in Sharjah",
        "Lexus battery replacement"
    ];
    let queryIndex = 0;
    let wordIndex = 0;
    
    function streamWords() {
        if (!typewriterText) return;
        const currentWords = queries[queryIndex].split(' ');
        
        if (wordIndex < currentWords.length) {
            // Append word
            const wordSpan = document.createElement('span');
            wordSpan.textContent = (wordIndex === 0 ? '' : ' ') + currentWords[wordIndex];
            wordSpan.style.opacity = '0';
            typewriterText.appendChild(wordSpan);
            
            // Hard cut opacity
            setTimeout(() => {
                wordSpan.style.opacity = '1';
            }, 50); 
            
            wordIndex++;
            setTimeout(streamWords, 300); // Sharp word streaming
        } else {
            // End of phrase, wait then clear
            setTimeout(() => {
                typewriterText.innerHTML = '';
                wordIndex = 0;
                queryIndex = (queryIndex + 1) % queries.length;
                setTimeout(streamWords, 400); 
            }, 3000); 
        }
    }
    
    setTimeout(streamWords, 1200);

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

    setTimeout(() => {
        if(garageCountEl) animateValue(garageCountEl, 0, 8396, 2000);
        if(reviewCountEl) animateValue(reviewCountEl, 0, 55214, 2500);
    }, 800);

    // 8. Fixed-Perspective Neural Pulse — 3D network inside UAE silhouette
    const canvas = document.getElementById('pixel-map');
    if (canvas && typeof THREE !== 'undefined' && typeof UAE_PATHS !== 'undefined') {
        const container = canvas.parentElement;
        
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
        
        // Define virtual coordinate system for the map (always 800x500)
        const VIRTUAL_W = 800;
        const VIRTUAL_H = 500;
        
        function updateMapLayout() {
            const width = container.clientWidth || window.innerWidth;
            const height = container.clientHeight || 500;
            const isMobile = window.innerWidth <= 768;
            
            renderer.setSize(width, height);
            
            const aspect = width / height;
            camera.aspect = aspect;
            
            // If mobile, pull camera way back so the wide map fits. If desktop, pull back slightly if narrow.
            if (isMobile) {
                camera.position.set(0, 80, 580 * (1.8 / aspect));
            } else {
                camera.position.set(0, 80, aspect < 1.6 ? 580 * (1.6 / aspect) : 580);
            }
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }
        
        // Initial layout
        updateMapLayout();
        window.addEventListener('resize', updateMapLayout);

        const group = new THREE.Group();
        // Fixed 15-degree tilt for depth perception, never changes
        group.rotation.x = -0.12;
        scene.add(group);

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
        
        hCtx.fillStyle = '#000';
        emiratePaths.forEach(p => { hCtx.fill(p); });
        
        // UAE outline texture
        const outlineCanvas = document.createElement('canvas');
        outlineCanvas.width = 800;
        outlineCanvas.height = 500;
        const oCtx = outlineCanvas.getContext('2d');
        oCtx.lineWidth = 1.5;
        oCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
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
                            nodeAlphas.push(0.6); // default semi-transparent
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
                    gl_PointSize = 3.0 * aScale * (300.0 / -mvPosition.z);
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
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15, depthWrite: false });
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
                    gl_PointSize = 5.0 * (300.0 / -mvPosition.z);
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
                        alphasArr[idx] = 0.6;  // default semi-transparent
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
        const canvasLabels = document.querySelectorAll('.canvas-label');
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

    // 9. Supabase Waitlist Integration
    const supabaseUrl = 'https://zbqtaiozkhfscwynddjd.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpicXRhaW96a2hmc2N3eW5kZGpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2ODkzNjcsImV4cCI6MjA5NDI2NTM2N30.alfx8gruhDhJr1L_zwNt0xrzAaxJdkcgIFnyZdtofa0';
    
    if (typeof supabase !== 'undefined') {
        const db = supabase.createClient(supabaseUrl, supabaseAnonKey);
        const waitlistForm = document.querySelector('.waitlist-form');
        
        if (waitlistForm) {
            waitlistForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const emailInput = waitlistForm.querySelector('input[type="email"]');
                const btn = waitlistForm.querySelector('button[type="submit"]');
                const email = emailInput.value.trim();
                
                if (!email) return;
                
                // Loading state
                btn.textContent = 'Joining...';
                btn.style.opacity = '0.7';
                btn.style.pointerEvents = 'none';
                
                // Insert into Supabase (silently ignore errors or duplicates for a smooth UX)
                const { error } = await db.from('waitlist').insert([{ email }]);
                
                // Success Morph (Mechanical Slide-up)
                waitlistForm.innerHTML = `
                    <div class="mechanical-reveal" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="transform: translateY(100%); animation: slideUpBrutal 0.8s cubic-bezier(0.83, 0, 0.17, 1) forwards;">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" style="margin: 0 auto 12px auto; display: block;">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                            <h3 class="mt-2" style="font-size: 1.5rem;">You're on the list.</h3>
                            <p class="waitlist-microcopy mt-2">We'll notify you at launch.</p>
                        </div>
                    </div>
                `;
            });
        }
    }
});
