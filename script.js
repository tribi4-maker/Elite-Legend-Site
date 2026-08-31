/* ── Fundo dinâmico com partículas ─────────────── */
(function () {
  const canvas = document.getElementById('bg-canvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function randomBetween(a, b) { return a + Math.random() * (b - a); }

  function createParticle() {
    return {
      x:     randomBetween(0, W),
      y:     randomBetween(0, H),
      r:     randomBetween(1, 3),
      vx:    randomBetween(-0.3, 0.3),
      vy:    randomBetween(-0.5, -0.1),
      alpha: randomBetween(0.15, 0.5),
    };
  }

  function initParticles() {
    const count = Math.floor((W * H) / 9000);
    particles = Array.from({ length: count }, createParticle);
  }

  function drawHex(cx, cy, size, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.07;
    ctx.strokeStyle = '#C9A84C';
    ctx.lineWidth   = 0.6;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const x = cx + size * Math.cos(angle);
      const y = cy + size * Math.sin(angle);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /* grade hexagonal estática de fundo */
  function drawHexGrid() {
    const size = 60;
    const colW = size * Math.sqrt(3);
    const rowH = size * 1.5;
    const cols = Math.ceil(W / colW) + 1;
    const rows = Math.ceil(H / rowH) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const offset = (r % 2) * (colW / 2);
        drawHex(c * colW + offset, r * rowH, size, 1);
      }
    }
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    drawHexGrid();

    /* partículas brilhantes */
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = Math.random() > 0.5 ? '#C9A84C' : '#F2D06B';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -10 || p.x < -10 || p.x > W + 10) {
        Object.assign(p, createParticle(), { y: H + 10 });
      }
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', () => { resize(); initParticles(); });
  resize();
  initParticles();
  tick();
})();

/* ── Formulário de Inscrição → Supabase + EmailJS ── */
document.getElementById('inscricao-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const btn = this.querySelector('.btn-submit');
  btn.disabled    = true;
  btn.textContent = 'A enviar…';

  const payload = {
    nome:             document.getElementById('nome').value.trim(),
    data_nasc:        document.getElementById('data_nascimento').value,
    num_bi:           document.getElementById('num_bi').value.trim(),
    num_contrib:      document.getElementById('num_contribuinte').value.trim(),
    clube:            document.getElementById('clube').value.trim(),
    auth_imagens:     document.querySelector('input[name="auth_imagens"]:checked')?.value ?? '',
    auth_publicidade: document.querySelector('input[name="auth_publicidade"]:checked')?.value ?? '',
    enc_nome:         document.getElementById('enc_nome').value.trim(),
    enc_tlm:          document.getElementById('enc_tlm').value.trim(),
    enc_email:        document.getElementById('enc_email').value.trim(),
    aceita_privacidade: document.getElementById('aceita-privacidade').checked ? 'Sim' : 'Não',
  };

  try {
    // 1 — Guardar na base de dados
    const res = await fetch(`${SUPABASE_URL}/rest/v1/inscricoes`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(await res.text());

    // 2 — Enviar email de notificação via Edge Function
    await fetch(`${SUPABASE_URL}/functions/v1/enviar-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      },
      body: JSON.stringify(payload),
    });

    this.style.display = 'none';
    document.getElementById('inscricao-header').style.display = 'none';
    const success = document.getElementById('form-success');
    success.classList.add('show');
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });

  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Enviar Inscrição';
    alert('Erro ao enviar. Tenta novamente ou contacta-nos diretamente.');
    console.error(err);
  }
});

/* ── Menu hamburger ─────────────────────────────── */
(function () {
  const toggle = document.getElementById('nav-toggle');
  const menu   = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    menu.classList.toggle('open');
  });

  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      toggle.classList.remove('open');
      menu.classList.remove('open');
    });
  });
})();

/* ── Carrossel de Novidades ──────────────────────── */
(function () {
  const track    = document.getElementById('novidades-track');
  const wrap     = document.querySelector('.novidades-track-wrap');
  const dotsWrap = document.getElementById('novidades-dots');
  if (!track) return;

  const total = track.children.length;
  const INTERVALO = 6000;
  let atual = 0;
  let timer = null;

  const dots = [];
  if (dotsWrap) {
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'novidades-dot';
      dot.setAttribute('aria-label', `Ir para novidade ${i + 1}`);
      dot.addEventListener('click', () => { irPara(i); reiniciarAutoplay(); });
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
  }

  function irPara(i) {
    atual = (i + total) % total;
    track.style.transform = `translateX(-${atual * 100}%)`;
    dots.forEach((d, idx) => d.classList.toggle('active', idx === atual));
  }

  function pausarAutoplay() {
    clearInterval(timer);
  }

  function reiniciarAutoplay() {
    clearInterval(timer);
    timer = setInterval(() => irPara(atual + 1), INTERVALO);
  }

  window.novidadeSeguinte = function () { irPara(atual + 1); reiniciarAutoplay(); };
  window.novidadeAnterior = function () { irPara(atual - 1); reiniciarAutoplay(); };

  // Pausar enquanto o rato/dedo está premido, retomar ao soltar
  if (wrap) {
    let touchStartX = 0;

    wrap.addEventListener('mousedown', pausarAutoplay);
    wrap.addEventListener('mouseup', reiniciarAutoplay);
    wrap.addEventListener('mouseleave', reiniciarAutoplay);

    wrap.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
      pausarAutoplay();
    }, { passive: true });

    wrap.addEventListener('touchend', e => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) < 40) { reiniciarAutoplay(); return; }
      if (deltaX < 0) window.novidadeSeguinte();
      else window.novidadeAnterior();
    });
  }

  irPara(0);
  if (total > 1) reiniciarAutoplay();
})();

/* ── Galeria de atletas + Lightbox ─────────────── */
(function () {
  const grid = document.getElementById('galeria-grid');
  if (!grid) return;

  const fotosAtletas = Array.from({ length: 22 }, (_, i) => `images/atletas/${i + 1}.webp`);
  const fotos = [...fotosAtletas, 'images/atletas/treinadores.webp'];
  const total = fotos.length;

  grid.innerHTML = fotos
    .map((src, i) => {
      const isTreinadores = src.includes('treinadores');
      const alt = isTreinadores ? 'Treinadores Elite Legend Academy' : 'Atleta Elite Legend Academy';
      return `
      <button class="galeria-thumb" type="button" data-index="${i}" aria-label="Ver foto ${i + 1} em grande">
        <img src="${src}" alt="${alt}" loading="lazy" />
      </button>
    `;
    })
    .join('');

  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const btnClose     = document.getElementById('lightbox-close');
  const btnPrev      = document.getElementById('lightbox-prev');
  const btnNext       = document.getElementById('lightbox-next');

  let atual = 0;

  function abrir(i) {
    atual = (i + total) % total;
    lightboxImg.src = fotos[atual];
    lightbox.classList.add('open');
  }

  function fechar() {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
  }

  function seguinte() { abrir(atual + 1); }
  function anterior()  { abrir(atual - 1); }

  grid.querySelectorAll('.galeria-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => abrir(Number(thumb.dataset.index)));
  });

  btnClose.addEventListener('click', fechar);
  btnPrev.addEventListener('click', anterior);
  btnNext.addEventListener('click', seguinte);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) fechar();
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')     fechar();
    if (e.key === 'ArrowRight') seguinte();
    if (e.key === 'ArrowLeft')  anterior();
  });
})();

/* ── Scroll ativo no navbar ─────────────────────── */
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  },
  { threshold: 0.4 }
);

sections.forEach(s => observer.observe(s));
