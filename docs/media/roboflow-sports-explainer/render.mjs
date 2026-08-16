#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const WIDTH = 1920;
const HEIGHT = 1080;
const RENDER_FPS = 15;
const OUTPUT_FPS = 30;
const AUDIO_FADE_SECONDS = 0.8;
const FONT = "PingFang SC, Noto Sans CJK SC, Helvetica Neue, Arial, sans-serif";
const MONO = "SFMono-Regular, Menlo, Consolas, monospace";
const outputDir = dirname(fileURLToPath(import.meta.url));

const scenes = [
  { id: "hook", duration: 4.8, voice: "一段普通比赛视频，能不能直接变成可以分析的运动数据？" },
  { id: "intro", duration: 5.4, voice: "Roboflow Sports 是一个开源体育计算机视觉工具库，目前从足球场景入手。" },
  { id: "pipeline", duration: 6.4, voice: "它把目标检测、跨帧跟踪、队伍分类和球场透视映射，串成一条可复用流程。" },
  { id: "tracking", duration: 5.0, voice: "先追踪球员与足球的方向，并尽量保留跨帧身份。" },
  { id: "projection", duration: 5.2, voice: "再把画面坐标投影到真实球场，形成可分析的俯视视角。" },
  { id: "metrics", duration: 5.4, voice: "在此基础上估算速度，累计跑动距离，并复盘阵型与空间。" },
  { id: "uses", duration: 4.8, voice: "它适合教练复盘、分析原型，以及体育计算机视觉研究。" },
  { id: "cta", duration: 6.0, voice: "从源码安装即可开始。代码采用 MIT 许可，模型与依赖请分别核对许可证。" },
];

const starts = [];
let totalDuration = 0;
for (const scene of scenes) {
  starts.push(totalDuration);
  totalDuration += scene.duration;
}

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};
const lerp = (from, to, value) => from + (to - from) * value;
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const txt = (value, x, y, size, fill = "#f4fff8", weight = 600, anchor = "start", opacity = 1, family = FONT) =>
  `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" opacity="${opacity}">${esc(value)}</text>`;

const defs = `
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#06110e"/><stop offset="1" stop-color="#0b2119"/></linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#7dff9b"/><stop offset="1" stop-color="#d7ff6a"/></linearGradient>
    <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse"><path d="M72 0H0V72" fill="none" stroke="#8cffad" stroke-opacity=".055"/></pattern>
    <filter id="shadow"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".38"/></filter>
    <filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#d7ff6a"/></marker>
  </defs>`;

const background = (index) => `
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#grid)"/>
  <circle cx="1660" cy="160" r="370" fill="#36ff89" opacity=".055"/>
  <circle cx="160" cy="940" r="300" fill="#d7ff6a" opacity=".035"/>
  ${txt("AWESOME SPORTS AI  /  PRODUCT EXPLAINER", 92, 72, 22, "#9cc8ad", 700, "start", 1, MONO)}
  ${txt(String(index + 1).padStart(2, "0") + " / " + String(scenes.length).padStart(2, "0"), 1828, 72, 22, "#9cc8ad", 700, "end", 1, MONO)}`;

const subtitle = (line) => `
  <rect x="250" y="948" width="1420" height="84" rx="30" fill="#03100c" fill-opacity=".86" stroke="#98ffaf" stroke-opacity=".18"/>
  ${txt(line, 960, 1004, 36, "#f7fff9", 600, "middle")}`;

const teamA = [[.14,.18],[.27,.29],[.42,.16],[.57,.31],[.72,.18],[.84,.36],[.22,.58],[.43,.63],[.66,.55],[.82,.72]];
const teamB = [[.16,.78],[.31,.68],[.47,.82],[.62,.69],[.77,.84],[.88,.61],[.18,.43],[.38,.44],[.59,.45],[.76,.42]];

function pitch(x, y, w, h, t, { labels = false, arrows = false, radar = false } = {}) {
  const players = [];
  const drawTeam = (points, color, prefix, phase) => points.forEach(([bx, by], i) => {
    const px = x + (bx + Math.sin(t * .72 + i * 1.21 + phase) * .025) * w;
    const py = y + (by + Math.cos(t * .61 + i * .93 + phase) * .035) * h;
    if (arrows && i < 6) {
      const dx = 38 + 24 * Math.sin(t + i);
      const dy = -20 + 35 * Math.cos(t * .8 + i);
      players.push(`<line x1="${px}" y1="${py}" x2="${px + dx}" y2="${py + dy}" stroke="#d7ff6a" stroke-width="4" opacity=".78" marker-end="url(#arrow)"/>`);
    }
    players.push(`<circle cx="${px}" cy="${py}" r="${radar ? 9 : 13}" fill="${color}" stroke="#f8fff9" stroke-width="3" filter="url(#glow)"/>`);
    if (labels && i < 6) players.push(txt(`${prefix}${String(i + 1).padStart(2, "0")}`, px + 17, py - 15, 18, "#ffffff", 750, "start", 1, MONO));
  });
  drawTeam(teamA, "#4ab6ff", "B", 0);
  drawTeam(teamB, "#ff5f79", "R", 2.1);
  const ballX = x + (.5 + Math.sin(t * 1.15) * .23) * w;
  const ballY = y + (.5 + Math.cos(t * .91) * .2) * h;
  players.push(`<circle cx="${ballX}" cy="${ballY}" r="8" fill="#ffffff" stroke="#d7ff6a" stroke-width="5"/>`);
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radar ? 16 : 26}" fill="#125c39" stroke="#baffc7" stroke-opacity=".7" stroke-width="4"/>
      <path d="M${x + w / 2} ${y}V${y + h} M${x} ${y + h * .16}H${x + w * .17}V${y + h * .84}H${x} M${x + w} ${y + h * .16}H${x + w * .83}V${y + h * .84}H${x + w}" fill="none" stroke="#effff2" stroke-opacity=".72" stroke-width="4"/>
      <circle cx="${x + w / 2}" cy="${y + h / 2}" r="${h * .14}" fill="none" stroke="#effff2" stroke-opacity=".72" stroke-width="4"/>
      ${players.join("")}
    </g>`;
}

function sceneHook(t, d, index) {
  const enter = ease((t - .15) / .85);
  const scanY = 235 + (t / d) * 560;
  return `${background(index)}
    <g transform="translate(${lerp(-90, 0, enter)} 0)" opacity="${enter}">
      ${txt("比赛视频", 110, 360, 112, "#ffffff", 820)}
      ${txt("能变成什么数据？", 110, 490, 92, "url(#accent)", 820)}
      ${txt("Roboflow Sports · 43 秒产品讲解", 118, 575, 30, "#a9cdb5", 600)}
    </g>
    <g filter="url(#shadow)">
      <rect x="1080" y="168" width="710" height="650" rx="38" fill="#071a13" stroke="#78ff9a" stroke-opacity=".38" stroke-width="3"/>
      ${pitch(1120, 215, 630, 540, t, { labels: true, arrows: true })}
      <rect x="1120" y="${scanY}" width="630" height="5" fill="#d7ff6a" opacity=".85" filter="url(#glow)"/>
      ${txt("LIVE VISION PIPELINE", 1150, 795, 20, "#9cc8ad", 700, "start", 1, MONO)}
    </g>${subtitle(scenes[index].voice)}`;
}

function sceneIntro(t, d, index) {
  const enter = ease((t - .1) / .75);
  const rows = ["sports/common/ball.py", "sports/common/team.py", "sports/common/view.py", "examples/soccer/main.py"];
  return `${background(index)}
    <g transform="translate(${lerp(-70, 0, enter)} 0)" opacity="${enter}">
      ${txt("roboflow/sports", 105, 305, 92, "#ffffff", 830)}
      ${txt("开源体育计算机视觉工具库", 112, 392, 42, "#9cffb1", 680)}
      <g transform="translate(110 470)">
        <rect width="178" height="64" rx="32" fill="#173d2d" stroke="#6cff93" stroke-opacity=".5"/>${txt("MIT", 89, 43, 25, "#d7ff6a", 800, "middle", 1, MONO)}
        <rect x="198" width="250" height="64" rx="32" fill="#173d2d" stroke="#6cff93" stroke-opacity=".5"/>${txt("Python ≥ 3.8", 323, 43, 25, "#d7ff6a", 800, "middle", 1, MONO)}
        <rect x="468" width="300" height="64" rx="32" fill="#173d2d" stroke="#6cff93" stroke-opacity=".5"/>${txt("Install from source", 618, 43, 23, "#d7ff6a", 750, "middle", 1, MONO)}
      </g>
      ${txt("从足球检测与分析场景开始，组件可复用到更多运动视觉工作流。", 112, 650, 32, "#bed3c5", 500)}
    </g>
    <g transform="translate(1120 188)" filter="url(#shadow)">
      <rect width="675" height="620" rx="36" fill="#071812" stroke="#82ffa2" stroke-opacity=".35" stroke-width="3"/>
      <circle cx="42" cy="40" r="8" fill="#ff6b78"/><circle cx="69" cy="40" r="8" fill="#ffd66b"/><circle cx="96" cy="40" r="8" fill="#72ff91"/>
      ${txt("repository tree", 335, 49, 21, "#89b69a", 700, "middle", 1, MONO)}
      ${rows.map((row, i) => {
        const rowEnter = ease((t - .55 - i * .28) / .55);
        return `<g opacity="${rowEnter}" transform="translate(${lerp(30, 0, rowEnter)} 0)"><rect x="38" y="${105 + i * 105}" width="599" height="78" rx="18" fill="#0d2a1f" stroke="#66ff8d" stroke-opacity=".14"/>${txt("▸", 70, 155 + i * 105, 28, "#d7ff6a", 800, "start", 1, MONO)}${txt(row, 112, 153 + i * 105, 24, "#eaffee", 600, "start", 1, MONO)}</g>`;
      }).join("")}
    </g>${subtitle(scenes[index].voice)}`;
}

function scenePipeline(t, d, index) {
  const labels = [["视频输入", "VIDEO"], ["目标检测", "DETECT"], ["跨帧跟踪", "TRACK"], ["队伍分类", "TEAM"], ["球场投影", "MAP"]];
  const progress = clamp((t - .6) / (d - 1.2));
  return `${background(index)}
    ${txt("一条可复用的视觉分析流水线", 960, 245, 72, "#ffffff", 820, "middle")}
    ${txt("从像素到可解释的运动数据", 960, 315, 32, "#9fcbb0", 600, "middle")}
    <line x1="232" y1="535" x2="1688" y2="535" stroke="#315d48" stroke-width="12" stroke-linecap="round"/>
    <line x1="232" y1="535" x2="${232 + 1456 * progress}" y2="535" stroke="url(#accent)" stroke-width="12" stroke-linecap="round" filter="url(#glow)"/>
    ${labels.map(([cn, en], i) => {
      const x = 90 + i * 356;
      const active = ease((progress * 5 - i) * 1.8);
      return `<g transform="translate(${x} 410)" filter="url(#shadow)"><rect width="284" height="250" rx="34" fill="${active > .05 ? "#123b29" : "#0a1c15"}" stroke="#8bffa4" stroke-opacity="${.18 + active * .7}" stroke-width="3"/><circle cx="142" cy="42" r="11" fill="${active > .05 ? "#d7ff6a" : "#365a44"}"/>${txt(cn, 142, 130, 34, "#ffffff", 760, "middle")}${txt(en, 142, 178, 21, "#9cc8ad", 750, "middle", 1, MONO)}${txt(String(i + 1).padStart(2, "0"), 142, 224, 19, "#60866e", 700, "middle", 1, MONO)}</g>`;
    }).join("")}
    ${txt("Detection  →  Tracking  →  Classification  →  Homography", 960, 770, 25, "#d7ff6a", 700, "middle", 1, MONO)}
    ${subtitle(scenes[index].voice)}`;
}

function sceneTracking(t, d, index) {
  return `${background(index)}
    <g transform="translate(85 135)" filter="url(#shadow)"><rect width="1160" height="735" rx="34" fill="#071811" stroke="#7dff9b" stroke-opacity=".28" stroke-width="3"/>${pitch(40, 42, 1080, 650, t, { labels: true, arrows: true })}</g>
    <g transform="translate(1325 210)">
      ${txt("方向", 0, 0, 86, "#ffffff", 840)}
      ${txt("DIRECTION", 4, 54, 24, "#d7ff6a", 800, "start", 1, MONO)}
      <line x1="0" y1="96" x2="430" y2="96" stroke="#6eff93" stroke-opacity=".35"/>
      ${txt("球员与足球", 0, 180, 36, "#c9e0d0", 640)}
      ${txt("保留跨帧身份", 0, 250, 36, "#c9e0d0", 640)}
      ${txt("输出运动路径", 0, 320, 36, "#c9e0d0", 640)}
      <rect x="0" y="390" width="420" height="154" rx="26" fill="#102d21" stroke="#7dff9b" stroke-opacity=".25"/>
      ${txt("TRACK ID", 32, 438, 20, "#91bca0", 700, "start", 1, MONO)}
      ${txt("B04  →  B04", 32, 500, 34, "#ffffff", 800, "start", 1, MONO)}
    </g>${subtitle(scenes[index].voice)}`;
}

function sceneProjection(t, d, index) {
  const p = ease((t - .4) / 2.2);
  const sourceX = 280 + Math.sin(t * 1.1) * 150;
  const sourceY = 520 + Math.cos(t * .9) * 120;
  const targetX = 1390 + Math.sin(t * 1.1) * 180;
  const targetY = 500 + Math.cos(t * .9) * 170;
  return `${background(index)}
    ${txt("球场映射", 100, 190, 72, "#ffffff", 830)}${txt("HOMOGRAPHY", 105, 242, 23, "#d7ff6a", 800, "start", 1, MONO)}
    <g filter="url(#shadow)">
      <path d="M120 825H900L755 285H270Z" fill="#164f35" stroke="#8affaa" stroke-opacity=".5" stroke-width="4"/>
      <path d="M510 825V285 M205 620H846 M315 455H800" fill="none" stroke="#f0fff3" stroke-opacity=".45" stroke-width="4"/>
      <circle cx="${sourceX}" cy="${sourceY}" r="17" fill="#ff5f79" stroke="#fff" stroke-width="4"/>
      <circle cx="${610 + Math.cos(t) * 120}" cy="${430 + Math.sin(t * .8) * 90}" r="17" fill="#4ab6ff" stroke="#fff" stroke-width="4"/>
    </g>
    <path d="M${sourceX + 20} ${sourceY} C900 ${sourceY - 80}, 980 ${targetY - 50}, ${targetX - 10} ${targetY}" fill="none" stroke="#d7ff6a" stroke-width="5" stroke-dasharray="12 14" opacity="${p}" marker-end="url(#arrow)"/>
    <g filter="url(#shadow)">${pitch(1060, 255, 720, 610, t, { labels: true, radar: true })}</g>
    <circle cx="${targetX}" cy="${targetY}" r="15" fill="#ff5f79" stroke="#fff" stroke-width="4" opacity="${p}"/>
    ${txt("画面坐标", 510, 885, 26, "#9cc8ad", 650, "middle")}${txt("标准球场坐标", 1420, 912, 26, "#9cc8ad", 650, "middle")}
    ${subtitle(scenes[index].voice)}`;
}

function sceneMetrics(t, d, index) {
  const rows = [["B04", 24.8, 684], ["R07", 21.3, 642], ["B09", 19.6, 618], ["R03", 18.1, 591]];
  return `${background(index)}
    <g transform="translate(72 132)" filter="url(#shadow)">${pitch(0, 0, 1160, 760, t, { labels: true, radar: true })}</g>
    <g transform="translate(1290 138)" filter="url(#shadow)">
      <rect width="555" height="755" rx="34" fill="#071a13" stroke="#7dff9b" stroke-opacity=".35" stroke-width="3"/>
      ${txt("速度 & 距离", 42, 84, 50, "#ffffff", 820)}${txt("SPEED / DISTANCE", 44, 126, 20, "#d7ff6a", 800, "start", 1, MONO)}
      ${rows.map(([id, speed, distance], i) => {
        const pulse = Math.sin(t * 1.25 + i) * .7;
        return `<g transform="translate(36 ${180 + i * 124})"><rect width="483" height="96" rx="22" fill="#102d21" stroke="#6eff93" stroke-opacity=".15"/>${txt(id, 28, 59, 26, "#ffffff", 800, "start", 1, MONO)}${txt((speed + pulse).toFixed(1) + " km/h", 214, 48, 26, "#d7ff6a", 800, "middle", 1, MONO)}${txt(Math.round(distance + t * (6 + i)) + " m", 449, 59, 26, "#b9d4c1", 750, "end", 1, MONO)}</g>`;
      }).join("")}
      ${txt("从运动轨迹生成可读指标", 277, 708, 27, "#a9cdb5", 600, "middle")}
    </g>${subtitle(scenes[index].voice)}`;
}

function sceneUses(t, d, index) {
  const cards = [["教练复盘", "COACH REVIEW", "把轨迹与空间变化变成可讨论画面"], ["分析原型", "ANALYTICS PROTOTYPE", "快速验证跟踪、速度与距离工作流"], ["视觉研究", "CV RESEARCH", "测试小球、遮挡与相机运动等难题"]];
  return `${background(index)}
    ${txt("谁会用到它？", 960, 245, 78, "#ffffff", 830, "middle")}
    ${txt("开放组件 + 示例工作流 + 可复用数据集入口", 960, 315, 31, "#9cc8ad", 600, "middle")}
    ${cards.map(([title, en, body], i) => {
      const cardEnter = ease((t - .25 - i * .35) / .7);
      const x = 105 + i * 585;
      return `<g transform="translate(${x} ${lerp(500, 425, cardEnter)})" opacity="${cardEnter}" filter="url(#shadow)"><rect width="525" height="350" rx="38" fill="#0a2118" stroke="#7dff9b" stroke-opacity="${.22 + i * .07}" stroke-width="3"/><rect x="34" y="36" width="78" height="12" rx="6" fill="url(#accent)"/>${txt(title, 36, 150, 48, "#ffffff", 800)}${txt(en, 38, 199, 19, "#d7ff6a", 800, "start", 1, MONO)}${txt(body, 38, 270, 25, "#b9d4c1", 520)}</g>`;
    }).join("")}
    ${subtitle(scenes[index].voice)}`;
}

function sceneCta(t, d, index) {
  const command = "pip install git+https://github.com/roboflow/sports.git";
  const typed = command.slice(0, Math.floor(clamp((t - 1.25) / 2.8) * command.length));
  return `${background(index)}
    ${txt("从源码开始", 960, 250, 88, "#ffffff", 840, "middle")}
    ${txt("github.com/roboflow/sports", 960, 325, 31, "#9cffb1", 680, "middle", 1, MONO)}
    <g transform="translate(245 405)" filter="url(#shadow)">
      <rect width="1430" height="270" rx="34" fill="#04100c" stroke="#7dff9b" stroke-opacity=".4" stroke-width="3"/>
      <circle cx="43" cy="38" r="8" fill="#ff6b78"/><circle cx="70" cy="38" r="8" fill="#ffd66b"/><circle cx="97" cy="38" r="8" fill="#72ff91"/>
      ${txt("$", 48, 150, 34, "#d7ff6a", 800, "start", 1, MONO)}${txt(typed + (Math.floor(t * 2) % 2 ? "▋" : ""), 96, 150, 31, "#f4fff8", 600, "start", 1, MONO)}
    </g>
    <g transform="translate(420 735)"><rect width="1080" height="92" rx="32" fill="#143426" stroke="#7dff9b" stroke-opacity=".28"/>${txt("代码：MIT   ·   模型与依赖：请分别核对许可证", 540, 59, 29, "#d8ede0", 650, "middle")}</g>
    ${txt("官方演示：github.com/roboflow/sports#-demos", 960, 894, 23, "#87ad95", 600, "middle", 1, MONO)}
    ${subtitle(scenes[index].voice)}`;
}

const renderers = { sceneHook, sceneIntro, scenePipeline, sceneTracking, sceneProjection, sceneMetrics, sceneUses, sceneCta };

function renderFrame(time) {
  let index = scenes.findIndex((scene, i) => time < starts[i] + scene.duration);
  if (index === -1) index = scenes.length - 1;
  const localTime = clamp(time - starts[index], 0, scenes[index].duration);
  const current = renderers[`scene${scenes[index].id[0].toUpperCase()}${scenes[index].id.slice(1)}`](localTime, scenes[index].duration, index);
  const fade = index > 0 ? ease(localTime / .45) : 1;
  let content = `<g opacity="${fade}">${current}</g>`;
  if (index > 0 && fade < 1) {
    const previous = scenes[index - 1];
    const previousFrame = renderers[`scene${previous.id[0].toUpperCase()}${previous.id.slice(1)}`](previous.duration, previous.duration, index - 1);
    content = `<g opacity="${1 - fade}">${previousFrame}</g>${content}`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">${defs}${content}</svg>`.replace(/[ \t]+$/gm, "");
}

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${command} failed with exit code ${result.status}`);
};
const hasCommand = (command) => spawnSync("/usr/bin/env", ["which", command], { stdio: "ignore" }).status === 0;
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const chromePath = () => {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
};

async function connectCdp(webSocketUrl) {
  return await new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    const pending = new Map();
    let nextId = 1;
    socket.addEventListener("error", reject, { once: true });
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(typeof event.data === "string" ? event.data : Buffer.from(event.data).toString());
      if (!message.id || !pending.has(message.id)) return;
      const { resolve: done, reject: fail } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) fail(new Error(message.error.message));
      else done(message.result);
    });
    socket.addEventListener("open", () => resolve({
      close: () => socket.close(),
      send: (method, params = {}) => new Promise((done, fail) => {
        const id = nextId;
        nextId += 1;
        pending.set(id, { resolve: done, reject: fail });
        socket.send(JSON.stringify({ id, method, params }));
      }),
    }), { once: true });
  });
}

async function renderPngFrames(framesDir, tempRoot) {
  const executable = chromePath();
  if (!executable) throw new Error("Google Chrome or Chromium is required to render vector frames");
  const port = 39000 + Math.floor(Math.random() * 8000);
  const chrome = spawn(executable, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${join(tempRoot, "chrome-profile")}`,
    "about:blank",
  ], { stdio: "ignore" });

  let cdp;
  try {
    let ready = false;
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`);
        ready = response.ok;
        if (ready) break;
      } catch {}
      await wait(100);
    }
    if (!ready) throw new Error("Chrome DevTools endpoint did not become ready");
    const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
    const target = await targetResponse.json();
    cdp = await connectCdp(target.webSocketDebuggerUrl);
    await cdp.send("Page.enable");
    await cdp.send("Runtime.enable");
    await cdp.send("Emulation.setDeviceMetricsOverride", { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false });
    await cdp.send("Runtime.evaluate", {
      expression: `document.documentElement.style.cssText='margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#06110e';document.body.style.cssText='margin:0;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden';document.body.innerHTML='<img id="frame" width="${WIDTH}" height="${HEIGHT}" style="display:block">'`,
    });

    const frameCount = Math.ceil(totalDuration * RENDER_FPS);
    for (let frame = 0; frame < frameCount; frame += 1) {
      const svg = renderFrame(frame / RENDER_FPS);
      const source = Buffer.from(svg).toString("base64");
      await cdp.send("Runtime.evaluate", {
        expression: `new Promise(async(resolve,reject)=>{const image=document.getElementById('frame');image.src='data:image/svg+xml;base64,${source}';try{await image.decode();requestAnimationFrame(()=>resolve(true));}catch(error){reject(error.message);}})`,
        awaitPromise: true,
      });
      const screenshot = await cdp.send("Page.captureScreenshot", {
        format: "png",
        captureBeyondViewport: false,
        fromSurface: true,
        clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT, scale: 1 },
      });
      writeFileSync(join(framesDir, `frame-${String(frame).padStart(5, "0")}.png`), Buffer.from(screenshot.data, "base64"));
      if (frame % 90 === 0) process.stdout.write(`Rendered ${frame}/${frameCount} PNG frames\n`);
    }
  } finally {
    cdp?.close();
    chrome.kill("SIGTERM");
  }
}

const srtTime = (seconds) => {
  const ms = Math.round(seconds * 1000);
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const secs = Math.floor((ms % 60_000) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms % 1000).padStart(3, "0")}`;
};

function buildAudioFilter(voiceCount = scenes.length) {
  const audioFilters = Array.from({ length: voiceCount }, (_, index) => {
    const delay = Math.round((starts[index] + .28) * 1000);
    return `[${index + 1}:a]adelay=${delay}|${delay},volume=1.0[v${index}]`;
  });
  const voices = Array.from({ length: voiceCount }, (_, index) => `[v${index}]`).join("");
  return `${audioFilters.join(";")};${voices}amix=inputs=${voiceCount}:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=9,apad,afade=t=out:st=${(totalDuration - AUDIO_FADE_SECONDS).toFixed(2)}:d=${AUDIO_FADE_SECONDS.toFixed(1)}[aout]`;
}

async function main() {
  if (!hasCommand("ffmpeg")) throw new Error("ffmpeg is required");
  const tempRoot = mkdtempSync(join(tmpdir(), "roboflow-sports-explainer-"));
  const framesDir = join(tempRoot, "frames");
  mkdirSync(framesDir);
  let renderSucceeded = false;

  try {
    await renderPngFrames(framesDir, tempRoot);

    const srt = scenes.map((scene, index) => `${index + 1}\n${srtTime(starts[index])} --> ${srtTime(starts[index] + scene.duration)}\n${scene.voice}\n`).join("\n");
    writeFileSync(join(outputDir, "roboflow-sports-explainer-zh.srt"), srt);
    writeFileSync(join(outputDir, "poster.svg"), renderFrame(2));
    copyFileSync(join(framesDir, `frame-${String(2 * RENDER_FPS).padStart(5, "0")}.png`), join(outputDir, "poster.png"));

    const videoOnly = join(tempRoot, "video-only.mp4");
    run("ffmpeg", ["-y", "-loglevel", "warning", "-framerate", String(RENDER_FPS), "-i", join(framesDir, "frame-%05d.png"), "-r", String(OUTPUT_FPS), "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-movflags", "+faststart", videoOnly]);

    const output = join(outputDir, "roboflow-sports-explainer-zh.mp4");
    const silent = process.argv.includes("--silent") || !hasCommand("say");
    if (silent) {
      copyFileSync(videoOnly, output);
    } else {
      const voiceFiles = scenes.map((scene, index) => {
        const voiceFile = join(tempRoot, `voice-${index}.aiff`);
        run("say", ["-v", "Tingting", "-r", "205", "-o", voiceFile, scene.voice]);
        return voiceFile;
      });
      const voiceInputs = voiceFiles.flatMap((file) => ["-i", file]);
      run("ffmpeg", ["-y", "-loglevel", "warning", "-i", videoOnly, ...voiceInputs, "-filter_complex", buildAudioFilter(voiceFiles.length), "-map", "0:v:0", "-map", "[aout]", "-t", totalDuration.toFixed(3), "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-ac", "2", "-metadata:s:a:0", "language=zho", "-movflags", "+faststart", output]);
    }
    process.stdout.write(`Created ${output}\n`);
    renderSucceeded = true;
  } finally {
    if (!renderSucceeded || process.env.KEEP_FRAMES === "1") process.stdout.write(`Temporary frames kept at ${tempRoot}\n`);
    else rmSync(tempRoot, { recursive: true, force: true });
  }
}

export { buildAudioFilter, renderFrame, scenes, starts, totalDuration };

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
