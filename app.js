// ── Pantalla completa del mapa estelar ──
        function toggleStarFullscreen() {
            const wrap = document.getElementById('star-wrap');
            const isFs = document.fullscreenElement || document.webkitFullscreenElement;
            if (!isFs) {
                const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen || wrap.mozRequestFullScreen;
                if (req) req.call(wrap);
            } else {
                const ex = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen;
                if (ex) ex.call(document);
            }
        }
        ['fullscreenchange','webkitfullscreenchange','mozfullscreenchange'].forEach(ev => {
            document.addEventListener(ev, () => {
                const isFs  = !!(document.fullscreenElement || document.webkitFullscreenElement);
                const icon  = document.getElementById('star-fs-icon');
                const label = document.getElementById('star-fs-label');
                if (icon)  icon.textContent  = isFs ? '✕' : '⛶';
                if (label) label.textContent = isFs ? 'Salir' : 'Pantalla completa';
                setTimeout(() => { if (typeof drawSky === 'function') drawSky(); }, 100);
            });
        });

        (function() {
            // ── Posiciones en coordenadas de pantalla normalizadas (x:0-1, y:0-1) ──
            // Distribuidas manualmente para llenar bien el cielo y no amontonarse
            // Norte arriba, Sur abajo, Este izq, Oeste der (vista al cielo nocturno)

            const STARS = [
                // ORIÓN — bien distribuido al centro-derecha
                { n:"Betelgeuse",   x:0.52, y:0.38, mag:0.5,  t:"star" },  // 0
                { n:"Rigel",        x:0.58, y:0.55, mag:0.1,  t:"star" },  // 1
                { n:"Bellatrix",    x:0.46, y:0.40, mag:1.6,  t:"star" },  // 2
                { n:"Saiph",        x:0.56, y:0.57, mag:2.1,  t:"star" },  // 3
                { n:"Mintaka",      x:0.48, y:0.47, mag:2.2,  t:"star" },  // 4
                { n:"Alnilam",      x:0.52, y:0.46, mag:1.7,  t:"star" },  // 5
                { n:"Alnitak",      x:0.56, y:0.45, mag:1.8,  t:"star" },  // 6
                // CANIS MAJOR — bajo derecha
                { n:"Sirio",        x:0.64, y:0.62, mag:-1.5, t:"star" },  // 7
                { n:"Adhara",       x:0.68, y:0.70, mag:1.5,  t:"star" },  // 8
                // TAURO — arriba izquierda de Orión
                { n:"Aldebarán",    x:0.40, y:0.30, mag:0.9,  t:"star" },  // 9
                { n:"Elnath",       x:0.34, y:0.26, mag:1.7,  t:"star" },  // 10
                // GÉMINIS — arriba
                { n:"Cástor",       x:0.28, y:0.22, mag:1.6,  t:"star" },  // 11
                { n:"Pólux",        x:0.33, y:0.24, mag:1.1,  t:"star" },  // 12
                // LEO — izquierda media
                { n:"Régulo",       x:0.20, y:0.42, mag:1.4,  t:"star" },  // 13
                { n:"Denébola",     x:0.14, y:0.36, mag:2.1,  t:"star" },  // 14
                // VIRGO — izquierda baja
                { n:"Espiga",       x:0.12, y:0.60, mag:1.0,  t:"star" },  // 15
                // ESCORPIÓN — bajo izquierda
                { n:"Antares",      x:0.22, y:0.75, mag:1.1,  t:"star" },  // 16
                // ERIDANUS / SUR
                { n:"Achernar",     x:0.50, y:0.82, mag:0.5,  t:"star" },  // 17
                // CRUZ DEL SUR — centro-bajo
                { n:"Acrux",        x:0.44, y:0.74, mag:0.8,  t:"star" },  // 18
                { n:"Mimosa",       x:0.40, y:0.70, mag:1.3,  t:"star" },  // 19
                { n:"Gacrux",       x:0.44, y:0.66, mag:1.6,  t:"star" },  // 20
                { n:"Delta Cru",    x:0.48, y:0.70, mag:2.8,  t:"star" },  // 21
                // CENTAURO — bajo izquierda media
                { n:"Alfa Cen",     x:0.36, y:0.76, mag:-0.3, t:"star" },  // 22
                { n:"Beta Cen",     x:0.32, y:0.72, mag:0.6,  t:"star" },  // 23
                // ESTRELLAS DISPERSAS
                { n:"Capella",      x:0.26, y:0.14, mag:0.1,  t:"star" },  // 24
                { n:"Procyon",      x:0.60, y:0.30, mag:0.4,  t:"star" },  // 25
                { n:"Canopo",       x:0.62, y:0.78, mag:-0.7, t:"star" },  // 26
                { n:"Fomalhaut",    x:0.76, y:0.68, mag:1.2,  t:"star" },  // 27
                // PLANETAS — bien separados
                { n:"Venus ♀",      x:0.80, y:0.45, mag:-4.0, t:"planet" }, // 28
                { n:"Júpiter ♃",    x:0.75, y:0.28, mag:-2.0, t:"planet" }, // 29
                { n:"Saturno ♄",    x:0.18, y:0.55, mag:0.8,  t:"planet" }, // 30
                // ESTRELLA ESPECIAL CLEIDIS — centro-arriba, bien visible
                { n:"💜 Cleidis",   x:0.50, y:0.18, mag:-3.0, t:"love"   }, // 31
            ];

            const CONSTELLATIONS = [
                { name:"Orión",        lines:[[0,5],[5,6],[4,5],[2,4],[0,2],[1,6],[3,6],[1,3]] },
                { name:"Cruz del Sur", lines:[[18,20],[19,21],[18,19]] },
                { name:"Géminis",      lines:[[11,12],[12,10]] },
                { name:"Tauro",        lines:[[9,10]] },
                { name:"Canis Major",  lines:[[7,8]] },
                { name:"Centauro",     lines:[[22,23]] },
                { name:"Leo",          lines:[[13,14]] },
            ];

            function toXY(star, W, H) {
                return { x: star.x * W, y: star.y * H };
            }

            // Radio visual de la estrella según magnitud
            function starR(mag, scale) {
                // mag negativa = muy brillante, mag 3 = débil
                const base = Math.max(1.2, 3.8 - mag * 0.7);
                return Math.min(base, 4.5) * scale;
            }

            // Exponer globalmente para que fullscreenchange pueda llamarla
            window.drawSky = function drawSky() {
                const canvas = document.getElementById('starCanvas');
                if (!canvas) return;
                const wrap = canvas.parentElement;
                const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);

                // En fullscreen usa toda la pantalla; si no, usa el ancho del contenedor
                const cssW = isFs ? window.innerWidth  : Math.max(wrap.clientWidth  || 340, 200);
                const cssH = isFs ? window.innerHeight : Math.round(cssW * 0.88);

                // devicePixelRatio para pantallas AMOLED/Retina de Android — sin blur
                const dpr = Math.min(window.devicePixelRatio || 1, 3);
                canvas.width  = cssW * dpr;
                canvas.height = cssH * dpr;
                canvas.style.width  = cssW + 'px';
                canvas.style.height = cssH + 'px';

                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr); // escalar todo por dpr
                const W = cssW, H = cssH;
                const scale = W / 400; // escala base

                // — Fondo —
                const bg = ctx.createRadialGradient(W*0.5, H*0.3, 0, W*0.5, H*0.6, Math.max(W,H));
                bg.addColorStop(0,   '#0f0228');
                bg.addColorStop(0.6, '#08011a');
                bg.addColorStop(1,   '#030010');
                ctx.fillStyle = bg;
                ctx.fillRect(0, 0, W, H);

                // — Vía Láctea sutil —
                const ml = ctx.createLinearGradient(W*0.2, 0, W*0.8, H);
                ml.addColorStop(0,   'rgba(160,120,240,0)');
                ml.addColorStop(0.35,'rgba(160,120,240,0.04)');
                ml.addColorStop(0.5, 'rgba(180,140,255,0.07)');
                ml.addColorStop(0.65,'rgba(160,120,240,0.04)');
                ml.addColorStop(1,   'rgba(160,120,240,0)');
                ctx.fillStyle = ml;
                ctx.fillRect(0, 0, W, H);

                // — Estrellas de fondo pequeñas (seed fija) —
                let seed = 137;
                const rng = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; };
                for (let i = 0; i < 320; i++) {
                    const bx = rng() * W;
                    const by = rng() * H;
                    const br = rng() * 0.7 + 0.15;
                    const bo = rng() * 0.55 + 0.15;
                    ctx.beginPath();
                    ctx.arc(bx, by, br, 0, Math.PI*2);
                    ctx.fillStyle = `rgba(255,255,255,${bo.toFixed(2)})`;
                    ctx.fill();
                }

                // — Líneas de constelaciones —
                CONSTELLATIONS.forEach(con => {
                    con.lines.forEach(([a, b]) => {
                        const pa = toXY(STARS[a], W, H);
                        const pb = toXY(STARS[b], W, H);
                        ctx.beginPath();
                        ctx.moveTo(pa.x, pa.y);
                        ctx.lineTo(pb.x, pb.y);
                        ctx.strokeStyle = 'rgba(180,130,255,0.22)';
                        ctx.lineWidth = 0.7 * scale;
                        ctx.stroke();
                    });
                });

                // — Etiquetas de constelaciones —
                ctx.textAlign = 'center';
                CONSTELLATIONS.forEach(con => {
                    const idxs = [...new Set(con.lines.flat())];
                    const pts  = idxs.map(i => toXY(STARS[i], W, H));
                    const lx   = pts.reduce((s,p) => s+p.x, 0) / pts.length;
                    const ly   = pts.reduce((s,p) => s+p.y, 0) / pts.length - 10*scale;
                    ctx.fillStyle = 'rgba(190,140,255,0.5)';
                    ctx.font = `${Math.round(9*scale)}px sans-serif`;
                    ctx.fillText(con.name, lx, ly);
                });

                // — Puntos cardinales —
                const cards = [{l:'N',x:0.5,y:0.02},{l:'S',x:0.5,y:0.97},{l:'E',x:0.02,y:0.5},{l:'O',x:0.97,y:0.5}];
                ctx.font = `bold ${Math.round(11*scale)}px sans-serif`;
                cards.forEach(c => {
                    ctx.fillStyle = 'rgba(200,155,255,0.5)';
                    ctx.fillText(c.l, c.x*W, c.y*H);
                });

                // — Estrellas principales —
                STARS.forEach(star => {
                    const {x, y} = toXY(star, W, H);
                    const r = starR(star.mag, scale);

                    if (star.t === 'love') {
                        // Halo exterior suave
                        const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 8);
                        halo.addColorStop(0,   'rgba(244,176,255,0.35)');
                        halo.addColorStop(0.5, 'rgba(200,100,255,0.12)');
                        halo.addColorStop(1,   'rgba(200,100,255,0)');
                        ctx.beginPath();
                        ctx.arc(x, y, r*8, 0, Math.PI*2);
                        ctx.fillStyle = halo;
                        ctx.fill();
                        // Destellos de 4 puntas delgadas
                        ctx.save();
                        ctx.translate(x, y);
                        [0, 45, 90, 135].forEach(deg => {
                            ctx.save();
                            ctx.rotate(deg * Math.PI / 180);
                            const grad = ctx.createLinearGradient(0, -r*6, 0, r*6);
                            grad.addColorStop(0,   'rgba(244,176,255,0)');
                            grad.addColorStop(0.5, 'rgba(244,176,255,0.8)');
                            grad.addColorStop(1,   'rgba(244,176,255,0)');
                            ctx.strokeStyle = grad;
                            ctx.lineWidth = 0.8 * scale;
                            ctx.beginPath();
                            ctx.moveTo(0, -r*6);
                            ctx.lineTo(0,  r*6);
                            ctx.stroke();
                            ctx.restore();
                        });
                        ctx.restore();
                        // Núcleo
                        const core = ctx.createRadialGradient(x, y, 0, x, y, r*1.5);
                        core.addColorStop(0, 'rgba(255,255,255,1)');
                        core.addColorStop(0.4,'rgba(244,176,255,0.9)');
                        core.addColorStop(1, 'rgba(200,100,255,0)');
                        ctx.beginPath();
                        ctx.arc(x, y, r*1.5, 0, Math.PI*2);
                        ctx.fillStyle = core;
                        ctx.fill();
                        // Etiqueta
                        ctx.fillStyle = '#e8b4ff';
                        ctx.font = `bold ${Math.round(12*scale)}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.fillText('💜 Cleidis', x, y - r*7 - 2);

                    } else if (star.t === 'planet') {
                        // Halo pequeño amarillo
                        const ph = ctx.createRadialGradient(x, y, 0, x, y, r*3);
                        ph.addColorStop(0,   'rgba(255,220,80,0.5)');
                        ph.addColorStop(0.6, 'rgba(255,200,50,0.15)');
                        ph.addColorStop(1,   'rgba(255,200,50,0)');
                        ctx.beginPath();
                        ctx.arc(x, y, r*3, 0, Math.PI*2);
                        ctx.fillStyle = ph;
                        ctx.fill();
                        // Disco del planeta
                        ctx.beginPath();
                        ctx.arc(x, y, r*1.1, 0, Math.PI*2);
                        ctx.fillStyle = '#ffd84a';
                        ctx.fill();

                    } else {
                        // Halo suave blanco-violeta
                        const sh = ctx.createRadialGradient(x, y, 0, x, y, r*2.2);
                        sh.addColorStop(0,   'rgba(255,255,255,0.9)');
                        sh.addColorStop(0.5, 'rgba(220,200,255,0.25)');
                        sh.addColorStop(1,   'rgba(220,200,255,0)');
                        ctx.beginPath();
                        ctx.arc(x, y, r*2.2, 0, Math.PI*2);
                        ctx.fillStyle = sh;
                        ctx.fill();
                        // Núcleo
                        ctx.beginPath();
                        ctx.arc(x, y, r, 0, Math.PI*2);
                        ctx.fillStyle = '#ffffff';
                        ctx.fill();
                    }
                });
            }

            // — Tooltip interactivo —
            let tooltipReady = false;
            function setupTooltip() {
                if (tooltipReady) return;
                tooltipReady = true;
                const canvas  = document.getElementById('starCanvas');
                const tooltip = document.getElementById('star-tooltip');
                if (!canvas || !tooltip) return;

                function getPos(e) {
                    const rect = canvas.getBoundingClientRect();
                    const sx = canvas.width  / rect.width;
                    const sy = canvas.height / rect.height;
                    const cx = e.touches ? e.touches[0].clientX : e.clientX;
                    const cy = e.touches ? e.touches[0].clientY : e.clientY;
                    return { x: (cx - rect.left)*sx, y: (cy - rect.top)*sy };
                }

                function check(pos) {
                    const W = canvas.width, H = canvas.height;
                    const scale = W / 400;
                    let best = null, bestD = 28 * scale;
                    STARS.forEach(s => {
                        const p = toXY(s, W, H);
                        const d = Math.hypot(pos.x - p.x, pos.y - p.y);
                        if (d < bestD) { bestD = d; best = { s, p }; }
                    });
                    if (best) {
                        const rect = canvas.getBoundingClientRect();
                        const tx = best.p.x * (rect.width  / W);
                        const ty = best.p.y * (rect.height / H);
                        const tl = best.s.t==='planet' ? '🪐 Planeta' : best.s.t==='love' ? '💜 Nuestra estrella' : '⭐ Estrella';
                        const ml = best.s.t==='love'   ? 'La más brillante' : `Mag. ${best.s.mag.toFixed(1)}`;
                        tooltip.innerHTML = `<strong>${best.s.n}</strong><br>${tl}<br><span style="opacity:.75;font-size:.72rem">${ml}</span>`;
                        tooltip.style.display = 'block';
                        tooltip.style.left = Math.min(tx+14, rect.width-165) + 'px';
                        tooltip.style.top  = Math.max(ty-62, 4) + 'px';
                    } else {
                        tooltip.style.display = 'none';
                    }
                }

                canvas.addEventListener('mousemove',  e => check(getPos(e)));
                canvas.addEventListener('mouseleave', () => { tooltip.style.display='none'; });
                canvas.addEventListener('touchstart', e => { e.preventDefault(); check(getPos(e)); }, { passive:false });
                canvas.addEventListener('touchend',   () => setTimeout(() => { tooltip.style.display='none'; }, 2000));
            }

            let resizeHandled = false;
            function initStarMap() {
                window.drawSky();
                setupTooltip();
                if (!resizeHandled) {
                    resizeHandled = true;
                    // resize y orientationchange para Android al rotar pantalla
                    const onResize = () => {
                        if (document.getElementById('estrellas') &&
                            document.getElementById('estrellas').style.display !== 'none') {
                            setTimeout(window.drawSky, 80);
                        }
                    };
                    window.addEventListener('resize', onResize);
                    window.addEventListener('orientationchange', onResize);
                }
            }

            function hookGo() {
                if (typeof window.go === 'function') {
                    const orig = window.go;
                    window.go = function(id) {
                        orig(id);
                        if (id === 'estrellas') setTimeout(initStarMap, 150);
                    };
                } else {
                    setTimeout(hookGo, 100);
                }
            }
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', hookGo);
            } else {
                setTimeout(hookGo, 200);
            }
        })();
        // CONFIGURACIÓN INICIAL
        const startDate = new Date(2026, 1, 10); // Meses en JS: 0=Ene, 1=Feb
        let currentSection = 'inicio';
        // ══════════════════════════════════════════════════
        // COLECCIÓN COMPLETA DE RECUERDOS (111 FOTOS Y VIDEOS)
        // ══════════════════════════════════════════════════
        const albumMedia = [
    {
        "src": "El amor de mi vida/IMG_20260210_155213477.jpg",
        "type": "image",
        "date": "10 Feb 2026",
        "caption": "Tu sonrisa ilumina mi vida ❤️"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142510485_HDR.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Cada momento a tu lado es mágico ✨"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142512986.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Mi lugar favorito es contigo 💑"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142519947.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Eres mi felicidad entera 🌹"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142521815.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Juntos en cada aventura 🌎"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142524445.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Amor eterno y verdadero 💜"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142534721.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Nuestra complicidad única 🥰"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142536624.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Haciendo recuerdos inolvidables 📸"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142545367.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Tu mirada que me enamora 💖"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142559115.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Risas que llenan el corazón 😄"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142606381.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Siempre de tu mano 🤝"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142610619.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Mi princesa hermosa 👑"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142613571.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "El amor más bonito del mundo 💕"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142615361.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Gracias por existir, mi vida 🌟"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142622626_HDR.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Contigo todo es perfecto 🌷"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_142627922_HDR.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Un día inolvidable juntos ☀️"
    },
    {
        "src": "El amor de mi vida/IMG_20260219_143437693_HDR.jpg",
        "type": "image",
        "date": "19 Feb 2026",
        "caption": "Amándote cada día más 💘"
    },
    {
        "src": "El amor de mi vida/IMG_20260308_162651873.jpg",
        "type": "image",
        "date": "8 Mar 2026",
        "caption": "Nuestra historia favorita 📖"
    },
    {
        "src": "El amor de mi vida/VID_20260310_153946255.mp4",
        "type": "video",
        "date": "10 Mar 2026",
        "caption": "Eres mi sol en días nublados ☀️"
    },
    {
        "src": "El amor de mi vida/VID_20260310_154133628.mp4",
        "type": "video",
        "date": "10 Mar 2026",
        "caption": "Tú y yo por siempre 💫"
    },
    {
        "src": "El amor de mi vida/VID_20260310_154204295.mp4",
        "type": "video",
        "date": "10 Mar 2026",
        "caption": "Tu sonrisa ilumina mi vida ❤️"
    },
    {
        "src": "El amor de mi vida/VID_20260310_154234627.mp4",
        "type": "video",
        "date": "10 Mar 2026",
        "caption": "Cada momento a tu lado es mágico ✨"
    },
    {
        "src": "El amor de mi vida/VID_20260310_154438853.mp4",
        "type": "video",
        "date": "10 Mar 2026",
        "caption": "Mi lugar favorito es contigo 💑"
    },
    {
        "src": "El amor de mi vida/VID_20260310_154601073.mp4",
        "type": "video",
        "date": "10 Mar 2026",
        "caption": "Eres mi felicidad entera 🌹"
    },
    {
        "src": "El amor de mi vida/VID_20260310_154638510.mp4",
        "type": "video",
        "date": "10 Mar 2026",
        "caption": "Juntos en cada aventura 🌎"
    },
    {
        "src": "El amor de mi vida/VID_20260310_154743528.mp4",
        "type": "video",
        "date": "10 Mar 2026",
        "caption": "Amor eterno y verdadero 💜"
    },
    {
        "src": "El amor de mi vida/IMG_20260313_164358492_HDR.jpg",
        "type": "image",
        "date": "13 Mar 2026",
        "caption": "Nuestra complicidad única 🥰"
    },
    {
        "src": "El amor de mi vida/IMG_20260313_164358492_HDR~2.jpg",
        "type": "image",
        "date": "13 Mar 2026",
        "caption": "Haciendo recuerdos inolvidables 📸"
    },
    {
        "src": "El amor de mi vida/IMG_20260313_164404817_HDR.jpg",
        "type": "image",
        "date": "13 Mar 2026",
        "caption": "Tu mirada que me enamora 💖"
    },
    {
        "src": "El amor de mi vida/IMG_20260411_174657314.jpg",
        "type": "image",
        "date": "11 Abr 2026",
        "caption": "Risas que llenan el corazón 😄"
    },
    {
        "src": "El amor de mi vida/IMG_20260411_174706500.jpg",
        "type": "image",
        "date": "11 Abr 2026",
        "caption": "Siempre de tu mano 🤝"
    },
    {
        "src": "El amor de mi vida/IMG_20260411_175831699.jpg",
        "type": "image",
        "date": "11 Abr 2026",
        "caption": "Mi princesa hermosa 👑"
    },
    {
        "src": "El amor de mi vida/IMG_20260411_175842333.jpg",
        "type": "image",
        "date": "11 Abr 2026",
        "caption": "El amor más bonito del mundo 💕"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_153727918.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Gracias por existir, mi vida 🌟"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_153733603.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Contigo todo es perfecto 🌷"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_153739017.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Un día inolvidable juntos ☀️"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_153742915.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Amándote cada día más 💘"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_153745257.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Nuestra historia favorita 📖"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_153904156.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Eres mi sol en días nublados ☀️"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_153907436.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Tú y yo por siempre 💫"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_153912093_HDR.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Tu sonrisa ilumina mi vida ❤️"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_155720226.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Cada momento a tu lado es mágico ✨"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_155801128-COLLAGE.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Mi lugar favorito es contigo 💑"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_155801128.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Eres mi felicidad entera 🌹"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_155854643.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Juntos en cada aventura 🌎"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_160118899.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Amor eterno y verdadero 💜"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_160125625.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Nuestra complicidad única 🥰"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_160136221.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Haciendo recuerdos inolvidables 📸"
    },
    {
        "src": "El amor de mi vida/IMG_20260421_160141539.jpg",
        "type": "image",
        "date": "21 Abr 2026",
        "caption": "Tu mirada que me enamora 💖"
    },
    {
        "src": "El amor de mi vida/IMG_20260422_134241295_HDR.jpg",
        "type": "image",
        "date": "22 Abr 2026",
        "caption": "Risas que llenan el corazón 😄"
    },
    {
        "src": "El amor de mi vida/IMG_20260422_134243060.jpg",
        "type": "image",
        "date": "22 Abr 2026",
        "caption": "Siempre de tu mano 🤝"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_162936477.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Mi princesa hermosa 👑"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_162938304.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "El amor más bonito del mundo 💕"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_162946104_HDR.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Gracias por existir, mi vida 🌟"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164448530.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Contigo todo es perfecto 🌷"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164454334_HDR.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Un día inolvidable juntos ☀️"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164457121.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Amándote cada día más 💘"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164500314.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Nuestra historia favorita 📖"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164509543_HDR.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Eres mi sol en días nublados ☀️"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164511286_HDR.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Tú y yo por siempre 💫"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164513116_HDR.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Tu sonrisa ilumina mi vida ❤️"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164514959_HDR.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Cada momento a tu lado es mágico ✨"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164516467.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Mi lugar favorito es contigo 💑"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164519222.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Eres mi felicidad entera 🌹"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164631622_HDR.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Juntos en cada aventura 🌎"
    },
    {
        "src": "El amor de mi vida/IMG_20260510_164634560_HDR.jpg",
        "type": "image",
        "date": "10 May 2026",
        "caption": "Amor eterno y verdadero 💜"
    },
    {
        "src": "El amor de mi vida/IMG_20260523_173312565.jpg",
        "type": "image",
        "date": "23 May 2026",
        "caption": "Nuestra complicidad única 🥰"
    },
    {
        "src": "El amor de mi vida/IMG_20260523_173313419.jpg",
        "type": "image",
        "date": "23 May 2026",
        "caption": "Haciendo recuerdos inolvidables 📸"
    },
    {
        "src": "El amor de mi vida/IMG_20260523_173318841.jpg",
        "type": "image",
        "date": "23 May 2026",
        "caption": "Tu mirada que me enamora 💖"
    },
    {
        "src": "El amor de mi vida/IMG_20260523_173319854.jpg",
        "type": "image",
        "date": "23 May 2026",
        "caption": "Risas que llenan el corazón 😄"
    },
    {
        "src": "El amor de mi vida/IMG_20260523_173325009.jpg",
        "type": "image",
        "date": "23 May 2026",
        "caption": "Siempre de tu mano 🤝"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144715399_HDR.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "Mi princesa hermosa 👑"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144729580.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "El amor más bonito del mundo 💕"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144734537.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "Gracias por existir, mi vida 🌟"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144735415.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "Contigo todo es perfecto 🌷"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144739155.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "Un día inolvidable juntos ☀️"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144743345_HDR.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "Amándote cada día más 💘"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144749431.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "Nuestra historia favorita 📖"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144850344.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "Eres mi sol en días nublados ☀️"
    },
    {
        "src": "El amor de mi vida/IMG_20260719_144857755_HDR.jpg",
        "type": "image",
        "date": "19 Jul 2026",
        "caption": "Tú y yo por siempre 💫"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162302712.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Tu sonrisa ilumina mi vida ❤️"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162312703.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Cada momento a tu lado es mágico ✨"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162341524_HDR.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Mi lugar favorito es contigo 💑"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162346401.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Eres mi felicidad entera 🌹"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162349498.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Juntos en cada aventura 🌎"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162401329.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Amor eterno y verdadero 💜"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162431407.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Nuestra complicidad única 🥰"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162438828.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Haciendo recuerdos inolvidables 📸"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162505194.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Tu mirada que me enamora 💖"
    },
    {
        "src": "El amor de mi vida/IMG_20260802_162517178.jpg",
        "type": "image",
        "date": "2 Ago 2026",
        "caption": "Risas que llenan el corazón 😄"
    },
    {
        "src": "El amor de mi vida/IMG_20260808_170116426_HDR.jpg",
        "type": "image",
        "date": "8 Ago 2026",
        "caption": "Siempre de tu mano 🤝"
    },
    {
        "src": "El amor de mi vida/IMG_20260808_174438899_HDR.jpg",
        "type": "image",
        "date": "8 Ago 2026",
        "caption": "Mi princesa hermosa 👑"
    },
    {
        "src": "El amor de mi vida/IMG_20260808_174441003_HDR.jpg",
        "type": "image",
        "date": "8 Ago 2026",
        "caption": "El amor más bonito del mundo 💕"
    },
    {
        "src": "El amor de mi vida/IMG_20260808_174443177_HDR.jpg",
        "type": "image",
        "date": "8 Ago 2026",
        "caption": "Gracias por existir, mi vida 🌟"
    },
    {
        "src": "El amor de mi vida/IMG_20260808_174447089.jpg",
        "type": "image",
        "date": "8 Ago 2026",
        "caption": "Contigo todo es perfecto 🌷"
    },
    {
        "src": "El amor de mi vida/IMG_20260808_174448381_HDR.jpg",
        "type": "image",
        "date": "8 Ago 2026",
        "caption": "Un día inolvidable juntos ☀️"
    },
    {
        "src": "El amor de mi vida/20260810_174606-IMG_STYLE.jpg",
        "type": "image",
        "date": "10 Ago 2026",
        "caption": "Amándote cada día más 💘"
    },
    {
        "src": "El amor de mi vida/20260810_174857-IMG_STYLE.jpg",
        "type": "image",
        "date": "10 Ago 2026",
        "caption": "Nuestra historia favorita 📖"
    },
    {
        "src": "El amor de mi vida/2026-08-16-16-17-58-905.jpg",
        "type": "image",
        "date": "16 Ago 2026",
        "caption": "Eres mi sol en días nublados ☀️"
    },
    {
        "src": "El amor de mi vida/2026-08-16-16-18-08-267.jpg",
        "type": "image",
        "date": "16 Ago 2026",
        "caption": "Tú y yo por siempre 💫"
    },
    {
        "src": "El amor de mi vida/2026-08-16-16-34-10-116.jpg",
        "type": "image",
        "date": "16 Ago 2026",
        "caption": "Tu sonrisa ilumina mi vida ❤️"
    },
    {
        "src": "El amor de mi vida/2026-08-16-16-34-13-510.jpg",
        "type": "image",
        "date": "16 Ago 2026",
        "caption": "Cada momento a tu lado es mágico ✨"
    },
    {
        "src": "El amor de mi vida/2026-08-16-16-39-38-280.jpg",
        "type": "image",
        "date": "16 Ago 2026",
        "caption": "Mi lugar favorito es contigo 💑"
    },
    {
        "src": "El amor de mi vida/2026-08-16-16-39-40-049.jpg",
        "type": "image",
        "date": "16 Ago 2026",
        "caption": "Eres mi felicidad entera 🌹"
    },
    {
        "src": "El amor de mi vida/IMG_20260822_183300871.jpg",
        "type": "image",
        "date": "22 Ago 2026",
        "caption": "Juntos en cada aventura 🌎"
    },
    {
        "src": "El amor de mi vida/IMG_20260822_183304362.jpg",
        "type": "image",
        "date": "22 Ago 2026",
        "caption": "Amor eterno y verdadero 💜"
    },
    {
        "src": "El amor de mi vida/IMG_20260822_183311753.jpg",
        "type": "image",
        "date": "22 Ago 2026",
        "caption": "Nuestra complicidad única 🥰"
    },
    {
        "src": "El amor de mi vida/IMG_20260822_183324278.jpg",
        "type": "image",
        "date": "22 Ago 2026",
        "caption": "Haciendo recuerdos inolvidables 📸"
    },
    {
        "src": "El amor de mi vida/IMG_20260822_183337433.jpg",
        "type": "image",
        "date": "22 Ago 2026",
        "caption": "Tu mirada que me enamora 💖"
    },
    {
        "src": "El amor de mi vida/IMG_20260822_183340955.jpg",
        "type": "image",
        "date": "22 Ago 2026",
        "caption": "Risas que llenan el corazón 😄"
    },
    {
        "src": "El amor de mi vida/IMG_20260822_183342117.jpg",
        "type": "image",
        "date": "22 Ago 2026",
        "caption": "Siempre de tu mano 🤝"
    }
];

        let currentAlbumFilter = 'all';
        let displayedAlbumCount = 6;
        const ALBUM_BATCH_SIZE = 6;
        let currentLightboxIndex = 0;
        let activeFilteredMedia = [];

        function getFilteredMedia() {
            if (currentAlbumFilter === 'all') return albumMedia;
            return albumMedia.filter(item => item.type === currentAlbumFilter);
        }

        function renderGallery(filter = null, reset = true) {
            if (filter) currentAlbumFilter = filter;
            if (reset) displayedAlbumCount = ALBUM_BATCH_SIZE;

            const grid = document.getElementById('album-grid');
            if (!grid) return;

            activeFilteredMedia = getFilteredMedia();
            const itemsToShow = activeFilteredMedia.slice(0, displayedAlbumCount);

            grid.innerHTML = itemsToShow.map((item, idx) => {
                const isVid = item.type === 'video';
                return `
                    <div class="polaroid" onclick="openLightbox(${idx})" title="Toca para ver en pantalla completa">
                        <span class="polaroid-badge">${item.date}</span>
                        ${isVid 
                            ? `<video src="${item.src}" preload="metadata" muted playsinline></video>
                               <div class="video-indicator">▶</div>` 
                            : `<img src="${item.src}" alt="Recuerdo con Cleidis" loading="lazy" decoding="async">`
                        }
                        <p class="caption">${item.caption}</p>
                    </div>
                `;
            }).join('');

            const loadMoreBtn = document.getElementById('btn-load-more');
            if (loadMoreBtn) {
                if (displayedAlbumCount >= activeFilteredMedia.length) {
                    loadMoreBtn.style.display = 'none';
                } else {
                    loadMoreBtn.style.display = 'inline-block';
                    const remaining = activeFilteredMedia.length - displayedAlbumCount;
                    loadMoreBtn.innerText = `Ver más recuerdos (+${Math.min(ALBUM_BATCH_SIZE, remaining)}) 💜`;
                }
            }
        }

        function loadMoreMedia() {
            displayedAlbumCount += ALBUM_BATCH_SIZE;
            renderGallery(null, false);
            spawnBatch(8);
        }

        function filterGallery(type, btn) {
            currentAlbumFilter = type;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');
            renderGallery(type, true);
            spawnBatch(10);
        }

        // ── LIGHTBOX MODAL ──
        function openLightbox(index) {
            activeFilteredMedia = getFilteredMedia();
            if (index < 0 || index >= activeFilteredMedia.length) return;
            currentLightboxIndex = index;

            const modal = document.getElementById('lightbox-modal');
            const mediaContainer = document.getElementById('lightbox-media-container');
            const captionEl = document.getElementById('lightbox-caption');
            const counterEl = document.getElementById('lightbox-counter');

            const item = activeFilteredMedia[index];
            if (item.type === 'video') {
                mediaContainer.innerHTML = `<video class="lightbox-media" src="${item.src}" controls autoplay playsinline></video>`;
            } else {
                mediaContainer.innerHTML = `<img class="lightbox-media" src="${item.src}" alt="${item.caption}">`;
            }

            captionEl.innerText = `${item.caption} (${item.date})`;
            counterEl.innerText = `${index + 1} de ${activeFilteredMedia.length} recuerdos`;

            modal.classList.add('active');
            spawnBatch(6);
        }

        function closeLightbox() {
            const modal = document.getElementById('lightbox-modal');
            const mediaContainer = document.getElementById('lightbox-media-container');
            if (mediaContainer) {
                const vid = mediaContainer.querySelector('video');
                if (vid) vid.pause();
                mediaContainer.innerHTML = '';
            }
            if (modal) modal.classList.remove('active');
        }

        function lightboxNext() {
            if (activeFilteredMedia.length === 0) return;
            const nextIdx = (currentLightboxIndex + 1) % activeFilteredMedia.length;
            openLightbox(nextIdx);
        }

        function lightboxPrev() {
            if (activeFilteredMedia.length === 0) return;
            const prevIdx = (currentLightboxIndex - 1 + activeFilteredMedia.length) % activeFilteredMedia.length;
            openLightbox(prevIdx);
        }

        function onLightboxBgClick(e) {
            if (e.target.id === 'lightbox-modal' || e.target.id === 'lightbox-content-wrap') {
                closeLightbox();
            }
        }

        // Teclado para Lightbox
        document.addEventListener('keydown', (e) => {
            const modal = document.getElementById('lightbox-modal');
            if (!modal || !modal.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') lightboxNext();
            if (e.key === 'ArrowLeft') lightboxPrev();
        });

        // Gesto táctil Swipe para Lightbox en móvil
        let touchStartX = 0;
        let touchEndX = 0;
        document.addEventListener('touchstart', (e) => {
            const modal = document.getElementById('lightbox-modal');
            if (modal && modal.classList.contains('active')) {
                touchStartX = e.changedTouches[0].screenX;
            }
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            const modal = document.getElementById('lightbox-modal');
            if (modal && modal.classList.contains('active')) {
                touchEndX = e.changedTouches[0].screenX;
                const diff = touchEndX - touchStartX;
                if (Math.abs(diff) > 50) {
                    if (diff < 0) lightboxNext();
                    else lightboxPrev();
                }
            }
        }, { passive: true });


        // DESBLOQUEAR WEB

        // NOVEDADES
        function showNovedades() {
            const modal = document.getElementById('novedades-modal');
            if(modal) {
                modal.style.display = 'flex';
                spawnBatch(5);
            } else {
                unlockWeb();
            }
        }

        function closeNovedadesAndUnlock() {
            const modal = document.getElementById('novedades-modal');
            if(modal) {
                modal.style.display = 'none';
            }
            unlockWeb();
        }

        function unlockWeb() {
            const hero = document.getElementById('hero');
            hero.style.transform = 'translateY(-100%)';
            hero.style.opacity = '0';
            
            setTimeout(() => {
                hero.style.display = 'none';
                document.querySelector('.main-nav-wrap').classList.add('visible');
                go('inicio');
                initTheme();
                startCounter();
                initFloating();
                setDailyMessage();
                renderGallery();
                initMemoryGame();
                loadKisses();
                loadMusicStats();
                countVisit();
                updateHugCounter();
                updateMoodHistory();
                loadMemories();
                loadBucketList();
                updateMemoryStats();
                setTimeout(showVisitCount, 500);
            }, 800);
        }

        // NAVEGACIÓN

        // TEMA OSCURO / CLARO
        function toggleTheme() {
            const body = document.documentElement;
            const btn = document.getElementById('theme-toggle');
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                btn.innerText = '🌙';
                localStorage.setItem('theme', 'light');
            } else {
                body.setAttribute('data-theme', 'dark');
                btn.innerText = '☀️';
                localStorage.setItem('theme', 'dark');
            }
        }
        
        function initTheme() {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
                const btn = document.getElementById('theme-toggle');
                if (btn) btn.innerText = '☀️';
            }
        }

        function go(id) {
            document.querySelectorAll('.section').forEach(s => s.style.display = 'none');
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            
            document.getElementById(id).style.display = 'block';
            document.getElementById('btn-' + id).classList.add('active');
            
            // Cerrar menú hamburguesa automáticamente sin verificar
            const nav = document.getElementById('navbar');
            const hamb = document.getElementById('main-hamburger');
            nav.classList.remove('open');
            hamb.classList.remove('active');
            
            window.scrollTo({top: 0, behavior: 'smooth'});
            spawnBatch(10);
            
            if(id === 'inicio') setDailyMessage();
            if(id === 'galeria') renderGallery();
            if(id === 'conexion') loadBucketList();
        }

        function toggleMainNav() {
            const nav = document.getElementById('navbar');
            const hamb = document.getElementById('main-hamburger');
            nav.classList.toggle('open');
            hamb.classList.toggle('active');
        }

        function toggleCollapsible(btn) {
            const content = btn.nextElementSibling;
            content.classList.toggle('active');
            btn.textContent = content.classList.contains('active') 
                ? btn.textContent.replace('+ ', '- ')
                : btn.textContent.replace('- ', '+ ');
        }

        function closeHamburgerMenu() {
            const nav = document.getElementById('navbar');
            const hamb = document.getElementById('main-hamburger');
            nav.classList.remove('open');
            hamb.classList.remove('active');
        }
        function setDailyMessage() {
            const msgs = [
                "Hoy es un gran día para recordarte que eres mi mundo. ❤️",
                "Tu sonrisa es mi combustible favorito para cada mañana. ☀️",
                "Cada día que pasa me convenzo más de que eres tú. 🌹",
                "Gracias por elegirme para ser tu compañero de vida. ✨",
                "Eres el regalo más bonito que me ha dado el destino. 🎁",
                "No hay distancia que pueda separar lo que sentimos. 🌎"
            ];
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            document.getElementById('daily-msg').innerText = msg;
        }

        // COFRE DE DESEOS
        function openChest() {
            const chest = document.getElementById('chest');
            chest.innerText = chest.innerText === '🎁' ? '🔓' : '🎁';
            spawnBatch(10);
        }

        async function sendWish() {
            const wish = document.getElementById('wish');
            const wishText = wish.value.trim();
            if(wishText === "") return;
            
            const btn = event.target;
            const originalText = btn.innerText;
            btn.innerText = "Guardando deseo...";
            btn.disabled = true;

            // 1. Guardar en Firebase Realtime Database
            if (window.db && window.dbRef && window.dbPush) {
                try {
                    const wishesRef = window.dbRef(window.db, 'deseos');
                    await window.dbPush(wishesRef, {
                        texto: wishText,
                        fecha: new Date().toLocaleString(),
                        dispositivo: navigator.userAgent
                    });
                    console.log("Deseo guardado en Firebase");
                    
                    // 2. Enviar notificación por correo (EmailJS)
                    // Ajustado para coincidir con tu plantilla de EmailJS
                    const templateParams = {
                        title: 'Nuevo Deseo en el Cofre',
                        name: 'Cleidis ❤️',
                        message: wishText,
                        date: new Date().toLocaleString()
                    };

                    emailjs.send('service_op5fqq7', 'template_xoux15k', templateParams)
                        .then(function(response) {
                           console.log('Correo enviado con éxito!', response.status, response.text);
                        }, function(error) {
                           console.log('Fallo el envío del correo...', error);
                        });

                    btn.innerText = "¡Deseo enviado! ❤️";
                    wish.value = "";
                    spawnBatch(30);
                } catch (error) {
                    console.error("Error al guardar en Firebase:", error);
                    btn.innerText = "Error al guardar ❌";
                }
            } else {
                btn.innerText = "Error de conexión ❌";
            }
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.disabled = false;
            }, 3000);
        }

        // JUEGOS: RULETA
        function spinWheel() {
            const wheel = document.getElementById('wheel');
            const result = document.getElementById('wheel-result');
            const options = ["Ir por un helado 🍦", "Cine en casa 🎬", "Caminata romántica 🌅", "Cena especial 🍕", "Noche de baile 💃", "Tarde de fotos 📸"];
            
            const randomDegree = Math.floor(Math.random() * 3600) + 720; // Al menos 2 vueltas
            wheel.style.transform = `rotate(${randomDegree}deg)`;
            
            result.innerText = "Girando...";
            
            setTimeout(() => {
                const actualDegree = randomDegree % 360;
                const optionIndex = Math.floor((360 - actualDegree) / 60) % 6;
                result.innerText = "¡Salió: " + options[optionIndex] + "! ❤️";
                spawnBatch(15);
            }, 4000);
        }

        // JUEGOS: MEMORIA
        let hasFlippedCard = false;
        let lockBoard = false;
        let firstCard, secondCard;

        function initMemoryGame() {
            const board = document.getElementById('memory-board');
            const imagePool = (typeof albumMedia !== 'undefined' && albumMedia.length > 0)
                ? albumMedia.filter(m => m.type === 'image').map(m => m.src)
                : ['foto1.jpeg', 'foto2.jpeg', 'foto3.jpeg', 'foto4.jpeg', 'foto5.jpeg', 'foto6.jpeg'];
            
            const selectedImgs = [...imagePool].sort(() => Math.random() - 0.5).slice(0, 6);
            const cards = [...selectedImgs, ...selectedImgs];
            cards.sort(() => Math.random() - 0.5);
            
            board.innerHTML = '';
            cards.forEach(img => {
                const card = document.createElement('div');
                card.className = 'memory-card';
                card.innerHTML = `
                    <div class="memory-front">❓</div>
                    <div class="memory-back"><img src="${img}"></div>
                `;
                card.dataset.img = img;
                card.onclick = flipMemoryCard;
                board.appendChild(card);
            });
        }

        function flipMemoryCard() {
            if (lockBoard) return;
            if (this === firstCard) return;

            this.classList.add('flipped');

            if (!hasFlippedCard) {
                hasFlippedCard = true;
                firstCard = this;
                return;
            }

            secondCard = this;
            checkForMatch();
        }

        function checkForMatch() {
            let isMatch = firstCard.dataset.img === secondCard.dataset.img;
            isMatch ? disableCards() : unflipCards();
        }

        function disableCards() {
            firstCard.onclick = null;
            secondCard.onclick = null;
            resetBoard();
            spawnBatch(5);
        }

        function unflipCards() {
            lockBoard = true;
            setTimeout(() => {
                firstCard.classList.remove('flipped');
                secondCard.classList.remove('flipped');
                resetBoard();
            }, 1000);
        }

        function resetBoard() {
            [hasFlippedCard, lockBoard] = [false, false];
            [firstCard, secondCard] = [null, null];
        }

        // JUEGOS: BESOS
        let kisses = 0;
        function sendKiss() {
            kisses++;
            document.getElementById('kiss-total').innerText = kisses;
            spawnBatch(1);
            
            // Guardar en Firebase
            if (window.db && window.dbRef && window.dbSet) {
                const kissRef = window.dbRef(window.db, 'besos_contador');
                window.dbSet(kissRef, kisses);
            }
        }

        function loadKisses() {
            if (window.db && window.dbRef) {
                const kissRef = window.dbRef(window.db, 'besos_contador');
                if (window.dbOnValue) {
                    window.dbOnValue(kissRef, (snapshot) => {
                        kisses = snapshot.val() || 0;
                        document.getElementById('kiss-total').innerText = kisses;
                    });
                } else if (window.dbGet) {
                    window.dbGet(kissRef).then(snapshot => {
                        kisses = snapshot.val() || 0;
                        document.getElementById('kiss-total').innerText = kisses;
                    });
                }
            }
        }

        // ADMIN PANEL
        function askAdmin() {
            const pass = prompt("Introduce la clave secreta:");
            if (pass === "cleidis2026") {
                openAdmin();
            }
        }

        function openAdmin() {
            document.getElementById('admin-panel').style.display = 'block';
            loadWishes();
        }

        function closeAdmin() {
            document.getElementById('admin-panel').style.display = 'none';
        }

        function loadWishes() {
            const container = document.getElementById('wishes-container');
            if (window.db && window.dbRef) {
                const wishesRef = window.dbRef(window.db, 'deseos');
                const renderWishes = (snapshot) => {
                    const data = snapshot.val();
                    container.innerHTML = "";
                    if (data) {
                        Object.values(data).reverse().forEach(wish => {
                            const item = document.createElement('div');
                            item.className = 'wish-list-item';
                            item.innerHTML = `
                                <p>${wish.texto}</p>
                                <span class="wish-date">${wish.fecha}</span>
                            `;
                            container.appendChild(item);
                        });
                    } else {
                        container.innerHTML = "<p>No hay deseos aún.</p>";
                    }
                };
                if (window.dbOnValue) {
                    window.dbOnValue(wishesRef, renderWishes);
                } else if (window.dbGet) {
                    window.dbGet(wishesRef).then(renderWishes);
                }
            }
        }

        function countVisit() {
            if (!window.db || !window.dbRef || !window.dbGet || !window.dbSet) return;
            const visitsRef = window.dbRef(window.db, 'visitas');
            window.dbGet(visitsRef).then(snapshot => {
                const current = snapshot.exists() ? (snapshot.val() || 0) : 0;
                window.dbSet(visitsRef, current + 1);
            }).catch(err => console.warn('Error actualizando visitas', err));
        }

        function showVisitCount() {
            if (!window.db || !window.dbRef || !window.dbGet) return;
            const visitsRef = window.dbRef(window.db, 'visitas');
            window.dbGet(visitsRef).then(snapshot => {
                if (snapshot.exists()) {
                    const visits = snapshot.val();
                    document.getElementById('visit-count').innerText = `Visitas totales: ${visits}`;
                }
            });
        }

        // CONTADOR
        function startCounter() {
            function update() {
                const now = new Date();
                const diff = now - startDate;
                
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                
                document.getElementById('d').innerText = d;
                document.getElementById('h').innerText = h;
                document.getElementById('m').innerText = m;
                document.getElementById('s').innerText = s;
            }
            update();
            setInterval(update, 1000);
        }

        // LIBRO 3D
        function flip(page) {
            page.classList.toggle('flipped');
            spawnBatch(5);
        }

        function resetBook() {
            document.querySelectorAll('.page').forEach(p => p.classList.remove('flipped'));
            spawnBatch(15);
        }

        // RAZONES
        function revealReason(el, text) {
            el.innerText = text;
            el.classList.add('revealed');
            spawnBatch(10);
        }

        // CUPONES
        function redeemCoupon(el) {
            el.classList.add('redeemed');
            el.querySelector('p').innerText = "¡Canjeado con éxito! ❤️";
            spawnBatch(20);
        }

        // PROMESAS
        function reveal(el, text) {
            el.innerText = text;
            el.classList.add('revealed');
            spawnBatch(8);
        }

        // ELEMENTOS FLOTANTES (CORAZONES)
        function spawnHeart() {
            const h = document.createElement('div');
            h.className = 'floating';
            const icons = ['❤️', '💖', '💝', '💕', '🌸', '✨'];
            h.innerHTML = icons[Math.floor(Math.random() * icons.length)];
            h.style.left = Math.random() * 100 + 'vw';
            h.style.fontSize = (Math.random() * 20 + 10) + 'px';
            h.style.animationDuration = (Math.random() * 3 + 2) + 's';
            h.style.opacity = Math.random();
            document.body.appendChild(h);
            setTimeout(() => h.remove(), 5000);
        }

        function spawnBatch(n) {
            for(let i=0; i<n; i++) setTimeout(spawnHeart, i*50);
        }

        function initFloating() {
            setInterval(spawnHeart, 600);
        }

        // MÚSICA - COMPATIBLE CON ANDROID
        const musicTitles = {
            1: 'Corazón Partío',
            2: 'A Que No Me Dejas',
            3: 'Amiga',
            4: 'La Fuerza de la Vida',
            5: 'Cuando Vueltas',
            6: 'Ángel Malherido',
            7: 'Por Amarte Así',
            8: 'Lo Dejaría Todo',
            9: 'Solamente Tu Amor',
            10: 'Viviendo Deprisa',
            11: 'Desde Cuando',
            12: 'No Me Compares',
            13: 'La Incondicional',
            14: 'Hasta Que Me Olvides',
            15: 'Entrégate',
            16: 'Tengo Todo Excepto A Ti',
            17: 'Sabes Una Cosa',
            18: 'Mi Persona Favorita',
            19: 'El Alma Al Aire'
        };

        function togglePlayer(num, videoId) {
            const miniPlayer = document.getElementById('mini-player');
            const playerIframe = document.getElementById('player-iframe');
            const playerTitle = document.getElementById('player-title');

            // Configurar el reproductor
            playerTitle.innerText = musicTitles[num] + ' ♥';
            playerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;

            // Mostrar el mini reproductor
            miniPlayer.style.display = 'flex';
            miniPlayer.classList.remove('collapsed');
            document.getElementById('btn-expand-player').innerText = '▼';
            spawnBatch(15);

            // Guardar reproducciones en Firebase
            saveMusicPlayCount(num);
        }

        function toggleExpandPlayer(e) {
            if(e) { e.stopPropagation(); e.preventDefault(); }
            const player = document.getElementById('mini-player');
            const btn = document.getElementById('btn-expand-player');
            if (player.classList.contains('collapsed')) {
                player.classList.remove('collapsed');
                btn.innerText = '▼';
            } else {
                player.classList.add('collapsed');
                btn.innerText = '▲';
            }
        }

        function closeMiniPlayer(e) {
            if(e) { e.stopPropagation(); e.preventDefault(); }
            const miniPlayer = document.getElementById('mini-player');
            const playerIframe = document.getElementById('player-iframe');
            miniPlayer.style.display = 'none';
            playerIframe.src = '';
            // Reset to collapsed
            miniPlayer.classList.add('collapsed');
            document.getElementById('btn-expand-player').innerText = '▲';
        }

        // Mini reproductor arrastrable
        function makeMiniPlayerDraggable() {
            const miniPlayer = document.getElementById('mini-player');
            let isDragging = false;
            let startX, startY, startLeft, startTop;

            function pointerDown(e) {
                isDragging = true;
                const point = e.touches ? e.touches[0] : e;
                startX = point.clientX;
                startY = point.clientY;
                const rect = miniPlayer.getBoundingClientRect();
                startLeft = rect.left;
                startTop = rect.top;
                miniPlayer.style.transition = 'none';
                e.preventDefault();
            }

            function pointerMove(e) {
                if (!isDragging) return;
                const point = e.touches ? e.touches[0] : e;
                const dx = point.clientX - startX;
                const dy = point.clientY - startY;
                let newLeft = startLeft + dx;
                let newTop = startTop + dy;

                // Limitar dentro de la pantalla
                const maxX = window.innerWidth - miniPlayer.offsetWidth;
                const maxY = window.innerHeight - miniPlayer.offsetHeight;
                newLeft = Math.min(Math.max(newLeft, 0), maxX);
                newTop = Math.min(Math.max(newTop, 0), maxY);

                miniPlayer.style.left = `${newLeft}px`;
                miniPlayer.style.top = `${newTop}px`;
                miniPlayer.style.right = 'auto';
                miniPlayer.style.bottom = 'auto';
            }

            function pointerUp() {
                isDragging = false;
                miniPlayer.style.transition = 'box-shadow 0.2s ease';
            }

            miniPlayer.addEventListener('mousedown', pointerDown);
            document.addEventListener('mousemove', pointerMove);
            document.addEventListener('mouseup', pointerUp);
            miniPlayer.addEventListener('touchstart', pointerDown, {passive: false});
            document.addEventListener('touchmove', pointerMove, {passive: false});
            document.addEventListener('touchend', pointerUp);
        }

        makeMiniPlayerDraggable();

        function saveMusicPlayCount(songId) {
            if (!window.db || !window.dbRef || !window.dbSet || !window.dbGet) return;
            const statRef = window.dbRef(window.db, `reproducciones_musica/${songId}`);
            window.dbGet(statRef).then(snapshot => {
                const current = snapshot.exists() ? (snapshot.val() || 0) : 0;
                window.dbSet(statRef, current + 1).then(() => {
                    loadMusicStats();
                });
            }).catch(err => console.warn('No se pudo actualizar estadística de música', err));
        }

        function loadMusicStats() {
            if (!window.db || !window.dbRef || !window.dbGet) return;
            const statsRef = window.dbRef(window.db, 'reproducciones_musica');
            window.dbGet(statsRef).then(snapshot => {
                const data = snapshot.exists() ? snapshot.val() : {};
                const lines = Object.entries(data || {}).map(([id, count]) => `${musicTitles[id] || id}: ${count} reproducciones`);
                document.getElementById('music-stats-text').innerHTML = lines.length ? lines.map(line => `<div>${line}</div>`).join('') : 'Aún no se ha reproducido ninguna canción.';
            }).catch(err => {
                document.getElementById('music-stats-text').innerText = 'Error al cargar estadísticas.';
                console.warn('Error loadMusicStats', err);
            });
        }

        // SORPRESAS
        function surpriseMe() {
            const surprises = [
                () => showRandomMessage(true),
                () => triggerConfetti(true),
                () => sendVirtualGift(Math.random() > 0.5 ? '🎁' : '💝', true),
                () => randomCompliment(true),
                () => showLoveQuote(true),
                () => animateHearts(true),
                () => generateDateIdea(true),
                () => {
                    // Para la calculadora, usar nombres predeterminados
                    document.getElementById('name1').value = 'Tú';
                    document.getElementById('name2').value = 'Cleidis';
                    calculateLove(true);
                },
                () => {
                    // Para el capturador de sueños, usar un sueño aleatorio
                    const dreams = [
                        'Viajar juntos por el mundo',
                        'Construir nuestro hogar perfecto',
                        'Tener una familia hermosa',
                        'Envejecer juntos tomados de la mano',
                        'Cumplir todos nuestros sueños juntos'
                    ];
                    document.getElementById('dream-input').value = dreams[Math.floor(Math.random() * dreams.length)];
                    captureDream(true);
                },
                () => {
                    // Para el generador de cartas
                    generateLoveLetter(true);
                },
                () => {
                    // Para abrazos virtuales
                    const hugTypes = ['🤗', '🫂', '💑', '👨‍❤️‍👩', '🌟', '💫'];
                    sendVirtualHug(hugTypes[Math.floor(Math.random() * hugTypes.length)], true);
                },
                () => {
                    // Para la lista de sueños
                    const bucketDreams = [
                        'Aprender a bailar juntos',
                        'Visitar un lugar exótico',
                        'Crear un jardín en casa',
                        'Escribir nuestra historia de amor',
                        'Hacer un viaje en globo aerostático'
                    ];
                    document.getElementById('bucket-input').value = bucketDreams[Math.floor(Math.random() * bucketDreams.length)];
                    addToBucketList(true);
                },
                () => {
                    // Para el seguimiento de ánimo
                    const moods = [
                        ['😊', 'Feliz'],
                        ['🥰', 'Enamorada'],
                        ['🤗', 'Abrazable'],
                        ['😴', 'Cansada'],
                        ['🤔', 'Pensativa'],
                        ['😢', 'Triste']
                    ];
                    const randomMood = moods[Math.floor(Math.random() * moods.length)];
                    shareMood(randomMood[0], randomMood[1], true);
                },
                () => {
                    // Para agregar un recuerdo aleatorio
                    const today = new Date().toISOString().split('T')[0];
                    document.getElementById('memory-date').value = today;
                    document.getElementById('memory-title').value = 'Un día especial';
                    document.getElementById('memory-description').value = 'Hoy fue un día maravilloso juntos. Gracias por existir.';
                    addMemory(true);
                }
            ];
            
            const randomSurprise = surprises[Math.floor(Math.random() * surprises.length)];
            randomSurprise();
            
            // Mostrar el contenedor de sorpresa
            const display = document.getElementById('surprise-display');
            display.style.display = 'block';
            setTimeout(() => display.style.display = 'none', 5000);
        }

        function showRandomMessage(fromDropdown = false) {
            const messages = [
                "¡Eres la razón de mi sonrisa cada día! 😊",
                "Mi amor por ti crece con cada latido del corazón 💓",
                "Eres mi sueño hecho realidad ✨",
                "Contigo, cada momento es mágico 🌟",
                "Eres mi todo, mi amor eterno ❤️",
                "Tu belleza ilumina mi mundo entero 🌹",
                "Gracias por ser tú, mi amor perfecto 💕"
            ];
            
            const randomMessage = messages[Math.floor(Math.random() * messages.length)];
            
            if (fromDropdown) {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💌 Mensaje Especial</h3>
                    <p style="font-size: 1.2rem; font-style: italic;">${randomMessage}</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 5000);
            } else {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💌 Mensaje Especial</h3>
                    <p style="font-size: 1.2rem; font-style: italic;">${randomMessage}</p>
                `;
            }
            spawnBatch(20);
        }

        function triggerConfetti(fromDropdown = false) {
            for (let i = 0; i < 50; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.animationDelay = Math.random() * 3 + 's';
                document.body.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
            }
            
            if (fromDropdown) {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">🎊 ¡Fiesta de Amor!</h3>
                    <p style="font-size: 1.2rem;">¡Celebremos nuestro amor con confeti! 🎉</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 5000);
            } else {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">🎊 ¡Fiesta de Amor!</h3>
                    <p style="font-size: 1.2rem;">¡Celebremos nuestro amor con confeti! 🎉</p>
                `;
            }
        }

        function sendVirtualGift(gift, fromDropdown = false) {
            const animation = document.createElement('div');
            animation.className = 'gift-animation';
            animation.innerHTML = gift;
            document.body.appendChild(animation);
            setTimeout(() => animation.remove(), 2000);
            
            if (fromDropdown) {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">🎁 ¡Regalo Virtual!</h3>
                    <p style="font-size: 2rem; margin: 20px 0;">${gift}</p>
                    <p style="font-style: italic;">¡Este regalo es solo para ti, mi amor!</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 5000);
            } else {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">🎁 ¡Regalo Virtual!</h3>
                    <p style="font-size: 2rem; margin: 20px 0;">${gift}</p>
                    <p style="font-style: italic;">¡Este regalo es solo para ti, mi amor!</p>
                `;
            }
            spawnBatch(15);
        }

        function randomCompliment(fromDropdown = false) {
            const compliments = [
                "Tus ojos brillan como estrellas en la noche 🌟",
                "Tu sonrisa ilumina cualquier habitación ☀️",
                "Eres la persona más hermosa que conozco 💖",
                "Tu inteligencia me deja sin palabras 🧠✨",
                "Tu corazón es puro y lleno de amor 💕",
                "Eres mi definición de perfección 👑",
                "Tu risa es la melodía más hermosa 🎵"
            ];
            
            const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
            const displayEl = document.getElementById('compliment-display');
            if (displayEl) displayEl.innerText = randomCompliment;
            
            if (fromDropdown) {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💬 Cumplido Especial</h3>
                    <p style="font-size: 1.2rem; font-style: italic;">${randomCompliment}</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 5000);
            } else {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💬 Cumplido Especial</h3>
                    <p style="font-size: 1.2rem; font-style: italic;">${randomCompliment}</p>
                `;
            }
            spawnBatch(10);
        }

        function showLoveQuote(fromDropdown = false) {
            const quotes = [
                "\"El amor no se mira con los ojos, sino con el alma.\" - William Shakespeare",
                "\"Te quiero no por lo que eres, sino por lo que soy cuando estoy contigo.\" - Gabriel García Márquez",
                "\"Enamorarse no es mirarse el uno al otro, es mirar juntos en la misma dirección.\" - Antoine de Saint-Exupéry",
                "\"El amor es la fuerza más poderosa del universo.\" - Albert Einstein",
                "\"Mi amor por ti es como el viento, no puedes verlo pero puedes sentirlo.\" - Nicholas Sparks"
            ];
            
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            
            if (fromDropdown) {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">📖 Cita de Amor</h3>
                    <p style="font-size: 1.1rem; font-style: italic;">${randomQuote}</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 5000);
            } else {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">📖 Cita de Amor</h3>
                    <p style="font-size: 1.1rem; font-style: italic;">${randomQuote}</p>
                `;
            }
            spawnBatch(12);
        }

        function animateHearts(fromDropdown = false) {
            for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                    const heart = document.createElement('div');
                    heart.className = 'floating';
                    heart.innerHTML = '💖';
                    heart.style.left = Math.random() * 100 + 'vw';
                    heart.style.fontSize = (Math.random() * 30 + 20) + 'px';
                    heart.style.animationDuration = (Math.random() * 2 + 1) + 's';
                    heart.style.opacity = Math.random();
                    document.body.appendChild(heart);
                    setTimeout(() => heart.remove(), 3000);
                }, i * 100);
            }
            
            if (fromDropdown) {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💝 Lluvia de Amor</h3>
                    <p style="font-size: 1.2rem;">¡Que caiga una lluvia de corazones sobre ti! 💕</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 5000);
            } else {
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💝 Lluvia de Amor</h3>
                    <p style="font-size: 1.2rem;">¡Que caiga una lluvia de corazones sobre ti! 💕</p>
                `;
            }
        }

        // FUNCIONES HAMBURGUESA
        function toggleHamburgerMenu() {
            const menu = document.getElementById('hamburger-menu');
            const btn = document.getElementById('hamburger-btn');
            
            if (menu.classList.contains('show')) {
                menu.classList.remove('show');
                btn.classList.remove('active');
            } else {
                menu.classList.add('show');
                btn.classList.add('active');
            }
        }

        function closeHamburgerMenu() {
            const menu = document.getElementById('hamburger-menu');
            const btn = document.getElementById('hamburger-btn');
            menu.classList.remove('show');
            btn.classList.remove('active');
        }

        // Cerrar menú hamburguesa al hacer clic fuera
        document.addEventListener('click', function(event) {
            const menu = document.getElementById('hamburger-menu');
            const btn = document.getElementById('hamburger-btn');
            
            if (!menu.contains(event.target) && !btn.contains(event.target)) {
                closeHamburgerMenu();
            }
        });

        // GENERADOR DE CITAS
        function generateDateIdea(fromDropdown = false) {
            const dateIdeas = [
                "🌅 Un picnic al atardecer en el parque, con tu comida favorita y música suave",
                "🎭 Una noche de cine en casa, viendo películas románticas y compartiendo palomitas",
                "🍝 Una cena especial en casa, cocinando juntos platos nuevos y exóticos",
                "🚶‍♀️ Un paseo nocturno por la ciudad, tomados de la mano y compartiendo sueños",
                "🎨 Una tarde de arte, pintando o dibujando juntos, dejando volar la creatividad",
                "📚 Una noche de lectura, compartiendo libros favoritos y discutiendo historias",
                "🌊 Un día en la playa o lago, nadando, jugando y relajándonos al sol",
                "🎪 Una visita a un parque de diversiones, montando en juegos y riendo juntos",
                "🏠 Una tarde de juegos de mesa, compitiendo amistosamente y disfrutando",
                "🎵 Un concierto virtual o en vivo, bailando y cantando nuestras canciones favoritas",
                "🌺 Un día de spa casero, con masajes, baños de burbujas y relajación total",
                "🚗 Un viaje espontáneo a un lugar cercano, descubriendo nuevos horizontes",
                "🍳 Una clase de cocina virtual, aprendiendo a preparar algo delicioso juntos",
                "🌙 Una noche de estrellas, acostados en el jardín contemplando el universo",
                "🎭 Una obra de teatro o musical, disfrutando del arte y la cultura juntos"
            ];
            
            const randomIdea = dateIdeas[Math.floor(Math.random() * dateIdeas.length)];
            document.getElementById('date-idea-display').innerText = randomIdea;
            spawnBatch(15);
            
            if (fromDropdown) {
                // Mostrar en el contenedor de sorpresa también
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💑 Idea de Cita Romántica</h3>
                    <p style="font-size: 1.1rem; font-style: italic;">${randomIdea}</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 8000);
            }
        }

        // CALCULADORA DE AMOR
        function calculateLove(fromDropdown = false) {
            const name1 = document.getElementById('name1').value.trim();
            const name2 = document.getElementById('name2').value.trim();
            
            if (!name1 || !name2) {
                document.getElementById('love-result').innerHTML = '<span style="color: #ff4d6d;">Por favor, ingresa ambos nombres 💕</span>';
                return;
            }
            
            // Algoritmo "científico" de compatibilidad (diversión pura)
            const combined = (name1 + name2).toLowerCase();
            let score = 0;
            
            // Contar letras comunes
            const letters = 'abcdefghijklmnopqrstuvwxyz';
            for (let letter of letters) {
                const count1 = (name1.toLowerCase().match(new RegExp(letter, 'g')) || []).length;
                const count2 = (name2.toLowerCase().match(new RegExp(letter, 'g')) || []).length;
                score += Math.min(count1, count2) * 2;
            }
            
            // Factor de longitud
            score += Math.abs(name1.length - name2.length) * -1;
            
            // Factor aleatorio para diversión
            score += Math.floor(Math.random() * 20) - 10;
            
            // Normalizar a porcentaje
            const percentage = Math.max(0, Math.min(100, 50 + score));
            
            let message = '';
            if (percentage >= 90) {
                message = '¡Amor perfecto! 💑✨';
            } else if (percentage >= 80) {
                message = '¡Compatibilidad excepcional! 💕';
            } else if (percentage >= 70) {
                message = '¡Muy buena conexión! 💖';
            } else if (percentage >= 60) {
                message = '¡Buena compatibilidad! 💓';
            } else if (percentage >= 50) {
                message = '¡Hay potencial! 💗';
            } else {
                message = '¡El amor todo lo puede! 💘';
            }
            
            document.getElementById('love-result').innerHTML = `
                <div style="font-size: 2rem; margin-bottom: 10px;">${percentage}%</div>
                <div>${message}</div>
            `;
            
            spawnBatch(20);
            
            if (fromDropdown) {
                // Mostrar en sorpresa también
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💕 Compatibilidad de Amor</h3>
                    <div style="font-size: 2rem; margin: 10px 0;">${percentage}%</div>
                    <p style="font-style: italic;">${message}</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 6000);
            }
        }

        // CAPTURADOR DE SUEÑOS
        function captureDream(fromDropdown = false) {
            const dream = document.getElementById('dream-input').value.trim();
            
            if (!dream) {
                document.getElementById('dream-display').innerHTML = '<span style="color: #ff4d6d;">Por favor, comparte un sueño o deseo 💭</span>';
                return;
            }
            
            // Guardar en Firebase si está disponible
            if (window.db && window.dbRef && window.dbPush) {
                const dreamsRef = window.dbRef(window.db, 'suenos');
                window.dbPush(dreamsRef, {
                    texto: dream,
                    fecha: new Date().toLocaleString('es-ES')
                });
            }
            
            const responses = [
                `¡Qué sueño tan hermoso! ✨ "${dream}" - Lo haremos realidad juntos 💫`,
                `Me encanta este sueño: "${dream}". ¡Cuenta conmigo para lograrlo! 🌟`,
                `Tu sueño "${dream}" me inspira. ¡Vamos por él! 💪❤️`,
                `¡Qué precioso deseo! "${dream}" - Lo guardo en mi corazón 💖`,
                `Este sueño "${dream}" refleja lo maravillosa que eres. ¡Lo conseguiremos! 🎯`
            ];
            
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            document.getElementById('dream-display').innerHTML = randomResponse;
            
            // Limpiar input
            document.getElementById('dream-input').value = '';
            
            spawnBatch(25);
            
            if (fromDropdown) {
                // Mostrar en sorpresa también
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">🌙 Sueño Capturado</h3>
                    <p style="font-size: 1.1rem; font-style: italic;">"${dream}"</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">¡Guardado en nuestro libro de sueños! 💫</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 7000);
            }
        }

        // GENERADOR DE CARTAS DE AMOR
        function generateLoveLetter(fromDropdown = false) {
            const style = document.getElementById('letter-style').value;
            const length = document.getElementById('letter-length').value;
            
            const letters = {
                romantica: {
                    corta: [
                        "Mi amor Cleidis, cada día que pasa te amo más. Eres mi razón de ser, mi alegría constante. Te quiero infinito. ❤️",
                        "Querida Cleidis, en tus ojos veo mi futuro. Tu sonrisa ilumina mi mundo. Eres perfecta para mí. 💕",
                        "Amor mío, gracias por existir. Tu amor me hace mejor persona cada día. Eternamente tuyo. 💖"
                    ],
                    media: [
                        "Mi querida Cleidis,\n\nDesde el momento en que te conocí, supe que eras especial. Tu sonrisa ilumina mis días más oscuros, tu risa es la melodía más hermosa que he escuchado. Cada momento contigo es un tesoro que guardo en mi corazón.\n\nTe amo más de lo que las palabras pueden expresar.\n\nTuyo para siempre ❤️",
                        "Amor de mi vida,\n\nEres la persona más maravillosa que conozco. Tu bondad, tu inteligencia, tu belleza... todo en ti me enamora cada día más. Gracias por ser mi compañera, mi confidente, mi todo.\n\nNo puedo imaginar mi vida sin ti.\n\nCon todo mi amor 💕"
                    ],
                    larga: [
                        "Mi amada Cleidis,\n\nHan pasado muchos momentos desde que nuestros caminos se cruzaron, y cada uno de ellos ha sido más especial que el anterior. Recuerdo el día que te conocí como si fuera ayer - tu sonrisa tímida, tus ojos brillantes, esa calidez que irradias.\n\nDesde entonces, mi vida ha cambiado completamente. Has traído colores a mi mundo en blanco y negro, alegría a mis días grises, amor a mi corazón solitario. Eres mi mejor amiga, mi confidente, mi amor eterno.\n\nGracias por tu paciencia, por tu comprensión, por amarme tal como soy. Gracias por los momentos de risa, por las conversaciones profundas, por los abrazos que curan todo.\n\nPrometo amarte, cuidarte y valorarte cada día de mi vida. Eres mi regalo más preciado, mi razón de ser.\n\nTe amo infinito.\n\nTuyo por siempre ❤️"
                    ]
                },
                poetica: {
                    corta: [
                        "Cleidis, estrella de mi firmamento,\ntu luz ilumina mi camino oscuro.\nEn tus brazos encuentro mi puerto,\nen tu amor, mi eterno seguro. 📝",
                        "Como rosa en jardín primaveral,\nasí florece tu belleza sin par.\nMi corazón late por ti eternal,\nen tu amor encuentro mi hogar. 🌹"
                    ],
                    media: [
                        "Oh Cleidis, musa de mis versos,\ninspiración de mi alma poeta.\nTus ojos son estrellas dispersas,\ntu sonrisa, melodía completa.\n\nEn el libro de mi vida,\ntú eres la página más bella.\nCada día a tu lado,\nes una aventura que me llena.\n\nTe amo como el poeta ama a la luna,\ncon pasión infinita y devoción profunda. 📖"
                    ],
                    larga: [
                        "A Cleidis, mi amor eterno\n\nEn el vasto océano de la existencia,\ntú eres la isla que me da paz.\nEn el desierto de la soledad,\ntú eres el oasis que me abraza.\n\nTus ojos son pozos de misterio,\ndonde me pierdo gustosamente.\nTu sonrisa es sol naciente,\nque ilumina mi horizonte eternamente.\n\nComo el río busca el mar,\nasí mi alma te busca a ti.\nComo la noche anhela el día,\nasí te anhelo en mi vivir.\n\nEres la poesía que escribo,\nla música que canto,\nla estrella que sigo,\nel amor que tanto anhelaba.\n\nEn cada latido de mi corazón,\nresuena tu nombre como mantra.\nEn cada suspiro de mi ser,\nse escapa tu esencia como fragancia.\n\nCleidis, amor mío,\nmi verso, mi rima, mi canción.\nEres el principio y el fin,\nde mi amor infinito. 💫"
                    ]
                },
                divertida: {
                    corta: [
                        "¡Hola mi amor! ¿Sabías que eres tan linda que hasta los emojis se ponen celosos? 😘 Eres mi persona favorita para hacer tonterías. ¡Te amo! 😂",
                        "Cleidis, eres como wifi: invisible pero indispensable. Sin ti, mi vida no tiene conexión. ¡Te amo más que a las pizzas! 🍕❤️"
                    ],
                    media: [
                        "¡Mi amor Cleidis!\n\nEres como mi teléfono: no puedo vivir sin ti. Bueno, técnicamente sí, pero sería muy aburrido. Eres mi compañera de aventuras, mi socia en crimen, mi mejor amiga.\n\nGracias por aguantar mis chistes malos, por bailar conmigo en la sala, por ser tú misma. ¡Eres perfecta!\n\nTe amo más que... ¡espera, no hay comparación posible! 😍"
                    ],
                    larga: [
                        "¡Carta de amor divertida para mi Cleidis favorita!\n\nPrimero que nada, debo confesar: eres tan hermosa que hasta las flores se ponen verdes de envidia. ¡Literalmente! 🌿😄\n\n¿Recuerdas cuando bailamos como locos en la sala? ¿O cuando intentamos cocinar y casi quemamos la casa? Esos momentos son los mejores porque los vivo contigo.\n\nEres mi persona favorita para:\n- Contar chistes (incluso los malos)\n- Ver películas de terror (y escondernos detrás de la almohada)\n- Comer helado a las 3 AM\n- Hacer caras raras en fotos\n- Soñar despiertos sobre nuestro futuro\n\nGracias por ser mi locura favorita, mi risa constante, mi amor eterno. Eres como un meme: graciosa, inolvidable y perfecta.\n\n¡Te amo más que a internet! (Y eso es decir mucho)\n\nTu payaso enamorado ❤️🤡"
                    ]
                },
                pasional: {
                    corta: [
                        "Cleidis, mi amor ardiente, cada célula de mi cuerpo te desea. Tu piel, tus labios, tu esencia... me vuelven loco. 🔥❤️",
                        "Amor mío, en tus brazos quiero perderme. Tu pasión enciende la mía. Eres mi fuego eterno. 💋🔥"
                    ],
                    media: [
                        "Mi pasión Cleidis,\n\nDesde que te conocí, mi cuerpo arde en deseos. Tus curvas, tu aroma, tu manera de moverte... todo en ti despierta mi instinto más primitivo.\n\nQuiero besarte hasta perder el aliento, tocarte hasta conocer cada centímetro de tu piel, amarte hasta que nuestros cuerpos sean uno solo.\n\nEres mi obsesión, mi deseo, mi amor más intenso.\n\nTuyo en cuerpo y alma 💋"
                    ],
                    larga: [
                        "Cleidis, mi amor apasionado,\n\nCada noche sueño contigo, con tu cuerpo perfecto, con tus labios suaves, con tu piel cálida. Mi deseo por ti es como un volcán a punto de erupción - intenso, poderoso, inevitable.\n\nRecuerdo cada caricia, cada beso robado, cada mirada llena de promesas. Tu aroma me persigue, tu voz me hipnotiza, tu presencia me consume.\n\nQuiero explorar cada rincón de tu ser, descubrir tus secretos más íntimos, hacerte mía de todas las formas posibles. Eres mi tentación constante, mi pecado favorito, mi paraíso terrenal.\n\nEn tus brazos encuentro la paz que mi alma anhela, en tus besos hallo el fuego que me mantiene vivo. Eres mi droga, mi adicción, mi razón de existir.\n\nTe amo con una pasión que quema, que consume, que transforma. Eres mi todo, mi universo, mi amor eterno.\n\nTuyo para siempre, con pasión infinita 🔥❤️"
                    ]
                }
            };
            
            const selectedLetters = letters[style][length];
            const randomLetter = selectedLetters[Math.floor(Math.random() * selectedLetters.length)];
            
            document.getElementById('letter-display').innerHTML = randomLetter.replace(/\n/g, '<br>');
            
            spawnBatch(30);
            
            if (fromDropdown) {
                // Mostrar en sorpresa también
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">💌 Carta de Amor Generada</h3>
                    <p style="font-size: 1rem; font-style: italic; line-height: 1.4;">${randomLetter.split('\n')[0]}...</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">¡Carta personalizada creada! 📝</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 8000);
            }
        }

        // ENVIADOR DE ABRAZOS VIRTUALES
        function sendVirtualHug(hugType, fromDropdown = false) {
            const hugNames = {
                '🤗': 'Abrazo tierno',
                '🫂': 'Abrazo fuerte', 
                '💑': 'Abrazo romántico',
                '👨‍❤️‍👩': 'Abrazo eterno',
                '🌟': 'Abrazo mágico',
                '💫': 'Abrazo sorpresa'
            };
            
            const animation = document.createElement('div');
            animation.className = 'hug-animation';
            animation.innerHTML = hugType;
            document.body.appendChild(animation);
            setTimeout(() => animation.remove(), 1500);
            
            // Guardar abrazo en Firebase
            if (window.db && window.dbRef && window.dbPush) {
                const hugsRef = window.dbRef(window.db, 'abrazos');
                window.dbPush(hugsRef, {
                    tipo: hugType,
                    nombre: hugNames[hugType],
                    fecha: new Date().toLocaleString('es-ES')
                });
            }
            
            // Actualizar contador
            updateHugCounter();
            
            spawnBatch(20);
            
            if (fromDropdown) {
                // Mostrar en sorpresa también
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">🤗 Abrazo Enviado</h3>
                    <p style="font-size: 2rem; margin: 10px 0;">${hugType}</p>
                    <p style="font-style: italic;">¡${hugNames[hugType]} enviado con todo el amor! 💕</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 5000);
            }
        }

        function updateHugCounter() {
            if (!window.db || !window.dbRef || !window.dbGet) return;
            const hugsRef = window.dbRef(window.db, 'abrazos');
            window.dbGet(hugsRef).then(snapshot => {
                const count = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                document.getElementById('hug-counter').innerText = `Abrazos enviados: ${count} 🤗`;
            });
        }

        // LISTA DE DESEOS COMPARTIDOS
        function addToBucketList(fromDropdown = false) {
            const dream = document.getElementById('bucket-input').value.trim();
            
            if (!dream) {
                alert('Por favor, escribe un sueño para agregar a la lista 💭');
                return;
            }
            
            // Guardar en Firebase
            if (window.db && window.dbRef && window.dbPush) {
                const bucketRef = window.dbRef(window.db, 'lista_suenos');
                window.dbPush(bucketRef, {
                    sueno: dream,
                    fecha: new Date().toLocaleString('es-ES'),
                    completado: false
                });
            }
            
            // Agregar a la lista visual
            const bucketList = document.getElementById('bucket-list');
            const item = document.createElement('div');
            item.className = 'bucket-item';
            item.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg); border-radius: 10px; margin-bottom: 8px;">
                    <input type="checkbox" onchange="toggleBucketItem(this)">
                    <span style="flex: 1; font-style: italic;">${dream}</span>
                    <span style="font-size: 0.8rem; color: #888;">${new Date().toLocaleDateString('es-ES')}</span>
                </div>
            `;
            bucketList.appendChild(item);
            
            // Limpiar input
            document.getElementById('bucket-input').value = '';
            
            spawnBatch(15);
            
            if (fromDropdown) {
                // Mostrar en sorpresa también
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">🎯 Sueño Agregado</h3>
                    <p style="font-size: 1.1rem; font-style: italic;">"${dream}"</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">¡Agregado a nuestra lista de sueños! ⭐</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 6000);
            }
        }

        function loadBucketList() {
            if (!window.db || !window.dbRef) return;
            const bucketRef = window.dbRef(window.db, 'lista_suenos');
            const getFn = window.dbGet;
            if (getFn) {
                getFn(bucketRef).then(snapshot => {
                    const bucketList = document.getElementById('bucket-list');
                    if (!bucketList) return;
                    bucketList.innerHTML = '';
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        Object.entries(data).forEach(([key, item]) => {
                            const div = document.createElement('div');
                            div.className = 'bucket-item';
                            div.innerHTML = `
                                <div style="display: flex; align-items: center; gap: 10px; padding: 10px; background: var(--bg); border-radius: 10px; margin-bottom: 8px;">
                                    <input type="checkbox" ${item.completado ? 'checked' : ''} onchange="toggleBucketItem('${key}', this)">
                                    <span style="flex: 1; font-style: italic; ${item.completado ? 'opacity: 0.6; text-decoration: line-through;' : ''}">${item.sueno}</span>
                                    <span style="font-size: 0.8rem; color: #888;">${item.fecha || ''}</span>
                                </div>
                            `;
                            bucketList.appendChild(div);
                        });
                    }
                });
            }
        }

        function toggleBucketItem(key, checkbox) {
            const itemSpan = checkbox.parentElement.querySelector('span');
            if (checkbox.checked) {
                if (itemSpan) { itemSpan.style.opacity = '0.6'; itemSpan.style.textDecoration = 'line-through'; }
            } else {
                if (itemSpan) { itemSpan.style.opacity = '1'; itemSpan.style.textDecoration = 'none'; }
            }
            if (window.db && window.dbRef && window.dbUpdate && key) {
                const itemRef = window.dbRef(window.db, 'lista_suenos/' + key);
                window.dbUpdate(itemRef, { completado: checkbox.checked });
            }
        }

        // SEGUIMIENTO DE ÁNIMO
        function shareMood(emoji, moodName, fromDropdown = false) {
            const moodEntry = {
                emoji: emoji,
                nombre: moodName,
                fecha: new Date().toLocaleString('es-ES'),
                timestamp: Date.now()
            };
            
            // Guardar en Firebase
            if (window.db && window.dbRef && window.dbPush) {
                const moodRef = window.dbRef(window.db, 'animos');
                window.dbPush(moodRef, moodEntry);
            }
            
            // Actualizar historial visual
            updateMoodHistory();
            
            spawnBatch(10);
            
            if (fromDropdown) {
                // Mostrar en sorpresa también
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">😊 Ánimo Compartido</h3>
                    <p style="font-size: 2rem; margin: 10px 0;">${emoji}</p>
                    <p style="font-style: italic;">Te sientes ${moodName.toLowerCase()} hoy 💭</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 5000);
            }
        }

        function updateMoodHistory() {
            if (!window.db || !window.dbRef || !window.dbGet) return;
            const moodRef = window.dbRef(window.db, 'animos');
            window.dbGet(moodRef).then(snapshot => {
                const historyDiv = document.getElementById('mood-history');
                if (snapshot.exists()) {
                    const moods = Object.values(snapshot.val()).sort((a, b) => b.timestamp - a.timestamp);
                    const recentMoods = moods.slice(0, 5); // Mostrar últimos 5
                    
                    historyDiv.innerHTML = recentMoods.map(mood => 
                        `<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                            <span style="font-size: 1.5rem;">${mood.emoji}</span>
                            <span>${mood.nombre}</span>
                            <span style="font-size: 0.8rem; color: #888; margin-left: auto;">${mood.fecha}</span>
                        </div>`
                    ).join('');
                }
            });
        }

        // TIMELINE DE RECUERDOS
        function addMemory(fromDropdown = false) {
            const date = document.getElementById('memory-date').value;
            const type = document.getElementById('memory-type').value;
            const title = document.getElementById('memory-title').value.trim();
            const description = document.getElementById('memory-description').value.trim();
            
            if (!date || !title || !description) {
                alert('Por favor, completa todos los campos del recuerdo 💭');
                return;
            }
            
            const memoryData = {
                fecha: date,
                tipo: type,
                titulo: title,
                descripcion: description,
                timestamp: new Date(date).getTime(),
                fechaCreacion: new Date().toLocaleString('es-ES')
            };
            
            // Guardar en Firebase
            if (window.db && window.dbRef && window.dbPush) {
                const memoriesRef = window.dbRef(window.db, 'recuerdos');
                window.dbPush(memoriesRef, memoryData);
            }
            
            // Limpiar formulario
            document.getElementById('memory-date').value = '';
            document.getElementById('memory-title').value = '';
            document.getElementById('memory-description').value = '';
            
            // Recargar timeline
            loadMemories();
            updateMemoryStats();
            
            spawnBatch(20);
            
            if (fromDropdown) {
                // Mostrar en sorpresa también
                document.getElementById('surprise-content').innerHTML = `
                    <h3 style="color: var(--primary); margin-bottom: 10px;">📅 Recuerdo Agregado</h3>
                    <p style="font-size: 1.1rem; font-style: italic;">"${title}"</p>
                    <p style="font-size: 0.9rem; margin-top: 10px;">¡Guardado en nuestra línea de tiempo! 📚</p>
                `;
                const display = document.getElementById('surprise-display');
                display.style.display = 'block';
                setTimeout(() => display.style.display = 'none', 6000);
            }
        }

        function loadMemories() {
            if (!window.db || !window.dbRef || !window.dbGet) return;
            const memoriesRef = window.dbRef(window.db, 'recuerdos');
            window.dbGet(memoriesRef).then(snapshot => {
                const timelineDiv = document.getElementById('memories-timeline');
                const noMemoriesDiv = document.getElementById('no-memories');
                
                if (snapshot.exists()) {
                    const memories = Object.values(snapshot.val()).sort((a, b) => b.timestamp - a.timestamp);

                    timelineDiv.innerHTML = `
                        <div style="position:absolute;left:0;top:0;width:2px;height:100%;background:linear-gradient(to bottom,var(--primary),var(--secondary));opacity:0.3;"></div>
                    ` + memories.map(memory => `
                        <div class="timeline-item">
                            <div class="timeline-content">
                                <div class="timeline-date">${formatDate(memory.fecha)}</div>
                                <div class="timeline-title">${memory.titulo}</div>
                                <div class="timeline-description">${memory.descripcion}</div>
                                <span class="timeline-type ${memory.tipo}">${getTypeLabel(memory.tipo)}</span>
                            </div>
                        </div>
                    `).join('');

                    noMemoriesDiv.style.display = 'none';

                    // Mostrar hint de scroll si el contenido supera el área visible
                    setTimeout(() => {
                        const hint = document.getElementById('memories-scroll-hint');
                        if (hint && timelineDiv.scrollHeight > timelineDiv.clientHeight) {
                            hint.style.display = 'block';
                            // Ocultarlo al primer scroll
                            timelineDiv.addEventListener('scroll', function hideHint() {
                                hint.style.display = 'none';
                                timelineDiv.removeEventListener('scroll', hideHint);
                            }, { once: true });
                        }
                    }, 200);
                } else {
                    timelineDiv.innerHTML = '';
                    noMemoriesDiv.style.display = 'block';
                }
            });
        }

        function formatDate(dateString) {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }

        function getTypeLabel(type) {
            const labels = {
                romantico: '💕 Romántico',
                divertido: '😂 Divertido',
                especial: '🌟 Especial',
                cotidiano: '🏠 Cotidiano',
                futuro: '🔮 Futuro'
            };
            return labels[type] || type;
        }

        function updateMemoryStats() {
            if (!window.db || !window.dbRef || !window.dbGet) return;
            
            const statsDiv = document.getElementById('memory-stats');
            const statElements = statsDiv.children;
            
            // Recuerdos totales
            const memoriesRef = window.dbRef(window.db, 'recuerdos');
            window.dbGet(memoriesRef).then(snapshot => {
                const memoriesCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                statElements[0].children[0].textContent = memoriesCount;
            });
            
            // Días juntos (desde la fecha inicial)
            const startDate = new Date(2026, 1, 10); // 10 de febrero 2026
            const today = new Date();
            const daysTogether = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            statElements[1].children[0].textContent = daysTogether;
            
            // Abrazos enviados
            const hugsRef = window.dbRef(window.db, 'abrazos');
            window.dbGet(hugsRef).then(snapshot => {
                const hugsCount = snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
                statElements[2].children[0].textContent = hugsCount;
            });
            
            // Canciones escuchadas
            const musicRef = window.dbRef(window.db, 'reproducciones_musica');
            window.dbGet(musicRef).then(snapshot => {
                let totalPlays = 0;
                if (snapshot.exists()) {
                    Object.values(snapshot.val()).forEach(count => totalPlays += count);
                }
                statElements[3].children[0].textContent = totalPlays;
            });
        }


        // PREVENIR ZOOM ACCIDENTAL EN MÓVIL AL TOCAR RÁPIDO
        document.addEventListener('touchstart', function(event) {
            if (event.touches.length > 1) event.preventDefault();
        }, { passive: false });