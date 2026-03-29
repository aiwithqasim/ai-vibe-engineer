const statusEl = document.getElementById("status");
const playerHealthEl = document.getElementById("player-health");
const enemyHealthEl = document.getElementById("enemy-health");
const startBtn = document.getElementById("start-btn");
const winModalEl = document.getElementById("win-modal");
const playAgainBtn = document.getElementById("play-again-btn");

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);

const MAP_W = 16;
const MAP_H = 16;
const TILE = 1;
const FOV = Math.PI / 3;
const MAX_VIEW = 20;
const PLAYER_MOVE_SPEED = 3.6;
const PLAYER_ROT_SPEED = 2.2;
const PLAYER_SHOT_COOLDOWN = 0.25;
const PLAYER_DAMAGE = 20;
const ENEMY_SPEED = 2.4;
const ENEMY_SHOT_COOLDOWN = 1.1;
const ENEMY_DAMAGE = 12;
const ENEMY_RADIUS = 0.5;

const map = [
  "################",
  "#..............#",
  "#....##........#",
  "#..............#",
  "#......#.......#",
  "#..............#",
  "#...#......#...#",
  "#..............#",
  "#..............#",
  "#...#......#...#",
  "#..............#",
  "#.......#......#",
  "#..............#",
  "#........##....#",
  "#..............#",
  "################",
];

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

const player = {
  x: 2.5,
  y: 2.5,
  angle: 0,
  health: 100,
  shotTimer: 0,
};

const enemy = {
  x: 12.5,
  y: 12.5,
  angle: Math.PI,
  health: 100,
  shotTimer: 0,
  strafeDir: 1,
  strafeTimer: 0,
};

let running = false;
let lastTime = performance.now();

function showWinPopup() {
  winModalEl.classList.remove("hidden");
}

function hideWinPopup() {
  winModalEl.classList.add("hidden");
}

function setStatus(text) {
  statusEl.textContent = text;
}

function updateHud() {
  playerHealthEl.textContent = `Player HP: ${Math.max(0, Math.ceil(player.health))}`;
  enemyHealthEl.textContent = `Enemy HP: ${Math.max(0, Math.ceil(enemy.health))}`;
}

function inWall(x, y) {
  const gx = Math.floor(x);
  const gy = Math.floor(y);

  if (gx < 0 || gy < 0 || gx >= MAP_W || gy >= MAP_H) {
    return true;
  }

  return map[gy][gx] === "#";
}

function canMoveTo(x, y, radius) {
  return (
    !inWall(x - radius, y - radius) &&
    !inWall(x + radius, y - radius) &&
    !inWall(x - radius, y + radius) &&
    !inWall(x + radius, y + radius)
  );
}

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function raycastDistance(ox, oy, angle, maxDist) {
  const step = 0.02;
  let d = 0;

  while (d < maxDist) {
    const x = ox + Math.cos(angle) * d;
    const y = oy + Math.sin(angle) * d;
    if (inWall(x, y)) {
      return d;
    }
    d += step;
  }

  return maxDist;
}

function lineOfSight(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.floor(dist / 0.04));

  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    if (inWall(ax + dx * t, ay + dy * t)) {
      return false;
    }
  }

  return true;
}

function normalizeAngle(a) {
  while (a < -Math.PI) a += Math.PI * 2;
  while (a > Math.PI) a -= Math.PI * 2;
  return a;
}

function startMatch() {
  hideWinPopup();

  player.x = 2.5;
  player.y = 8;
  player.angle = 0;
  player.health = 100;
  player.shotTimer = 0;

  enemy.x = 13.2;
  enemy.y = 8;
  enemy.angle = Math.PI;
  enemy.health = 100;
  enemy.shotTimer = 0;
  enemy.strafeDir = Math.random() > 0.5 ? 1 : -1;
  enemy.strafeTimer = 0.8 + Math.random() * 0.9;

  running = true;
  startBtn.textContent = "Restart Match";
  updateHud();
  setStatus("Fight! Arrow keys move/turn. Space shoots.");
}

function firePlayer() {
  if (!running || player.shotTimer > 0) return;

  player.shotTimer = PLAYER_SHOT_COOLDOWN;

  const target = getEnemyViewData();
  if (!target) {
    setStatus("Miss.");
    return;
  }

  const angularHitRadius = Math.atan2(ENEMY_RADIUS, Math.max(target.enemyDist, 0.1));
  if (Math.abs(target.enemyAngle) <= angularHitRadius) {
    enemy.health -= PLAYER_DAMAGE;
    updateHud();

    if (enemy.health <= 0) {
      enemy.health = 0;
      running = false;
      updateHud();
      setStatus("Enemy defeated! Press Start or Enter to play again.");
      showWinPopup();
    } else {
      setStatus("Direct hit!");
    }
  } else {
    setStatus("Miss.");
  }
}

function getEnemyViewData() {
  if (enemy.health <= 0) {
    return null;
  }

  const ex = enemy.x - player.x;
  const ey = enemy.y - player.y;
  const enemyDist = Math.hypot(ex, ey);
  const enemyAngle = normalizeAngle(Math.atan2(ey, ex) - player.angle);

  if (Math.abs(enemyAngle) >= FOV / 2) {
    return null;
  }

  if (!lineOfSight(player.x, player.y, enemy.x, enemy.y)) {
    return null;
  }

  const wallAtEnemyAngle = raycastDistance(player.x, player.y, player.angle + enemyAngle, MAX_VIEW);
  if (enemyDist >= wallAtEnemyAngle) {
    return null;
  }

  return { enemyDist, enemyAngle };
}

function updatePlayer(dt) {
  if (keys.ArrowLeft) player.angle -= PLAYER_ROT_SPEED * dt;
  if (keys.ArrowRight) player.angle += PLAYER_ROT_SPEED * dt;

  let move = 0;
  if (keys.ArrowUp) move += 1;
  if (keys.ArrowDown) move -= 1;

  if (move !== 0) {
    const nx = player.x + Math.cos(player.angle) * move * PLAYER_MOVE_SPEED * dt;
    const ny = player.y + Math.sin(player.angle) * move * PLAYER_MOVE_SPEED * dt;

    if (canMoveTo(nx, player.y, 0.2)) player.x = nx;
    if (canMoveTo(player.x, ny, 0.2)) player.y = ny;
  }

  player.shotTimer = Math.max(0, player.shotTimer - dt);
}

function updateEnemy(dt) {
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy);

  const toPlayer = Math.atan2(dy, dx);
  const angleDelta = normalizeAngle(toPlayer - enemy.angle);
  enemy.angle += angleDelta * Math.min(1, dt * 5);

  enemy.strafeTimer -= dt;
  if (enemy.strafeTimer <= 0) {
    enemy.strafeDir = Math.random() > 0.5 ? 1 : -1;
    enemy.strafeTimer = 0.7 + Math.random() * 1.3;
  }

  const forwardX = Math.cos(enemy.angle);
  const forwardY = Math.sin(enemy.angle);
  const rightX = Math.cos(enemy.angle + Math.PI / 2);
  const rightY = Math.sin(enemy.angle + Math.PI / 2);

  // Keep a comfortable combat distance instead of charging directly.
  const preferredRange = 5.5;
  const approach = dist > preferredRange + 0.9 ? 1 : dist < preferredRange - 0.9 ? -0.7 : 0;
  const strafe = dist < 10 ? enemy.strafeDir * 0.95 : enemy.strafeDir * 0.45;

  const moveX = forwardX * approach + rightX * strafe;
  const moveY = forwardY * approach + rightY * strafe;
  const mag = Math.hypot(moveX, moveY) || 1;
  const dirX = moveX / mag;
  const dirY = moveY / mag;

  const nx = enemy.x + dirX * ENEMY_SPEED * dt;
  const ny = enemy.y + dirY * ENEMY_SPEED * dt;

  if (canMoveTo(nx, enemy.y, 0.24)) {
    enemy.x = nx;
  } else {
    enemy.strafeDir *= -1;
  }
  if (canMoveTo(enemy.x, ny, 0.24)) {
    enemy.y = ny;
  } else {
    enemy.strafeDir *= -1;
  }

  enemy.shotTimer = Math.max(0, enemy.shotTimer - dt);

  if (enemy.shotTimer <= 0 && dist < 12 && lineOfSight(enemy.x, enemy.y, player.x, player.y)) {
    enemy.shotTimer = ENEMY_SHOT_COOLDOWN;
    player.health -= ENEMY_DAMAGE;
    updateHud();

    if (player.health <= 0) {
      player.health = 0;
      running = false;
      updateHud();
      setStatus("You lost. Press Start or Enter to restart.");
    } else {
      setStatus("Enemy hit you!");
    }
  }
}

function render3D() {
  const w = canvas.width;
  const h = canvas.height;

  ctx.fillStyle = "#101a2a";
  ctx.fillRect(0, 0, w, h / 2);
  ctx.fillStyle = "#1f2433";
  ctx.fillRect(0, h / 2, w, h / 2);

  for (let x = 0; x < w; x += 1) {
    const camX = (x / w - 0.5) * FOV;
    const rayAngle = player.angle + camX;
    const d = raycastDistance(player.x, player.y, rayAngle, MAX_VIEW);
    const corrected = d * Math.cos(camX);
    const wallH = Math.min(h, h / Math.max(corrected, 0.001));

    const shade = Math.max(20, 200 - corrected * 15);
    ctx.fillStyle = `rgb(${shade}, ${shade + 10}, ${shade + 30})`;
    ctx.fillRect(x, (h - wallH) / 2, 1, wallH);
  }

  const target = getEnemyViewData();
  if (target) {
    const screenX = ((target.enemyAngle / FOV) + 0.5) * w;
    const size = Math.min(h * 0.82, h / Math.max(target.enemyDist, 0.3));
    const baseY = h * 0.5 + size * 0.48;
    const bob = Math.sin(performance.now() * 0.01) * Math.max(1, 12 / Math.max(target.enemyDist, 1));

    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(screenX, baseY + 6, size * 0.2, size * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = "#1f2c49";
    ctx.fillRect(screenX - size * 0.13, baseY - size * 0.28 + bob, size * 0.09, size * 0.3);
    ctx.fillRect(screenX + size * 0.04, baseY - size * 0.28 + bob, size * 0.09, size * 0.3);

    // Torso
    ctx.fillStyle = "#c3475b";
    ctx.fillRect(screenX - size * 0.2, baseY - size * 0.68 + bob, size * 0.4, size * 0.42);

    // Arms and weapon
    ctx.fillStyle = "#a43a4b";
    ctx.fillRect(screenX - size * 0.3, baseY - size * 0.62 + bob, size * 0.1, size * 0.24);
    ctx.fillRect(screenX + size * 0.2, baseY - size * 0.62 + bob, size * 0.1, size * 0.24);
    ctx.fillStyle = "#2e323a";
    ctx.fillRect(screenX + size * 0.22, baseY - size * 0.55 + bob, size * 0.2, size * 0.08);

    // Head
    ctx.fillStyle = "#f6c6b4";
    ctx.beginPath();
    ctx.arc(screenX, baseY - size * 0.82 + bob, size * 0.12, 0, Math.PI * 2);
    ctx.fill();

    // Enemy health bar
    const hpRatio = Math.max(0, enemy.health / 100);
    const barW = size * 0.48;
    const barH = Math.max(4, size * 0.03);
    const barX = screenX - barW / 2;
    const barY = baseY - size * 1.02 + bob;
    ctx.fillStyle = "rgba(20, 20, 20, 0.8)";
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = "#35e06b";
    ctx.fillRect(barX, barY, barW * hpRatio, barH);
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  if (running) {
    updatePlayer(dt);
    if (enemy.health > 0) {
      updateEnemy(dt);
    }
  }

  render3D();
  requestAnimationFrame(loop);
}

function handleKey(event, down) {
  if (event.code === "Enter" && down) {
    event.preventDefault();
    startMatch();
    return;
  }

  if (!(event.code in keys)) return;
  event.preventDefault();
  keys[event.code] = down;

  if (event.code === "Space" && down) {
    firePlayer();
  }
}

window.addEventListener("keydown", (e) => handleKey(e, true));
window.addEventListener("keyup", (e) => handleKey(e, false));
window.addEventListener("resize", resize);
startBtn.addEventListener("click", startMatch);
playAgainBtn.addEventListener("click", startMatch);

resize();
updateHud();
setStatus("Press Start Match or Enter to begin.");
requestAnimationFrame(loop);