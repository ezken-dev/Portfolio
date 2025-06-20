// --- GLOBAL STATE & CACHED ELEMENTS ---
let mainContentWrapper = null;
let cvDatapadWrapper = null;
let transitionContainer = null;
let transitionCanvas = null;
let transitionCtx, transitionStars = [], transitionAnimationId;
let transitionSpeed = 0.2;

// --- SMOOTH SCROLLING VARIABLES ---
let currentScroll = 0;
let targetScroll = 0;
let ease = 0.075; // The lower, the smoother
let scrollableContent;

// --- INTERACTIVE & ANIMATED ELEMENTS STATE ---
let interactiveElements = [];
// Reverted: Removed scrollAnimatedElements array

// --- SEAMLESS LOADER & INTRO SEQUENCE ---
const loaderCanvas = document.getElementById('loader-canvas');
let loaderCtx, loaderWidth, loaderHeight;
let loaderStars = [];
const loaderStarCount = 1500;
let loaderAnimationId;

let loaderSpeed = 0.2;
let loaderAcceleration = 0.005;
let isSlowingDown = false;
let loaderStartTime;
let isEngineStarted = false;

function initAndAnimateLoader() {
    if (!loaderCanvas) return;
    loaderCtx = loaderCanvas.getContext('2d');
    loaderWidth = loaderCanvas.width = window.innerWidth;
    loaderHeight = loaderCanvas.height = window.innerHeight;
    loaderStars = [];
    for (let i = 0; i < loaderStarCount; i++) {
        loaderStars.push({
            x: (Math.random() - 0.5) * loaderWidth,
            y: (Math.random() - 0.5) * loaderHeight,
            z: Math.random() * loaderWidth
        });
    }
    animateLoader();
}

// This function now draws the same dynamic background as the main site
function animateLoader() {
    if (!loaderCtx) return;

    loaderCtx.fillStyle = 'rgba(2, 2, 24, 0.4)';
    loaderCtx.fillRect(0, 0, loaderWidth, loaderHeight);
    
    const time = Date.now() * 0.00005;
    const gradientLayers = [
        { x: loaderWidth * 0.5 + Math.sin(time * 0.5) * loaderWidth * 0.1, y: loaderHeight * 0.6 + Math.cos(time * 0.5) * loaderHeight * 0.1, size: loaderWidth * 0.7, color: 'rgba(13, 27, 42, 0.5)' },
        { x: loaderWidth * 0.4 + Math.cos(time * 0.8) * loaderWidth * 0.2, y: loaderHeight * 0.4 + Math.sin(time * 0.8) * loaderHeight * 0.2, size: loaderWidth * 0.8, color: 'rgba(67, 97, 238, 0.2)' }
    ];
    
    loaderCtx.globalCompositeOperation = 'lighter';
    gradientLayers.forEach(layer => {
        const grad = loaderCtx.createRadialGradient(layer.x, layer.y, 0, layer.x, layer.y, layer.size);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        loaderCtx.fillStyle = grad;
        loaderCtx.fillRect(0, 0, loaderWidth, loaderHeight);
    });
    loaderCtx.globalCompositeOperation = 'source-over';

    if (isEngineStarted) {
        if (isSlowingDown) {
            loaderAcceleration = 0;
            loaderSpeed += (0.1 - loaderSpeed) * 0.04;
        } else {
            const elapsedTime = Date.now() - loaderStartTime;
            if (elapsedTime > 1000) {
                loaderAcceleration = 0.06;
            }
            loaderSpeed += loaderAcceleration;
        }
    } else {
        loaderSpeed = 0.2;
    }

    loaderCtx.save();
    loaderCtx.translate(loaderWidth / 2, loaderHeight / 2);

    for (let star of loaderStars) {
        star.z -= loaderSpeed;
        if (star.z <= 0) {
            star.z = loaderWidth;
            star.x = (Math.random() - 0.5) * loaderWidth;
            star.y = (Math.random() - 0.5) * loaderHeight;
        }

        const sx = (star.x / star.z) * loaderWidth;
        const sy = (star.y / star.z) * loaderHeight;
        const r = Math.max(0.1, (1 - star.z / loaderWidth) * 2.5);
        const opacity = Math.min(1, 1.2 - (star.z / loaderWidth));

        loaderCtx.beginPath();
        loaderCtx.arc(sx, sy, r, 0, Math.PI * 2);
        loaderCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        loaderCtx.fill();
    }

    loaderCtx.restore();
    loaderAnimationId = requestAnimationFrame(animateLoader);
}


// --- PAGE TRANSITION LOGIC ---
function initTransitionCanvas() {
    if (!transitionCanvas) return;
    transitionCtx = transitionCanvas.getContext('2d');
    transitionCanvas.width = window.innerWidth;
    transitionCanvas.height = window.innerHeight;
    transitionStars = [];
    for (let i = 0; i < 2000; i++) {
        transitionStars.push({
            x: (Math.random() - 0.5) * transitionCanvas.width,
            y: (Math.random() - 0.5) * transitionCanvas.height,
            z: Math.random() * transitionCanvas.width
        });
    }
}

function animateTransition(phase, onComplete, direction = 'forward') {
    if (!transitionCtx) return;

    if (phase === 'in') {
        transitionSpeed += 0.25; 
    } else if (phase === 'out') {
        transitionSpeed -= (transitionSpeed - 0.1) * 0.05; 
    }

    transitionCtx.fillStyle = 'rgba(2, 2, 24, 0.4)';
    transitionCtx.fillRect(0, 0, transitionCanvas.width, transitionCanvas.height);
    
    const time = Date.now() * 0.00005;
    const width = transitionCanvas.width;
    const height = transitionCanvas.height;
    const gradientLayers = [
        { x: width * 0.5 + Math.sin(time * 0.5) * width * 0.1, y: height * 0.6 + Math.cos(time * 0.5) * height * 0.1, size: width * 0.7, color: 'rgba(13, 27, 42, 0.5)' },
        { x: width * 0.4 + Math.cos(time * 0.8) * width * 0.2, y: height * 0.4 + Math.sin(time * 0.8) * height * 0.2, size: width * 0.8, color: 'rgba(67, 97, 238, 0.2)' }
    ];
    
    transitionCtx.globalCompositeOperation = 'lighter';
    gradientLayers.forEach(layer => {
        const grad = transitionCtx.createRadialGradient(layer.x, layer.y, 0, layer.x, layer.y, layer.size);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        transitionCtx.fillStyle = grad;
        transitionCtx.fillRect(0, 0, width, height);
    });
    transitionCtx.globalCompositeOperation = 'source-over';

    transitionCtx.save();
    transitionCtx.translate(transitionCanvas.width / 2, transitionCanvas.height / 2);

    for (let star of transitionStars) {
        if (direction === 'back') {
            star.z += transitionSpeed; 
            if (star.z > transitionCanvas.width) { 
                star.z = 1; 
                star.x = (Math.random() - 0.5) * transitionCanvas.width;
                star.y = (Math.random() - 0.5) * transitionCanvas.height;
            }
        } else { 
            star.z -= transitionSpeed; 
            if (star.z <= 0) { 
                star.z = transitionCanvas.width; 
                star.x = (Math.random() - 0.5) * transitionCanvas.width;
                star.y = (Math.random() - 0.5) * transitionCanvas.height;
            }
        }

        const sx = (star.x / star.z) * transitionCanvas.width;
        const sy = (star.y / star.z) * transitionCanvas.height;
        const r = Math.max(0.1, (1 - star.z / transitionCanvas.width) * 3);
        const opacity = Math.min(1, 1.5 - (star.z / transitionCanvas.width));
        
        transitionCtx.beginPath();
        transitionCtx.arc(sx, sy, r, 0, Math.PI * 2);
        transitionCtx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        transitionCtx.fill();
    }
    transitionCtx.restore();

    if ((phase === 'in' && transitionSpeed < 30) || (phase === 'out' && transitionSpeed > 0.15)) {
        transitionAnimationId = requestAnimationFrame(() => animateTransition(phase, onComplete, direction));
    } else {
        if (onComplete) onComplete();
    }
}

function pageTransition(destinationUrl, direction = 'forward') {
    if (!transitionContainer) return;

    sessionStorage.setItem('isTransitioning', 'true');
    sessionStorage.setItem('transitionDirection', direction);

    const currentContent = mainContentWrapper || cvDatapadWrapper;
    if (currentContent) currentContent.style.opacity = '0';
    
    transitionContainer.classList.add('active');

    if (!transitionCtx) initTransitionCanvas();
    transitionSpeed = 0.2; 

    if (transitionAnimationId) cancelAnimationFrame(transitionAnimationId);
    
    animateTransition('in', () => {
        window.location.href = destinationUrl;
    }, direction);
}


// --- Helper function to play sounds reliably ---
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => console.error(`Could not play ${soundId}:`, error));
    }
}


// --- Custom cursor logic ---
const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');
const parallaxShapes = document.querySelectorAll('.floating-shape');
let posX = 0, posY = 0, mouseX = 0, mouseY = 0;

if (cursor && cursorFollower) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    });

    function moveCursor() {
        posX += (mouseX - posX) / 9;
        posY += (mouseY - posY) / 9;
        cursorFollower.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;

        if (parallaxShapes.length > 0) {
            const parallaxX = (mouseX / window.innerWidth - 0.5) * 80;
            const parallaxY = (mouseY / window.innerHeight - 0.5) * 80;
            parallaxShapes.forEach((shape, i) => {
                const speed = (i + 1) * 0.15 + 0.5;
                shape.style.transform = `translate3d(${parallaxX * speed}px, ${parallaxY * speed}px, 0)`;
            });
        }
        requestAnimationFrame(moveCursor);
    }
    moveCursor();
}

// Particle trail effect for cursor
let lastParticleTime = 0;
const particleInterval = 75;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastParticleTime > particleInterval) {
        createCursorParticle(e.clientX, e.clientY);
        lastParticleTime = now;
    }
});

function createCursorParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'trail-particle';
    const size = Math.random() * 6 + 3;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    const colors = ['#4cc9f0', '#4361ee', '#90e0ef', '#3a0ca3'];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    const particleTrail = document.getElementById('particleTrail');
    if (particleTrail) {
        particleTrail.appendChild(particle);
    }
    setTimeout(() => { particle.remove(); }, 1000);
}


// --- CANVAS BACKGROUND ---
const backgroundCanvas = document.getElementById('background-canvas');
let bgCtx;
let bgStars = [];

function setupBackgroundCanvas() {
    if (!backgroundCanvas) return;
    bgCtx = backgroundCanvas.getContext('2d');
    backgroundCanvas.width = window.innerWidth;
    backgroundCanvas.height = window.innerHeight;
    bgStars = [];
    const starCount = window.innerWidth > 768 ? 800 : 300;
    for (let i = 0; i < starCount; i++) {
        bgStars.push({
            x: Math.random() * backgroundCanvas.width, y: Math.random() * backgroundCanvas.height,
            radius: Math.random() * 1.2 + 0.5, alpha: Math.random() * 0.8 + 0.2,
            layer: Math.floor(Math.random() * 3) + 1,
            dx: (Math.random() - 0.5) * 0.1, dy: (Math.random() - 0.5) * 0.1,
        });
    }
}

function drawBackground() {
    if (!bgCtx) return;

    const time = Date.now() * 0.00005;
    const width = backgroundCanvas.width;
    const height = backgroundCanvas.height;

    bgCtx.fillStyle = '#020218';
    bgCtx.fillRect(0, 0, width, height);

    const gradientLayers = [
        { x: width * 0.5 + Math.sin(time * 0.5) * width * 0.1, y: height * 0.6 + Math.cos(time * 0.5) * height * 0.1, size: width * 0.7, color: 'rgba(13, 27, 42, 0.5)' },
        { x: width * 0.4 + Math.cos(time * 0.8) * width * 0.2, y: height * 0.4 + Math.sin(time * 0.8) * height * 0.2, size: width * 0.8, color: 'rgba(67, 97, 238, 0.2)' }
    ];
    bgCtx.globalCompositeOperation = 'lighter';
    gradientLayers.forEach(layer => {
        const grad = bgCtx.createRadialGradient(layer.x, layer.y, 0, layer.x, layer.y, layer.size);
        grad.addColorStop(0, layer.color);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        bgCtx.fillStyle = grad;
        bgCtx.fillRect(0, 0, width, height);
    });
    bgCtx.globalCompositeOperation = 'source-over';

    const parallaxX = (mouseX / window.innerWidth - 0.5) * 50;
    const parallaxY = (mouseY / window.innerHeight - 0.5) * 50;
    const starTime = Date.now();

    bgStars.forEach(star => {
        star.x += star.dx; star.y += star.dy;
        if (star.x < 0) star.x = width; if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height; if (star.y > height) star.y = 0;

        bgCtx.beginPath();
        bgCtx.arc(star.x + parallaxX * (star.layer * 0.3), star.y + parallaxY * (star.layer * 0.3), star.radius, 0, Math.PI * 2);
        const twinkleFactor = (Math.sin(starTime * 0.0005 + star.y) * 0.5 + 0.5) * 0.7 + 0.3;
        const finalAlpha = star.alpha * twinkleFactor;
        bgCtx.fillStyle = `rgba(255, 255, 255, ${finalAlpha})`;
        bgCtx.fill();
    });
}


// --- MAIN 3D SCENE (HERO) ---
let scene, camera, renderer, mainSceneElements = {}, raycaster, threeMouse, MIN_ZOOM, MAX_ZOOM, targetZoom, intersects;

function setupMainScene() {
    const sphereCanvas = document.getElementById('sphereCanvas');
    if (!sphereCanvas) return;
    
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ canvas: sphereCanvas, alpha: true, antialias: true });
    raycaster = new THREE.Raycaster();
    threeMouse = new THREE.Vector2();
    MIN_ZOOM = 3.5;
    MAX_ZOOM = 7;
    targetZoom = 5;
    intersects = [];

    const canvasSize = Math.min(window.innerWidth * 0.5, 500);
    renderer.setSize(canvasSize, canvasSize);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const sphereGeometry = new THREE.SphereGeometry(1.8, 128, 128);
    const gradientMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 }, uHover: { value: 0.0 }, uClickTime: { value: -1.0 },
            uClickPos: { value: new THREE.Vector3() }, color1: { value: new THREE.Color(0x0d1b2a) },
            color2: { value: new THREE.Color(0x4361ee) }, color3: { value: new THREE.Color(0x4cc9f0) },
        },
        vertexShader: `varying vec3 vNormal; varying vec3 vViewPosition; varying vec3 vWorldPosition; void main() { vNormal = normalize(normalMatrix * normal); vec4 worldPosition = modelMatrix * vec4(position, 1.0); vWorldPosition = worldPosition.xyz; vec4 viewPosition = modelViewMatrix * worldPosition; vViewPosition = viewPosition.xyz; gl_Position = projectionMatrix * viewPosition; }`,
        fragmentShader: `uniform float time; uniform float uHover; uniform float uClickTime; uniform vec3 uClickPos; uniform vec3 color1; uniform vec3 color2; uniform vec3 color3; varying vec3 vNormal; varying vec3 vViewPosition; varying vec3 vWorldPosition; void main() { float mixFactor = (sin(vViewPosition.y * 2.0 + time * 0.8) + 1.0) / 2.0; vec3 baseColor = mix(color1, color2, mixFactor); vec3 viewDirection = normalize(-vViewPosition); float fresnel = 1.0 - dot(vNormal, viewDirection); fresnel = pow(fresnel, 2.0 + uHover * 1.5); vec3 finalColor = baseColor + color3 * fresnel; if (uClickTime > 0.0) { float timeSinceClick = time - uClickTime; if (timeSinceClick > 0.0 && timeSinceClick < 1.5) { float dist = distance(vWorldPosition, uClickPos); float rippleProgress = timeSinceClick * 4.0; float rippleWidth = 0.1; float ripple = smoothstep(rippleProgress - rippleWidth, rippleProgress, dist) - smoothstep(rippleProgress, rippleProgress + rippleWidth, dist); ripple *= (1.0 - timeSinceClick / 1.5); finalColor += vec3(0.90, 0.94, 0.98) * ripple; } } gl_FragColor = vec4(finalColor, 0.95); }`,
        transparent: true
    });
    const sphere = new THREE.Mesh(sphereGeometry, gradientMaterial);
    scene.add(sphere);

    const atmosphereGeometry = new THREE.SphereGeometry(2.0, 128, 128);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({ color: 0x4cc9f0, transparent: true, opacity: 0.15, blending: THREE.AdditiveBlending, side: THREE.BackSide });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    scene.add(atmosphere);

    const particleTexture = new THREE.CanvasTexture(createParticleTexture());
    const createGlowingStarRing = (radius, size, color, count, speed) => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            const angle = (i / 3) * (Math.PI * 2 / count);
            pos[i] = Math.cos(angle) * radius; pos[i+1] = 0; pos[i+2] = Math.sin(angle) * radius;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ size, map: particleTexture, color, transparent: true, opacity: 0.8, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
        const mesh = new THREE.Points(geo, mat);
        mesh.rotation.x = (Math.random() - 0.5) * 0.2; mesh.rotation.z = (Math.random() - 0.5) * 0.2;
        scene.add(mesh);
        return { mesh, speed };
    };
    const starRings = [
        createGlowingStarRing(2.5, 0.15, 0x4cc9f0, 12, 0.002),
        createGlowingStarRing(3.0, 0.12, 0x90e0ef, 16, 0.003),
        createGlowingStarRing(3.5, 0.10, 0xffffff, 20, 0.004)
    ];

    const innerGeo = new THREE.BufferGeometry();
    const innerPos = new Float32Array(100 * 3);
    for (let i = 0; i < 100 * 3; i += 3) {
        const r = 1.5 * Math.random(), t = Math.random() * Math.PI * 2, p = Math.acos(2 * Math.random() - 1);
        innerPos[i] = r * Math.sin(p) * Math.cos(t); innerPos[i+1] = r * Math.sin(p) * Math.sin(t); innerPos[i+2] = r * Math.cos(p);
    }
    innerGeo.setAttribute('position', new THREE.BufferAttribute(innerPos, 3));
    const innerMat = new THREE.PointsMaterial({ size: 0.07, map: particleTexture, color: 0x90e0ef, transparent: true, opacity: 0.6, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false });
    const innerParticlesMesh = new THREE.Points(innerGeo, innerMat);
    scene.add(innerParticlesMesh);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0x4cc9f0, 1); dirLight.position.set(5, 5, 5); scene.add(dirLight);

    camera.position.z = targetZoom;
    mainSceneElements = { sphere, atmosphere, starRings, innerParticlesMesh };
}

// --- MODAL 3D SCENE ---
let modalScene, modalCamera, modalRenderer, modalMesh, modalControls, isModal3DActive = false, modalClock;
function initModal3DScene() {
    const canvas = document.getElementById('modal-3d-canvas');
    if (!canvas) return;

    modalClock = new THREE.Clock();
    modalScene = new THREE.Scene();
    modalCamera = new THREE.PerspectiveCamera(75, (canvas.clientWidth || 500) / (canvas.clientHeight || 250), 0.1, 1000);
    modalRenderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    modalRenderer.setSize(canvas.clientWidth || 500, canvas.clientHeight || 250);
    modalRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const shaderMaterial = new THREE.ShaderMaterial({
        uniforms: { u_time: { value: 0.0 } },
        vertexShader: `varying vec3 vNormal; varying vec3 vViewPosition; void main() { vNormal = normalize(normalMatrix * normal); vec4 viewPosition = modelViewMatrix * vec4(position, 1.0); vViewPosition = viewPosition.xyz; gl_Position = projectionMatrix * viewPosition; }`,
        fragmentShader: `uniform float u_time; varying vec3 vNormal; varying vec3 vViewPosition; void main() { vec3 color1 = vec3(0.1, 0.1, 0.4); vec3 color2 = vec3(0.2, 0.7, 0.9); float mixFactor = sin(vViewPosition.y * 0.2 + u_time * 0.8) * 0.5 + 0.5; vec3 gradientColor = mix(color1, color2, mixFactor); vec3 viewDirection = normalize(-vViewPosition); float fresnel = 1.0 - dot(vNormal, viewDirection); fresnel = pow(fresnel, 2.5); vec3 glowColor = vec3(0.6, 0.85, 1.0) * fresnel; vec3 finalColor = gradientColor + glowColor; gl_FragColor = vec4(finalColor, 1.0); }`
    });
    const geometry = new THREE.TorusKnotGeometry(10, 3, 150, 32);
    modalMesh = new THREE.Mesh(geometry, shaderMaterial);
    modalScene.add(modalMesh);
    modalCamera.position.z = 22;
    modalControls = new THREE.OrbitControls(modalCamera, modalRenderer.domElement);
    modalControls.enableDamping = true; modalControls.dampingFactor = 0.05; modalControls.autoRotate = true;
    modalControls.autoRotateSpeed = 1.0; modalControls.enablePan = false;
}

// --- GAME DEVELOPMENT INTERACTIVE ---
let gameAnimationId;
function startGame() {
    const canvas = document.getElementById('game-dev-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight;

    let ball = { x: canvas.width / 2, y: canvas.height - 30, radius: 8, dx: 3, dy: -3 };
    let paddle = { height: 10, width: 80, x: (canvas.width - 80) / 2 };
    let bricks = [], score = 0;
    const brickRowCount = 3, brickColumnCount = 5, brickWidth = (canvas.width / 6), brickHeight = 20, brickPadding = 10;
    const brickOffsetTop = 30, brickOffsetLeft = (canvas.width - (brickColumnCount * (brickWidth + brickPadding))) / 2 + brickPadding / 2;
    const brickCount = brickRowCount * brickColumnCount;
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: (c * (brickWidth + brickPadding)) + brickOffsetLeft, y: (r * (brickHeight + brickPadding)) + brickOffsetTop, status: 1 };
        }
    }
    let particles = [], trail = [], gameOver = false;
    const trailLength = 10;

    function createExplosion(brick) {
        for (let i = 0; i < 15; i++) {
            particles.push({ x: brick.x + brickWidth / 2, y: brick.y + brickHeight / 2, dx: (Math.random() - 0.5) * 5, dy: (Math.random() - 0.5) * 5, size: Math.random() * 3 + 1, life: 50, color: `rgba(67, 97, 238, ${Math.random()})` });
        }
    }
    function updateAndDrawParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i]; p.x += p.dx; p.y += p.dy; p.dy += 0.1; p.life--;
            if (p.life <= 0) particles.splice(i, 1);
            else { ctx.globalAlpha = p.life / 50; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.size, p.size); ctx.globalAlpha = 1.0; }
        }
    }
    function collisionDetection() {
        for (let c = 0; c < brickColumnCount; c++) for (let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if (b.status == 1 && ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                ball.dy = -ball.dy; b.status = 0; score++; createExplosion(b);
                if (score === brickCount) gameOver = true;
            }
        }
    }
    function drawElements() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        trail.forEach((pos, i) => {
            const ratio = i / trailLength; ctx.fillStyle = `rgba(76, 201, 240, ${ratio * 0.3})`;
            ctx.beginPath(); ctx.arc(pos.x, pos.y, ball.radius * ratio, 0, Math.PI * 2); ctx.fill();
        });
        for (let c = 0; c < brickColumnCount; c++) for (let r = 0; r < brickRowCount; r++) if (bricks[c][r].status == 1) {
            ctx.beginPath(); ctx.rect(bricks[c][r].x, bricks[c][r].y, brickWidth, brickHeight); ctx.fillStyle = "#4361ee"; ctx.fill(); ctx.closePath();
        }
        ctx.beginPath(); ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height); ctx.fillStyle = "#90e0ef"; ctx.fill(); ctx.closePath();
        ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2); ctx.fillStyle = "#4cc9f0"; ctx.fill(); ctx.closePath();
        updateAndDrawParticles();
    }
    function gameLoop() {
        if (gameOver) {
            ctx.fillStyle = "rgba(2, 2, 24, 0.8)"; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#FFFFFF"; ctx.font = "bold 40px 'Orbitron'"; ctx.textAlign = "center";
            ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2); return;
        }
        trail.push({ x: ball.x, y: ball.y }); if (trail.length > trailLength) trail.shift();
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) ball.dx = -ball.dx;
        if (ball.y + ball.dy < ball.radius) ball.dy = -ball.dy;
        else if (ball.y + ball.dy > canvas.height - ball.radius) {
            if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) ball.dy = -ball.dy;
            else { ball.x = canvas.width / 2; ball.y = canvas.height - 30; ball.dx = 3; ball.dy = -3; trail = []; }
        }
        ball.x += ball.dx; ball.y += ball.dy;
        collisionDetection(); drawElements();
        gameAnimationId = requestAnimationFrame(gameLoop);
    }
    canvas.addEventListener("mousemove", e => {
        const relativeX = e.clientX - canvas.getBoundingClientRect().left;
        if (relativeX > paddle.width / 2 && relativeX < canvas.width - paddle.width / 2) paddle.x = relativeX - paddle.width / 2;
    });
    gameLoop();
}

function stopGame() {
    if (gameAnimationId) { cancelAnimationFrame(gameAnimationId); gameAnimationId = null; }
}

// --- NEW: KALEIDOSCOPE UI ---
let kaleidoscopeInitialized = false;
function initKaleidoscope() {
    kaleidoscopeInitialized = true;
    const canvas = document.getElementById('kaleidoscope-canvas');
    const slider = document.getElementById('symmetry-slider');
    const valueSpan = document.getElementById('symmetry-value');
    const clearBtn = document.getElementById('clear-kaleidoscope-btn');

    if (!canvas || !slider || !clearBtn) return;

    const ctx = canvas.getContext('2d');
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    let symmetry = slider.value;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let hue = 0;
    
    function clearCanvas() {
        ctx.fillStyle = '#010413';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    clearCanvas();
    
    function draw(e) {
        if (!isDrawing) return;
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 4;
        ctx.strokeStyle = `hsl(${hue}, 100%, 70%)`;
        
        const rect = canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const angle = (Math.PI * 2) / symmetry;
        
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        for (let i = 0; i < symmetry; i++) {
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(lastX - canvas.width / 2, lastY - canvas.height / 2);
            ctx.lineTo(currentX - canvas.width / 2, currentY - canvas.height / 2);
            ctx.stroke();

            // Mirrored version
            ctx.save();
            ctx.scale(1, -1);
            ctx.beginPath();
            ctx.moveTo(lastX - canvas.width / 2, lastY - canvas.height / 2);
            ctx.lineTo(currentX - canvas.width / 2, currentY - canvas.height / 2);
            ctx.stroke();
            ctx.restore();
        }
        
        ctx.restore();
        
        lastX = currentX;
        lastY = currentY;
        hue += 2;
    }

    canvas.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        [lastX, lastY] = [e.clientX - rect.left, e.clientY - rect.top];
        hue = Math.random() * 360;
    });
    
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', () => isDrawing = false);
    canvas.addEventListener('mouseleave', () => isDrawing = false);
    
    slider.addEventListener('input', (e) => {
        symmetry = e.target.value;
        if (valueSpan) valueSpan.textContent = symmetry;
    });
    
    clearBtn.addEventListener('click', clearCanvas);
}


// --- VIDEO EDITING TIMELINE LOGIC ---
let videoEditorInitialized = false, trackState = { base: true, vfx: true, text: true };
function initVideoEditor() {
    if (videoEditorInitialized) return;
    const canvas = document.getElementById('video-effect-canvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d'), timelineContainer = document.querySelector('.timeline-container'), playhead = document.querySelector('.timeline-playhead'), trackToggles = document.querySelectorAll('.track-toggle');
    let isDragging = false, currentProgress = 0;
    const drawBaseLayer = (p) => { const n = 20, s = canvas.width / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const z = Math.abs(Math.sin(i * j + p * 10)) * s / 2; ctx.fillStyle = `rgba(76, 201, 240, ${z/s*0.3})`; ctx.fillRect(i*s+(s-z)/2, j*s+(s-z)/2, z, z); } };
    const drawVfxLayer = (p) => { if (Math.random() > 0.7) { ctx.fillStyle = `rgba(144, 224, 239, ${Math.random()*0.7})`; ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, (Math.random()*80+20)*p*(Math.random()>0.5?1:-1), 2); } };
    const drawTextLayer = (p) => { ctx.font = "bold 60px Orbitron"; ctx.textAlign = "center"; ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1,p*1.5)})`; ctx.letterSpacing = `${p*20}px`; ctx.fillText("EzKen", canvas.width/2, canvas.height/2+20); ctx.letterSpacing = "0px"; };
    const drawEffect = (p) => { if (!canvas || !ctx) return; canvas.width = canvas.clientWidth; canvas.height = canvas.clientHeight; ctx.clearRect(0, 0, canvas.width, canvas.height); if (trackState.base) drawBaseLayer(p); if (trackState.vfx) drawVfxLayer(p); if (trackState.text) drawTextLayer(p); };
    const updatePlayhead = (e) => { const r = timelineContainer.getBoundingClientRect(); let x = Math.max(0, Math.min(e.clientX-r.left, r.width)); playhead.style.left = `${x}px`; currentProgress = x / r.width; drawEffect(currentProgress); };
    timelineContainer.addEventListener('mousedown', (e) => { isDragging = true; updatePlayhead(e); });
    document.addEventListener('mousemove', (e) => { if (isDragging) updatePlayhead(e); });
    document.addEventListener('mouseup', () => { isDragging = false; });
    trackToggles.forEach(t => { t.addEventListener('click', () => { trackState[t.dataset.track] = !trackState[t.dataset.track]; t.classList.toggle('active'); drawEffect(currentProgress); }); });
    drawEffect(0); videoEditorInitialized = true;
}

// --- MOTION DESIGN LOGIC ---
let motionDesignInitialized = false;
function initMotionDesign() {
    if (motionDesignInitialized) return;
    const stage = document.querySelector('.motion-text-stage'), input = document.getElementById('motion-text-input'), presets = document.querySelectorAll('.preset-btn');
    if (!stage || !input || !presets.length) return;
    let activePreset = 'cascade';
    const updateMotionText = () => {
        const text = input.value || input.placeholder;
        stage.innerHTML = ''; stage.classList.remove('animate-in'); void stage.offsetWidth; stage.classList.add('animate-in');
        text.split('').forEach((char, index) => {
            const span = document.createElement('span'); span.className = `letter anim-${activePreset}`;
            span.textContent = char === ' ' ? '\u00A0' : char; span.style.animationDelay = `${index*60}ms`;
            stage.appendChild(span);
        });
    };
    input.addEventListener('input', updateMotionText);
    presets.forEach(b => { b.addEventListener('click', () => { presets.forEach(btn => btn.classList.remove('active')); b.classList.add('active'); activePreset = b.dataset.preset; updateMotionText(); }); });
    updateMotionText(); motionDesignInitialized = true;
}


// --- Reverted: Original Interactive Elements animation logic ---
function handleInteractiveElements() {
    if (interactiveElements.length === 0) return;

    interactiveElements.forEach(item => {
        const rect = item.el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = mouseX - centerX;
        const dy = mouseY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const pullRadius = 300;
        let targetX = 0;
        let targetY = 0;

        if (dist < pullRadius) {
            const force = 1 - (dist / pullRadius);
            targetX = dx * force * -0.2;
            targetY = dy * force * -0.2;
        }
        
        item.target.tx = targetX;
        item.target.ty = item.isHovering ? item.hoverTy + targetY : targetY;
        
        item.target.scale = item.isHovering ? item.hoverScale : 1;
        
        item.cx += (item.target.tx - item.cx) * item.ease;
        item.cy += (item.target.ty - item.cy) * item.ease;
        item.scale += (item.target.scale - item.scale) * item.ease;
        
        item.el.style.transform = `translate(${item.cx}px, ${item.cy}px) scale(${item.scale})`;
    });
}


// --- MAIN ANIMATION LOOP & EVENT LISTENERS ---
function animate() {
    // Smooth Scroll Logic
    currentScroll += (targetScroll - currentScroll) * ease;
    if (Math.abs(targetScroll - currentScroll) < 0.1) {
        currentScroll = targetScroll;
    }
    
    if (scrollableContent) {
        scrollableContent.style.transform = `translate3d(0, -${currentScroll}px, 0)`;
    }
    updateCustomScrollbar();

    // Reverted: Removed call to handleScrollAnimations()
    if (interactiveElements.length > 0) handleInteractiveElements();

    // Existing Background & 3D Scene Animation Logic
    if (backgroundCanvas) drawBackground();
    
    if (renderer && mainSceneElements.sphere) {
        const { sphere, starRings, atmosphere, innerParticlesMesh } = mainSceneElements;
        if (!sphere.material.uniforms) return;
        const uniforms = sphere.material.uniforms;
        raycaster.setFromCamera(threeMouse, camera);
        intersects = raycaster.intersectObject(sphere);

        uniforms.time.value = performance.now() / 2000;
        const targetHover = intersects.length > 0 ? 1.0 : 0.0;
        uniforms.uHover.value += (targetHover - uniforms.uHover.value) * 0.1;

        sphere.rotation.y += ( (mouseX / window.innerWidth - 0.5) * 0.4 - sphere.rotation.y + 0.0005) * 0.02;
        sphere.rotation.x += ( (mouseY / window.innerHeight - 0.5) * 0.4 - sphere.rotation.x) * 0.02;
        sphere.position.y = Math.sin(Date.now() * 0.001) * 0.1;
        camera.position.z += (targetZoom - camera.position.z) * 0.05;

        if(starRings) starRings.forEach(r => { r.mesh.rotation.y += r.speed; });
        if(atmosphere) { atmosphere.rotation.y += 0.0005; atmosphere.rotation.x += 0.0002; }
        if(innerParticlesMesh) { innerParticlesMesh.rotation.y -= 0.002; innerParticlesMesh.rotation.x -= 0.001; }
        renderer.render(scene, camera);
    }
    
    if (modalRenderer && isModal3DActive) {
        if (modalClock && modalMesh) modalMesh.material.uniforms.u_time.value = modalClock.getElapsedTime();
        if (modalControls) modalControls.update();
        modalRenderer.render(modalScene, modalCamera);
    }
    
    requestAnimationFrame(animate);
}


function onWindowResize() {
    if (scrollableContent) {
        document.body.style.height = `${scrollableContent.scrollHeight}px`;
    }
    if (backgroundCanvas) setupBackgroundCanvas();
    if (renderer) {
        const newCanvasSize = Math.min(window.innerWidth * 0.5, 500);
        camera.aspect = 1; camera.updateProjectionMatrix();
        renderer.setSize(newCanvasSize, newCanvasSize);
    }
    if (modalRenderer) {
        const canvas = modalRenderer.domElement;
        if (canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0) {
            modalCamera.aspect = canvas.clientWidth / canvas.clientHeight;
            modalCamera.updateProjectionMatrix();
            modalRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
        }
    }
    updateCustomScrollbar();
}

function onThreeMouseMove(event) {
    if(threeMouse) {
        threeMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        threeMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
}

function handleWheel(event) {
    if (document.body.classList.contains('modal-open')) {
        return;
    }
    
    event.preventDefault();

    if (document.getElementById('sphereCanvas')) {
       targetZoom += event.deltaY * 0.005;
       targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, targetZoom));
    }

    targetScroll += event.deltaY;
    
    if (scrollableContent) {
        const maxScroll = scrollableContent.scrollHeight - window.innerHeight;
        targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    }
}

function createParticleTexture() {
    const c = document.createElement('canvas'); c.width = 32; c.height = 32;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(0.5, 'rgba(76,201,240,0.8)'); grad.addColorStop(1, 'rgba(76,201,240,0)');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(16, 16, 16, 0, Math.PI * 2); ctx.fill();
    return c;
}

// --- SKILL MODAL & INTERACTIVE LOGIC ---
let typingInterval;
const codeToType = `<!<span class="token-comment">-- My Universe of Code --</span>>\n<<span class="token-tag">div</span> <span class="token-attr">class</span>=<span class="token-string">"portfolio-container"</span>>\n    <<span class="token-tag">h1</span>>Rifat's Portfolio</<span class="token-tag">h1</span>>\n    <<span class="token-tag">p</span>>Creative ideas become stellar realities.</<span class="token-tag">p</span>>\n</<span class="token-tag">div</span>>`;

function startTypingAnimation(element) {
    let i = 0; element.innerHTML = "";
    const cursorSpan = '<span class="blinking-cursor"></span>';
    element.innerHTML = cursorSpan;
    typingInterval = setInterval(() => {
        if (i < codeToType.length) {
            const char = codeToType.charAt(i);
            const currentContent = element.innerHTML.replace(cursorSpan, '');
            if (char === '<') { const tagEnd = codeToType.indexOf('>', i); element.innerHTML = currentContent + codeToType.substring(i, tagEnd + 1) + cursorSpan; i = tagEnd; } 
            else { element.innerHTML = currentContent + char + cursorSpan; }
            i++;
        } else { clearInterval(typingInterval); element.innerHTML = element.innerHTML.replace(cursorSpan, ''); }
    }, 40);
}

// --- Custom Scrollbar Logic ---
function updateCustomScrollbar() {
    const scrollbarThumb = document.getElementById('scrollbar-thumb'); 
    if (!scrollbarThumb || !scrollableContent) return;

    const docHeight = scrollableContent.scrollHeight;
    const winHeight = window.innerHeight;
    
    const scrollableHeight = docHeight - winHeight;
    if (scrollableHeight <= 0) { 
        scrollbarThumb.style.height = '0px'; 
        return; 
    }
    
    const thumbHeight = Math.max(20, (winHeight / docHeight) * winHeight);
    scrollbarThumb.style.height = `${thumbHeight}px`;
    
    const scrollPercent = currentScroll / scrollableHeight;
    const thumbPosition = scrollPercent * (winHeight - thumbHeight);
    scrollbarThumb.style.transform = `translate(-50%, ${thumbPosition}px)`;
}


// --- Main Script Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    mainContentWrapper = document.getElementById('main-content-wrapper');
    cvDatapadWrapper = document.querySelector('.cv-datapad');
    transitionContainer = document.getElementById('transition-container');
    transitionCanvas = document.getElementById('transition-canvas');
    
    const isMainPage = mainContentWrapper !== null;
    const isCvPage = cvDatapadWrapper !== null;
    const loader = document.getElementById('loader');
    const body = document.body;

    scrollableContent = mainContentWrapper || (cvDatapadWrapper ? cvDatapadWrapper.parentElement : null);
    if (scrollableContent) {
        document.body.style.height = `${scrollableContent.scrollHeight}px`;
    }

    const isTransitioning = sessionStorage.getItem('isTransitioning') === 'true';
    const hasVisited = sessionStorage.getItem('hasVisited') === 'true';
    
    const currentContent = mainContentWrapper || cvDatapadWrapper;
    if (currentContent) currentContent.style.opacity = '0';

    if (isTransitioning) {
        if (loader) loader.remove();
        body.classList.remove('loading');
        
        const direction = sessionStorage.getItem('transitionDirection');
        sessionStorage.removeItem('isTransitioning');
        sessionStorage.removeItem('transitionDirection');
        
        transitionContainer.classList.add('active');
        if (!transitionCtx) initTransitionCanvas();
        transitionSpeed = 30;
        
        animateTransition('out', () => {
            transitionContainer.classList.remove('active');
            if (currentContent) currentContent.style.opacity = '1';
            updateCustomScrollbar();
        }, direction);

    } else if (hasVisited) {
        if (loader) loader.remove();
        body.classList.remove('loading');
        if (currentContent) currentContent.style.opacity = '1';
        updateCustomScrollbar();

    } else {
        if (isMainPage) {
            initAndAnimateLoader();
            const startEngineUI = document.getElementById('start-engine-ui');
            const startEngineBtn = document.getElementById('start-engine-btn');
            const introSound = document.getElementById('intro-sound');
            if (startEngineBtn) {
                startEngineBtn.addEventListener('click', () => {
                    if (introSound) { introSound.volume = 0.4; introSound.play().catch(e => console.warn("Audio play prevented.", e)); }
                    if (startEngineUI) { startEngineUI.style.opacity = '0'; startEngineUI.addEventListener('transitionend', () => startEngineUI.remove()); }

                    isEngineStarted = true; loaderStartTime = Date.now();
                    setTimeout(() => { isSlowingDown = true; }, 3000);

                    setTimeout(() => {
                        const loaderContent = document.getElementById('loader-content');
                        if (loaderContent) { loaderContent.style.opacity = '1'; loaderContent.style.pointerEvents = 'auto'; }

                        setTimeout(() => {
                            if (loader) loader.style.opacity = '0';
                            if (body) body.classList.remove('loading');
                            if (currentContent) currentContent.style.opacity = '1';
                            updateCustomScrollbar();

                            if (introSound && !introSound.paused) {
                                let vol = introSound.volume;
                                const fadeOut = setInterval(() => { vol = Math.max(0, vol - 0.1); introSound.volume = vol; if (vol === 0) { introSound.pause(); clearInterval(fadeOut); } }, 150);
                            }

                            if (loader) loader.addEventListener('transitionend', () => {
                                loader.remove();
                                if (loaderAnimationId) cancelAnimationFrame(loaderAnimationId);
                                sessionStorage.setItem('hasVisited', 'true');
                            });
                        }, 1500);
                    }, 3500);
                }, { once: true });
            }
        } else {
            if (loader) loader.remove();
            body.classList.remove('loading');
            if (currentContent) currentContent.style.opacity = '1';
            sessionStorage.setItem('hasVisited', 'true');
        }
    }

    if (isMainPage) {
        setupMainScene();
        setupBackgroundCanvas();

        // --- SETUP INTERACTIVE ELEMENTS ---
        // Reverted: Removed opacity properties from the item object
        document.querySelectorAll('.project-card, .skill-item').forEach(el => {
            const item = {
                el: el,
                cx: 0, cy: 0, scale: 1,
                target: { tx: 0, ty: 0, scale: 1 },
                isHovering: false,
                hoverTy: el.classList.contains('skill-item') ? -10 : 0,
                hoverScale: el.classList.contains('project-card') ? 1.05 : 1,
                ease: 0.08 // A slightly faster ease looks better without scroll animations
            };
            interactiveElements.push(item);
        });

        // Reverted: Removed scrollAnimatedElements population
        
        animate();
    } else if (isCvPage) {
        setupBackgroundCanvas();
        animate(); 

        const datapad = document.querySelector('.cv-datapad');
        if (datapad) {
            datapad.style.transition = 'transform 0.1s ease-out';
            let smoothMouseX = 0, smoothMouseY = 0;
            let currentX = 0, currentY = 0;
            
            cvDatapadWrapper.addEventListener('mousemove', (e) => {
                const rect = datapad.getBoundingClientRect();
                if (rect.width === 0) return;
                smoothMouseX = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
                smoothMouseY = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            });

            cvDatapadWrapper.addEventListener('mouseleave', () => {
                smoothMouseX = 0;
                smoothMouseY = 0;
            });

            let tiltAnimationId;
            function animateDatapadTilt() {
                if (!document.body.contains(datapad)) {
                    cancelAnimationFrame(tiltAnimationId);
                    return;
                }
                currentX += (smoothMouseX - currentX) * 0.05;
                currentY += (smoothMouseY - currentY) * 0.05;
                const existingTransform = getComputedStyle(datapad).transform;
                const matrix = new DOMMatrix(existingTransform);
                const existingTranslateY = matrix.m42;

                datapad.style.transform = `perspective(2000px) rotateX(${-currentY * 4}deg) rotateY(${currentX * 4}deg) translateY(${existingTranslateY}px)`;
                tiltAnimationId = requestAnimationFrame(animateDatapadTilt);
            }
            animateDatapadTilt();
        }

        document.querySelectorAll('.timeline-header').forEach(header => {
            header.addEventListener('click', () => {
                const entry = header.closest('.timeline-entry');
                entry.classList.toggle('is-open');
            });
        });

        const animatedElements = document.querySelectorAll('.cv-section');
        const sectionTitles = document.querySelectorAll('.cv-section-title');
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890*&<>/";
        const decodeEffect = (element) => {
            if(element.isDecoding) return;
            let iterations = 0;
            const originalText = element.dataset.originalText;
            element.isDecoding = true;

            const interval = setInterval(() => {
                element.innerText = originalText.split('')
                    .map((letter, index) => {
                        if (index < iterations) {
                            return originalText[index];
                        }
                        return letters[Math.floor(Math.random() * letters.length)];
                    })
                    .join('');
                
                if (iterations >= originalText.length) {
                    clearInterval(interval);
                    element.isDecoding = false;
                }
                
                iterations += 1 / 2;
            }, 30);
        };

        sectionTitles.forEach(title => {
            title.dataset.originalText = title.innerText;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    const title = entry.target.querySelector('.cv-section-title');
                    if(title) {
                       decodeEffect(title);
                    }
                    if(entry.target.id === 'skills-container') {
                        initSkillChart();
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        animatedElements.forEach(el => {
            el.classList.add('reveal-on-scroll');
            observer.observe(el);
        });
        const skillsContainer = document.getElementById('skills-container');
        if(skillsContainer) {
            skillsContainer.classList.add('reveal-on-scroll');
            observer.observe(skillsContainer);
        }

        function initSkillChart() {
            const canvas = document.getElementById('skill-radar-chart');
            const dataContainer = document.getElementById('skills-data');
            if (!canvas || !dataContainer) return;
        
            const skillNodes = dataContainer.querySelectorAll('div');
            const data = Array.from(skillNodes).map(node => ({
                label: node.dataset.skill,
                level: parseFloat(node.dataset.level)
            }));
        
            const ctx = canvas.getContext('2d');
            const size = canvas.offsetWidth;
            canvas.width = size;
            canvas.height = size;
        
            const center = size / 2;
            const baseRadius = size * 0.28;
            const angleSlice = (Math.PI * 2) / data.length;
        
            let animationProgress = 0;
            let animationId;
            let pulseTime = 0;
        
            function draw() {
                ctx.clearRect(0, 0, size, size);
                let currentRadius = baseRadius;
                
                if (animationProgress < 1) {
                    animationProgress += 0.05;
                } else {
                    pulseTime += 0.02;
                    const pulseFactor = 1 + Math.sin(pulseTime) * 0.025;
                    currentRadius = baseRadius * pulseFactor;
                }
                
                ctx.strokeStyle = 'rgba(76, 201, 240, 0.2)';
                ctx.lineWidth = 1;
                for (let i = 1; i <= 5; i++) {
                    ctx.beginPath();
                    const r = currentRadius * (i / 5) * Math.min(1, animationProgress * 2);
                    for (let j = 0; j < data.length; j++) {
                        const x = center + r * Math.cos(angleSlice * j - Math.PI / 2);
                        const y = center + r * Math.sin(angleSlice * j - Math.PI / 2);
                        if (j === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
        
                for (let i = 0; i < data.length; i++) {
                    ctx.beginPath();
                    ctx.moveTo(center, center);
                    const x = center + currentRadius * Math.cos(angleSlice * i - Math.PI / 2) * Math.min(1, animationProgress * 2);
                    const y = center + currentRadius * Math.sin(angleSlice * i - Math.PI / 2) * Math.min(1, animationProgress * 2);
                    ctx.lineTo(x, y);
                    ctx.stroke();
                }
        
                ctx.beginPath();
                ctx.fillStyle = 'rgba(76, 201, 240, 0.4)';
                ctx.strokeStyle = 'rgba(144, 224, 239, 1)';
                ctx.lineWidth = 2;
                data.forEach((p, i) => {
                    const r = currentRadius * p.level * animationProgress;
                    const x = center + r * Math.cos(angleSlice * i - Math.PI / 2);
                    const y = center + r * Math.sin(angleSlice * i - Math.PI / 2);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
        
                ctx.font = '12px Orbitron';
                ctx.fillStyle = 'rgba(224, 247, 250, 0.7)';
                data.forEach((p, i) => {
                    const r = currentRadius * 1.15;
                    const x = center + r * Math.cos(angleSlice * i - Math.PI / 2);
                    const y = center + r * Math.sin(angleSlice * i - Math.PI / 2);
                    ctx.textAlign = x > center + 5 ? 'left' : x < center - 5 ? 'right' : 'center';
                    ctx.fillText(p.label, x, y);
        
                    const pointR = currentRadius * p.level * animationProgress;
                    const pointX = center + pointR * Math.cos(angleSlice * i - Math.PI / 2);
                    const pointY = center + pointR * Math.sin(angleSlice * i - Math.PI / 2);
        
                    ctx.beginPath();
                    ctx.arc(pointX, pointY, 4, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(144, 224, 239, 1)';
                    ctx.fill();
                });
                
                animationId = requestAnimationFrame(draw);
            }
            draw();
        }
    }

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onThreeMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: false });

    if (document.getElementById('sphereCanvas')) {
        document.getElementById('sphereCanvas').addEventListener('click', () => {
            if (intersects && intersects.length > 0) {
                const { sphere } = mainSceneElements; const uniforms = sphere.material.uniforms;
                uniforms.uClickPos.value.copy(intersects[0].point);
                uniforms.uClickTime.value = uniforms.time.value;
            }
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function(e) {
            playSound('ui-open-sound');
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target && scrollableContent) {
                    const maxScroll = scrollableContent.scrollHeight - window.innerHeight;
                    let targetPosition = target.offsetTop - 80;
                    targetScroll = Math.max(0, Math.min(targetPosition, maxScroll));
                }
            }
        });
    });

    document.querySelectorAll('.project-card').forEach(c => c.addEventListener('click', () => playSound('ui-open-sound')));

    const skillItems = document.querySelectorAll('.skill-item');
    if (skillItems.length > 0) {
        const modal = document.getElementById('skill-modal');
        const closeModalBtn = document.querySelector('.modal-close-btn');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        
        const interactives = {
            '3D Development': document.getElementById('modal-3d-canvas'),
            'Web Development': document.getElementById('code-editor-container'),
            'Game Development': document.getElementById('game-dev-canvas'),
            'Graphics Designing': document.getElementById('graphics-design-interactive'),
            'Video Editing': document.getElementById('video-editing-interactive'),
            'Motion Designing': document.getElementById('motion-design-interactive')
        };
        const codeOutput = document.getElementById('code-output');

        function hideAllInteractives() {
            Object.values(interactives).forEach(el => el && (el.style.display = 'none'));
            isModal3DActive = false;
            clearInterval(typingInterval);
            stopGame();
            if (modalControls) modalControls.autoRotate = false;
        }

        skillItems.forEach(item => {
            item.addEventListener('click', () => {
                playSound('ui-open-sound');
                const title = item.getAttribute('data-title');
                const description = item.getAttribute('data-description');
                if (modalTitle) modalTitle.textContent = title;
                if (modalDescription) modalDescription.textContent = description;
                hideAllInteractives();

                if (interactives[title]) interactives[title].style.display = 'block';

                switch(title) {
                    case '3D Development':
                        if (!modalRenderer) initModal3DScene();
                        isModal3DActive = true; if (modalControls) modalControls.autoRotate = true;
                        setTimeout(() => onWindowResize(), 0); break;
                    case 'Web Development': if(codeOutput) startTypingAnimation(codeOutput); break;
                    case 'Game Development': startGame(); break;
                    case 'Graphics Designing': 
                        if (!kaleidoscopeInitialized) initKaleidoscope();
                        break;
                    case 'Video Editing': initVideoEditor(); break;
                    case 'Motion Designing': initMotionDesign(); break;
                }
                
                body.classList.add('modal-open');
                if (modal) modal.classList.add('active');
            });
        });

        const closeModal = () => { playSound('ui-close-sound'); body.classList.remove('modal-open'); if (modal) modal.classList.remove('active'); hideAllInteractives(); };
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
        if (modal) modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    }

    // --- UPDATED: VIDEO MODAL LOGIC ---
    const videoModal = document.getElementById('video-modal');
    const videoModalCloseBtn = document.querySelector('.video-modal-close');
    const videoContainer = document.querySelector('.video-container');
    const videoProjectCards = document.querySelectorAll('.video-project-card');

    function closeVideoModal() {
        playSound('ui-close-sound');
        document.body.classList.remove('modal-open');
        videoModal.classList.remove('active');
        videoContainer.innerHTML = ''; // Remove the iframe to stop video playback
    }

    videoProjectCards.forEach(card => {
        card.addEventListener('click', () => {
            playSound('ui-open-sound');
            const videoId = card.dataset.videoId;
            if (!videoId) return;
            
            // --- FIX STARTS HERE ---
            // Before: The URL was 'https://googleusercontent.com/youtube.com/embed/${videoId}' which is incorrect.
            // After: The URL is now the standard 'https://www.youtube.com/embed/${videoId}'
            videoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
            // --- FIX ENDS HERE ---

            document.body.classList.add('modal-open');
            videoModal.classList.add('active');
        });
    });

    if (videoModalCloseBtn) videoModalCloseBtn.addEventListener('click', closeVideoModal);
    if (videoModal) videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) closeVideoModal();
    });
    
    const glitchWrapper = document.querySelector('.glitch-wrapper');
    if (glitchWrapper) {
        const glitchElement = document.querySelector('.glitch');
        let isGlitching = false;
        const triggerGlitch = () => {
            if(isGlitching) return;
            isGlitching = true;
            glitchElement.classList.add('is-glitching');
            glitchElement.textContent = 'Rifat';
            glitchElement.dataset.text = 'Rifat';
            setTimeout(() => {
                glitchElement.textContent = 'KEN';
                glitchElement.dataset.text = 'KEN';
            }, 250);
            setTimeout(() => {
                glitchElement.classList.remove('is-glitching');
                isGlitching = false;
            }, 400);
        };
        const startPeriodicGlitch = () => {
            setTimeout(() => {
                triggerGlitch();
                startPeriodicGlitch();
            }, Math.random() * 5000 + 4000);
        };
        startPeriodicGlitch();
        glitchWrapper.addEventListener('click', (e) => {
            glitchWrapper.classList.add('is-clicked');
            playSound('ui-open-sound');
            setTimeout(() => glitchWrapper.classList.remove('is-clicked'), 600);
        });
        let smoothMouseX = 0, smoothMouseY = 0, currentX = 0, currentY = 0;
        glitchWrapper.addEventListener('mousemove', (e) => {
            const rect = glitchWrapper.getBoundingClientRect();
            smoothMouseX = (e.clientX-rect.left-rect.width/2)/(rect.width/2);
            smoothMouseY = (e.clientY-rect.top-rect.height/2)/(rect.height/2);
        });
        glitchWrapper.addEventListener('mouseleave', () => {
            smoothMouseX=0;
            smoothMouseY=0;
        });
        function animateTilt() {
            currentX += (smoothMouseX-currentX)*0.08;
            currentY += (smoothMouseY-currentY)*0.08;
            glitchWrapper.style.transform = `perspective(1200px) rotateX(${currentY*15}deg) rotateY(${-1*currentX*15}deg)`;
            requestAnimationFrame(animateTilt);
        }
        animateTilt();
    }

    const downloadCvBtn = document.getElementById('download-cv-btn');
    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            playSound('ui-open-sound');
            window.print();
        });
    }

    document.querySelectorAll('.page-transition-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const soundId = this.dataset.sound || 'ui-open-sound';
            const direction = this.dataset.direction || 'forward';
            playSound(soundId);
            pageTransition(this.href, direction);
        });
    });
});