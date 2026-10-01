/**
 * ========================================================
 * CARTA VIVA & NUESTRO JARDÍN INTERACTIVO (PARA CLEIDIS)
 * Desarrollado con amor para sorprender a Cleidis ❤️
 * ========================================================
 */

// --- SINTETIZADOR DE AUDIO (Web Audio API) ---
class LoveAudioFX {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Sonido sutil de pluma sobre papel
    playPenScratch() {
        if (!this.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const bufferSize = this.ctx.sampleRate * 0.04;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.15;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1400 + Math.random() * 800, this.ctx.currentTime);
            filter.Q.setValueAtTime(3, this.ctx.currentTime);

            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.exponentialRampToValueAtTime(0.04, now + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);

            noise.start(now);
            noise.stop(now + 0.04);
        } catch (e) {
            // Silencioso si el navegador restringe audio
        }
    }

    // Sonido de gota de agua mágica (para regar el jardín)
    playWaterDrop() {
        if (!this.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.exponentialRampToValueAtTime(1200, now + 0.12);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.22);
        } catch (e) {}
    }

    // Sonido de campanitas / brillo mágico
    playSparkle() {
        if (!this.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const freqs = [659.25, 880, 1174.66, 1760]; // Mi, La, Re, La alto
            freqs.forEach((f, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const now = this.ctx.currentTime + (idx * 0.06);

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, now);

                gain.gain.setValueAtTime(0.07, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 0.36);
            });
        } catch (e) {}
    }

    // Sonido de estampar el sello de lacre
    playStamp() {
        if (!this.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

            gain.gain.setValueAtTime(0.25, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.25);
        } catch (e) {}
    }
}

const loveAudio = new LoveAudioFX();


/* ========================================================
   1. SISTEMA: CARTA VIVA 📜
   ======================================================== */

const CARTAS_COLECCION = [
    {
        id: 1,
        titulo: "El Inicio de Todo (10 de Febrero)",
        subtitulo: "La noche en que mi universo cambió",
        fecha: "10 de Febrero de 2026 ~ Presente",
        destinatario: "Para Cleidis, mi amor eterno 💜",
        texto: 
`Mi princesa Cleidis,

Aquel 10 de Febrero de 2026 no fue simplemente un día más en el calendario; fue el instante exacto en que mi vida cobró un brillo que nunca antes había conocido.

Antes de ti, el mundo avanzaba en tonos grises y silencios comunes. Pero cuando llegaste con esa sonrisa tierna, con la luz en tu mirada y la pureza de tu corazón, todo encontró su lugar. No fue el azar ni la casualidad: el cielo acomodó cada estrella para que nuestros caminos se cruzaran en La Dorada y comenzara esta historia que hoy cuido como mi más grande tesoro.

Gracias por regalarme tus risas, por tu paciencia dulce y por hacerme sentir el hombre más afortunado del planeta con solo tomar tu mano. Cada segundo a tu lado reafirma que encontré en ti mi hogar, mi paz y mi alegría más profunda.

Te amo hoy, te amaré mañana y te amaré en cada suspiro de mi eternidad.`
    },
    {
        id: 2,
        titulo: "Lo Que Eres Para Mí",
        subtitulo: "Cada detalle que me enamora",
        fecha: "Siempre en mi mente y corazón ✨",
        destinatario: "Para Cleidis, dueña de mis pensamientos 🌹",
        texto:
`Cleidis, amor mío,

A veces me descubro contemplándote en silencio, hipnotizado por la belleza con la que existes. Me pregunto qué bendición tan grande me concedió la vida para merecer una mujer tan dulce, inteligente y admirable como tú.

Amo cómo tus ojos se iluminan cuando te ríes. Amo la ternura con la que me miras cuando crees que no me doy cuenta. Amo la fuerza de tu carácter, la bondad infinita con la que tratas a los demás y esa complicidad única que solo tú y yo comprendemos.

No eres únicamente mi novia: eres mi confidente secreta, mi mejor amiga, mi refugio en los días difíciles y mi mayor impulso para ser mejor cada día.

Nunca olvides lo increíblemente valiosa, hermosa y especial que eres. No hay nadie en este mundo que pueda compararse contigo, mi reina hermosa.`
    },
    {
        id: 3,
        titulo: "Mi Promesa Eterna",
        subtitulo: "Nuestro futuro juntos",
        fecha: "Para toda la vida y más allá 💍",
        destinatario: "Para Cleidis, mi único amor eterno ❤️",
        texto:
`Amor de mi vida,

Hoy quiero plasmar ante ti las promesas que nacen de lo más hondo de mi pecho:

Te prometo estar a tu lado en los días de triunfo y alegría, pero sobre todo abrazarte con más fuerza cuando la vida se sienta pesada. Prometo secar tus lágrimas, recordarte tu valor cuando tengas dudas y celebrar cada uno de tus sueños como si fuera el mío propio.

Prometo no dejar que la rutina apague la magia de mirarnos, seguir robándote besos inesperados y enamorarte todos los días como la primera vez. Nuestra historia apenas ha escrito sus primeros versos, pero sé que el libro de nuestra vida juntos será la más hermosa obra de amor.

Toma mi mano y no la sueltes jamás. Juntos somos invencibles.`
    }
];

let cartaState = {
    selectedIdx: 0,
    fullText: "",
    currentIndex: 0,
    isPlaying: false,
    speedMs: 45,
    timer: null,
    isComplete: false
};

function initCartaViva() {
    cartaSelect(0);
}

function cartaSelect(idx) {
    if (cartaState.timer) clearTimeout(cartaState.timer);
    cartaState.selectedIdx = idx;
    cartaState.isPlaying = false;
    cartaState.isComplete = false;

    // Actualizar botones tabs
    document.querySelectorAll('.carta-tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === idx);
    });

    const customEditor = document.getElementById('carta-custom-wrap');
    if (idx === 3) {
        // Modo personalizado
        if (customEditor) customEditor.style.display = 'block';
        const customText = document.getElementById('carta-custom-input').value.trim() || 
            `Cleidis, este es un mensaje especial escrito con mi puño y letra para recordarte lo mucho que te amo cada segundo.`;
        cartaState.fullText = customText;
        document.getElementById('carta-destinatario').textContent = "Para Cleidis, mi tesoro especial 💌";
        document.getElementById('carta-fecha').textContent = "Escrito hoy con amor";
    } else {
        if (customEditor) customEditor.style.display = 'none';
        const data = CARTAS_COLECCION[idx];
        cartaState.fullText = data.texto;
        document.getElementById('carta-destinatario').textContent = data.destinatario;
        document.getElementById('carta-fecha').textContent = data.fecha;
    }

    cartaState.currentIndex = 0;
    const bodyElem = document.getElementById('carta-body-text');
    if (bodyElem) bodyElem.textContent = "";

    const cursor = document.getElementById('carta-cursor');
    if (cursor) cursor.style.display = 'inline-block';

    const seal = document.getElementById('carta-seal-wrap');
    if (seal) seal.style.display = 'none';

    const footer = document.getElementById('carta-footer');
    if (footer) footer.style.display = 'none';

    updateCartaPlayButton(false);
    cartaPlay();
}

function cartaPlay() {
    if (cartaState.isComplete) {
        cartaRestart();
        return;
    }
    loveAudio.init();
    cartaState.isPlaying = true;
    updateCartaPlayButton(true);
    typeNextChar();
}

function cartaPause() {
    cartaState.isPlaying = false;
    if (cartaState.timer) clearTimeout(cartaState.timer);
    updateCartaPlayButton(false);
}

function cartaTogglePlay() {
    if (cartaState.isPlaying) {
        cartaPause();
    } else {
        cartaPlay();
    }
}

function typeNextChar() {
    if (!cartaState.isPlaying) return;

    if (cartaState.currentIndex < cartaState.fullText.length) {
        const char = cartaState.fullText[cartaState.currentIndex];
        const bodyElem = document.getElementById('carta-body-text');
        if (bodyElem) bodyElem.textContent += char;
        cartaState.currentIndex++;

        // Sonido rítmico de pluma
        if (char !== ' ' && char !== '\n' && cartaState.currentIndex % 2 === 0) {
            loveAudio.playPenScratch();
        }

        // Variabilidad orgánica de velocidad: pausas en comas y puntos
        let delay = cartaState.speedMs;
        if (char === '.' || char === '!' || char === '?') {
            delay = cartaState.speedMs * 8;
        } else if (char === ',' || char === ';') {
            delay = cartaState.speedMs * 4;
        } else if (char === '\n') {
            delay = cartaState.speedMs * 6;
        } else {
            delay += (Math.random() * 18 - 9); // Leve fluctuación humana
        }

        cartaState.timer = setTimeout(typeNextChar, Math.max(12, delay));
    } else {
        // Finalizada
        cartaOnFinished();
    }
}

function cartaOnFinished() {
    cartaState.isPlaying = false;
    cartaState.isComplete = true;
    updateCartaPlayButton(false);

    const cursor = document.getElementById('carta-cursor');
    if (cursor) cursor.style.display = 'none';

    const footer = document.getElementById('carta-footer');
    if (footer) footer.style.display = 'block';

    const seal = document.getElementById('carta-seal-wrap');
    if (seal) {
        seal.style.display = 'block';
        setTimeout(() => {
            loveAudio.playStamp();
            triggerLoveSparks();
        }, 200);
    }
}

function cartaComplete() {
    if (cartaState.timer) clearTimeout(cartaState.timer);
    const bodyElem = document.getElementById('carta-body-text');
    if (bodyElem) bodyElem.textContent = cartaState.fullText;
    cartaState.currentIndex = cartaState.fullText.length;
    cartaOnFinished();
}

function cartaRestart() {
    if (cartaState.timer) clearTimeout(cartaState.timer);
    cartaState.currentIndex = 0;
    cartaState.isComplete = false;
    const bodyElem = document.getElementById('carta-body-text');
    if (bodyElem) bodyElem.textContent = "";

    const seal = document.getElementById('carta-seal-wrap');
    if (seal) seal.style.display = 'none';

    const footer = document.getElementById('carta-footer');
    if (footer) footer.style.display = 'none';

    const cursor = document.getElementById('carta-cursor');
    if (cursor) cursor.style.display = 'inline-block';

    cartaPlay();
}

function cartaChangeSpeed(val) {
    cartaState.speedMs = parseInt(val, 10) || 45;
}

function cartaToggleSound() {
    loveAudio.soundEnabled = !loveAudio.soundEnabled;
    const btn = document.getElementById('carta-sound-btn');
    if (btn) {
        btn.classList.toggle('active', loveAudio.soundEnabled);
        btn.innerHTML = loveAudio.soundEnabled ? '🔊 Pluma On' : '🔇 Silencio';
    }
    if (loveAudio.soundEnabled) loveAudio.init();
}

function updateCartaPlayButton(playing) {
    const btn = document.getElementById('carta-play-btn');
    if (!btn) return;
    if (cartaState.isComplete) {
        btn.innerHTML = '🔄 Releer';
    } else if (playing) {
        btn.innerHTML = '⏸️ Pausar';
    } else {
        btn.innerHTML = '▶️ Escribir';
    }
}

function cartaApplyCustom() {
    const input = document.getElementById('carta-custom-input');
    const val = input ? input.value.trim() : "";
    if (!val) {
        alert("¡Escribe unas palabras para Cleidis primero! 💜");
        return;
    }
    cartaState.fullText = val;
    cartaRestart();
}

function triggerLoveSparks() {
    // Generar chispas de corazones flotantes
    const parchment = document.querySelector('.carta-parchment');
    if (!parchment) return;

    const rect = parchment.getBoundingClientRect();
    const count = 16;
    for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'jardin-fx-item';
        spark.textContent = ['❤️', '💜', '✨', '🌹', '💖'][Math.floor(Math.random() * 5)];
        spark.style.position = 'fixed';
        spark.style.left = (rect.left + rect.width / 2 + (Math.random() * 160 - 80)) + 'px';
        spark.style.top = (rect.top + rect.height * 0.7 + (Math.random() * 80 - 40)) + 'px';
        spark.style.fontSize = (1.2 + Math.random() * 0.8) + 'rem';
        spark.style.zIndex = '9999';
        document.body.appendChild(spark);

        setTimeout(() => {
            if (spark && spark.parentNode) spark.parentNode.removeChild(spark);
        }, 1700);
    }
}


/* ========================================================
   2. SISTEMA: NUESTRO JARDÍN VIRTUAL 🌸
   ======================================================== */

const JARDIN_FRASES_AMOR = [
    "Cada segundo a tu lado, Cleidis, es como ver nacer la primera flor de la primavera.",
    "No hay jardín en el mundo con tantas maravillas como las que tú tienes en el corazón.",
    "El 10 de Febrero sembramos una semilla que florecerá durante toda nuestra vida.",
    "Tu sonrisa es el rocío que despierta a mi alma todos los amaneceres.",
    "Si por cada vez que pienso en ti naciera una flor, La Dorada entera sería un edén de rosas.",
    "Cuidarte y amarte es la promesa más dulce que mi corazón le hace al destino.",
    "Eres mi flor eterna, Cleidis; la que nunca se marchita y siempre llena mi vida de perfume.",
    "Cuando me abrazas, siento que el universo entero se aquieta para vernos felices.",
    "Amo cómo eres: tu inteligencia, tus risas inesperadas y la luz inmensa que contagias.",
    "Este amor crece con cada palabra tierna, con cada beso y con cada sueño que compartimos.",
    "Cleidis, eres el milagro más hermoso que Dios y la vida me concedieron.",
    "Ni mil cielos estrellados brillan tanto como tus ojos cuando me miras enamorada."
];

let jardinState = {
    nectar: 35, // 0 a 100%
    streakDays: 1,
    totalDrops: 12,
    lastDateStr: "",
    stage: 2, // 1 a 5
    flowerType: "rosa"
};

function initJardin() {
    loadJardinState();
    renderJardin();
}

function loadJardinState() {
    try {
        const saved = localStorage.getItem('cleidis_jardin_state_v1');
        const todayStr = new Date().toISOString().slice(0, 10);

        if (saved) {
            const data = JSON.parse(saved);
            jardinState.nectar = typeof data.nectar === 'number' ? data.nectar : 35;
            jardinState.totalDrops = typeof data.totalDrops === 'number' ? data.totalDrops : 12;
            jardinState.streakDays = typeof data.streakDays === 'number' ? data.streakDays : 1;
            jardinState.lastDateStr = data.lastDateStr || "";

            // Calcular racha si es un nuevo día
            if (jardinState.lastDateStr && jardinState.lastDateStr !== todayStr) {
                const last = new Date(jardinState.lastDateStr);
                const now = new Date(todayStr);
                const diffTime = Math.abs(now - last);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    jardinState.streakDays++;
                } else if (diffDays > 1) {
                    jardinState.streakDays = 1;
                }
                jardinState.lastDateStr = todayStr;
                saveJardinState();
            }
        } else {
            jardinState.lastDateStr = todayStr;
            saveJardinState();
        }
    } catch (e) {
        console.warn("Storage no disponible", e);
    }
}

function saveJardinState() {
    try {
        localStorage.setItem('cleidis_jardin_state_v1', JSON.stringify({
            nectar: jardinState.nectar,
            totalDrops: jardinState.totalDrops,
            streakDays: jardinState.streakDays,
            lastDateStr: jardinState.lastDateStr
        }));
    } catch (e) {}
}

function calculateJardinStage() {
    const n = jardinState.nectar;
    if (n < 20) return 1; // Semilla
    if (n < 45) return 2; // Brote verde
    if (n < 70) return 3; // Tallo con hojas
    if (n < 92) return 4; // Capullo
    return 5; // Flor florecida plena
}

function renderJardin() {
    jardinState.stage = calculateJardinStage();

    // Actualizar medidor
    const fill = document.getElementById('jardin-meter-fill');
    const label = document.getElementById('jardin-meter-label');
    if (fill) fill.style.width = Math.min(100, Math.max(8, jardinState.nectar)) + '%';
    if (label) label.textContent = `${Math.round(jardinState.nectar)}% Néctar de Amor`;

    // Actualizar estadísticas
    const streakEl = document.getElementById('jardin-streak-val');
    const dropsEl = document.getElementById('jardin-drops-val');
    const stageEl = document.getElementById('jardin-stage-val');

    if (streakEl) streakEl.textContent = jardinState.streakDays;
    if (dropsEl) dropsEl.textContent = jardinState.totalDrops;

    const stageNames = [
        "",
        "🌱 Semilla de Fe",
        "🌿 Brote Esmeralda",
        "🪴 Tallo de Cariño",
        "🌷 Capullo Prometido",
        "🌹 Rosa Eterna Florecida"
    ];
    if (stageEl) stageEl.textContent = stageNames[jardinState.stage] || "Flor Mágica";

    const badge = document.getElementById('jardin-badge-text');
    if (badge) badge.textContent = stageNames[jardinState.stage];

    // Renderizar SVG de la flor según la etapa
    renderFlowerSVG(jardinState.stage);
}

function renderFlowerSVG(stage) {
    const wrap = document.getElementById('jardin-flower-svg-wrap');
    if (!wrap) return;

    let svgContent = '';

    if (stage === 1) {
        // Semilla mágica en la tierra fértil
        svgContent = `
        <svg viewBox="0 0 200 220" width="100%" height="100%">
            <!-- Maceta de barro suave -->
            <path d="M 45 140 L 155 140 L 140 210 L 60 210 Z" fill="#d48c6a" stroke="#a66244" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="58" ry="12" fill="#bc7754" stroke="#a66244" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="50" ry="9" fill="#5a3d28"/>
            <!-- Letrero en maceta -->
            <rect x="74" y="165" width="52" height="20" rx="5" fill="#fde6ee" stroke="#e898b6" stroke-width="1"/>
            <text x="100" y="179" text-anchor="middle" font-size="10" font-family="'Quicksand',sans-serif" font-weight="700" fill="#8a3ab9">Cleidis ❤️</text>
            <!-- Semilla brillante germinando -->
            <ellipse cx="100" cy="136" rx="12" ry="8" fill="#8b5a2b"/>
            <circle cx="100" cy="134" r="5" fill="#8a3ab9" opacity="0.8">
                <animate attributeName="r" values="4;7;4" dur="2s" infinite="true"/>
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" infinite="true"/>
            </circle>
            <!-- Pequeño destello -->
            <text x="100" y="115" text-anchor="middle" font-size="20">✨</text>
        </svg>`;
    } else if (stage === 2) {
        // Brote esmeralda con hojitas tiernas
        svgContent = `
        <svg viewBox="0 0 200 220" width="100%" height="100%">
            <!-- Maceta -->
            <path d="M 45 140 L 155 140 L 140 210 L 60 210 Z" fill="#d48c6a" stroke="#a66244" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="58" ry="12" fill="#bc7754" stroke="#a66244" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="50" ry="9" fill="#5a3d28"/>
            <rect x="74" y="165" width="52" height="20" rx="5" fill="#fde6ee" stroke="#e898b6" stroke-width="1"/>
            <text x="100" y="179" text-anchor="middle" font-size="10" font-family="'Quicksand',sans-serif" font-weight="700" fill="#8a3ab9">Cleidis ❤️</text>
            <!-- Tallo pequeño brotando -->
            <path d="M 100 138 Q 98 115 100 95" stroke="#48a855" stroke-width="6" stroke-linecap="round" fill="none"/>
            <!-- Hoja izquierda -->
            <path d="M 99 110 Q 75 95 72 110 Q 82 120 99 112" fill="#59c768" stroke="#3b8f45" stroke-width="1.5"/>
            <!-- Hoja derecha -->
            <path d="M 100 102 Q 125 85 128 100 Q 118 112 100 104" fill="#59c768" stroke="#3b8f45" stroke-width="1.5"/>
            <!-- Gota de rocío brillante -->
            <circle cx="76" cy="102" r="2.5" fill="#e0f7ff" stroke="#80d8ff" stroke-width="0.8"/>
            <!-- Chispas -->
            <text x="100" y="80" text-anchor="middle" font-size="16">🌱</text>
        </svg>`;
    } else if (stage === 3) {
        // Tallo fuerte y ramitas
        svgContent = `
        <svg viewBox="0 0 200 220" width="100%" height="100%">
            <!-- Maceta -->
            <path d="M 45 140 L 155 140 L 140 210 L 60 210 Z" fill="#d48c6a" stroke="#a66244" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="58" ry="12" fill="#bc7754" stroke="#a66244" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="50" ry="9" fill="#5a3d28"/>
            <rect x="74" y="165" width="52" height="20" rx="5" fill="#fde6ee" stroke="#e898b6" stroke-width="1"/>
            <text x="100" y="179" text-anchor="middle" font-size="10" font-family="'Quicksand',sans-serif" font-weight="700" fill="#8a3ab9">Cleidis ❤️</text>
            <!-- Tallo curvilíneo elegante -->
            <path d="M 100 138 Q 94 100 102 65" stroke="#3d8f45" stroke-width="7" stroke-linecap="round" fill="none"/>
            <!-- Hojas maduras -->
            <path d="M 98 115 Q 60 100 58 120 Q 75 132 98 117" fill="#4caf50" stroke="#2e7d32" stroke-width="2"/>
            <path d="M 101 95 Q 140 80 142 100 Q 125 114 101 97" fill="#4caf50" stroke="#2e7d32" stroke-width="2"/>
            <path d="M 99 75 Q 68 60 70 76 Q 85 86 99 77" fill="#66bb6a" stroke="#2e7d32" stroke-width="1.8"/>
            <!-- Pequeño botón preparándose -->
            <circle cx="102" cy="62" r="10" fill="#c2185b" opacity="0.8"/>
            <path d="M 96 66 Q 102 50 108 66 Z" fill="#4caf50"/>
        </svg>`;
    } else if (stage === 4) {
        // Capullo de rosa a punto de abrirse
        svgContent = `
        <svg viewBox="0 0 200 220" width="100%" height="100%">
            <!-- Maceta -->
            <path d="M 45 140 L 155 140 L 140 210 L 60 210 Z" fill="#d48c6a" stroke="#a66244" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="58" ry="12" fill="#bc7754" stroke="#a66244" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="50" ry="9" fill="#5a3d28"/>
            <rect x="74" y="165" width="52" height="20" rx="5" fill="#fde6ee" stroke="#e898b6" stroke-width="1"/>
            <text x="100" y="179" text-anchor="middle" font-size="10" font-family="'Quicksand',sans-serif" font-weight="700" fill="#8a3ab9">Cleidis ❤️</text>
            <!-- Tallo -->
            <path d="M 100 138 Q 95 95 101 55" stroke="#2e7d32" stroke-width="7" stroke-linecap="round" fill="none"/>
            <!-- Hojas -->
            <path d="M 98 115 Q 58 102 55 124 Q 75 135 98 117" fill="#4caf50" stroke="#1b5e20" stroke-width="2"/>
            <path d="M 101 92 Q 145 78 148 98 Q 130 114 101 94" fill="#4caf50" stroke="#1b5e20" stroke-width="2"/>
            <!-- Sépalos del capullo -->
            <path d="M 90 56 Q 82 38 88 28 Q 98 46 95 56 Z" fill="#388e3c"/>
            <path d="M 112 56 Q 120 38 114 28 Q 104 46 107 56 Z" fill="#388e3c"/>
            <!-- Capullo de rosa aterciopelado -->
            <path d="M 88 52 C 82 25, 120 25, 114 52 C 114 58, 88 58, 88 52 Z" fill="url(#roseGrad4)" stroke="#9b111e" stroke-width="1.5"/>
            <path d="M 93 42 C 90 28, 110 28, 107 42 Z" fill="#ad1457"/>
            <defs>
                <linearGradient id="roseGrad4" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ff4081"/>
                    <stop offset="50%" stop-color="#c2185b"/>
                    <stop offset="100%" stop-color="#880e4f"/>
                </linearGradient>
            </defs>
            <text x="101" y="24" text-anchor="middle" font-size="14">✨</text>
        </svg>`;
    } else {
        // FASE 5: LA ROSA ETERNA EN FLORECIMIENTO PLENO (WOW FACTOR)
        svgContent = `
        <svg viewBox="0 0 200 220" width="100%" height="100%">
            <!-- Aura brillante alrededor de la flor -->
            <circle cx="100" cy="50" r="48" fill="url(#auraGrad)" opacity="0.5">
                <animate attributeName="r" values="44;52;44" dur="3s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.35;0.65;0.35" dur="3s" repeatCount="indefinite"/>
            </circle>
            <!-- Maceta elegante dorada/rosada -->
            <path d="M 45 140 L 155 140 L 140 210 L 60 210 Z" fill="#b96489" stroke="#772b4f" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="58" ry="12" fill="#d279a0" stroke="#772b4f" stroke-width="2"/>
            <ellipse cx="100" cy="140" rx="50" ry="9" fill="#4a182f"/>
            <!-- Placa dorada en la maceta -->
            <rect x="68" y="165" width="64" height="24" rx="6" fill="url(#goldGrad)" stroke="#b8860b" stroke-width="1.5"/>
            <text x="100" y="181" text-anchor="middle" font-size="10.5" font-family="'Dancing Script',cursive" font-weight="700" fill="#4a0e2e">Cleidis & Hoyuse ❤️</text>
            <!-- Tallo curvado lleno de vida -->
            <path d="M 100 138 Q 92 98 100 68" stroke="#2e7d32" stroke-width="7.5" stroke-linecap="round" fill="none"/>
            <!-- Hojas con textura -->
            <path d="M 97 114 Q 52 98 48 122 Q 72 136 97 116" fill="#388e3c" stroke="#1b5e20" stroke-width="2"/>
            <path d="M 101 92 Q 150 75 154 98 Q 134 116 101 94" fill="#388e3c" stroke="#1b5e20" stroke-width="2"/>
            <path d="M 98 78 Q 66 64 68 80 Q 84 90 98 80" fill="#4caf50" stroke="#1b5e20" stroke-width="1.8"/>
            <!-- Pétalos exteriores -->
            <g transform="translate(100,50)">
                <ellipse cx="-26" cy="2" rx="20" ry="24" fill="#d81b60" transform="rotate(-30 -26 2)"/>
                <ellipse cx="26" cy="2" rx="20" ry="24" fill="#d81b60" transform="rotate(30 26 2)"/>
                <ellipse cx="0" cy="16" rx="26" ry="18" fill="#c2185b"/>
                <ellipse cx="-18" cy="-14" rx="20" ry="22" fill="#ad1457" transform="rotate(-15 -18 -14)"/>
                <ellipse cx="18" cy="-14" rx="20" ry="22" fill="#ad1457" transform="rotate(15 18 -14)"/>
                <!-- Pétalos centrales en espiral de rosa -->
                <ellipse cx="0" cy="-6" rx="19" ry="20" fill="url(#roseCenterGrad)"/>
                <path d="M -12 -5 Q 0 -22 12 -5 Q 0 8 -12 -5 Z" fill="#f06292"/>
                <path d="M -7 -6 Q 0 -16 7 -6 Q 0 2 -7 -6 Z" fill="#ffebee"/>
                <circle cx="0" cy="-6" r="3" fill="#ffffff" opacity="0.9"/>
            </g>
            <!-- Mariposa violeta revoloteando -->
            <g transform="translate(142, 28) scale(0.9)">
                <ellipse cx="-6" cy="-4" rx="7" ry="9" fill="#ba68c8" transform="rotate(-30)"/>
                <ellipse cx="6" cy="-4" rx="7" ry="9" fill="#ba68c8" transform="rotate(30)"/>
                <ellipse cx="-4" cy="5" rx="5" ry="6" fill="#ce93d8"/>
                <ellipse cx="4" cy="5" rx="5" ry="6" fill="#ce93d8"/>
                <line x1="0" y1="-8" x2="0" y2="8" stroke="#4a148c" stroke-width="1.5"/>
            </g>
            <!-- Definiciones de degradados -->
            <defs>
                <radialGradient id="auraGrad">
                    <stop offset="0%" stop-color="#f48fb1" stop-opacity="0.9"/>
                    <stop offset="60%" stop-color="#ba68c8" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#8a3ab9" stop-opacity="0"/>
                </radialGradient>
                <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#fff4cc"/>
                    <stop offset="50%" stop-color="#ffd54f"/>
                    <stop offset="100%" stop-color="#ffb300"/>
                </linearGradient>
                <radialGradient id="roseCenterGrad" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stop-color="#ff4081"/>
                    <stop offset="60%" stop-color="#e91e63"/>
                    <stop offset="100%" stop-color="#880e4f"/>
                </radialGradient>
            </defs>
        </svg>`;
    }

    wrap.innerHTML = svgContent;
}

function jardinRegar() {
    loveAudio.init();
    loveAudio.playWaterDrop();
    jardinAddNectar(14, '💧');
    spawnStageParticles(['💧', '✨', '🌊'], 10);
    showNewLoveQuote();
    triggerFlowerBounce();
}

function jardinSol() {
    loveAudio.init();
    loveAudio.playSparkle();
    jardinAddNectar(14, '☀️');
    spawnStageParticles(['☀️', '✨', '💛', '🌟'], 12);
    showNewLoveQuote();
    triggerFlowerBounce();
}

function jardinCantar() {
    loveAudio.init();
    loveAudio.playSparkle();
    jardinAddNectar(14, '🎶');
    spawnStageParticles(['🎵', '🎶', '💜', '🌸'], 10);
    showNewLoveQuote();
    triggerFlowerBounce();
}

function jardinPalabraAmor() {
    loveAudio.init();
    const palabra = prompt("Escribe una palabra o pensamiento de amor para nuestra flor:", "Te amo con todo mi corazón");
    if (palabra && palabra.trim()) {
        loveAudio.playSparkle();
        jardinAddNectar(20, '💌');
        spawnStageParticles(['💌', '💖', '🌹', '✨'], 14);

        const card = document.getElementById('jardin-quote-text');
        if (card) {
            card.textContent = `"${palabra.trim()}" — Tu pensamiento ha nutrido profundamente a nuestra flor 💜`;
        }
        triggerFlowerBounce();
    }
}

function jardinAddNectar(amount, icon) {
    const oldStage = jardinState.stage;
    jardinState.nectar = Math.min(100, jardinState.nectar + amount);
    jardinState.totalDrops += 1;
    saveJardinState();
    renderJardin();

    // Si evolucionó a una nueva etapa
    if (jardinState.stage > oldStage) {
        setTimeout(() => {
            loveAudio.playSparkle();
            triggerLoveSparks();
            alert(`🎉 ¡Nuestra flor ha crecido! Ha alcanzado una nueva fase mágica: ${document.getElementById('jardin-stage-val').textContent} 🌹`);
        }, 300);
    }
}

function jardinTouchFlower() {
    loveAudio.init();
    loveAudio.playSparkle();
    triggerFlowerBounce();
    spawnStageParticles(['💕', '💜', '✨', '🌸'], 8);
    showNewLoveQuote();
}

function triggerFlowerBounce() {
    const wrap = document.getElementById('jardin-flower-svg-wrap');
    if (!wrap) return;
    wrap.classList.remove('bouncing');
    void wrap.offsetWidth; // Forzar reflow
    wrap.classList.add('bouncing');
}

function showNewLoveQuote() {
    const quoteEl = document.getElementById('jardin-quote-text');
    if (!quoteEl) return;
    const randomIdx = Math.floor(Math.random() * JARDIN_FRASES_AMOR.length);
    quoteEl.textContent = `"${JARDIN_FRASES_AMOR[randomIdx]}"`;
}

function spawnStageParticles(emojis, count) {
    const stage = document.querySelector('.jardin-stage');
    if (!stage) return;
    const rect = stage.getBoundingClientRect();

    for (let i = 0; i < count; i++) {
        const item = document.createElement('div');
        item.className = 'jardin-fx-item';
        item.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        item.style.position = 'fixed';
        item.style.left = (rect.left + 40 + Math.random() * (rect.width - 80)) + 'px';
        item.style.top = (rect.top + rect.height * 0.7 + (Math.random() * 40 - 20)) + 'px';
        item.style.fontSize = (1.1 + Math.random() * 0.7) + 'rem';
        item.style.zIndex = '9999';
        document.body.appendChild(item);

        setTimeout(() => {
            if (item && item.parentNode) item.parentNode.removeChild(item);
        }, 1600);
    }
}

function jardinReiniciar() {
    if (confirm("¿Deseas reiniciar el ciclo para ver crecer la flor desde su semilla nuevamente? (Tu racha se mantendrá intacta) 🌱")) {
        jardinState.nectar = 10;
        saveJardinState();
        renderJardin();
        showNewLoveQuote();
    }
}


/* ========================================================
   INTEGRACIÓN GLOBAL AL ENTRAR EN CADA SECCIÓN
   ======================================================== */
window.onEnterCarta = function() {
    initCartaViva();
};

window.onEnterJardin = function() {
    initJardin();
};

// Auto inicialización si ya está cargado
document.addEventListener('DOMContentLoaded', () => {
    // Escuchar el selector de velocidad de carta
    const speedSel = document.getElementById('carta-speed-select');
    if (speedSel) {
        speedSel.addEventListener('change', (e) => cartaChangeSpeed(e.target.value));
    }
});
