import * as THREE from 'three';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });

const renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat, stencilBuffer: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const borderGeometry = new THREE.EdgesGeometry(geometry);
const borderMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
const border = new THREE.LineSegments(borderGeometry, borderMaterial);
cube.add(border);

camera.position.z = 5;

const smallCubeGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
const neonMaterial = new THREE.MeshBasicMaterial({
    color: 0x037ffc,
    emissive: 0xffffff,
    emissiveIntensity: 1,
});

const smallCube = new THREE.Mesh(smallCubeGeometry, neonMaterial);
cube.add(smallCube);

const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
bloomPass.threshold = 0;
bloomPass.strength = 25;
bloomPass.radius = 1;

const composer = new EffectComposer(renderer, renderTarget);
const renderPass = new RenderPass(scene, camera);
renderPass.clearColor = new THREE.Color(0, 0, 0);
renderPass.clearAlpha = 0;
const fxaaPass = new ShaderPass( FXAAShader );
fxaaPass.uniforms.resolution.value.set(1 / window.innerWidth, 1 / window.innerHeight );
fxaaPass.renderToScreen = true;
fxaaPass.material.transparent = true;

composer.addPass(renderPass);
composer.addPass(bloomPass);
composer.addPass(fxaaPass);

const animate = () => {
    requestAnimationFrame(animate);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    
    smallCube.rotation.x -= 0.01; 

	renderer.render(scene, camera);
	renderer.clearDepth();
    composer.render();
};

animate();

window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	composer.setSize( window.innerWidth, window.innerHeight );
}, false);
