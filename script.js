// ===== THREE.JS 3D BACKGROUND =====
function initThreeJS() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 500;
    const posArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        posArray[i] = (Math.random() - 0.5) * 50;
        posArray[i + 1] = (Math.random() - 0.5) * 50;
        posArray[i + 2] = (Math.random() - 0.5) * 50;

        // Gold/silver particles
        const isGold = Math.random() > 0.5;
        colorArray[i] = isGold ? 1.0 : 0.75;
        colorArray[i + 1] = isGold ? 0.84 : 0.75;
        colorArray[i + 2] = isGold ? 0.0 : 0.75;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Floating rings (representing token)
    const ringGeometry = new THREE.TorusGeometry(3, 0.05, 16, 100);
    const ringMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700, transparent: true, opacity: 0.3 });
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
    ring1.position.set(8, 2, -10);
    scene.add(ring1);

    const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(2, 0.03, 16, 100),
        new THREE.MeshBasicMaterial({ color: 0xC0C0C0, transparent: true, opacity: 0.2 })
    );
    ring2.position.set(-8, -3, -12);
    scene.add(ring2);

    // Wireframe sphere
    const sphereGeometry = new THREE.IcosahedronGeometry(2, 1);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700, wireframe: true, transparent: true, opacity: 0.1 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(-6, 4, -15);
    scene.add(sphere);

    camera.position.z = 15;

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);

        particlesMesh.rotation.y += 0.0003;
        particlesMesh.rotation.x += 0.0001;

        ring1.rotation.x += 0.005;
        ring1.rotation.y += 0.003;

        ring2.rotation.x -= 0.003;
        ring2.rotation.z += 0.005;

        sphere.rotation.x += 0.002;
        sphere.rotation.y += 0.003;

        camera.position.x += (mouseX * 2 - camera.position.x) * 0.02;
        camera.position.y += (mouseY * 1 - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===== NAVIGATION =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
}

// ===== SCROLL TO SECTION =====
function scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== COMING SOON POPUP =====
function showComingSoon() {
    document.getElementById('popupOverlay').classList.add('active');
}

function hideComingSoon() {
    document.getElementById('popupOverlay').classList.remove('active');
}

// ===== TASK COMPLETION =====
const completedTasks = { x: false, tg: false };

function completeTask(type) {
    setTimeout(() => {
        completedTasks[type] = true;
        const card = document.getElementById(type === 'x' ? 'taskX' : 'taskTg');
        card.classList.add('completed');
    }, 1000);
}

// ===== FORM SUBMISSION =====
const submittedWallets = new Set();
const submittedXUsernames = new Set();
const submittedTgUsernames = new Set();

function isValidEVMAddress(address) {
    const fullAddress = address.startsWith('0x') ? address : '0x' + address;
    return /^0x[a-fA-F0-9]{40}$/.test(fullAddress);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.borderColor = isError ? '#ff4444' : '#00ff88';
    toast.style.color = isError ? '#ff4444' : '#00ff88';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function handleFormSubmit(event) {
    event.preventDefault();

    const xUsername = document.getElementById('xUsername').value.trim().toLowerCase();
    const tgUsername = document.getElementById('tgUsername').value.trim().toLowerCase();
    let walletAddress = document.getElementById('walletAddress').value.trim();
    const captcha = document.getElementById('captchaCheck').checked;

    // Validation
    if (!xUsername || !tgUsername || !walletAddress) {
        showToast('Please fill in all fields.', true);
        return;
    }

    if (!captcha) {
        showToast('Please verify you are not a robot.', true);
        return;
    }

    // Format wallet
    if (!walletAddress.startsWith('0x')) {
        walletAddress = '0x' + walletAddress;
    }

    if (!isValidEVMAddress(walletAddress)) {
        showToast('Please enter a valid EVM wallet address (0x + 40 hex characters).', true);
        return;
    }

    // Duplicate checks
    if (submittedWallets.has(walletAddress.toLowerCase())) {
        showToast('This wallet address has already been submitted.', true);
        return;
    }

    if (submittedXUsernames.has(xUsername)) {
        showToast('This X username has already been submitted.', true);
        return;
    }

    if (submittedTgUsernames.has(tgUsername)) {
        showToast('This Telegram username has already been submitted.', true);
        return;
    }

    // Check spots
    const spotsEl = document.getElementById('spotsRemaining');
    const currentSpots = parseInt(spotsEl.textContent);
    if (currentSpots <= 0) {
        showToast('Sorry, all spots have been filled!', true);
        return;
    }

    // Success - save data
    submittedWallets.add(walletAddress.toLowerCase());
    submittedXUsernames.add(xUsername);
    submittedTgUsernames.add(tgUsername);

    // Update spots
    const newSpots = currentSpots - 1;
    spotsEl.textContent = newSpots;
    const joined = 1000 - newSpots;
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = (joined / 1000 * 100) + '%';

    // Update progress labels
    const labels = document.querySelectorAll('.progress-labels span');
    if (labels.length >= 1) {
        labels[0].textContent = joined + ' Joined';
    }

    // Mark tasks as completed
    document.getElementById('taskX').classList.add('completed');
    document.getElementById('taskTg').classList.add('completed');

    // Show verification
    document.getElementById('formContainer').style.display = 'none';
    document.querySelector('.tasks-container').style.display = 'none';
    document.getElementById('verificationContainer').style.display = 'block';

    showToast('Done! You have successfully joined the PAP waitlist rewards.');
}

// ===== FAQ TOGGLE =====
function toggleFaq(item) {
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isActive) {
        item.classList.add('active');
    }
}

// ===== ANIMATED COUNTER =====
function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * eased);
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ===== INTERSECTION OBSERVER =====
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Animate spots counter
                if (entry.target.querySelector('.spots-number')) {
                    animateCounter(entry.target.querySelector('.spots-number'), 742);
                }
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.dash-card, .task-card, .faq-item').forEach(el => {
        observer.observe(el);
    });
}

// ===== NAVBAR SCROLL EFFECT =====
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.85)';
        }
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initScrollAnimations();
    initNavbarScroll();
});

// Make functions globally accessible
window.toggleMobileMenu = toggleMobileMenu;
window.scrollToSection = scrollToSection;
window.showComingSoon = showComingSoon;
window.hideComingSoon = hideComingSoon;
window.completeTask = completeTask;
window.handleFormSubmit = handleFormSubmit;
window.toggleFaq = toggleFaq;
