package com.gesfo.toolsManager.organogramaServidores;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class OrganogramaRepository {
	private final JdbcTemplate producaoJdbcTemplate;

    public OrganogramaRepository(
            @Qualifier("producaoJdbcTemplate") JdbcTemplate producaoJdbcTemplate) {
        this.producaoJdbcTemplate = producaoJdbcTemplate;
    }

    public List<Map<String, Object>> buscarSetores() {
        String sql = "SELECT SETOR, NOMESETOR, PAISETOR, HIERARQUIA_SETORES, HIERARQUIA_NUM FROM GTO_VWM_ORGANOGRAMA_SETORES ORDER BY HIERARQUIA_NUM";
        return producaoJdbcTemplate.queryForList(sql);
    }

    public List<Map<String, Object>> buscarServidoresPorSetor(String codSetor) {
        String sql = "SELECT NUMFUNC, NOME, NOME_CARGO_FUNCAO, TIPO_CARGO, SETOR, HIERARQUIA_NUM FROM GTO_VWM_ORGANOGRAMA_SERVIDORES WHERE SETOR = ? ORDER BY HIERARQUIA_SERVIDORES";
        return producaoJdbcTemplate.queryForList(sql, codSetor);
    }
}
