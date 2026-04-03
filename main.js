import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Global variables
let scene, camera, renderer, controls;
let cow, milkParticles = [];
let currentChapter = 0;
let isPlaying = false;
let isPaused = false;
let tourStartTime;
let animationId;

// Chapter data with narration and camera positions
const chapters = [
    {
        title: "The Farm - Where It All Begins",
        duration: 60,
        narration: "Welcome to our journey through the world of raw milk! We begin at the farm, where healthy cows graze in open pastures. Raw milk comes directly from the cow without pasteurization or homogenization, preserving its natural state. This milk contains over 60 enzymes, beneficial bacteria, and essential nutrients that support human health.",
        cameraPosition: { x: 15, y: 8, z: 15 },
        lookAt: { x: 0, y: 2, z: 0 },
        showInfo: false
    },
    {
        title: "The Cow - Nature's Perfect Producer",
        duration: 60,
        narration: "Meet our friendly cow! Cows are remarkable creatures that produce milk rich in immunoglobulins, lactoferrin, and lysozyme - natural compounds that support immune function. Grass-fed cows produce milk with higher levels of omega-3 fatty acids and conjugated linoleic acid (CLA), which have been linked to numerous health benefits including reduced inflammation and improved heart health.",
        cameraPosition: { x: 8, y: 4, z: 8 },
        lookAt: { x: 0, y: 2, z: 0 },
        showInfo: true
    },
    {
        title: "Milking Process - Pure and Natural",
        duration: 60,
        narration: "The milking process for raw milk requires exceptional care and hygiene. Unlike conventional milk, raw milk is never heated above body temperature, preserving delicate enzymes like lactase that help digest lactose. The milk flows naturally, maintaining its complex structure of proteins, fats, and carbohydrates exactly as nature intended.",
        cameraPosition: { x: -10, y: 5, z: 10 },
        lookAt: { x: 0, y: 2, z: 0 },
        showInfo: false
    },
    {
        title: "Milk Composition - Liquid Gold",
        duration: 60,
        narration: "Look closely at the milk particles! Raw milk contains a perfect balance of nutrients: calcium for strong bones, vitamin D for immune support, vitamin K2 for heart health, and B vitamins for energy metabolism. The fat globules in raw milk are surrounded by a membrane that protects against harmful bacteria while delivering fat-soluble vitamins efficiently to your body.",
        cameraPosition: { x: 0, y: 10, z: 12 },
        lookAt: { x: 0, y: 3, z: 0 },
        showInfo: true
    },
    {
        title: "Health Benefits - Why It Matters",
        duration: 60,
        narration: "Research suggests raw milk may help reduce allergies, asthma, and eczema in children. The beneficial bacteria in raw milk support gut health and digestion. Many people who are lactose intolerant find they can digest raw milk better due to the presence of lactase-producing bacteria. Raw milk represents a complete food that has nourished humans for thousands of years.",
        cameraPosition: { x: -15, y: 6, z: -10 },
        lookAt: { x: 0, y: 2, z: 0 },
        showInfo: false
    },
    {
        title: "Conclusion - A Natural Choice",
        duration: 30,
        narration: "Thank you for joining us on this journey! Raw milk is more than just a beverage - it's a connection to traditional farming, natural nutrition, and holistic health. While it's important to source raw milk from trusted, certified farms with high safety standards, many choose raw milk as part of a wellness-focused lifestyle. Remember to always research local regulations and consult healthcare providers.",
        cameraPosition: { x: 20, y: 10, z: 20 },
        lookAt: { x: 0, y: 2, z: 0 },
        showInfo: false
    }
];

// Initialize the scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 20, 100);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 8, 15);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    controls.minDistance = 5;
    controls.maxDistance = 50;

    // Add lighting
    addLighting();

    // Create environment
    createEnvironment();

    // Create cow model
    createCow();

    // Create milk particles
    createMilkParticles();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

// Add lighting to the scene
function addLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Hemisphere light for sky/ground color variation
    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x3d8c40, 0.4);
    scene.add(hemisphereLight);
}

// Create the farm environment
function createEnvironment() {
    // Ground (grass)
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x3d8c40,
        roughness: 0.8
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Barn
    createBarn();

    // Fence
    createFence();

    // Trees
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 40 + Math.random() * 20;
        createTree(
            Math.cos(angle) * radius,
            0,
            Math.sin(angle) * radius
        );
    }

    // Clouds
    createClouds();
}

// Create a simple barn
function createBarn() {
    const barnGroup = new THREE.Group();

    // Main barn structure
    const barnGeometry = new THREE.BoxGeometry(12, 8, 15);
    const barnMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
    const barn = new THREE.Mesh(barnGeometry, barnMaterial);
    barn.position.y = 4;
    barn.castShadow = true;
    barn.receiveShadow = true;
    barnGroup.add(barn);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(10, 4, 4);
    const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 10;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    barnGroup.add(roof);

    // Door
    const doorGeometry = new THREE.PlaneGeometry(4, 5);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: 0x4a3728 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 2.5, 7.51);
    barnGroup.add(door);

    barnGroup.position.set(-30, 0, -20);
    scene.add(barnGroup);
}

// Create fence around the pasture
function createFence() {
    const fenceMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    
    for (let i = 0; i < 40; i++) {
        const angle = (i / 40) * Math.PI * 2;
        const radius = 35;
        
        const postGeometry = new THREE.BoxGeometry(0.3, 1.5, 0.3);
        const post = new THREE.Mesh(postGeometry, fenceMaterial);
        post.position.set(
            Math.cos(angle) * radius,
            0.75,
            Math.sin(angle) * radius
        );
        post.castShadow = true;
        scene.add(post);

        // Add rails
        if (i % 2 === 0) {
            const railGeometry = new THREE.BoxGeometry(2, 0.2, 0.15);
            const rail1 = new THREE.Mesh(railGeometry, fenceMaterial);
            rail1.position.set(
                Math.cos(angle) * radius,
                0.5,
                Math.sin(angle) * radius
            );
            rail1.rotation.y = -angle;
            scene.add(rail1);

            const rail2 = new THREE.Mesh(railGeometry, fenceMaterial);
            rail2.position.set(
                Math.cos(angle) * radius,
                1.0,
                Math.sin(angle) * radius
            );
            rail2.rotation.y = -angle;
            scene.add(rail2);
        }
    }
}

// Create a tree
function createTree(x, y, z) {
    const treeGroup = new THREE.Group();

    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.8, 4, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 2;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Leaves
    const leavesGeometry = new THREE.SphereGeometry(3, 8, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228b22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 5;
    leaves.castShadow = true;
    treeGroup.add(leaves);

    treeGroup.position.set(x, y, z);
    scene.add(treeGroup);
}

// Create clouds
function createClouds() {
    for (let i = 0; i < 10; i++) {
        const cloudGroup = new THREE.Group();
        
        const cloudMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.9
        });

        for (let j = 0; j < 5; j++) {
            const cloudGeometry = new THREE.SphereGeometry(2 + Math.random() * 2, 8, 8);
            const cloudPart = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloudPart.position.set(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 4
            );
            cloudGroup.add(cloudPart);
        }

        cloudGroup.position.set(
            (Math.random() - 0.5) * 100,
            25 + Math.random() * 10,
            (Math.random() - 0.5) * 100
        );
        
        scene.add(cloudGroup);
    }
}

// Create a procedural cow model
function createCow() {
    cow = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const spotMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

    // Body
    const bodyGeometry = new THREE.BoxGeometry(3, 2.5, 5);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    cow.add(body);

    // Add spots to body
    for (let i = 0; i < 5; i++) {
        const spotGeometry = new THREE.CircleGeometry(0.4, 8);
        const spot = new THREE.Mesh(spotGeometry, spotMaterial);
        spot.position.set(
            1.51,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 4
        );
        spot.rotation.y = -Math.PI / 2;
        cow.add(spot);
    }

    // Head
    const headGeometry = new THREE.BoxGeometry(2, 1.5, 2.5);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.set(0, 2, 3.5);
    head.castShadow = true;
    cow.add(head);

    // Snout
    const snoutGeometry = new THREE.BoxGeometry(1.2, 1, 1.5);
    const snoutMaterial = new THREE.MeshStandardMaterial({ color: 0xffb6c1 });
    const snout = new THREE.Mesh(snoutGeometry, snoutMaterial);
    snout.position.set(0, 0.5, 1.8);
    cow.add(snout);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(0.6, 1, 1.2);
    cow.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(-0.6, 1, 1.2);
    cow.add(rightEye);

    // Ears
    const earGeometry = new THREE.BoxGeometry(0.8, 0.6, 0.2);
    
    const leftEar = new THREE.Mesh(earGeometry, bodyMaterial);
    leftEar.position.set(1, 2, 0.5);
    leftEar.rotation.z = -Math.PI / 6;
    cow.add(leftEar);

    const rightEar = new THREE.Mesh(earGeometry, bodyMaterial);
    rightEar.position.set(-1, 2, 0.5);
    rightEar.rotation.z = Math.PI / 6;
    cow.add(rightEar);

    // Horns
    const hornGeometry = new THREE.ConeGeometry(0.15, 0.8, 8);
    const hornMaterial = new THREE.MeshStandardMaterial({ color: 0xfffff0 });
    
    const leftHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    leftHorn.position.set(0.5, 2.8, 0.5);
    leftHorn.rotation.z = -Math.PI / 8;
    cow.add(leftHorn);

    const rightHorn = new THREE.Mesh(hornGeometry, hornMaterial);
    rightHorn.position.set(-0.5, 2.8, 0.5);
    rightHorn.rotation.z = Math.PI / 8;
    cow.add(rightHorn);

    // Legs
    const legGeometry = new THREE.CylinderGeometry(0.3, 0.3, 2.5, 8);
    
    const positions = [
        { x: 1, z: 1.5 },
        { x: -1, z: 1.5 },
        { x: 1, z: -1.5 },
        { x: -1, z: -1.5 }
    ];

    positions.forEach(pos => {
        const leg = new THREE.Mesh(legGeometry, bodyMaterial);
        leg.position.set(pos.x, -1.25, pos.z);
        leg.castShadow = true;
        cow.add(leg);
    });

    // Udder
    const udderGeometry = new THREE.SphereGeometry(0.6, 8, 8);
    const udder = new THREE.Mesh(udderGeometry, new THREE.MeshStandardMaterial({ color: 0xffb6c1 }));
    udder.position.set(0, -0.8, -1);
    cow.add(udder);

    // Tail
    const tailGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.set(0, 1, -2.5);
    tail.rotation.x = Math.PI / 4;
    cow.add(tail);

    // Tail tuft
    const tuftGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    const tuftMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });
    const tuft = new THREE.Mesh(tuftGeometry, tuftMaterial);
    tuft.position.set(0, -0.8, -1.2);
    tail.add(tuft);

    cow.position.set(0, 1.25, 0);
    scene.add(cow);
}

// Create milk particles for physics demonstration
function createMilkParticles() {
    const particleGeometry = new THREE.SphereGeometry(0.15, 8, 8);
    const particleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.3
    });

    for (let i = 0; i < 200; i++) {
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(
            (Math.random() - 0.5) * 10,
            5 + Math.random() * 10,
            (Math.random() - 0.5) * 10
        );
        particle.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.1,
            -0.2 - Math.random() * 0.2,
            (Math.random() - 0.5) * 0.1
        );
        particle.castShadow = true;
        scene.add(particle);
        milkParticles.push(particle);
    }
}

// Update milk particle physics
function updateMilkParticles() {
    const groundLevel = 0.15;
    const splashZone = new THREE.Vector3(0, 1.5, 0);

    milkParticles.forEach((particle, index) => {
        // Apply gravity
        particle.velocity.y -= 0.015;

        // Apply slight attraction to cow (simulating milking)
        const direction = new THREE.Vector3().subVectors(splashZone, particle.position);
        const distance = direction.length();
        
        if (distance < 8) {
            direction.normalize();
            particle.velocity.add(direction.multiplyScalar(0.005));
        }

        // Update position
        particle.position.add(particle.velocity);

        // Ground collision with bounce
        if (particle.position.y < groundLevel) {
            particle.position.y = groundLevel;
            particle.velocity.y *= -0.3;
            particle.velocity.x *= 0.95;
            particle.velocity.z *= 0.95;

            // Reset particle if it stops
            if (Math.abs(particle.velocity.y) < 0.05) {
                particle.position.set(
                    (Math.random() - 0.5) * 10,
                    5 + Math.random() * 10,
                    (Math.random() - 0.5) * 10
                );
                particle.velocity.set(
                    (Math.random() - 0.5) * 0.1,
                    -0.2 - Math.random() * 0.2,
                    (Math.random() - 0.5) * 0.1
                );
            }
        }

        // Add some horizontal damping
        particle.velocity.x *= 0.999;
        particle.velocity.z *= 0.999;
    });
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);

    if (!isPaused && isPlaying) {
        // Rotate cow slightly
        if (cow) {
            cow.rotation.y += 0.002;
        }

        // Update milk particles
        updateMilkParticles();

        // Update chapter progression
        updateChapterProgression();
    }

    controls.update();
    renderer.render(scene, camera);
}

// Update chapter progression
function updateChapterProgression() {
    const elapsed = (Date.now() - tourStartTime) / 1000;
    let totalTime = 0;
    
    for (let i = 0; i <= currentChapter; i++) {
        totalTime += chapters[i].duration;
    }

    const progress = Math.min(elapsed / totalTime, 1);
    document.getElementById('progress-fill').style.width = `${progress * 100}%`;

    // Check if we should advance to next chapter
    let chapterTime = 0;
    for (let i = 0; i < currentChapter; i++) {
        chapterTime += chapters[i].duration;
    }

    const timeInCurrentChapter = elapsed - chapterTime;
    
    if (timeInCurrentChapter >= chapters[currentChapter].duration && currentChapter < chapters.length - 1) {
        advanceToNextChapter();
    }
}

// Advance to next chapter
function advanceToNextChapter() {
    currentChapter++;
    updateChapterDisplay();
    
    if (currentChapter >= chapters.length) {
        endTour();
    } else {
        transitionToChapter(currentChapter);
    }
}

// Transition to a specific chapter
function transitionToChapter(chapterIndex) {
    const chapter = chapters[chapterIndex];
    
    // Smooth camera transition
    const targetPosition = new THREE.Vector3(
        chapter.cameraPosition.x,
        chapter.cameraPosition.y,
        chapter.cameraPosition.z
    );
    
    const targetLookAt = new THREE.Vector3(
        chapter.lookAt.x,
        chapter.lookAt.y,
        chapter.lookAt.z
    );

    // Animate camera
    const startPos = camera.position.clone();
    const startLookAt = controls.target.clone();
    const startTime = Date.now();
    const duration = 2000;

    function animateCamera() {
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        
        // Ease in-out
        const easeT = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        camera.position.lerpVectors(startPos, targetPosition, easeT);
        controls.target.lerpVectors(startLookAt, targetLookAt, easeT);
        controls.update();

        if (t < 1) {
            requestAnimationFrame(animateCamera);
        }
    }

    animateCamera();

    // Update narration
    setTimeout(() => {
        document.getElementById('narration-text').textContent = chapter.narration;
    }, 500);

    // Show/hide info panel
    const infoPanel = document.getElementById('info-panel');
    infoPanel.style.display = chapter.showInfo ? 'block' : 'none';
}

// Update chapter display
function updateChapterDisplay() {
    document.getElementById('chapter-indicator').textContent = 
        `Chapter ${currentChapter + 1}/${chapters.length}`;
}

// Start the tour
function startTour() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('narration-panel').style.display = 'block';
    document.getElementById('chapter-indicator').style.display = 'block';
    document.getElementById('controls').style.display = 'flex';
    document.getElementById('skip-button').style.display = 'block';
    
    isPlaying = true;
    tourStartTime = Date.now();
    currentChapter = 0;
    
    updateChapterDisplay();
    transitionToChapter(0);
}

// End the tour
function endTour() {
    isPlaying = false;
    document.getElementById('narration-text').textContent = 
        "🎉 Tour Complete! Thank you for learning about raw milk. Click 'Restart' to begin again.";
    document.getElementById('skip-button').style.display = 'none';
}

// Event listeners
document.getElementById('start-button').addEventListener('click', startTour);

document.getElementById('skip-button').addEventListener('click', () => {
    if (currentChapter < chapters.length - 1) {
        advanceToNextChapter();
    }
});

document.getElementById('pause-btn').addEventListener('click', () => {
    isPaused = !isPaused;
    document.getElementById('pause-btn').textContent = isPaused ? '▶️ Resume' : '⏸️ Pause';
});

document.getElementById('restart-btn').addEventListener('click', () => {
    currentChapter = 0;
    tourStartTime = Date.now();
    isPaused = false;
    document.getElementById('pause-btn').textContent = '⏸️ Pause';
    document.getElementById('skip-button').style.display = 'block';
    updateChapterDisplay();
    transitionToChapter(0);
});

// Initialize the application
init();
