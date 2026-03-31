let ultimosDadosValidos = null; 

window.addEventListener('load', function () {
    var chartDom = document.getElementById('treemapConteiner');
    var myChart = echarts.init(chartDom);
	
	myChart.on('click', function(params) {
	    if (!params.data) return;
	    
	    const filhos = params.data.children;
	    
	    // Se é nó folha, restaura o último estado válido
	    if (!filhos || filhos.length === 0) {
	        if (ultimosDadosValidos) {
	            myChart.setOption({ series: [{ data: ultimosDadosValidos }] });
	        }
	    }
	});

	function somarRecursivo(no) {
		    if (!no.children || no.children.length === 0) {
		        return no.value;
		    }
		    const somaFilhos = no.children.reduce((acc, filho) => acc + somarRecursivo(filho), 0);
		    no.value = no.value + somaFilhos;
		    return no.value;
		}
	
    function converterParaEcharts(setor) {
        return {
            name: setor.setor,
            value: setor.quantidadeServ || 0,
            codSetor: setor.setor,
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

    let dadosCompletos = [];

    function carregarTreemap(filtrarCod = null) {
        if (dadosCompletos.length > 0) {
            aplicarTreemap(filtrarCod);
            return;
        }

        fetch('/api/organograma/treemap')
            .then(r => r.json())
            .then(setores => {
                dadosCompletos = setores.map(converterParaEcharts);
				dadosCompletos.forEach(somarRecursivo);
                aplicarTreemap(filtrarCod);
            })
            .catch(() => console.error('Erro ao carregar treemap'));
    }

    function aplicarTreemap(filtrarCod) {
        let data = dadosCompletos;

        if (filtrarCod) {
            const encontrado = encontrarSetor(dadosCompletos, filtrarCod);
            if (encontrado && encontrado.value > 0) 
				data = [encontrado];
        }
		
		// se data estiver vazio, não aplica
		if (!data || data.length === 0) {
		        if (ultimosDadosValidos) {
		            myChart.setOption({ series: [{ data: ultimosDadosValidos }] });
		        }
		        return;
		    }
			
			ultimosDadosValidos = data;

        myChart.setOption({
			color: undefined,
            series: [{
			    type: 'treemap',
			    roam: false,
				width: '100%',   // ← adicione
			   	height: '100%',  // ← adicione
			   	top: 0,          // ← remove margem do topo
			   	left: 0,         // ← remove margem da esquerda
			   	right: 0,        // ← remove margem da direita
			   	bottom: 0,       // ← remove margem de baixo
			    data: data,
				// ← Paleta de azuis/roxos harmoniosos com seu tema
				       colorMappingBy: 'value',
				       levels: [
				           {
				               colorSaturation: [0.4, 0.7],
				               itemStyle: {
				                   borderWidth: 3,
				                   borderColor: '#fff',
				                   gapWidth: 3
				               }
				           },
				           {
				               colorSaturation: [0.3, 0.6],
				               itemStyle: {
				                   borderWidth: 2,
				                   borderColor: '#fff',
				                   gapWidth: 2
				               }
				           },
				           {
				               colorSaturation: [0.2, 0.5],
				               itemStyle: {
				                   borderWidth: 1,
				                   borderColor: '#fff',
				                   gapWidth: 1
				               }
				           }
				       ],

				       // Cor base — azul do seu tema (#2B2E9E)
				       color: ['#2B2E9E', '#4A4DD6', '#7a7dea', '#C16221', '#DC8E32'],

				       // ← Filtra nós com 0 servidores para não aparecer branco
				       visibleMin: 0, // constrola o valor mini que o retangulo tem que ter para aparecer
					   squareRatio: 0.5, // ← favorece retângulos mais alongados, ajuda nós pequenos
					   leafDepth: 2, // define a profundidade a primeira exibição aparece

				       label: {
				           show: true,
				           formatter: '{b}\n{c} servidores',
				           color: '#fff'
				       },
				       upperLabel: {
				           show: true,
				           height: 30,
				           color: '#fff'
				       }
				   }]
        });
        //myChart.resize();
    }

    carregarTreemap();

    window.addEventListener('setorAtivo', function (e) {
        carregarTreemap(e.detail);
    });

}); // ← fecha o load