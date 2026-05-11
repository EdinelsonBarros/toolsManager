let ultimosDadosValidos = null;
let dadosCompletos = [];

// Cache: evita buscar o mesmo setor duas vezes
const servidoresCache = {};

window.addEventListener('load', function () {
    var chartDom = document.getElementById('treeServ');
    var myChart = echarts.init(chartDom);

    // Evento externo (filtro de setor ativo) — registrado UMA vez
    window.addEventListener('setorAtivo', function (e) {
        carregarTreeServ(e.detail);
    });

	document.getElementById('selectSetor').addEventListener('change', function () {
	    const cod = this.value;
	    carregarTreeServ(cod || null);
	});
	
	
	
    // ── Click nos nós ────────────────────────────────────────
    myChart.on('click', function (params) {
        if (!params.data) return;

        const { codSetor, isServidor, children } = params.data;

        // Clique em nó de servidor → ignora
        if (isServidor) return;

        // Clique em setor: toggle dos servidores como filhos
        toggleServidoresNoSetor(codSetor);
    });

    // ── Funções de conversão ─────────────────────────────────
    function somarRecursivo(no) {
        if (!no.children || no.children.length === 0) return no.value;
        const somaFilhos = no.children.reduce((acc, filho) => acc + somarRecursivo(filho), 0);
        no.value = no.value + somaFilhos;
        return no.value;
    }

    function converterParaEcharts(setor) {
        return {
            name: setor.setor,
            value: setor.quantidadeServ || 0,
            codSetor: setor.setor,
            hierarquiaNum: setor.hierarquia_num,
            isServidor: false,
            _servidoresVisiveis: false, // controla toggle
            children: (setor.filhos || []).map(converterParaEcharts)
        };
    }

    function encontrarSetor(lista, cod) {
        for (const s of lista) {
            if (s.codSetor === cod) return s;
            const filho = encontrarSetor(s.children || [], cod);
            if (filho) return filho;
        }
        return null;
    }

    // ── Toggle de servidores no nó ───────────────────────────
    function toggleServidoresNoSetor(codSetor) {
        const no = encontrarSetor(dadosCompletos, codSetor);
        if (!no) return;

        // Se servidores já estão visíveis → remove e recolhe
        if (no._servidoresVisiveis) {
            no.children = (no.children || []).filter(f => !f.isServidor);
            no._servidoresVisiveis = false;
            aplicarTreeServ(null);
            return;
        }

        // Se já tem cache, injeta direto
        if (servidoresCache[codSetor]) {
            injetarServidores(no, servidoresCache[codSetor]);
            return;
        }

        // Busca sob demanda
        fetch(`/api/organograma/servidores?setor=${encodeURIComponent(codSetor)}`)
            .then(r => r.json())
            .then(servidores => {
                servidoresCache[codSetor] = servidores;
                injetarServidores(no, servidores);
            })
            .catch(err => console.error('Erro ao buscar servidores:', err));
    }

    function injetarServidores(no, servidores) {
        // Remove servidores antigos se existirem (segurança)
        no.children = (no.children || []).filter(f => !f.isServidor);

        const nosServidor = servidores.map(srv => ({
            name: srv.nome,
            value: 1,
            isServidor: true,
            numfunc: srv.numfunc,
            nomeCargo: srv.nomeCargo,
            tipoCargo: srv.tipoCargo,
            // Sem children → nó folha
            symbol: srv.tipoCargo === 'CHEFIA' ? 'diamond' : 'circle',
            symbolSize: srv.tipoCargo === 'CHEFIA' ? 14 : 8,
            itemStyle: {
                color: srv.tipoCargo === 'CHEFIA' ? '#f59e0b' : '#6366f1'
            },
            label: {
                formatter: function (p) {
                    // Nome curto + cargo abreviado
                    const partes = p.data.name.split(' ').filter(w => w.length > 2);
                    const nomeAbrev = partes.length >= 2
                        ? `${partes[0]} ${partes[partes.length - 1]}`
                        : p.data.name;
                    return p.data.nomeCargo
                        ? `${nomeAbrev}\n${p.data.nomeCargo}`
                        : nomeAbrev;
                }
            }
        }));

        no.children.push(...nosServidor);
        no._servidoresVisiveis = true;
        aplicarTreeServ(null);
    }

    // ── Carga principal ──────────────────────────────────────
	function carregarTreeServ(filtrarCod = null) {
	    if (dadosCompletos.length > 0) {
	        aplicarTreeServ(filtrarCod);
	        return;
	    }

	    fetch('/api/organograma/treemap')
	        .then(r => r.json())
	        .then(setores => {
	            dadosCompletos = setores.map(converterParaEcharts);
	            dadosCompletos.forEach(somarRecursivo);

				// ── ADICIONE AQUI: popula o select ───────────────────
				   const secretarias = dadosCompletos
				       .flatMap(raiz => raiz.children)
				       .filter(s => s.hierarquiaNum <= 77);

				   ultimosDadosValidos = secretarias;

				   const select = document.getElementById('selectSetor');
				   secretarias.forEach(s => {
				       const option = document.createElement('option');
				       option.value = s.codSetor;
				       option.textContent = s.name;
				       select.appendChild(option);
				   });

	            aplicarTreeServ(filtrarCod);
	        })
	        .catch(err => console.error('Erro ao carregar treeServ:', err));
	}

	function aplicarTreeServ(filtrarCod) {
	    let data;

	    if (filtrarCod) {
	        const encontrado = encontrarSetor(dadosCompletos, filtrarCod);
	        data = encontrado ?? ultimosDadosValidos;
	    } else {
	        // ── Primeiro carregamento: nós do mesmo nível, sem filiação ──
	        data = dadosCompletos
	            .flatMap(raiz => raiz.children)
	            .filter(s => s.hierarquiaNum <= 77);
	    }

	    if (!data || (Array.isArray(data) && data.length === 0)) {
	        if (ultimosDadosValidos) data = ultimosDadosValidos;
	        else return;
	    }

	    ultimosDadosValidos = data;

	    // ── Quando são múltiplos nós raiz, envolve num nó virtual invisível ──
	    const seriesData = Array.isArray(data)
	        ? [{ name: '', value: 0, itemStyle: { opacity: 0 }, label: { show: false }, children: data }]
	        : [data];

	    myChart.setOption({
	        tooltip: {
	            trigger: 'item',
	            triggerOn: 'mousemove',
	            formatter: function (params) {
	                const d = params.data;
	                if (d.isServidor) {
	                    return `
	                        <b>${d.name}</b><br/>
	                        Nº ${d.numfunc || '—'}<br/>
	                        ${d.nomeCargo || ''}<br/>
	                        ${d.tipoCargo === 'CHEFIA' ? '⭐ Chefia' : ''}
	                    `;
	                }
	                if (!d.name) return ''; // nó virtual
	                return `<b>${d.name}</b><br/>Servidores: ${d.value}`;
	            }
	        },
	        series: [{
	            type: 'tree',
	            data: seriesData,
	            left: '2%',
	            right: '2%',
	            top: '8%',
	            bottom: '20%',
	            symbol: 'emptyCircle',
	            symbolSize: 10,
	            orient: 'vertical',
	            expandAndCollapse: true,
	            initialTreeDepth: filtrarCod ? 2 : 1, // no primeiro load mostra só as secretarias
	            label: {
	                position: 'top',
	                rotate: 0,
	                verticalAlign: 'middle',
	                align: 'right',
	                fontSize: 12,
	                formatter: function (params) {
	                    if (!params.data.name) return ''; // nó virtual
	                    if (params.data.isServidor) return params.data.name;
	                    return `${params.data.name} (${params.data.value})`;
	                }
	            },
	            leaves: {
	                label: {
	                    position: 'bottom',
	                    rotate: 0,
	                    verticalAlign: 'middle',
	                    align: 'left',
	                    fontSize: 8
	                }
	            },
	            animationDurationUpdate: 800
	        }]
	    }, true);
	}

    // Inicia
    carregarTreeServ();
});


document.getElementById('selectSetor').addEventListener('change', function () {
    const cod = this.value;
    carregarTreeServ(cod || null);
});