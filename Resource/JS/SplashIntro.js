window.SplashIntro = (function () {
    'use strict';
    const CFG = {
        updateInterval: 0.033,

        // 数字流（NumberStream）
        maxStreams: 16,
        minStreamLength: 8,
        maxStreamLength: 25,
        charSpacing: 0.5,
        charSize: 1.2,
        minSpeed: 1.0,
        maxSpeed: 2.5,

        // 代码雨
        maxMatrixColumns: 12,
        matrixColumnSpacing: 1.0,
        matrixSpeed: 2.0,
        matrixCharChangeRate: 0.2,

        // PCB 电路板光流
        circuitPathCount: 60,
        circuitPathWidth: 0.008,
        circuitPathSpeed: 2.0,
        pcbGridSize: 0.3,
        pcbLayerCount: 4,
        pcbCornerChance: 0.25,
        tracesPerFrame: 5,
        pointsPerFrame: 30,

        // 动画序列时间控制
        numberStreamBeforeLogo: 7,
        logoAppearDuration: 2,
        logoAndLightPathDuration: 3,
        numberFadeDuration: 4,
        circuitFadeInDuration: 1.5,

        // 落幕动画时长
        endingFlashDuration: 0.25,
        endingDissolveDuration: 0.8,
        endingHoldDuration: 1,
        endingScatterDuration: 2.2,
        endingFadeOutDuration: 1.2,
        endingBlackDuration: 1.8,

        // 落幕粒子上限（原版 12000，浏览器 Canvas 取 8000 平衡性能）
        maxEndingParticles: 8000,
    };

    /* ====================================================================
     * 颜色常量（取自 C# ColorHelper / 各控制器）
     * ================================================================== */
    const COLORS = {
        number: { r: 0.2, g: 0.8, b: 1.0 },            // 数字流青蓝
        matrix: { r: 0.45, g: 0.35, b: 1.0 },          // 代码雨紫蓝
        fs: { r: 0.0, g: 0.94, b: 1.0 },               // FSColor 更青
        download: { r: 0.25, g: 0.55, b: 1.0 },        // 更蓝
        success: { r: 0.7, g: 1.0, b: 0.85 },          // 浅绿
        error: { r: 1.0, g: 0.25, b: 0.31 },           // 错误红
        completeGreen: { r: 0.0, g: 1.0, b: 0.53 },    // CompleteGreen
        completePurple: { r: 0.72, g: 0.3, b: 1.0 },   // CompletePurple
        circuitActive: { r: 0.0, g: 0.78, b: 1.0 },    // 电路点亮色
        circuitInactive: { r: 0.0, g: 0.5, b: 1.0, a: 0.2 }, // 电路底色
    };

    const clamp01 = (t) => Math.max(0, Math.min(1, t));
    const lerp = (a, b, t) => a + (b - a) * t;
    const rand = (min, max) => min + Math.random() * (max - min);
    const randInt = (min, max) => Math.floor(rand(min, max + 1));
    const smoothEaseInOut = (t) => { t = clamp01(t); return t * t * (3 - 2 * t); };

    function shuffle(arr) {
        for (let i = 0; i < arr.length; i++) {
            const j = randInt(i, arr.length - 1);
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    const rgba = (c, a = 1) =>
        `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${a})`;

    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const waitFrame = () => new Promise((r) => requestAnimationFrame(r));

    /** 逐帧驱动动画的协程（对应 C# IEnumerator + yield return null） */
    function animate(duration, step) {
        return new Promise((resolve) => {
            let elapsed = 0;
            let last = performance.now();
            const tick = (now) => {
                const dt = Math.min(0.05, (now - last) / 1000);
                last = now;
                elapsed += dt;
                step(elapsed / duration, dt);
                if (elapsed < duration) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });
    }

    /** 加载图片 */
    function loadImage(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = url;
        });
    }

    /* ====================================================================
     * 预渲染 Sprite
     * ================================================================== */
    function buildNumberSprite(ch, color) {
        const size = 64;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `700 ${size * 0.62}px "Orbitron", sans-serif`;
        // 辉光层（模拟 3x3 GlowOffsets 卷积）
        ctx.shadowColor = rgba(color, 0.55);
        ctx.shadowBlur = 10;
        ctx.fillStyle = rgba(color, 1);
        ctx.fillText(ch, size / 2, size / 2 + size * 0.04);
        // 主体层
        ctx.shadowBlur = 0;
        ctx.fillText(ch, size / 2, size / 2 + size * 0.04);
        return c;
    }

    function buildMatrixSprite(color) {
        const size = 32;
        const c = document.createElement('canvas');
        c.width = c.height = size;
        const ctx = c.getContext('2d');
        ctx.fillStyle = rgba(color, 1);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (Math.random() < 0.3 && x > 4 && x < size - 4 && y > 4 && y < size - 4) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
        return c;
    }

    class NumberStreams {
        constructor(sprites) {
            this.sprites = sprites;   // { '0'..'9': canvas }
            this.active = false;
            this.streams = [];        // { baseY, speed, chars:[{y,ch}], alphaMult, len, lastChange }
            this.positions = [];      // 允许生成流的 X 位置（单位 px）
            this.initialCount = 0;
        }

        init(w, h) {
            const scale = h / 10;
            this.scale = scale;
            this.spacing = CFG.charSpacing * scale;
            this.charPx = (48 / 100) * CFG.charSize * scale;
            this.bottomY = h + this.spacing;          // 屏幕底部之外
            this.offscreenTop = h / 2 - (5 + 2) * scale; // 顶部 + 2 units
            this.canvasH = h;
            this.fade = 1;                            // 整体淡出系数（落幕前数字流淡出用）
            this.positions.length = 0;
            const spacing = Math.min(this.spacing, this.charPx * 1.1);
            const count = Math.max(CFG.maxStreams, Math.floor(w / spacing));
            for (let i = 0; i < count; i++) {
                this.positions.push(lerp(0, w, (i + 0.5) / count) + rand(-0.2, 0.2) * spacing);
            }
            shuffle(this.positions);
        }

        start() {
            this.active = true;
            this.initialCount = 0;
            this.initialCount = this.launchInitial();
        }

        async launchInitial() {
            const count = Math.min(8, this.positions.length);
            for (let i = 0; i < count; i++) {
                if (!this.active) break;
                this.createStream(this.positions[i]);
                await wait(rand(50, 150));
            }
        }

        createStream(x) {
            const len = randInt(CFG.minStreamLength, CFG.maxStreamLength);
            const height = (len - 1) * this.spacing;
            const stream = {
                x,
                baseY: this.bottomY + height + rand(0.5, 3) * this.scale,
                speed: rand(CFG.minSpeed, CFG.maxSpeed) * this.scale,
                chars: [],
                len,
                alphaMult: rand(0.5, 0.95),
                lastChange: performance.now() / 1000,
            };
            for (let i = 0; i < len; i++) {
                stream.chars.push({ y: i * this.spacing, ch: randInt(0, 9) });
            }
            this.streams.push(stream);
        }

        /** 返回 false 表示该流已完全移出屏幕 */
        update(dt, time) {
            if (!this.active) return;
            for (let i = this.streams.length - 1; i >= 0; i--) {
                const s = this.streams[i];
                s.baseY -= s.speed * dt;
                // 最底部字符（chars[0]）离开屏幕顶部 → 回收整根流
                if (s.chars.length > 0 && s.baseY - 0 < this.offscreenTop) {
                    this.streams.splice(i, 1);
                    continue;
                }
                // 闪烁换字（2% 概率，0.2s 冷却）
                if (time - s.lastChange > 0.2 && Math.random() < 0.02) {
                    s.chars[randInt(0, s.len - 1)].ch = randInt(0, 9);
                    s.lastChange = time;
                }
            }
            // 补充新流（10% 概率，对应 UpdateNumberStreams 尾部）
            if (this.streams.length < CFG.maxStreams && this.positions.length > 0 &&
                Math.random() < 0.1) {
                this.createStream(this.positions[randInt(0, this.positions.length - 1)]);
            }
        }

        draw(ctx) {
            if (!this.active) return;
            const { r, g, b } = COLORS.number;
            const time = performance.now() / 1000;
            for (const s of this.streams) {
                for (let i = 0; i < s.chars.length; i++) {
                    const ch = s.chars[i];
                    const y = s.baseY - ch.y; // i 越大越靠上
                    if (y < -this.charPx || y > this.canvasH + this.charPx) continue;
                    const baseAlpha = lerp(0.4, 0.9, i / s.len);
                    const pulse = Math.sin(time * 2 + i * 0.2) * 0.2 + 0.8;
                    const alpha = baseAlpha * pulse * s.alphaMult * (this.fade ?? 1);
                    if (alpha <= 0.01) continue;
                    ctx.globalAlpha = alpha;
                    const sprite = this.sprites[ch.ch];
                    if (sprite) ctx.drawImage(sprite, s.x, y, this.charPx, this.charPx);
                }
            }
            ctx.globalAlpha = 1;
        }
    }

    class MatrixRain {
        constructor(sprites) {
            this.sprites = sprites;   // [canvas, canvas]
            this.active = false;
            this.columns = [];
            this.positions = [];
        }

        init(w, h) {
            const scale = h / 10;
            this.scale = scale;
            this.spacing = 0.4 * scale;
            this.charPx = (32 / 100) * 0.8 * scale;
            this.topY = -this.spacing;                    // 屏幕顶部之外
            this.offscreenBottom = h / 2 + (5 + 2) * scale; // 底部 - 2 units
            this.canvasH = h;
            this.fade = 1;                                // 整体淡出系数
            // X 分布与数字流错开
            this.positions.length = 0;
            const count = Math.max(CFG.maxMatrixColumns, Math.floor(w / (1.0 * scale)));
            for (let i = 0; i < count; i++) {
                this.positions.push(lerp(0, w, (i + 0.5) / count) + rand(-0.2, 0.2) * scale);
            }
            shuffle(this.positions);
        }

        start() {
            this.active = true;
            this.launchInitial();
        }

        async launchInitial() {
            const count = Math.min(CFG.maxMatrixColumns, this.positions.length);
            for (let i = 0; i < count; i++) {
                if (!this.active) break;
                this.createColumn(this.positions[i]);
                await wait(rand(100, 300));
            }
        }

        createColumn(x) {
            const len = randInt(8, 16);
            const height = (len - 1) * this.spacing;
            const col = {
                x,
                baseY: this.topY - height - rand(1, 3) * this.scale,
                speed: rand(CFG.matrixSpeed * 0.8, CFG.matrixSpeed * 1.2) * this.scale,
                chars: [],
                len,
                lastChange: performance.now() / 1000,
                idx: this.columns.length,
            };
            for (let i = 0; i < len; i++) {
                col.chars.push({ y: i * this.spacing, ch: randInt(0, 2) });
            }
            this.columns.push(col);
        }

        update(dt, time) {
            if (!this.active) return;
            for (let i = this.columns.length - 1; i >= 0; i--) {
                const c = this.columns[i];
                c.baseY += c.speed * dt;
                // 最顶部字符（chars[0]）离开屏幕底部 → 回收整列
                if (c.chars.length > 0 && c.baseY - 0 > this.offscreenBottom) {
                    this.columns.splice(i, 1);
                    continue;
                }
                if (time - c.lastChange > 0.1 && Math.random() < CFG.matrixCharChangeRate * 0.5) {
                    c.chars[randInt(0, c.len - 1)].ch = randInt(0, 2);
                    c.lastChange = time;
                }
            }
            if (this.columns.length < CFG.maxMatrixColumns && this.positions.length > 0 &&
                Math.random() < 0.1) {
                this.createColumn(this.positions[randInt(0, this.positions.length - 1)]);
            }
        }

        draw(ctx) {
            if (!this.active) return;
            const { r, g, b } = COLORS.matrix;
            const time = performance.now() / 1000;
            for (const c of this.columns) {
                for (let i = 0; i < c.chars.length; i++) {
                    const ch = c.chars[i];
                    const y = c.baseY + ch.y;
                    if (y < -this.charPx || y > this.canvasH + this.charPx) continue;
                    const baseAlpha = lerp(0.2, 0.7, i / c.len);
                    const pulse = Math.sin(time * 3 + i * 0.2 + c.idx) * 0.1 + 0.9;
                    const alpha = baseAlpha * pulse * (this.fade ?? 1);
                    if (alpha <= 0.01) continue;
                    ctx.globalAlpha = alpha;
                    const sprite = this.sprites[ch.ch];
                    if (sprite) ctx.drawImage(sprite, c.x, y, this.charPx, this.charPx);
                }
            }
            ctx.globalAlpha = 1;
        }
    }

    class PcbSystem {
        constructor() {
            this.paths = [];        // { path2d, pts:[{x,y}], targetAlpha, isActive, layer, animSpeed, animOffset, pulseTimer }
            this.pulses = [];       // 数据脉冲
            this.visible = false;   // 渐隐渐显控制
            this.fadeAlpha = 0;
            this.animRunning = false;
            this.animStartTime = 0;
        }

        init(w, h) {
            this.w = w;
            this.h = h;
            this.scale = h / 10;
            this.cx = w / 2;
            this.cy = h / 2;
        }

        clear() {
            this.paths.length = 0;
            this.pulses.length = 0;
            this.animRunning = false;
        }

        /** 生成 PCB 网格与走线（分帧，对应 InitializePCBOptimized + GeneratePCBTracesOptimized） */
        async generate() {
            this.clear();
            const grid = new Map();   // key "x,y" -> { pos:{x,y}, conn:Set }
            const positions = [];

            const gw = Math.min(0.6 * this.w, 0.3 * this.w * 2);
            const gh = Math.min(0.6 * this.h, 0.3 * this.h * 2);
            const minX = this.cx - gw / 2, maxX = this.cx + gw / 2;
            const minY = this.cy - gh / 2, maxY = this.cy + gh / 2;

            const gridSize = CFG.pcbGridSize * this.scale;
            let gx = Math.floor(gw / gridSize), gy = Math.floor(gh / gridSize);
            gx = Math.max(15, Math.min(30, gx));
            gy = Math.max(10, Math.min(20, gy));
            const sx = gw / Math.max(1, gx - 1);
            const sy = gh / Math.max(1, gy - 1);

            for (let x = 0; x < gx; x++) {
                for (let y = 0; y < gy; y++) {
                    if (Math.random() < 0.1) continue;
                    const pos = { x: minX + x * sx, y: minY + y * sy };
                    grid.set(x + ',' + y, { pos, conn: new Set() });
                    positions.push([x, y]);
                }
                await waitFrame();
            }

            shuffle(positions);

            // 距离中心最近的 20 个点作为起点（对应 sortedGridPositions）
            positions.sort((a, b) => {
                const da = (minX + a[0] * sx - this.cx) ** 2 + (minY + a[1] * sy - this.cy) ** 2;
                const db = (minX + b[0] * sx - this.cx) ** 2 + (minY + b[1] * sy - this.cy) ** 2;
                return da - db;
            });
            const starts = positions.slice(0, 20);

            const key = (a, b) => a + ',' + b;
            const hasConn = (posKey, otherKey) => grid.get(posKey)?.conn.has(otherKey) || false;

            // 逐层生成走线（3 层，方向交替）
            const layerDirs = [1, 0, 1]; // 1=水平 0=垂直
            let created = 0;
            for (let layer = 0; layer < layerDirs.length && created < CFG.circuitPathCount; layer++) {
                const prefDir = layerDirs[layer];
                for (let i = 0; i < starts.length && created < CFG.circuitPathCount; i++) {
                    for (let attempt = 0; attempt < 2 && created < CFG.circuitPathCount; attempt++) {
                        if (this.trace(grid, key, hasConn, starts[i], prefDir, layer)) created++;
                        if (created % CFG.tracesPerFrame === 0) await waitFrame();
                    }
                }
            }
        }

        /** 单条走线（对应 GenerateTraceOptimized） */
        trace(grid, key, hasConn, start, prefDir, layer) {
            let cur = start;
            const pts = [grid.get(key(cur[0], cur[1])).pos];
            const maxSeg = randInt(5, 12);
            let seg = 0;
            let dir = prefDir;
            const count = () => key(cur[0], cur[1]);

            while (seg < maxSeg) {
                const cx = cur[0], cy = cur[1];
                const candidates = [];
                if (dir === 1) {
                    if (grid.has(key(cx - 1, cy)) && !hasConn(count(), key(cx - 1, cy))) candidates.push([cx - 1, cy]);
                    if (grid.has(key(cx + 1, cy)) && !hasConn(count(), key(cx + 1, cy))) candidates.push([cx + 1, cy]);
                } else {
                    if (grid.has(key(cx, cy - 1)) && !hasConn(count(), key(cx, cy - 1))) candidates.push([cx, cy - 1]);
                    if (grid.has(key(cx, cy + 1)) && !hasConn(count(), key(cx, cy + 1))) candidates.push([cx, cy + 1]);
                }
                // 对角线回退
                if (candidates.length === 0) {
                    const diag = [[cx - 1, cy - 1], [cx - 1, cy + 1], [cx + 1, cy - 1], [cx + 1, cy + 1]];
                    for (const d of diag) {
                        if (grid.has(key(d[0], d[1])) && !hasConn(count(), key(d[0], d[1]))) candidates.push(d);
                    }
                }
                if (candidates.length === 0) break;

                const next = candidates[randInt(0, candidates.length - 1)];
                if (hasConn(count(), key(next[0], next[1]))) {
                    if (Math.random() < 0.2) break;
                    dir = 1 - dir;
                    continue;
                }
                grid.get(count()).conn.add(key(next[0], next[1]));
                grid.get(key(next[0], next[1])).conn.add(count());
                pts.push(grid.get(key(next[0], next[1])).pos);
                cur = next;
                seg++;
                if (Math.random() < CFG.pcbCornerChance) dir = 1 - dir;
                if (Math.random() < 0.15) break;
            }
            if (pts.length < 2) return false;

            // 缓存 Path2D
            const p2d = new Path2D();
            p2d.moveTo(pts[0].x, pts[0].y);
            for (let i = 1; i < pts.length; i++) p2d.lineTo(pts[i].x, pts[i].y);

            const isActive = Math.random() < 0.25;
            this.paths.push({
                path: p2d,
                pts,
                targetAlpha: rand(0.15, 0.25),
                currentAlpha: 0,
                isActive,
                layer,
                animSpeed: rand(0.8, 1.5) * CFG.circuitPathSpeed,
                animOffset: rand(0, Math.PI * 2),
                pulseTimer: rand(0.5, 1.5),
            });
            return true;
        }

        /** 渐隐渐显（对应 FadeInCircuitPathsOptimized） */
        fadeIn(duration) {
            return animate(duration, (t) => {
                this.fadeAlpha = smoothEaseInOut(t);
            }).then(() => { this.fadeAlpha = 1; });
        }

        startAnim() {
            this.animRunning = true;
            this.animStartTime = performance.now() / 1000;
        }

        stopAnim() {
            this.animRunning = false;
        }

        update(dt, time) {
            if (!this.animRunning) return;
            const t = time - this.animStartTime;
            // 数据脉冲：active 线周期性发射（对应 CreateDataPulseOptimized 触发逻辑）
            for (const p of this.paths) {
                if (!p.isActive) continue;
                p.pulseTimer -= dt;
                if (p.pulseTimer <= 0) {
                    p.pulseTimer = rand(0.8, 1.6);
                    if (p.pts.length >= 2) {
                        this.pulses.push({
                            p,
                            start: p.pts[0],
                            end: p.pts[p.pts.length - 1],
                            progress: 0,
                        });
                    }
                }
            }
            for (let i = this.pulses.length - 1; i >= 0; i--) {
                const pl = this.pulses[i];
                pl.progress += dt / 0.4; // 0.4s 走完全程
                if (pl.progress >= 1) this.pulses.splice(i, 1);
            }
            // 偶发点亮/熄灭（对应尾部随机切换）
            for (const p of this.paths) {
                if (Math.random() < 0.0002) {
                    p.isActive = true;
                    p.animOffset = rand(0, Math.PI * 2);
                } else if (Math.random() < 0.0001) {
                    p.isActive = !p.isActive;
                    p.animOffset = rand(0, Math.PI * 2);
                }
            }
        }

        /** 落幕时整体渐隐 */
        fadeOut(duration, onStep) {
            return animate(duration, (t) => {
                onStep && onStep(clamp01(t));
            });
        }

        draw(ctx, time) {
            if (this.paths.length === 0) return;
            ctx.save();
            ctx.lineWidth = Math.max(1, CFG.circuitPathWidth * this.scale);
            ctx.lineCap = 'round';
            const active = COLORS.circuitActive;
            const fade = this.fadeAlpha;

            for (const p of this.paths) {
                if (p.currentAlpha <= 0.005) continue;
                let alpha;
                if (p.isActive) {
                    const pulse = Math.sin(time * p.animSpeed + p.animOffset) * 0.5 + 0.5;
                    alpha = p.currentAlpha * (0.5 + pulse);
                    const m = p.layer % 2 === 0 ? 1 : 0.7;
                    ctx.strokeStyle = rgba({ r: active.r * m, g: active.g * m, b: active.b }, alpha * fade);
                } else {
                    const flick = Math.sin(time * p.animSpeed * 0.3 + p.animOffset) * 0.1 + 0.9;
                    alpha = p.currentAlpha * flick;
                    ctx.strokeStyle = rgba(COLORS.circuitInactive, alpha * fade);
                }
                ctx.stroke(p.path);
            }

            // 数据脉冲
            for (const pl of this.pulses) {
                const t = pl.progress;
                const px = lerp(pl.start.x, pl.end.x, t);
                const py = lerp(pl.start.y, pl.end.y, t);
                const trail = Math.min(0.05 * this.scale, Math.hypot(pl.end.x - pl.start.x, pl.end.y - pl.start.y) * t);
                const dx = pl.end.x - pl.start.x, dy = pl.end.y - pl.start.y;
                const len = Math.hypot(dx, dy) || 1;
                const tx = px - (dx / len) * trail;
                const ty = py - (dy / len) * trail;
                const a = lerp(0.6, 0, t) * fade;
                if (a <= 0.01) continue;
                ctx.strokeStyle = `rgba(0,255,255,${a})`;
                ctx.lineWidth = Math.max(1, CFG.circuitPathWidth * this.scale * 2);
                ctx.beginPath();
                ctx.moveTo(tx, ty);
                ctx.lineTo(px, py);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    const LOG_LEVELS = {
        message: { icon: '◈', color: COLORS.number },
        info: { icon: 'ｉ', color: COLORS.fs },
        download: { icon: '⇩', color: COLORS.download },
        success: { icon: '✓', color: COLORS.success },
        error: { icon: '×', color: COLORS.error },
    };

    class SplashLog {
        constructor(root) {
            this.root = root;
            this.entries = [];
            this.leaving = [];
            this.disposed = false;
            this.linePx = 20;
        }

        resize() {
            if (!this.root) return;
            const cw = this.root.clientWidth || 0;
            this.linePx = Math.max(26, cw * 0.065);
        }

        /** 压入一条日志；返回 Promise，打字完成后 resolve */
        async push(message, level = 'info') {
            if (this.disposed || !this.root) return;
            const info = LOG_LEVELS[level] || LOG_LEVELS.info;
            const entry = {
                el: document.createElement('div'),
                body: null,
                remaining: 9.5,
                isTyping: true,
                x: -this.linePx * 6,        // 左侧屏幕外
                y: 0,
                targetY: 0,
                slidingIn: true,
                leaving: false,
                leavingProgress: 0,
                leavingStartY: 0,
            };
            entry.el.className = 'splash-log-entry level-' + level;
            const icon = document.createElement('span');
            icon.className = 'splash-log-icon';
            icon.textContent = info.icon;
            entry.body = document.createElement('span');
            entry.body.className = 'splash-log-body';
            entry.el.appendChild(icon);
            entry.el.appendChild(entry.body);
            this.root.appendChild(entry.el);

            this.entries.push(entry);
            this.trim();
            this.updateLayout(entry);

            // 打字机（对应 TypewriterRoutine）
            for (let i = 1; i <= message.length; i++) {
                if (this.disposed || !entry.el.isConnected) break;
                entry.body.textContent = message.slice(0, i);
                await wait(30);
            }
            if (entry.body && entry.body.isConnected) entry.body.textContent = message;
            entry.isTyping = false;
        }

        /** 计算当前行目标位置并立即定位新条目 */
        updateLayout(entry) {
            const index = this.entries.indexOf(entry);
            entry.targetY = index * this.linePx;
            entry.y = entry.targetY;
            entry.x = -this.linePx * 6;
            entry.slidingIn = true;
            entry.el.style.transform = `translate(${entry.x}px, ${entry.y}px)`;
        }

        trim() {
            while (this.entries.length > 12) {
                const first = this.entries.shift();
                this.startLeaving(first);
            }
        }

        startLeaving(entry) {
            if (!entry || entry.leaving || !entry.el || !entry.el.isConnected) return;
            entry.leaving = true;
            entry.leavingProgress = 0;
            entry.leavingStartY = entry.y;
            this.leaving.push(entry);
        }

        /** 每帧更新：顺位滑动 + 移出动画 + 生命周期 */
        update(dt) {
            if (this.disposed || (!this.entries.length && !this.leaving.length)) return;

            // 顺位目标（对应 UpdateSliding）
            for (let i = 0; i < this.entries.length; i++) {
                this.entries[i].targetY = i * this.linePx;
            }
            const smooth = 1 - Math.exp(-dt * 12);
            const slideIn = 1 - Math.exp(-dt * 7);
            for (let i = this.entries.length - 1; i >= 0; i--) {
                const e = this.entries[i];
                if (!e.el || !e.el.isConnected) { this.entries.splice(i, 1); continue; }
                e.y = lerp(e.y, e.targetY, smooth);
                if (e.slidingIn) {
                    e.x = lerp(e.x, 0, slideIn);
                    if (Math.abs(e.x) < 2) { e.x = 0; e.slidingIn = false; }
                }
                e.el.style.transform = `translate(${e.x}px, ${e.y}px)`;

                // 生命周期（打字中不推进）
                if (!e.isTyping) {
                    e.remaining -= dt;
                    if (e.remaining <= 0) {
                        this.entries.splice(i, 1);
                        this.startLeaving(e);
                    }
                }
            }

            // 移出动画（对应 UpdateLeaving）
            for (let i = this.leaving.length - 1; i >= 0; i--) {
                const e = this.leaving[i];
                if (!e.el || !e.el.isConnected) { this.leaving.splice(i, 1); continue; }
                e.leavingProgress += dt / 0.4;
                e.y = e.leavingStartY + e.leavingProgress * this.linePx * 2;
                e.el.style.transform = `translate(${e.x}px, ${e.y}px)`;
                e.el.style.opacity = String(clamp01(1 - e.leavingProgress));
                if (e.leavingProgress >= 1) {
                    e.el.remove();
                    this.leaving.splice(i, 1);
                }
            }
        }

        /** 强制逐条弹出清场（对应 EjectAll） */
        async ejectAll() {
            while (this.entries.length > 0) {
                const first = this.entries.shift();
                this.startLeaving(first);
                // 等待飞出完成
                while (this.leaving.includes(first)) {
                    await waitFrame();
                }
                await wait(50);
            }
        }

        clear() {
            for (const e of this.entries) e.el?.remove();
            for (const e of this.leaving) e.el?.remove();
            this.entries.length = 0;
            this.leaving.length = 0;
        }
    }

    class ProcessText {
        constructor(el) {
            this.el = el;
            this.mode = 'idle';
            this.baseColor = COLORS.fs;
            this.prefix = '';
            this.current = 0;
            this.total = 0;
            this.breathePhase = 0;
            this.disposed = false;
            this._lastDone = -1;
            this._lastTotal = -1;
        }

        setColor(c) {
            this.baseColor = c;
            this.el.style.color = rgba(c, 1);
        }

        async showTypewriter(content) {
            if (this.disposed || !this.el) return;
            this.setColor({ r: COLORS.fs.r, g: COLORS.fs.g, b: COLORS.fs.b });
            this.el.style.opacity = '1';
            this.el.textContent = '';
            for (let i = 1; i <= content.length; i++) {
                this.el.textContent = content.slice(0, i) + (i % 2 ? '|' : '');
                await wait(100);
            }
            this.el.textContent = content;
        }

        async showDownloading(prefix, current, total) {
            if (this.disposed || !this.el) return;
            this.total = total;
            this.current = current;
            if (this.mode !== 'downloading') {
                this.mode = 'downloading';
                this.prefix = prefix;
                this._lastDone = -1;
                this._lastTotal = -1;
                this.setColor(COLORS.download);
                await this.showTypewriter(prefix);
            } else {
                this.current = current;
            }
        }

        updateDownloadProgress(current, total) {
            if (this.disposed || this.mode !== 'downloading') return;
            this.current = current;
            this.total = total;
        }

        async showComplete(content) {
            if (this.disposed || !this.el) return;
            this.mode = 'complete';
            this.setColor(COLORS.completePurple);
            await this.showTypewriter(content);
            this.breathePhase = 0;
        }

        showError(content) {
            if (this.disposed || !this.el) return;
            this.mode = 'error';
            this.el.textContent = content;
            this.setColor(COLORS.error);
            this.breathePhase = 0;
        }

        async hide() {
            if (this.disposed || !this.el) return;
            const from = parseFloat(this.el.style.opacity || '1');
            await animate(1 / 2.8, (_t, dt) => {
                const next = from - dt * 2.8;
                this.el.style.opacity = String(Math.max(0, next));
            });
            this.el.style.opacity = '0';
            this.mode = 'idle';
        }

        /** 每帧更新下载计数 */
        update(dt) {
            if (this.disposed || !this.el) return;
            if (this.mode === 'downloading') {
                this.breathePhase += dt * (1.4 * 0.8);
                const pulse = (Math.sin(this.breathePhase) + 1) * 0.5;
                const done = Math.max(0, Math.min(this.current, this.total));
                if (done !== this._lastDone || this.total !== this._lastTotal) {
                    this._lastDone = done;
                    this._lastTotal = this.total;
                    this.el.innerHTML =
                        `${this.prefix} <span style="color:#fff">` +
                        `<span style="color:#D0FFCC">${done}</span>` +
                        `</span>/<span style="color:#6A6A6A">${this.total}</span>`;
                }
                this.el.style.color = rgba(COLORS.download, lerp(0.5, 1, pulse));
            } else if (this.mode === 'complete' || this.mode === 'error') {
                this.breathePhase += dt * 1.4;
                const pulse = (Math.sin(this.breathePhase) + 1) * 0.5;
                this.el.style.opacity = String(lerp(0.45, 0.95, pulse));
            }
        }

        hideImmediate() {
            if (this.disposed) return;
            this.el.style.opacity = '0';
            this.mode = 'idle';
        }
    }

    class ParticleEnding {
        constructor(canvas, numberSprites, logoImg, logoRect) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.sprites = numberSprites;
            this.logoImg = logoImg;
            this.logoRect = logoRect; // {x, y, w, h}
            this.particles = [];
            this.active = false;
            this.phase = -1;           // 0 flash, 1 dissolve, 2 hold, 3 scatter, 4 fadeout
            this.phaseElapsed = 0;
            this.scale = (canvas.clientHeight || canvas.height) / 10;
            this.particlePx = 0.4 * this.scale;
        }

        /** 采样 Logo 生成粒子 */
        build() {
            const img = this.logoImg;
            const { x: lx, y: ly, w: lw, h: lh } = this.logoRect;
            const oc = document.createElement('canvas');
            oc.width = img.naturalWidth || img.width;
            oc.height = img.naturalHeight || img.height;
            const octx = oc.getContext('2d');
            octx.drawImage(img, 0, 0);
            let data;
            try { data = octx.getImageData(0, 0, oc.width, oc.height).data; }
            catch { return; }

            const cols = 160, rows = 96;
            const stepX = Math.max(1, Math.floor(oc.width / cols));
            const stepY = Math.max(1, Math.floor(oc.height / rows));
            const palette = [
                COLORS.number, COLORS.number, COLORS.number,
                { r: 0.10, g: 1.00, b: 0.90 },
                { r: 0.25, g: 0.55, b: 1.00 },
                COLORS.matrix,
            ];
            const pts = [];
            outer:
            for (let py = 0; py < oc.height; py += stepY) {
                for (let px = 0; px < oc.width; px += stepX) {
                    const i = (py * oc.width + px) * 4;
                    const a = data[i + 3] / 255;
                    if (a < 0.2) continue;
                    const lum = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
                    if (lum < 0.75) continue;
                    const u = (px + 0.5) / oc.width;
                    const v = (py + 0.5) / oc.height;
                    const pos = {
                        x: lx + u * lw,
                        y: ly + v * lh,
                    };
                    const offX = pos.x - (lx + lw / 2), offY = pos.y - (ly + lh / 2);
                    const dist = Math.hypot(offX, offY);
                    const dx = dist > 0.001 ? offX / dist : 1;
                    const dy = dist > 0.001 ? offY / dist : 0;
                    const base = palette[randInt(0, palette.length - 1)];
                    pts.push({
                        x: pos.x, y: pos.y,
                        startX: pos.x, startY: pos.y,
                        vx: dx * rand(1.6, 7.0) * this.scale,
                        vy: dy * rand(1.6, 7.0) * this.scale,
                        spin: rand(-3, 3),
                        rot: 0,
                        flashTimer: rand(0, 0.25),
                        ch: 0,
                        base,
                        alpha: 0,
                        size: this.particlePx,
                    });
                    if (pts.length >= CFG.maxEndingParticles) break outer;
                }
            }
            this.particles = pts;
        }

        /** 主协程：驱动整个落幕流程 */
        async run(onLogoAlpha, onPcbFade) {
            this.active = true;
            const img = this.logoImg;

            // ---- 阶段 0：Logo 闪亮（0.25s）----
            this.phase = 0;
            await animate(CFG.endingFlashDuration, (t) => {
                onLogoAlpha(lerp(1, 1, 0) * (0.75 + Math.sin(t * Math.PI) * 0.25));
            });
            onLogoAlpha(1);

            // ---- 阶段 1：粒子渐入 + Logo 同步渐隐（0.8s）----
            this.phase = 1;
            const startAlpha = 1;
            await animate(CFG.endingDissolveDuration, (t) => {
                const ease = smoothEaseInOut(t);
                onLogoAlpha(lerp(startAlpha, 0, ease));
                for (const p of this.particles) {
                    p.flashTimer -= 1 / 60;
                    if (p.flashTimer <= 0) {
                        p.ch = randInt(0, 9);
                        p.flashTimer = rand(0.05, 0.18);
                    }
                    p.alpha = Math.min(1, ease * 1.5);
                }
            });
            onLogoAlpha(0);

            // ---- 阶段 2：停顿闪烁（1s）----
            this.phase = 2;
            await animate(CFG.endingHoldDuration, (t) => {
                for (const p of this.particles) {
                    p.flashTimer -= 1 / 60;
                    if (p.flashTimer <= 0) {
                        p.ch = randInt(0, 9);
                        p.flashTimer = rand(0.05, 0.18);
                    }
                    p.alpha = 1;
                }
            });

            // ---- 阶段 3：四散飞出 + 电路渐隐（2.2s）----
            this.phase = 3;
            let scatterElapsed = 0;
            await animate(CFG.endingScatterDuration, (t, dt) => {
                scatterElapsed += dt;
                for (const p of this.particles) {
                    p.x = p.startX + p.vx * scatterElapsed;
                    p.y = p.startY + p.vy * scatterElapsed;
                    p.rot += p.spin * dt;
                    p.alpha = 1;
                }
                onPcbFade(t);
            });

            // ---- 阶段 4：数字渐隐 + 继续飞出（1.2s）----
            this.phase = 4;
            let fadeElapsed = 0;
            await animate(CFG.endingFadeOutDuration, (t, dt) => {
                fadeElapsed += dt;
                const ease = smoothEaseInOut(t);
                const total = CFG.endingScatterDuration + fadeElapsed;
                for (const p of this.particles) {
                    p.x = p.startX + p.vx * total;
                    p.y = p.startY + p.vy * total;
                    p.rot += p.spin * dt;
                    p.alpha = lerp(1, 0, ease);
                }
            });

            // 清理粒子
            this.particles.length = 0;
            this.phase = -1;
            this.active = false;
        }

        /** 主循环绘制（由引擎帧循环调用） */
        draw() {
            if (!this.active && this.particles.length === 0) return;
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
            for (const p of this.particles) {
                if (p.alpha <= 0.01) continue;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.globalAlpha = p.alpha;
                ctx.drawImage(this.sprites[p.ch], -p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            }
            ctx.globalAlpha = 1;
        }
    }

    class SplashEngine {
        constructor(overlay) {
            this.overlay = overlay;
            this.pcbCanvas = overlay.querySelector('#splashPcbCanvas');
            this.fxCanvas = overlay.querySelector('#splashFxCanvas');
            this.particleCanvas = overlay.querySelector('#splashParticleCanvas');
            this.teamLogo = overlay.querySelector('#splashTeamLogo');
            this.logRoot = overlay.querySelector('#splashLog');
            this.loadText = overlay.querySelector('#loadText');
            this.processTextEl = overlay.querySelector('#processText');
            this.versionText = overlay.querySelector('#versionText');
            this.blackPanel = overlay.querySelector('#blackPanel');

            this.fxCtx = this.fxCanvas?.getContext('2d');
            this.pcbCtx = this.pcbCanvas?.getContext('2d');

            // Logo 显示状态
            this.logoVisible = false;
            this.logoAlpha = 0;
            this.logoTint = 0;    // 0 = 青蓝, 1 = 白
            this.logoRect = { x: 0, y: 0, w: 0, h: 0 };

            // 子系统
            this.numberStreams = new NumberStreams({});
            this.matrixRain = new MatrixRain([]);
            this.pcb = new PcbSystem();
            this.log = new SplashLog(this.logRoot);
            this.processText = new ProcessText(this.processTextEl);
            this.ending = null;
        }

        /** 初始化尺寸与 sprite */
        setup(logoImg) {
            this.logoImg = logoImg;
            this.resize();
            window.addEventListener('resize', () => this.resize());

            // 预渲染 sprite
            const numSprites = {};
            for (let i = 0; i < 10; i++) {
                numSprites[i] = buildNumberSprite(String(i), COLORS.number);
            }
            this.numberSprites = numSprites;
            this.numberStreams.sprites = numSprites;
            // MatrixRain 的字符索引为 0-2，必须准备 3 张精灵，否则 drawImage 会收到 undefined
            this.matrixSprites = [
                buildMatrixSprite(COLORS.matrix),
                buildMatrixSprite(COLORS.matrix),
                buildMatrixSprite(COLORS.matrix)
            ];
            this.matrixRain.sprites = this.matrixSprites;

            // 主循环
            let last = performance.now();
            const loop = (now) => {
                const dt = Math.min(0.05, (now - last) / 1000);
                last = now;
                const time = now / 1000;
                this.frame(dt, time);
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            for (const c of [this.pcbCanvas, this.fxCanvas, this.particleCanvas]) {
                if (!c) continue;
                const w = c.clientWidth || this.overlay.clientWidth;
                const h = c.clientHeight || this.overlay.clientHeight;
                c.width = Math.round(w * dpr);
                c.height = Math.round(h * dpr);
            }
            const ctxs = [this.pcbCtx, this.fxCtx, this.particleCanvas?.getContext('2d')];
            for (const ctx of ctxs) {
                if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
            const w = this.fxCanvas.clientWidth || this.overlay.clientWidth;
            const h = this.fxCanvas.clientHeight || this.overlay.clientHeight;
            this.w = w;
            this.h = h;
            this.numberStreams.init(w, h);
            this.matrixRain.init(w, h);
            this.pcb.init(w, h);
            this.log.resize();
            // Logo 显示区域（居中，保持宽高比）
            if (this.logoImg) {
                const iw = this.logoImg.naturalWidth || 512;
                const ih = this.logoImg.naturalHeight || 256;
                // 手机端（窄屏）适当缩小主 Logo，避免占满屏幕
                const mobile = w <= 768;
                const maxW = mobile ? w * 0.72 : w * 0.6;
                const maxH = mobile ? h * 0.32 : h * 0.5;
                let lw = Math.min(maxW, ih ? iw / ih * maxH : maxW);
                let lh = lw * ih / iw;
                if (lh > maxH) { lh = maxH; lw = lh * iw / ih; }
                this.logoRect = { x: w / 2 - lw / 2, y: h / 2 - lh / 2, w: lw, h: lh };
            }
        }

        /** 每帧：更新各子系统并绘制 */
        frame(dt, time) {
            // 更新
            this.numberStreams.update(dt, time);
            this.matrixRain.update(dt, time);
            this.pcb.update(dt, time);
            this.log.update(dt);
            this.processText.update(dt);

            // 绘制 PCB
            if (this.pcbCtx) {
                this.pcbCtx.clearRect(0, 0, this.w, this.h);
                this.pcb.draw(this.pcbCtx, time);
            }
            // 绘制 数字流 + 代码雨 + Logo
            if (this.fxCtx) {
                this.fxCtx.clearRect(0, 0, this.w, this.h);
                this.numberStreams.draw(this.fxCtx);
                this.matrixRain.draw(this.fxCtx);
                if (this.logoVisible && this.logoImg && this.logoAlpha > 0.01) {
                    this.drawLogo(this.fxCtx, time);
                }
            }
            // 绘制落幕粒子
            if (this.ending) this.ending.draw();
        }

        /** 绘制主 Logo（青蓝→白渐变染色，对应 LogoTechAppearEnhanced；离屏处理避免污染下层） */
        drawLogo(ctx) {
            const { x, y, w, h } = this.logoRect;
            const ow = Math.max(1, Math.ceil(w));
            const oh = Math.max(1, Math.ceil(h));
            if (!this._logoOffscreen) this._logoOffscreen = document.createElement('canvas');
            const off = this._logoOffscreen;
            if (off.width !== ow || off.height !== oh) {
                off.width = ow;
                off.height = oh;
            }
            const octx = off.getContext('2d');
            octx.clearRect(0, 0, ow, oh);
            octx.drawImage(this.logoImg, 0, 0, ow, oh);
            octx.globalCompositeOperation = 'source-atop';
            const r = lerp(0, 1, this.logoTint);
            const g = lerp(0.8, 1, this.logoTint);
            const b = lerp(1, 1, this.logoTint);
            octx.fillStyle = rgba({ r, g, b }, 1);
            octx.fillRect(0, 0, ow, oh);
            octx.globalCompositeOperation = 'source-over';
            ctx.save();
            ctx.globalAlpha = this.logoAlpha;
            ctx.drawImage(off, x, y, w, h);
            ctx.restore();
        }

        /** Logo 阶段 */
        async teamLogoPhase() {
            if (!this.teamLogo) return;
            const el = this.teamLogo;
            el.style.opacity = '1';
            await wait(1500);
            await this.fadeDom(el, 1, 0, 0.36);
            await wait(1500);
            await this.fadeDom(el, 0, 1, 0.36);
            await wait(2000);
            el.style.opacity = '0';
        }

        fadeDom(el, from, to, duration) {
            return animate(duration, (t) => {
                el.style.opacity = String(lerp(from, to, smoothEaseInOut(t)));
            });
        }

        /** 主 Logo 动画序列（对应 PlayAnimationSequence + LogoTechAppearEnhanced + PCB） */
        async mainLogoSequence() {
            this.logoVisible = true;
            this.logoAlpha = 0;
            this.logoTint = 0;

            // 数字流 + 代码雨启动
            this.numberStreams.start();
            this.matrixRain.start();

            await wait(CFG.numberStreamBeforeLogo * 1000);

            // Logo 科技感淡入（2s，青蓝→白）
            await animate(CFG.logoAppearDuration, (t) => {
                this.logoAlpha = smoothEaseInOut(t);
                this.logoTint = t;
            });
            this.logoAlpha = 1;
            this.logoTint = 1;

            // 生成 PCB 电路
            await this.pcb.generate();
            this.pcb.fadeIn(CFG.circuitFadeInDuration * 1.5);
            this.pcb.startAnim();

            await wait(CFG.logoAndLightPathDuration * 1000);

            // 数字流 / 代码雨淡出
            this.numberStreams.active = false;
            this.matrixRain.active = false;
            await this.fadeOutStreams(CFG.numberFadeDuration);
        }

        async fadeOutStreams(duration) {
            await animate(duration, (t, dt) => {
                const fade = clamp01(1 - t);
                this.numberStreams.fade = fade;
                this.matrixRain.fade = fade;
                for (const s of this.numberStreams.streams) s.baseY -= s.speed * dt;
                for (const c of this.matrixRain.columns) c.baseY += c.speed * dt;
            });
            // 清理
            this.numberStreams.streams.length = 0;
            this.matrixRain.columns.length = 0;
            this.numberStreams.fade = 1;
            this.matrixRain.fade = 1;
        }

        /** Loading 阶段（对应 ShowLoadingProgress） */
        async loadingPhase() {
            await this.log.push('INITIALIZING BOOT SEQUENCE...', 'message');

            this.loadText.style.opacity = '0';
            this.loadText.style.fontStyle = 'italic';
            this.loadText.textContent = '= Loading =';
            this.loadText.style.color = rgba(COLORS.fs, 1);
            await animate(1 / 2.8, (t) => {
                this.loadText.style.opacity = String(lerp(0, 0.75, smoothEaseInOut(t)));
            });

            // 版本号在下载阶段前就显示，并持续到结束阶段淡出
            this.versionText.textContent = `FinalSuspectWebsite v3.0`;
            this.versionText.style.opacity = '1';
        }

        /** 下载阶段（对应 LoadEssentialResources + VerifyAdditionalResources） */
        async downloadPhase(images) {
            await this.log.push('CHECKING DEPENDENCIES');
            await wait(800);

            // 依赖检查（本地已有，模拟通过）
            await this.log.push('START DOWNLOAD: "core.dat"', 'download');
            await wait(500);

            await this.log.push('CHECKING RESOURCES...');
            await this.processText.showTypewriter('正在检查文件...');
            await wait(300);

            if (!images || images.length === 0) {
                await this.log.push('ALL RESOURCES VERIFIED!', 'success');
                this.processText.hide();
                return;
            }

            // 隐藏打字机文案，进入下载计数
            await this.processText.hide();
            await this.processText.showDownloading('下载中', 0, images.length);
            await this.log.push(`START DOWNLOAD: "${this.fileName(images[0])}"`, 'download');

            let progress = 0;
            for (let i = 0; i < images.length; i++) {
                if (i > 0) await this.log.push(`START DOWNLOAD: "${this.fileName(images[i])}"`, 'download');
                await loadImage(images[i]);
                progress++;
                this.processText.updateDownloadProgress(progress, images.length);
                await wait(500); // 对应 DownloadResources 间 0.5s
            }

            await this.processText.hide();
            await this.processText.showComplete('下载完成');
            await this.log.push('FINISH!', 'success');
            await wait(500);
            await this.processText.hide();
        }

        fileName(url) {
            const parts = url.split('/');
            return parts[parts.length - 1];
        }

        /** 完成阶段（对应 ShowLoadCompleteAnimation） */
        async completePhase() {
            await this.log.ejectAll();
            await wait(1000);

            // "- Completed -" 绿色 + 闪烁 3 次
            this.loadText.textContent = '- Completed -';
            this.loadText.style.color = rgba(COLORS.completeGreen, 0.75);
            this.loadText.style.opacity = '1';
            for (let i = 0; i < 3; i++) {
                this.loadText.style.opacity = '0';
                await wait(30);
                this.loadText.style.opacity = '1';
                await wait(30);
            }
            await wait(500);
            const holdDuration = 2.5;
            const fadeDuration = 1.4;
            await wait(holdDuration * 1000);
            this._fadeProgress = 1;
            await animate(1 / fadeDuration, (_t, dt) => {
                const next = Math.max(0, this._fadeProgress - dt / fadeDuration);
                this._fadeProgress = next;
                // loadText 从 1 线性淡出到 0
                this.loadText.style.opacity = String(next);
                if (next >= 0.45) {
                    this.versionText.style.opacity = '1';
                } else {
                    this.versionText.style.opacity = String(next / 0.45);
                }
            });
            this.loadText.style.opacity = '0';
            this.versionText.style.opacity = '0';
            this._fadeProgress = undefined;
        }

        /** 落幕（对应 EndWithFadeToBlack） */
        async endingPhase() {
            this.ending = new ParticleEnding(
                this.particleCanvas, this.numberSprites, this.logoImg, this.logoRect);
            this.ending.build();

            // 停止 PCB 点亮协程（落幕期间不再复亮）
            this.pcb.stopAnim();
            const pcbPaths = this.pcb.paths;

            await this.ending.run(
                (a) => { this.logoAlpha = a; },
                (t) => {
                    // 电路板渐隐（对应阶段三）
                    for (const p of pcbPaths) {
                        p.currentAlpha = lerp(p.targetAlpha, 0, t);
                    }
                }
            );

            this.logoVisible = false;
            this.pcb.clear();

            // 黑幕淡入（1.8s）
            const black = this.blackPanel;
            black.style.opacity = '0';
            await animate(CFG.endingBlackDuration, (t) => {
                black.style.opacity = String(smoothEaseInOut(t));
            });
            black.style.opacity = '1';
        }

        async start(options) {
            const { images = [], onComplete } = options || {};

            // 锁定页面滚动，避免启动动画期间背景页面可滑动
            const htmlEl = document.documentElement;
            const bodyEl = document.body;
            const prevHtmlOverflow = htmlEl.style.overflow;
            const prevBodyOverflow = bodyEl.style.overflow;
            htmlEl.style.overflow = 'hidden';
            bodyEl.style.overflow = 'hidden';

            try {
                // 准备 Logo 图片（加载失败则跳过动画直接完成）
                const logoImg = await loadImage('/Resource/images/FinalSuspect-Logo-2.0.png');
                if (!logoImg) {
                    onComplete && onComplete();
                    return;
                }
                this.setup(logoImg);

                // 后台并行预加载所有图片（本地资源，速度极快）
                const preloadPromise = Promise.all(images.map((u) => loadImage(u)));

                await this.teamLogoPhase();
                await this.mainLogoSequence();
                await this.loadingPhase();

                // 下载阶段等待预加载完成后展示
                await preloadPromise;
                await this.downloadPhase(images);
                await this.completePhase();
                await this.endingPhase();

                // 全部结束
                this.log.clear();
            } finally {
                // 恢复页面滚动，随后交还控制权
                htmlEl.style.overflow = prevHtmlOverflow;
                bodyEl.style.overflow = prevBodyOverflow;
                onComplete && onComplete();
            }
        }
    }

    /* ====================================================================
     * 对外 API
     * ================================================================== */
    return {
        start(options) {
            const overlay = document.getElementById('loadingOverlay');
            if (!overlay) return Promise.resolve();
            // 缺少动画元素（其它页面共用 loadingOverlay 时）→ 优雅降级直接完成
            if (!overlay.querySelector('#splashFxCanvas') || !overlay.querySelector('#splashPcbCanvas')) {
                options && options.onComplete && options.onComplete();
                return Promise.resolve();
            }
            const engine = new SplashEngine(overlay);
            return engine.start(options);
        },
    };
})();
