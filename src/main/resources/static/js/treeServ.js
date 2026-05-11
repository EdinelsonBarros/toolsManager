/**
 * Organograma de Servidores – tree2.js
 * Stack: ECharts 5, Thymeleaf/Spring
 *
 * Comportamentos:
 *  - Carregamento: exibe árvore de setores
 *  - Clique simples: expande/colapsa o nó (máx 5 níveis visíveis, nó clicado vira raiz)
 *  - Duplo clique | select: chama /servidoresPaiSetor?setor=X (retorna todos os servidores
 *    do setor e de seus filhos em lista flat), monta hierarquia agrupada por setor,
 *    chefe do setor clicado (ou mais alto encontrado) vira raiz, substitui a árvore
 *  - Segundo duplo clique no mesmo nó: volta à árvore de setores
 *  - Botão "Voltar": restaura a árvore de setores
 *  - Cache de servidores por codSetor (chave = codSetor passado ao endpoint)
 */
window.addEventListener('load', function() {

    // ─── Referências DOM ───────────────────────────────────────────────────────
    const chartDom = document.getElementById('treeServ');
    const selectSetor = document.getElementById('selectSetor');
    const btnVoltar = document.getElementById('btnVoltar');

    // ─── Estado global ─────────────────────────────────────────────────────────
    const myChart = echarts.init(chartDom);
    const servidoresCache = {};          // codSetor → [ServidorDTO]
    let dadosSetores = [];          // árvore completa de setores (formato ECharts)
    let modoAtual = 'setores';   // 'setores' | 'servidores'
    let setorServidoresAtivo = null;   // codSetor que está exibindo servidores

    // ─── Utilitários ───────────────────────────────────────────────────────────

    /** Converte a lista flat retornada pelo backend (pai/filho via paiSetor) numa árvore. */
    function flatParaArvore(lista) {
        const mapa = {};
        lista.forEach(s => {
            mapa[s.setor] = {
                name: s.nomeSetor || s.setor,
                codSetor: s.setor,
                paiSetor: s.paiSetor,
                hierarquiaNum: s.hierarquia_num,
                value: s.quantidadeServ || 0,
                isServidor: false,
                _aberto: false,
                children: []
            };
        });

        const raizes = [];
        lista.forEach(s => {
            const no = mapa[s.setor];
            if (s.paiSetor && mapa[s.paiSetor]) {
                mapa[s.paiSetor].children.push(no);
            } else {
                raizes.push(no);
            }
        });
        return raizes;
    }

    /** Busca um nó pelo codSetor (recursivo). */
    function encontrarNo(lista, cod) {
        for (const no of lista) {
            if (no.codSetor === cod) return no;
            const filho = encontrarNo(no.children || [], cod);
            if (filho) return filho;
        }
        return null;
    }

    /** Coleta todos os nós da árvore numa lista plana. */
    function coletarTodos(lista, acc = []) {
        lista.forEach(no => { acc.push(no); coletarTodos(no.children || [], acc); });
        return acc;
    }

    /** Retorna os ancestrais de um nó (do mais próximo ao mais distante). */
    function caminhoAte(lista, cod, caminho = []) {
        for (const no of lista) {
            if (no.codSetor === cod) return [...caminho, no];
            const res = caminhoAte(no.children || [], cod, [...caminho, no]);
            if (res) return res;
        }
        return null;
    }

    // ─── Montagem da árvore de servidores ──────────────────────────────────────

    function formatarNoServidor(srv) {
        return {
            name: srv.nome,
            isServidor: true,
            numfunc: srv.numfunc,
            nomeCargo: srv.nomeCargo,
            tipoCargo: srv.tipoCargo,
            value: 1,
            //symbol: srv.tipoCargo === 'CHEFIA' ? 'diamond' : 'circle',
            //symbolSize: srv.tipoCargo === 'CHEFIA' ? 18 : 11,
            itemStyle: {
                color: srv.tipoCargo === 'CHEFIA' ? '#f59e0b' : '#6366f1',
                borderColor: '#fff',
                borderWidth: 2
            },
            children: []
        };
    }

    /**
     * Recebe a lista flat de servidores retornada por /servidoresPaiSetor
     * (todos os servidores do setor clicado e de seus sub-setores).
     *
     * Estratégia:
     *  1. Agrupa servidores por codSetor.
     *  2. Para cada grupo cria um nó-setor com label do dadosSetores (já em memória).
     *  3. Dentro de cada nó-setor: chefe (CHEFIA) vira pai dos subordinados.
     *  4. Monta a hierarquia dos nós-setor usando paiSetor dos próprios servidores,
     *     respeitando a mesma lógica da árvore de setores.
     *  5. O nó-setor do codSetor clicado (ou o de menor hierarquiaNum) vira raiz.
     */
    function montarArvoreServidores(servidores, codSetorRaiz) {
        // ── 1. Agrupa por codSetor ────────────────────────────────────────────
        const grupos = {};   // codSetor → { codSetor, paiSetor, hierarquiaNum, servidores[] }
        servidores.forEach(srv => {
            if (!grupos[srv.codSetor]) {
                grupos[srv.codSetor] = {
                    codSetor: srv.codSetor,
                    paiSetor: srv.paiSetor,
                    hierarquiaNum: srv.hierarquiaNum || 9999,
                    servidores: []
                };
            }
            grupos[srv.codSetor].servidores.push(srv);
        });

        // ── 2. Cria nós-setor ─────────────────────────────────────────────────
        const nosSetor = {};   // codSetor → nó ECharts
        Object.values(grupos).forEach(g => {
            // Tenta pegar nome do setor a partir da árvore já carregada
            const noSetorRef = encontrarNo(dadosSetores, g.codSetor);
            const nomeSetor = noSetorRef ? noSetorRef.name : g.codSetor;

            // ── 3. Hierarquia interna: chefe → subordinados ───────────────────
            const chefe = g.servidores.find(s => s.tipoCargo === 'CHEFIA');
            const subs = g.servidores.filter(s => s.tipoCargo !== 'CHEFIA');
            const noSubs = subs.map(formatarNoServidor);


            let noChefe = null;
            if (chefe) {
                noChefe = formatarNoServidor(chefe);
                noChefe.children = noSubs;
            }

            nosSetor[g.codSetor] = {
                name: nomeSetor,
                codSetor: g.codSetor,
                paiSetor: g.paiSetor,
                hierarquiaNum: g.hierarquiaNum,
                isServidor: false,
                value: g.servidores.length,
                // Se tiver chefe: [noChefe]; senão lista todos direto
                children: noChefe ? [noChefe] : noSubs
            };
        });

        // ── 4. Vincula nós-setor pela hierarquia (paiSetor) ───────────────────
        const raizes = [];
        Object.values(nosSetor).forEach(no => {
            // Pai está dentro do conjunto retornado?
            if (no.paiSetor && nosSetor[no.paiSetor]) {
                nosSetor[no.paiSetor].children.push(no);
            } else {
                // Pai não veio na lista → este é raiz local
                raizes.push(no);
            }
        });

        // ── 5. Escolhe raiz ───────────────────────────────────────────────────
        // Prefere o próprio setor clicado; senão o de menor hierarquiaNum
        if (nosSetor[codSetorRaiz]) {
            return nosSetor[codSetorRaiz];
        }
        if (raizes.length === 1) {
            return raizes[0];
        }
        if (raizes.length > 1) {
            // Múltiplas raízes: cria nó-envelope usando o setor clicado como label
            const noRef = encontrarNo(dadosSetores, codSetorRaiz);
            return {
                name: noRef ? noRef.name : codSetorRaiz,
                codSetor: codSetorRaiz,
                isServidor: false,
                value: servidores.length,
                children: raizes



            };
        }
        // Lista vazia: nó vazio informativo
        return {
            name: 'Nenhum servidor encontrado',
            isServidor: false,
            value: 0,
            children: []
        };
    }

    // ─── Busca com cache ───────────────────────────────────────────────────────

    /**
     * Chama /servidoresPaiSetor?setor=X — retorna todos os servidores do setor
     * e de seus filhos (o backend faz LIKE '%X%' na coluna SETOR).
     * Cache keyed pelo codSetor para evitar requisições repetidas.
     */
    async function buscarServidoresPaiSetor(codSetor) {
        if (servidoresCache[codSetor]) return servidoresCache[codSetor];
        const r = await fetch(`/api/organograma/servidoresPaiSetor?setor=${encodeURIComponent(codSetor)}`);
        if (!r.ok) throw new Error(`Erro ao buscar servidores do setor ${codSetor}`);
        const dados = await r.json();
        servidoresCache[codSetor] = dados;
        return dados;
    }

    async function carregarEExibirServidores(codSetor) {
        mostrarLoader(true);
        try {
            const servidores = await buscarServidoresPaiSetor(codSetor);




            const raiz = montarArvoreServidores(servidores, codSetor);
            setorServidoresAtivo = codSetor;
            modoAtual = 'servidores';
            btnVoltar.classList.add('visivel');
            renderizarServidores(raiz);
        } catch (e) {
            console.error('Erro ao carregar servidores:', e);
        } finally {
            mostrarLoader(false);
        }
    }

    // ─── Renderização – Servidores ─────────────────────────────────────────────

    function renderizarServidores(raiz) {
        myChart.clear()
        myChart.setOption({
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(17,24,39,0.92)',
                borderColor: '#374151',
                textStyle: { color: '#f9fafb', fontSize: 12 },
                formatter: p => {
                    const d = p.data;
                    if (d.isServidor) {
                        return `<b style="color:#fbbf24">${d.name}</b><br>
                                <span style="color:#9ca3af">${d.nomeCargo || ''}</span><br>
                                <span style="color:#6366f1">Nº ${d.numfunc || ''}</span>`;
                    }
                    return `<b>${d.name}</b>`;
                }
            },
            series: [{
                type: 'tree',
                data: [raiz],
                orient: 'vertical',
                layout: 'orthogonal',
                edgeShape: 'polyline',
                nodeGap: 20,
                layerPadding: 100,
                roam: true,
                symbol: 'rect',
                symbolSize: [150, 46],
                initialTreeDepth: 1,   // expande tudo
                expandAndCollapse: false,
                animationDuration: 400,
                label: {
                    position: 'inside',
                    fontSize: 10,
                    color: '#fff',
                    formatter: p => {
                        const n = p.data.name || '';
                        if (p.data.isServidor) {
                            return n.length > 22 ? n.substring(0, 20) + '…' : n;
                        }
                        return n.length > 22 ? n.substring(0, 20) + '…' : n;
                    }
                },
                itemStyle: {
                    color: '#1e3a5f',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    borderRadius: 4
                },
                lineStyle: { width: 1.5, color: '#334155' },
                leaves: {
                    label: { position: 'inside', color: '#fff', fontSize: 14 }
                }
            }]
        }, true);
    }

    // ─── Renderização – Setores ────────────────────────────────────────────────

    /**
     * Recorta a subárvore a partir de um nó, limitando a profundidade.
     * Faz uma cópia rasa para não alterar dadosSetores.
     */
    function recortarArvore(no, profMax, profAtual = 0) {
		return {
		       ...no,
		       children: profAtual >= 1,
		           
		           children: (no.children || []).map(f => recortarArvore(f, profMax, profAtual + 1))
		   };
    }

    function renderizarSetores(noRaiz) {
        const data = noRaiz ? recortarArvore(noRaiz, 3) : recortarArvore(dadosSetores[0], 1);
        myChart.clear()
        myChart.setOption({
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(17,24,39,0.92)',
                borderColor: '#374151',
                textStyle: { color: '#f9fafb', fontSize: 12 },
                formatter: p => `<b>${p.data.name}</b><br>
                                 <span style="color:#9ca3af">Servidores: ${p.data.value || 0}</span>`
            },
            series: [{
                type: 'tree',
                data: [data],
                orient: 'vertical',
                layout: 'orthogonal',
                edgeShape: 'polyline',
                roam: true,
                symbol: 'rect',
                symbolSize: [145, 44],
                nodeGap: 20,
                layerPadding: 100,
                initialTreeDepth: 1,
                expandAndCollapse: false,
                animationDuration: 400,
                label: {
                    position: 'inside',
                    fontSize: 10,
                    color: '#fff',
                    formatter: p => {
                        const n = p.data.name || '';
                        return n.length > 22 ? n.substring(0, 20) + '…' : n;
                    }
                },
                itemStyle: {
                    color: '#0f172a',
                    borderColor: '#3b82f6',
                    borderWidth: 1,
                    borderRadius: 4
                },
                lineStyle: { width: 1.5, color: '#334155' },
                leaves: {
                    label: {
                        position: 'inside',
                        fontSize: 10,
                        color: '#fff',
                        formatter: p => {
                            const n = p.data.name || '';
                            return n.length > 22 ? n.substring(0, 20) + '…' : n;
                        }
                    }
                }
            }]
        }, true);
    }

    // ─── Controle de cliques ───────────────────────────────────────────────────

    let ultimoClique = { cod: null, tempo: 0 };
    const DUPLO_CLICK_MS = 350;

    myChart.on('click', function(params) {
        if (!params.data) return;
        const d = params.data;

        // Cliques em nós de servidor não fazem nada especial
        if (d.isServidor) return;

        const agora = Date.now();
        const mesmoCod = d.codSetor === ultimoClique.cod;
        const dentroDuplo = (agora - ultimoClique.tempo) < DUPLO_CLICK_MS;

        if (mesmoCod && dentroDuplo) {
            // ── DUPLO CLIQUE ──────────────────────────────────────────────────
            ultimoClique = { cod: null, tempo: 0 };

            if (modoAtual === 'servidores' && setorServidoresAtivo === d.codSetor) {
                // Segundo duplo clique no mesmo setor → volta aos setores
                voltarParaSetores();
                return;
            }

            // Carrega servidores
            carregarEExibirServidores(d.codSetor);

        } else {
            // ── CLIQUE SIMPLES ────────────────────────────────────────────────
            ultimoClique = { cod: d.codSetor, tempo: agora };

            if (modoAtual !== 'setores') return;

            // Navega para o nó clicado como nova raiz (máx 5 níveis)
            const no = encontrarNo(dadosSetores, d.codSetor);
            if (no) renderizarSetores(no);
        }
    });

    // ─── Select ───────────────────────────────────────────────────────────────

    selectSetor.addEventListener('change', function() {
        const cod = this.value;
        


        carregarEExibirServidores(cod);
    });

    // ─── Botão Voltar ─────────────────────────────────────────────────────────

    btnVoltar.addEventListener('click', voltarParaSetores);

    function voltarParaSetores() {
        modoAtual = 'setores';
        setorServidoresAtivo = null;
        selectSetor.value = '';
        btnVoltar.classList.remove('visivel');
        renderizarSetores(dadosSetores[0]);
    }

    // ─── Loader ───────────────────────────────────────────────────────────────

    function mostrarLoader(show) {
        const el = document.getElementById('loader');
        if (el) el.style.display = show ? 'flex' : 'none';
    }

    // ─── Carga inicial ────────────────────────────────────────────────────────

    function popularSelect(nos) {
        selectSetor.innerHTML = '<option value="">-- Todos os setores --</option>';
        // Apenas primeiro nível
        nos.forEach(no => {
            const opt = document.createElement('option');
            opt.value = no.codSetor;
            opt.textContent = no.name;
            selectSetor.appendChild(opt);
        });
    }

    function carregarSetores() {
        mostrarLoader(true);
        fetch('/api/organograma/treemap')
            .then(r => r.json())
            .then(setores => {
                // Backend já retorna árvore com "filhos", mas o campo pode se chamar "filhos" ou "children"
                // Normalizamos para "children"
                dadosSetores = normalizarFilhos(setores);
                popularSelect(dadosSetores);
                //renderizarSetores(dadosSetores[0]);
            })
            .catch(err => console.error('Erro ao carregar setores:', err))
            .finally(() => mostrarLoader(false));
    }

    /** O backend usa "filhos"; ECharts espera "children". Converte recursivamente. */
    function normalizarFilhos(lista) {
        return lista.map(s => {
            const no = {
                name: s.nomeSetor || s.setor,
                codSetor: s.setor,
                paiSetor: s.paiSetor,
                hierarquiaNum: s.hierarquia_num,
                value: s.quantidadeServ || 0,
                isServidor: false,
                children: normalizarFilhos(s.filhos || s.children || [])
            };
            return no;
        });
    }

    // ─── Responsividade ───────────────────────────────────────────────────────
    window.addEventListener('resize', () => myChart.resize());

    carregarSetores();
});
