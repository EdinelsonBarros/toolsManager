let ultimosDadosValidos = null;
let dadosCompletos = [];
const servidoresCache = {};

window.addEventListener('load', function () {
    const chartDom = document.getElementById('treeServ');
    const myChart = echarts.init(chartDom);

    // --- Eventos ---
    window.addEventListener('setorAtivo', (e) => carregarTreeServ(e.detail));

    document.getElementById('selectSetor').addEventListener('change', function () {
        carregarTreeServ(this.value || null);
    });

    myChart.on('click', function (params) {
        if (!params.data || params.data.isServidor) return;
        toggleServidoresNoSetor(params.data.codSetor);
    });

    // --- Processamento de Dados ---
    function converterParaEcharts(setor) {
        return {
            name: setor.setor,
            value: setor.quantidadeServ || 0,
            codSetor: setor.setor,
            hierarquiaNum: setor.hierarquia_num,
            isServidor: false,
            _servidoresVisiveis: false,
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

    // --- Lógica de Servidores (Chefe como Nó Pai) ---
    function toggleServidoresNoSetor(codSetor) {
        const no = encontrarSetor(dadosCompletos, codSetor);
        if (!no) return;

        // Se já estão visíveis, remove apenas os servidores e mantém os sub-setores
        if (no._servidoresVisiveis) {
            no.children = (no.children || []).filter(f => !f.isServidor);
            no._servidoresVisiveis = false;
            aplicarTreeServ(no.codSetor);
            return;
        }

        if (servidoresCache[codSetor]) {
            injetarServidores(no, servidoresCache[codSetor]);
            return;
        }

        fetch(`/api/organograma/servidores?setor=${encodeURIComponent(codSetor)}`)
            .then(r => r.json())
            .then(servidores => {
                servidoresCache[codSetor] = servidores;
                injetarServidores(no, servidores);
            });
    }

    function injetarServidores(no, servidores) {
        // Limpa servidores antigos antes de injetar
        no.children = (no.children || []).filter(f => !f.isServidor);

        const chefe = servidores.find(s => s.tipoCargo === 'CHEFIA');
        const subordinados = servidores.filter(s => s.tipoCargo !== 'CHEFIA');
        const nosSubordinados = subordinados.map(srv => formatarNoServidor(srv));

        if (chefe) {
            // O CHEFE vira um nó pai que contém os outros funcionários
            const noChefe = formatarNoServidor(chefe);
            noChefe.children = nosSubordinados; 
            no.children.push(noChefe);
        } else {
            // Se não houver chefe definido, lista todos normalmente
            no.children.push(...nosSubordinados);
        }

        no._servidoresVisiveis = true;
        aplicarTreeServ(no.codSetor);
    }

    function formatarNoServidor(srv) {
        return {
            name: srv.nome,
            isServidor: true,
            numfunc: srv.numfunc,
            nomeCargo: srv.nomeCargo,
            tipoCargo: srv.tipoCargo,
            symbol: srv.tipoCargo === 'CHEFIA' ? 'diamond' : 'circle',
            symbolSize: srv.tipoCargo === 'CHEFIA' ? 14 : 10,
            itemStyle: { 
                color: srv.tipoCargo === 'CHEFIA' ? '#f59e0b' : '#6366f1',
                borderColor: '#fff',
                borderWidth: 1
            }
        };
    }
	
	
/*	function extrairSetoresParaSelect(lista) {
	    return lista.reduce((acc, setor) => {
	        // 1. Se o setor atual for válido, adiciona à lista
	        if (setor.hierarquiaNum <= 77) {
	            acc.push(setor);
	        }
	        
	        // 2. Se o setor tiver filhos, processa os filhos também e junta os resultados
	        if (setor.children && setor.children.length > 0) {
	            acc = acc.concat(extrairSetoresParaSelect(setor.children));
	        }
	        
	        return acc;
	    }, []);
	}
	*/
	
	
	
	

    // --- Renderização (Foco no Nó Pai) ---
    function aplicarTreeServ(filtrarCod) {
        let data = null;
        
        if (filtrarCod) {
            data = encontrarSetor(dadosCompletos, filtrarCod);
        } 
        
        // Se não houver filtro ou não encontrar, usa a raiz real do JSON
        if (!data) {
            data = dadosCompletos[0]; 
        }

        ultimosDadosValidos = data;

        // Renderizamos o nó 'data' diretamente como raiz da série
        const seriesData = [data];

        myChart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: (p) => p.data.isServidor ? `<b>${p.data.name}</b><br>${p.data.nomeCargo}` : `<b>Setor:</b> ${p.name}`
            },
            series: [{
                type: 'tree',
                data: seriesData,
                orient: 'vertical',
                layout: 'orthogonal',
                edgeShape: 'polyline',
                symbol: 'rect',
                symbolSize: [140, 45],
                initialTreeDepth: 1, // Mostra o pai e o primeiro nível (secretarias)
                expandAndCollapse: true,
                label: {
                    position: 'inside',
                    fontSize: 10,
                    color: '#fff',
                    formatter: (params) => {
                        const n = params.data.name || '';
                        return n.length > 20 ? n.substring(0, 18) + '...' : n;
                    }
                },
                lineStyle: { 
                    width: 2,
                    color: '#ccc'
                },
                leaves: {
                    label: { position: 'bottom', color: '#333', fontSize: 9 }
                }
            }]
        }, true);
    }
	
	

    function carregarTreeServ() {
        fetch('/api/organograma/treemap')
            .then(r => r.json())
            .then(setores => {
                // Converte os dados
                dadosCompletos = setores.map(converterParaEcharts);
                
				const select = document.getElementById('selectSetor');
		        select.innerHTML = '<option value="">Selecione um Setor</option>'; // Limpa o select

		        // Usamos o reduce para pegar TODOS os setores da árvore que são <= 77
		        const setoresValidos = dadosCompletos;

		        // Agora basta percorrer a lista "achatada" e criar as options
		        setoresValidos.forEach(s => {
		            const opt = document.createElement('option');
		            opt.value = s.codSetor;
		            opt.textContent = s.name;
		            select.appendChild(opt);
		        });
		        // --- TRECHO COM REDUCE TERMINA AQUI ---
				console.log(setoresValidos);
		        aplicarTreeServ(setoresValidos.codSetor);
    		})
            .catch(err => console.error("Erro ao carregar:", err));
    }

    carregarTreeServ();
});