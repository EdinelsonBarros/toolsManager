const chartDom = document.getElementById('treeServ');
const myChart = echarts.init(chartDom, null, {
    width: 8000,   // canvas interno grande — transborda
    height: 1000
});


// ─── Estado global ─────────────────────────────────────────────────────────

window.addEventListener('load', function() {

    // ─── Referências DOM ───────────────────────────────────────────────────────

    const selectSetor = document.getElementById('selectSetor');
    const btnVoltar = document.getElementById('btnVoltar');




    let ultimoClique = { cod: null, tempo: 0 };
    const DUPLO_CLICK_MS = 350;

});

function calcularLarguraMaxima(node) {
    let contagemPorNivel = {};

    function percorrer(n, nivel) {
        if (!n) return;
        contagemPorNivel[nivel] = (contagemPorNivel[nivel] || 0) + 1;
        if (n.children) {
            n.children.forEach(filho => percorrer(filho, nivel + 1));
        }
    }

    percorrer(node, 0);
    // Retorna o maior valor encontrado em qualquer nível
    return Math.max(...Object.values(contagemPorNivel));
}


export async function montarArvore(servidor) {
    //console.log(servidor);
    const s = await fetch(`/api/organograma/noarvore?servidor=${encodeURIComponent(servidor)}`);
    if (!s.ok) throw new Error(`Erro ao buscar arvore do servidor ${servidor}`);
    const dados = await s.json();


    const dataMapeada = mapearECharts(dados[0]);

    const larguraMaxima = calcularLarguraMaxima(dataMapeada);
    const novaLargura = Math.max(window.innerWidth, larguraMaxima * 180);

    console.log("Largura Máxima (nós):", larguraMaxima);
    console.log("Largura Calculada (px):", novaLargura);


    // 3. REDIMENSIONE O CANVAS ANTES DE RENDERIZAR
    myChart.resize({
        width: novaLargura,
        height: 1000 // ou calcule a altura baseado na profundidade da árvore
    });

    renderizarServidores(mapearECharts(dados[0]));
}

function mapearECharts(node) {
    return {
        ...node,
        name: node.nome, // ECharts exige "name"
        nomeCargo: node.nomeCargo,
        children: (node.children || []).map(filho => mapearECharts(filho))
    };
}
/*private String numfunc;
    private String nome;
    private String nomeCargo;
    private String tipoCargo;
    private String codSetor;
    private String setoresPai;
    private String paiSetor;
    private Double hierarquiaNum;*/






// arvore funcional
// acrescentar outros dados na label

function renderizarServidores(data) {
    //console.log(servidor);
    myChart.clear()
    myChart.setOption({
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(17,24,39,0.92)',
            borderColor: '#374151',
            textStyle: { color: '#f9fafb', fontSize: 12 },
            formatter: p => {
                const d = p.data;
                if (!d.isServidor) {
                    return `<b style="color:#fbbf24">${d.name}</b><br>
                            <span style="color:#9ca3af">${d.nomeCargo || ''}</span><br>
                            <span style="color:#6366f1">Nº ${d.numfunc || ''}</span>`;
                }
                return `<b>${d.name}</b>`;
            }
        },
        series: [{
            type: 'tree',
            data: [data],
            orient: 'vertical',
            layout: 'orthogonal',
            edgeShape: 'polyline',
            top: 20,
            left: 20,
            bottom: 20,
            right: 20,
            //zoom: 0.8, 
            layerPadding: 120,
            roam: true,
            symbol: 'roundRect',
            symbolSize: [140, 80],
            initialTreeDepth: 1,   // expande tudo
            expandAndCollapse: false,
            animationDuration: 400,
            itemStyle: {

                color: '#fff',
                borderColor: '#334155',
                borderWidth: 1.5,
                borderRadius: [50, 10, 0, 0]
            },
            label: {
                color: '#1e3a5f',
                fontSize: 10,
                minMargin: 10,
				borderRadius: [10, 10, 0, 0],
                formatter: p => {
                    const n = p.data.name || '';
                    const partes = n.trim().split(' ').filter(p => p.length > 0);
                    const curto = partes.length <= 1 ? n : `${partes[0]} ${partes[partes.length - 1]}`;
                    return curto.length > 20 ? curto.substring(0, 18) + '…' : curto;
                }
            },
            lineStyle: { width: 1.5, color: '#334155' },
            leaves: {
                label: {
                    position: 'inside',
                    color: '#1e3a5f',
                    borderWidth: 1,
                    fontSize: 10,
                    minMargin: 10,
					borderRadius: [10, 10, 0, 0],
                    formatter: p => {
						const n = p.data.name || '';
						const cargo = p.data.nomeCargo || '';
						const partes = n.trim().split(' ').filter(x => x.length > 0);
						const curto = partes.length <= 1 ? n : `${partes[0]} ${partes[partes.length - 1]}`;
						const nomeFormatado = curto.length > 20 ? curto.substring(0, 18) + '…' : curto;
						const cargoFormatado = cargo.length > 18 ? cargo.substring(0, 16) + '…' : cargo;

						return `${nomeFormatado}}\n${cargoFormatado}`;
                    },
                }
            }
        }]
    }, true);
}

