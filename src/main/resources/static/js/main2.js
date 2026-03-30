/* ============================================================
   main.js — Organograma + Dark Mode + Indicadores
   ============================================================ */

// ── Dark / Light Mode ────────────────────────────────────────
(function () {
  const btn  = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const KEY  = 'tema-organograma';

  function aplicarTema(dark) {
    document.body.classList.toggle('dark', dark);
    icon.src = dark ? 'icons/sun.png' : 'icons/moon.png';
    icon.alt = dark ? 'Tema claro'    : 'Tema escuro';
    localStorage.setItem(KEY, dark ? 'dark' : 'light');
  }

  // Restaura preferência salva (ou usa preferência do sistema)
  const salvo = localStorage.getItem(KEY);
  if (salvo) {
    aplicarTema(salvo === 'dark');
  } else {
    aplicarTema(window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  btn.addEventListener('click', () => {
    aplicarTema(!document.body.classList.contains('dark'));
  });
})();


// ── Indicadores via AJAX ─────────────────────────────────────
fetch('/custofolha/indicadores')
  .then(r => r.json())
  .then(data => {
    const d = Array.isArray(data) ? data[0] : data;
    preencherCard('ind-proventos',   d.custoProventos);
    preencherCard('ind-inss',        d.inssPatronal);
    preencherCard('ind-alimentacao', d.valeAlimentacao);
    preencherCard('ind-saude',       d.planoSaudePatronal);
    preencherCard('ind-chefia',      d.adicionalCargoChefia);
    preencherCard('ind-confianca',   d.funcaoConfianca);
  })
  .catch(() => {
    document.querySelectorAll('.card-folha-valor').forEach(el => {
      el.textContent = 'Indisponível';
      el.classList.remove('loading');
    });
  });

function preencherCard(id, valor) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('loading');
  const num = valor ?? 0;
  el.textContent = Number(num).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}


// ── Toggle de setor (árvore) ─────────────────────────────────
function toggleSetor(headerEl, codSetor) {
  const li       = headerEl.closest('li.node');
  const children = li.querySelector(':scope > ul.children');
  const toggle   = headerEl.querySelector('.toggle-icon');

  if (!children) return;

  const abrindo = !children.classList.contains('open');
  children.classList.toggle('open', abrindo);
  toggle.classList.toggle('open', abrindo);

  // Carrega servidores via AJAX apenas na primeira abertura
  if (abrindo) {
    const container = children.querySelector('.servidores-container');
    if (container && !container.dataset.loaded) {
      container.dataset.loaded = 'true';
      container.innerHTML = '<li class="loading">Carregando…</li>';

      fetch(`/organograma/servidores?setor=${encodeURIComponent(codSetor)}`)
        .then(r => r.json())
        .then(servidores => {
          if (!servidores.length) {
            container.innerHTML = '';
            return;
          }
          container.innerHTML = servidores.map(s => {
            const iniciais = iniciais2(s.nome);
            const chefia   = s.chefia ? ' chefia' : '';
            return `
              <li>
                <div class="node-header" style="cursor:default">
                  <div class="srv-avatar${chefia}">${iniciais}</div>
                  <div class="srv-info">
                    <span class="srv-name">${s.nome}</span>
                    <span class="srv-cargo">${s.cargo ?? ''}</span>
                  </div>
                </div>
              </li>`;
          }).join('');
        })
        .catch(() => {
          container.innerHTML = '<li class="loading">Erro ao carregar.</li>';
        });
    }
  }
}

function iniciais2(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}


// ── Expandir / Recolher tudo ─────────────────────────────────
function expandAll() {
  document.querySelectorAll('.children').forEach(el => el.classList.add('open'));
  document.querySelectorAll('.toggle-icon').forEach(el => el.classList.add('open'));
}

function collapseAll() {
  document.querySelectorAll('.children').forEach(el => el.classList.remove('open'));
  document.querySelectorAll('.toggle-icon').forEach(el => el.classList.remove('open'));
}


// ── Busca de servidores ──────────────────────────────────────
const searchBox     = document.getElementById('searchBox');
const searchResults = document.getElementById('searchResults');
let   searchTimer   = null;

searchBox.addEventListener('input', () => {
  clearTimeout(searchTimer);
  const q = searchBox.value.trim();

  if (q.length < 2) {
    searchResults.innerHTML = '';
    searchResults.classList.remove('visible');
    return;
  }

  searchResults.innerHTML = '<div class="result-loading">Buscando…</div>';
  searchResults.classList.add('visible');

  searchTimer = setTimeout(() => {
    fetch(`/organograma/buscar?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(items => {
        if (!items.length) {
          searchResults.innerHTML = '<div class="result-empty">Nenhum resultado encontrado.</div>';
          return;
        }
        searchResults.innerHTML = items.map(item => {
          const iniciais = iniciais2(item.nome);
          const chefia   = item.chefia ? ' chefia' : '';
          return `
            <div class="result-item">
              <div class="result-avatar${chefia}">${iniciais}</div>
              <div class="result-info">
                <span class="result-nome">${item.nome}</span>
                <span class="result-detalhe">${item.cargo ?? ''}</span>
                <span class="result-setor">${item.setor ?? ''}</span>
              </div>
              <span class="result-numfunc">${item.numfunc ?? ''}</span>
            </div>`;
        }).join('');
      })
      .catch(() => {
        searchResults.innerHTML = '<div class="result-empty">Erro na busca.</div>';
      });
  }, 300);
});

// Fecha painel ao clicar fora
document.addEventListener('click', e => {
  if (!searchBox.contains(e.target) && !searchResults.contains(e.target)) {
    searchResults.classList.remove('visible');
  }
});

searchBox.addEventListener('focus', () => {
  if (searchResults.innerHTML.trim()) searchResults.classList.add('visible');
});
