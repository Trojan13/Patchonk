import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import './style.css';

const canvasHost = document.querySelector('#gameCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x131221);
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(0, 0, 18);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
canvasHost.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 1.8));
const keyLight = new THREE.PointLight(0xff8eb4, 25, 30);
keyLight.position.set(-5, 6, 8);
scene.add(keyLight);
const fillLight = new THREE.PointLight(0x8c7dff, 18, 30);
fillLight.position.set(6, -2, 6);
scene.add(fillLight);

const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -6.8, 0) });
world.allowSleep = true;
const balls = [];
const visualBalls = [];
const boardGroup = new THREE.Group();
scene.add(boardGroup);

const colors = { pink: 0xff7ca9, violet: 0x9c83ff, cyan: 0x6de0dd, gold: 0xf2c879 };
const pegMaterial = new THREE.MeshStandardMaterial({ color: colors.gold, emissive: 0x5b3920, emissiveIntensity: 0.5, metalness: 0.25, roughness: 0.35 });
const edgeMaterial = new THREE.MeshStandardMaterial({ color: colors.violet, emissive: 0x271c67, emissiveIntensity: 0.8 });

function makeAnimeDisplay() {
  const art = document.createElement('canvas');
  art.width = 620;
  art.height = 300;
  const ctx = art.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 620, 300);
  gradient.addColorStop(0, '#241a50');
  gradient.addColorStop(0.5, '#713b77');
  gradient.addColorStop(1, '#1a6d88');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 620, 300);
  ctx.fillStyle = '#ffcb68';
  ctx.beginPath();
  ctx.arc(315, 145, 84, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#34204f';
  ctx.beginPath();
  ctx.moveTo(230, 120);
  ctx.quadraticCurveTo(270, 20, 365, 58);
  ctx.quadraticCurveTo(420, 100, 394, 160);
  ctx.lineTo(370, 102);
  ctx.lineTo(330, 125);
  ctx.lineTo(280, 100);
  ctx.lineTo(245, 160);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#241a50';
  for (const x of [278, 350]) {
    ctx.beginPath();
    ctx.ellipse(x, 150, 16, 25, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#ff7ca9';
  ctx.beginPath();
  ctx.arc(283, 152, 6, 0, Math.PI * 2);
  ctx.arc(355, 152, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#713b77';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(318, 175, 27, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('HIKARI!', 24, 45);
  ctx.font = '18px monospace';
  ctx.fillText('aim for the glow', 24, 273);
  const texture = new THREE.CanvasTexture(art);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 1.55),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.92 })
  );
  screen.position.set(0, 1.15, -0.28);
  boardGroup.add(screen);
  const screenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(3.42, 1.77, 0.12),
    new THREE.MeshStandardMaterial({ color: 0xd33968, emissive: 0x4e102b, emissiveIntensity: 0.65, metalness: 0.35 })
  );
  screenFrame.position.set(0, 1.15, -0.34);
  boardGroup.add(screenFrame);
  screen.position.z = -0.44;
}

makeAnimeDisplay();

function addStaticBody(shape, position, quaternion = new CANNON.Quaternion()) {
  const body = new CANNON.Body({ mass: 0, shape });
  body.position.set(...position);
  body.quaternion.copy(quaternion);
  world.addBody(body);
  return body;
}

function addPeg(x, y, isPinwheel = false) {
  const shape = new CANNON.Sphere(0.13);
  addStaticBody(shape, [x, y, 0]);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), pegMaterial);
  mesh.position.set(x, y, 0);
  boardGroup.add(mesh);
  if (isPinwheel) {
    mesh.userData.spin = (Math.random() > 0.5 ? 1 : -1) * 2.2;
    mesh.material = new THREE.MeshStandardMaterial({ color: colors.pink, emissive: 0x6f193f, emissiveIntensity: 0.5 });
  }
}

for (let row = 0; row < 8; row += 1) {
  for (let col = -4; col <= 4; col += 1) {
    const x = col * 0.88 + (row % 2 ? 0.44 : 0);
    const y = 3.2 - row * 0.72;
    addPeg(x, y, row === 2 && Math.abs(col) === 2);
  }
}

const wallShape = new CANNON.Box(new CANNON.Vec3(0.15, 4.7, 0.25));
addStaticBody(wallShape, [-4.7, -0.5, 0]);
addStaticBody(wallShape, [4.7, -0.5, 0]);
addStaticBody(new CANNON.Box(new CANNON.Vec3(4.7, 0.18, 0.25)), [0, -5.15, 0]);

const slotColors = [colors.pink, colors.violet, colors.cyan, colors.gold, colors.violet, colors.pink, colors.cyan];
for (let i = 0; i < 7; i += 1) {
  const x = -3.72 + i * 1.24;
  addStaticBody(new CANNON.Box(new CANNON.Vec3(0.045, 0.8, 0.2)), [x, -4.25, 0]);
  const slot = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.12, 0.18), new THREE.MeshStandardMaterial({ color: slotColors[i], emissive: slotColors[i], emissiveIntensity: 0.25 }));
  slot.position.set(x + 0.55, -4.95, 0);
  boardGroup.add(slot);
}

for (const x of [-4.7, 4.7]) {
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.25, 9.5, 0.35), edgeMaterial);
  rail.position.set(x, -0.45, 0);
  boardGroup.add(rail);
}

const target = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.06, 8, 24), new THREE.MeshStandardMaterial({ color: colors.pink, emissive: colors.pink, emissiveIntensity: 1.5 }));
target.position.set(1.2, 3.85, 0.1);
boardGroup.add(target);

let power = 62;
let angle = 0;
let score = 0;
let round = 1;
let combo = 0;
let attentionEvents = 0;
let running = true;
let elapsed = 0;
let lastTime = performance.now();
let targetIndex = 3;
const targetNames = ['Rosa ×2', 'Violett ×3', 'Cyan ×2', 'Gold ×4'];

function resize() {
  const rect = canvasHost.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

function dropBall() {
  if (!running || balls.length > 10) return;
  const body = new CANNON.Body({ mass: 0.7, shape: new CANNON.Sphere(0.18), linearDamping: 0.08, angularDamping: 0.1 });
  const launch = THREE.MathUtils.degToRad(angle);
  body.position.set(0, 4.55, 0);
  body.velocity.set(Math.sin(launch) * (power / 18), 0, 0);
  body.angularVelocity.set(0, 0, 2);
  world.addBody(body);
  balls.push(body);
  const visual = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), new THREE.MeshStandardMaterial({ color: colors.pink, emissive: 0x5c1737, emissiveIntensity: 0.65, metalness: 0.25 }));
  visual.position.copy(body.position);
  boardGroup.add(visual);
  visualBalls.push(visual);
  document.querySelector('#ballValue').textContent = String(Number(document.querySelector('#ballValue').textContent) + 1);
  document.querySelector('#sessionStatus').textContent = 'Kugel unterwegs';
  document.querySelector('#eventMessage').textContent = 'Bahn wird ausgewertet …';
}

function settleBall(index, body, visual) {
  const slot = Math.max(0, Math.min(6, Math.floor((body.position.x + 4.2) / 1.2)));
  const hit = slot === targetIndex;
  const points = hit ? [2, 3, 2, 4, 3, 2, 2][slot] : 1;
  score += points;
  combo = hit ? combo + 1 : 0;
  round = Math.min(5, 1 + Math.floor(score / 10));
  document.querySelector('#scoreValue').textContent = String(score);
  document.querySelector('#comboValue').textContent = String(combo);
  document.querySelector('#roundValue').textContent = String(round);
  document.querySelector('#runProgress').style.width = `${round * 20}%`;
  document.querySelector('#runProgressLabel').textContent = `${round} / 5`;
  document.querySelector('#eventMessage').textContent = hit ? `Treffer! +${points} · stabile Bahn` : `Slot ${slot + 1} · +${points}`;
  if (hit) attentionEvents += 1;
  document.querySelector('#attentionEvents').textContent = String(attentionEvents);
  world.removeBody(body);
  boardGroup.remove(visual);
  balls.splice(index, 1);
  visualBalls.splice(index, 1);
  if (!balls.length) document.querySelector('#sessionStatus').textContent = 'Bereit';
}

function nextTarget() {
  targetIndex = (targetIndex + 1 + Math.floor(Math.random() * 3)) % 7;
  target.position.x = -3.72 + targetIndex * 1.24 + 0.55;
  document.querySelector('#targetLabel').textContent = `Ziel: ${targetNames[targetIndex % targetNames.length]}`;
}

function animate(now = performance.now()) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.033);
  lastTime = now;
  if (running) {
    world.step(1 / 60, dt, 3);
    elapsed += dt;
    for (let i = balls.length - 1; i >= 0; i -= 1) {
      const body = balls[i];
      const visual = visualBalls[i];
      visual.position.copy(body.position);
      visual.quaternion.copy(body.quaternion);
      if (body.position.y < -5.3) settleBall(i, body, visual);
    }
    boardGroup.children.forEach((child) => {
      if (child.userData.spin) child.rotation.z += dt * child.userData.spin;
    });
  }
  target.rotation.z += dt * 0.8;
  renderer.render(scene, camera);
}
animate();

function setValue(selector, callback) {
  document.querySelector(selector).addEventListener('input', (event) => callback(Number(event.target.value)));
}
setValue('#powerSlider', (value) => { power = value; document.querySelector('#powerValue').textContent = String(value); });
setValue('#angleSlider', (value) => { angle = value; document.querySelector('#angleValue').textContent = String(value); });
document.querySelector('#dropButton').addEventListener('click', dropBall);
document.querySelector('#pauseButton').addEventListener('click', (event) => {
  running = !running;
  event.currentTarget.textContent = running ? 'Pause' : 'Fortsetzen';
  document.querySelector('#sessionStatus').textContent = running ? 'Bereit' : 'Pausiert';
});
document.querySelector('#endSessionButton').addEventListener('click', () => {
  running = false;
  document.querySelector('#pauseButton').textContent = 'Fortsetzen';
  document.querySelector('#sessionStatus').textContent = 'Session beendet';
  document.querySelector('#eventMessage').textContent = 'Session pausiert – Daten bleiben lokal in diesem Prototyp.';
});
document.querySelector('#voiceButton').addEventListener('click', () => {
  const audio = new Audio('/audio/hana-encouragement.ogg');
  audio.play().catch(() => {
    document.querySelector('#eventMessage').textContent = 'Audio-Slot bereit: /public/audio/hana-encouragement.ogg';
  });
});
document.querySelector('#attentionToggle').addEventListener('click', (event) => {
  const enabled = event.currentTarget.classList.toggle('active');
  event.currentTarget.textContent = enabled ? 'AN' : 'AUS';
  event.currentTarget.setAttribute('aria-pressed', String(enabled));
  document.querySelector('#sideLaneState').textContent = enabled ? 'aktiv' : 'aus';
});
document.querySelectorAll('.media-action').forEach((button) => {
  button.addEventListener('click', () => {
    attentionEvents += 1;
    document.querySelector('#attentionEvents').textContent = String(attentionEvents);
    document.querySelector('#eventMessage').textContent = `${button.dataset.media === 'shorts' ? 'Clip' : 'Stream-Fenster'} markiert`;
  });
});
setInterval(() => {
  if (!running) return;
  const seconds = Math.floor(elapsed);
  document.querySelector('#sessionTimer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  if (seconds > 0 && seconds % 18 === 0) nextTarget();
}, 1000);
