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



  // ── Expandir / Recolher ──────────────────────────────────
  function expandAll() {
    document.querySelectorAll('.children').forEach(c => c.classList.add('open'));
    document.querySelectorAll('.toggle-icon').forEach(i => i.classList.add('open'));
  }
  function collapseAll() {
    document.querySelectorAll('.children').forEach(c => c.classList.remove('open'));
    document.querySelectorAll('.toggle-icon').forEach(i => i.classList.remove('open'));
  }

  // ── Toggle setor com AJAX ────────────────────────────────
  function toggleSetor(el, setor) {
    const li       = el.closest('li');
    const children = li.querySelector('.children');
    const icon     = el.querySelector('.toggle-icon');

    children.classList.toggle('open');
    icon.classList.toggle('open');

    const srvContainer = li.querySelector('.servidores-container');
    if (srvContainer && !srvContainer.dataset.loaded) {
      srvContainer.dataset.loaded = 'true';
      srvContainer.innerHTML = '<li class="loading">Carregando...</li>';

      fetch(`/api/organograma/servidores?setor=${encodeURIComponent(setor)}`)
        .then(r => r.json())
        .then(servidores => {
          srvContainer.innerHTML = '';
          if (servidores.length === 0) {
            srvContainer.innerHTML = '<li class="loading">Nenhum servidor lotado.</li>';
            return;
          }
          servidores.forEach(srv => srvContainer.appendChild(criarNoServidor(srv)));
        })
        .catch(() => {
          srvContainer.innerHTML = '<li class="loading">Erro ao carregar.</li>';
        });
    }
  }

  // ── Cria nó de servidor (árvore) ────────────────────────
  function criarNoServidor(srv) {
    const li = document.createElement('li');
    li.className = 'node';

    const header = document.createElement('div');
    header.className = 'node-header';
    header.style.cursor = 'default';

    const avatar = document.createElement('div');
    avatar.className = srv.tipoCargo === 'CHEFIA' ? 'srv-avatar chefia' : 'srv-avatar';
    const iniciais = srv.nome.split(' ')
      .filter(p => p.length > 2).slice(0, 2).map(p => p[0]).join('');
    avatar.textContent = iniciais || '?';

    const info = document.createElement('div');
    info.className = 'srv-info';
    info.innerHTML = `
      <span class="srv-name">${srv.nome} 
		<span class="srv-cargo">${srv.numfunc}</span>
	  </span>
	  
      ${srv.nomeCargo ? `<span class="srv-cargo">${srv.nomeCargo}</span> ` : ''}
    `;

    header.appendChild(avatar);
    header.appendChild(info);

    if (srv.tipoCargo === 'CHEFIA') {
      const badge = document.createElement('span');
      badge.className = 'badge chefia';
      badge.textContent = 'Chefia';
      header.appendChild(badge);
    }

    li.appendChild(header);
    return li;
  }

  // ── Busca de servidores ──────────────────────────────────
  const searchBox    = document.getElementById('searchBox');
  const resultsPanel = document.getElementById('searchResults');
  let debounceTimer  = null;

  searchBox.addEventListener('input', function () {
    const termo = this.value.trim();

    // Menos de 3 caracteres: filtrar setores normalmente e ocultar painel
    if (termo.length < 3) {
      fecharPainel();
      filtrarSetores(termo);
      return;
    }

    // 3+ caracteres: esconde filtro de setor e busca servidores
    mostrarTodosSetores();
    clearTimeout(debounceTimer);
    resultsPanel.innerHTML = '<div class="result-loading">Buscando...</div>';
    resultsPanel.classList.add('visible');

    debounceTimer = setTimeout(() => {
      fetch(`/api/organograma/buscar?termo=${encodeURIComponent(termo)}`)
        .then(r => r.json())
        .then(servidores => renderizarResultados(servidores))
        .catch(() => {
          resultsPanel.innerHTML = '<div class="result-empty">Erro ao buscar.</div>';
        });
    }, 300);
  });

  // Fecha painel ao clicar fora
  const toolbar = document.querySelector('.toolbar');

  document.addEventListener('click', function (e) {
    if (!toolbar.contains(e.target)) {
      fecharPainel();
    }
  });

  function fecharPainel() {
    resultsPanel.classList.remove('visible');
    resultsPanel.innerHTML = '';
  }

  function renderizarResultados(servidores) {
    resultsPanel.innerHTML = '';

    if (servidores.length === 0) {
      resultsPanel.innerHTML = '<div class="result-empty">Nenhum servidor encontrado.</div>';
      return;
    }

    servidores.forEach(srv => {
      const item = document.createElement('div');
      item.className = 'result-item';

      const avatar = document.createElement('div');
      avatar.className = srv.tipoCargo === 'CHEFIA' ? 'result-avatar chefia' : 'result-avatar';
      const iniciais = srv.nome.split(' ')
        .filter(p => p.length > 2).slice(0, 2).map(p => p[0]).join('');
      avatar.textContent = iniciais || '?';

      const info = document.createElement('div');
      info.className = 'result-info';
      info.innerHTML = `
        <span class="result-nome">${srv.nome}</span>
        <span class="result-detalhe">${srv.nomeCargo || ''}</span>
        <span class="result-setor">${srv.nomeSetor || srv.codSetor || ''}</span>
      `;

      const numfunc = document.createElement('span');
      numfunc.className = 'result-numfunc';
      numfunc.textContent = srv.numfunc ? `Nº ${srv.numfunc}` : '';

      item.appendChild(avatar);
      item.appendChild(info);
      item.appendChild(numfunc);
      resultsPanel.appendChild(item);
    });
  }

  // ── Filtro de setores (comportamento original) ───────────
  function filtrarSetores(termo) {
    document.querySelectorAll('.node').forEach(node => {
      const label = node.querySelector('.setor-label');
      if (!label) return;
      node.style.display = (!termo || label.textContent.toLowerCase().includes(termo.toLowerCase()))
        ? '' : 'none';
    });
  }

 
  // ── Carrega valor total da folha ─────────────────────────
  function mostrarTodosSetores() {
    document.querySelectorAll('.node').forEach(node => {
      node.style.display = '';
    });
  }
  /*
  fetch('/custofolha/totalproventos')
      .then(r => r.json())
      .then(data => {
        const el = document.getElementById('valorFolha');
        el.classList.remove('loading');
        const valor = typeof data === 'number' ? data : (data.total ?? data.valor ?? 0);
        el.textContent = valor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
      })
      .catch(() => {
        document.getElementById('valorFolha').textContent = 'Indisponível';
      });
	  
	  */
	  // ── Carrega todos os indicadores via AJAX ────────────────
	    fetch('/custofolha/indicadores')
	      .then(r => r.json())
	      .then(data => {
			const d = Array.isArray(data) ? data[0] : data;
	        preencherCard('ind-proventos',   d.custoProventos);
	        preencherCard('ind-inss',        d.inss_patronal);
	        preencherCard('ind-alimentacao', d.vale_alimentacao);
	        preencherCard('ind-saude',       d.plano_saude_patronal);
	        preencherCard('ind-chefia',      d.adicional_cargo_chefia);
	        preencherCard('ind-confianca',   d.funcao_confianca);
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
