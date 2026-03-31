package com.gesfo.toolsManager.organogramaServidores;

import java.util.LinkedHashMap;
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
    
    public List<Map<String, Object>> buscarServidoresPorTermo(String termo) {
        String sql = """
                SELECT * FROM (
                SELECT NUMFUNC, NOME, NOME_CARGO_FUNCAO, TIPO_CARGO, SETOR, NOMESETOR
        			FROM GTO_VWM_ORGANOGRAMA_SERVIDORES
        		WHERE (UPPER(NOME) LIKE UPPER(?) OR NUMFUNC LIKE ?)
        		ORDER BY HIERARQUIA_SERVIDORES ASC
        		) WHERE ROWNUM <= 20
                """;
        String param = "%" + termo + "%";
        return producaoJdbcTemplate.queryForList(sql, param, param);
    }
    
    
    public Long buscarQuantServEstado() {
    	String sql = "SELECT COUNT(1) AS SERVIDORES_ESTADO FROM GTO_VW_ORGANOGRAMA_SERVIDORES";
    	
    	return producaoJdbcTemplate.queryForObject(sql, Long.class);
    }
    
    public List<Map<String, Object>> buscarQuantServSetor() {
    	String sql = " SELECT "
    			+ "        SETOR, "
    			+ "        COUNT(1) QUANTIDADE "
    			+ " FROM GTO_VW_ORGANOGRAMA_SERVIDORES "
    			+ " GROUP BY SETOR";
    	
    	return producaoJdbcTemplate.queryForList(sql);
    }
    
    public Map<String, Integer> buscarQuantidadePorSetor() {
        String sql = "SELECT SETOR, COUNT(1) QUANTIDADE " +
                     "FROM GTO_VWM_ORGANOGRAMA_SERVIDORES " +
                     "GROUP BY SETOR";

        Map<String, Integer> mapa = new LinkedHashMap<>();
        List<Map<String, Object>> rows = producaoJdbcTemplate.queryForList(sql);
        for (Map<String, Object> row : rows) {
            String setor = str(row, "SETOR");
            int qtd = ((Number) row.get("QUANTIDADE")).intValue();
            mapa.put(setor, qtd);
        }
        return mapa;
    }
    
    private String str(Map<String, Object> row, String col) {
        Object val = row.get(col);
        return val != null ? val.toString().trim() : "";
    }
}
