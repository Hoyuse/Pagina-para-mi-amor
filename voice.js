//  MENSAJES DE VOZ
    // ══════════════════════════════════════════
    let voiceMediaRecorder = null;
    let voiceChunks        = [];
    let voiceBlob          = null;
    let voiceTimerInterval = null;
    let voiceSeconds       = 0;
    let voiceAnimFrame     = null;
    let voiceAnalyser      = null;
    let voiceAudioCtx      = null;
    const VOICE_MAX_SEC    = 120;

    // ── Actualiza la onda en el canvas ──
    function voiceDrawWave() {
        const canvas = document.getElementById('voice-wave');
        if (!canvas || !voiceAnalyser) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;
        const bufLen = voiceAnalyser.frequencyBinCount;
        const dataArr = new Uint8Array(bufLen);
        voiceAnalyser.getByteTimeDomainData(dataArr);

        ctx.clearRect(0, 0, W, H);
        ctx.strokeStyle = '#c87bff';
        ctx.lineWidth   = 2;
        ctx.beginPath();
        const sliceW = W / bufLen;
        let x = 0;
        for (let i = 0; i < bufLen; i++) {
            const v = dataArr[i] / 128.0;
            const y = (v * H) / 2;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            x += sliceW;
        }
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        voiceAnimFrame = requestAnimationFrame(voiceDrawWave);
    }

    // ── Inicia el canvas con tamaño real ──
    function voiceInitCanvas() {
        const canvas = document.getElementById('voice-wave');
        if (!canvas) return;
        const wrap = document.getElementById('voice-wave-wrap');
        canvas.width  = wrap.clientWidth  || 300;
        canvas.height = 64;
    }

    // ── GRABAR ──
    async function voiceStartRec() {
        if (voiceMediaRecorder && voiceMediaRecorder.state === 'recording') return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            voiceAudioCtx  = new (window.AudioContext || window.webkitAudioContext)();
            const src      = voiceAudioCtx.createMediaStreamSource(stream);
            voiceAnalyser  = voiceAudioCtx.createAnalyser();
            voiceAnalyser.fftSize = 512;
            src.connect(voiceAnalyser);

            voiceChunks = [];
            voiceMediaRecorder = new MediaRecorder(stream);
            voiceMediaRecorder.ondataavailable = e => { if (e.data.size > 0) voiceChunks.push(e.data); };
            voiceMediaRecorder.onstop = voiceOnStop;
            voiceMediaRecorder.start(100);

            // UI
            voiceInitCanvas();
            document.getElementById('voice-wave-idle').style.display = 'none';
            document.getElementById('btn-record').disabled    = true;
            document.getElementById('btn-record').style.opacity = '0.5';
            document.getElementById('btn-stop-rec').disabled  = false;
            document.getElementById('btn-stop-rec').style.background = '#e53935';
            document.getElementById('btn-stop-rec').style.color      = '#fff';
            document.getElementById('btn-stop-rec').style.cursor     = 'pointer';
            document.getElementById('voice-preview-wrap').style.display = 'none';
            document.getElementById('btn-save-voice').style.display     = 'none';

            // Temporizador
            voiceSeconds = 0;
            clearInterval(voiceTimerInterval);
            voiceTimerInterval = setInterval(() => {
                voiceSeconds++;
                const m = String(Math.floor(voiceSeconds / 60)).padStart(2, '0');
                const s = String(voiceSeconds % 60).padStart(2, '0');
                document.getElementById('voice-timer').textContent = m + ':' + s;
                if (voiceSeconds >= VOICE_MAX_SEC) voiceStopRec();
            }, 1000);

            voiceDrawWave();
        } catch (err) {
            alert('No se pudo acceder al micrófono. Verifica los permisos 🎙️');
        }
    }

    // ── DETENER ──
    function voiceStopRec() {
        if (!voiceMediaRecorder || voiceMediaRecorder.state !== 'recording') return;
        voiceMediaRecorder.stop();
        voiceMediaRecorder.stream.getTracks().forEach(t => t.stop());
        clearInterval(voiceTimerInterval);
        cancelAnimationFrame(voiceAnimFrame);
        if (voiceAudioCtx) { voiceAudioCtx.close(); voiceAudioCtx = null; }

        // Limpiar canvas
        const canvas = document.getElementById('voice-wave');
        if (canvas) { const ctx = canvas.getContext('2d'); ctx.clearRect(0, 0, canvas.width, canvas.height); }
        document.getElementById('voice-wave-idle').style.display = 'block';
        document.getElementById('voice-wave-idle').textContent   = '✅ Grabación lista';

        document.getElementById('btn-record').disabled   = false;
        document.getElementById('btn-record').style.opacity = '1';
        document.getElementById('btn-stop-rec').disabled = true;
        document.getElementById('btn-stop-rec').style.background = '#ccc';
        document.getElementById('btn-stop-rec').style.color      = '#888';
        document.getElementById('btn-stop-rec').style.cursor     = 'not-allowed';
    }

    // ── Cuando termina la grabación ──
    function voiceOnStop() {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg';
        voiceBlob = new Blob(voiceChunks, { type: mimeType });
        const url  = URL.createObjectURL(voiceBlob);
        const preview = document.getElementById('voice-preview');
        preview.src = url;
        document.getElementById('voice-preview-wrap').style.display = 'block';
        document.getElementById('btn-save-voice').style.display     = 'block';
    }

    // ── GUARDAR en Firebase como base64 ──
    async function voiceSave() {
        if (!voiceBlob) return;
        const title = document.getElementById('voice-title').value.trim() || '🎙️ Mensaje de voz';

        // Límite ~1.5 MB en base64 (≈1.1 MB blob) para no saturar Realtime DB
        if (voiceBlob.size > 1100000) {
            alert('El audio es demasiado largo. Máximo 2 minutos 🙏');
            return;
        }

        document.getElementById('btn-save-voice').style.display  = 'none';
        document.getElementById('voice-saving-msg').style.display = 'block';

        try {
            const reader = new FileReader();
            reader.onload = async function(e) {
                const base64 = e.target.result; // data:audio/webm;base64,...
                if (!window.db || !window.dbRef || !window.dbPush) {
                    alert('Error de conexión con la base de datos');
                    return;
                }
                const vocesRef = window.dbRef(window.db, 'voces');
                await window.dbPush(vocesRef, {
                    titulo:    title,
                    audio:     base64,
                    duracion:  voiceSeconds,
                    timestamp: Date.now()
                });
                document.getElementById('voice-saving-msg').style.display = 'none';
                document.getElementById('voice-title').value = '';
                document.getElementById('voice-preview-wrap').style.display = 'none';
                document.getElementById('voice-wave-idle').textContent = 'Presiona grabar para comenzar';
                document.getElementById('voice-timer').textContent = '00:00';
                voiceBlob    = null;
                voiceSeconds = 0;
                voiceLoadList();
            };
            reader.readAsDataURL(voiceBlob);
        } catch (err) {
            document.getElementById('voice-saving-msg').style.display = 'none';
            document.getElementById('btn-save-voice').style.display   = 'block';
            alert('Error al guardar. Intenta de nuevo 💔');
        }
    }

    // ── CARGAR lista de mensajes ──
    function voiceLoadList() {
        if (!window.db || !window.dbRef || !window.dbGet) return;
        const vocesRef = window.dbRef(window.db, 'voces');
        window.dbGet(vocesRef).then(snapshot => {
            const list  = document.getElementById('voice-list');
            const empty = document.getElementById('voice-empty');
            if (!snapshot.exists()) {
                list.innerHTML = '';
                list.appendChild(empty);
                empty.style.display = 'block';
                return;
            }
            const items = Object.entries(snapshot.val()).sort((a,b) => b[1].timestamp - a[1].timestamp);
            empty.style.display = 'none';

            // Mantener el nodo empty pero limpiar el resto
            list.innerHTML = '';
            list.appendChild(empty);

            items.forEach(([key, v]) => {
                const dur = v.duracion ? (Math.floor(v.duracion/60)+'m '+(v.duracion%60)+'s') : '';
                const date = new Date(v.timestamp).toLocaleDateString('es-ES',{day:'numeric',month:'long',year:'numeric'});
                const card = document.createElement('div');
                card.style.cssText = 'background:linear-gradient(135deg,#f5eeff,#ffe8f8);border-radius:16px;padding:14px;border:1px solid rgba(138,58,185,0.15);';
                card.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;gap:8px;">
                        <div>
                            <div style="font-weight:700;color:var(--primary);font-size:0.95rem;">${v.titulo}</div>
                            <div style="font-size:0.75rem;color:#a78bca;margin-top:2px;">${date}${dur ? ' · '+dur : ''}</div>
                        </div>
                        <button onclick="voiceDelete('${key}',this)" style="background:none;border:none;color:#e57373;font-size:1.1rem;cursor:pointer;padding:2px 6px;border-radius:8px;-webkit-tap-highlight-color:transparent;" title="Eliminar">🗑️</button>
                    </div>
                    <audio controls src="${v.audio}" style="width:100%;border-radius:10px;" preload="none"></audio>
                `;
                list.appendChild(card);
            });
        });
    }

    // ── ELIMINAR mensaje ──
    function voiceDelete(key, btn) {
        if (!confirm('¿Eliminar este mensaje de voz? 💔')) return;
        if (!window.db || !window.dbRef) return;
        import("https://www.gstatic.com/firebasejs/12.11.0/firebase-database.js").then(m => {
            const r = m.ref(window.db, 'voces/' + key);
            m.remove(r).then(() => voiceLoadList());
        });
    }

    // ── Cargar lista cuando se entra a la sección ──
    (function hookVoiceGo() {
        if (typeof window.go === 'function') {
            const orig = window.go;
            window.go = function(id) {
                orig(id);
                if (id === 'voces') { voiceInitCanvas(); voiceLoadList(); }
            };
        } else {
            setTimeout(hookVoiceGo, 100);
        }