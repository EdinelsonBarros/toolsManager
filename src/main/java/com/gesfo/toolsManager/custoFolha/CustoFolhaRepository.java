package com.gesfo.toolsManager.custoFolha;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CustoFolhaRepository {
	private final JdbcTemplate dev1JdbcTemplate;
	
	public CustoFolhaRepository(
			@Qualifier("dev1JdbcTemplate") JdbcTemplate dev1JdbcTemplate) {
		this.dev1JdbcTemplate = dev1JdbcTemplate;
	}
	
	public BigDecimal buscarCustoProventos() {
		String sql = "SELECT NVL(SUM(VALOR), 0) FROM FICHAS_RUBRICAS WHERE RUBRICA = 9995 AND FICHA IN (SELECT FICHA FROM FITABANCO WHERE MES_ANO = TRUNC(SYSDATE, 'MM') AND NUMERO = 1)";
		try {
	        // queryForObject(String sql, Class<T> requiredType)
	        return dev1JdbcTemplate.queryForObject(sql, BigDecimal.class);
	    } catch (EmptyResultDataAccessException e) {
	        return BigDecimal.ZERO; // Caso não encontre registros
	    }
	}
	
	
	
	public Map<String, Object> buscarIndicadoresEstado() {
	    String sql = ""
	            + " SELECT "
	            + "    NVL(SUM(CASE WHEN FR.RUBRICA = 9995 AND FR.VALOR > 0 THEN FR.VALOR END), 0) AS SALARIOS, "
	            + "    NVL(SUM(CASE WHEN FR.RUBRICA = 8701 AND FR.VALOR > 0 THEN FR.VALOR END), 0) AS INSS_PATRONAL, "
	            + "    NVL(SUM(CASE WHEN FR.RUBRICA = 1319 AND FR.DESC_VANT = 1 THEN ABS(FR.VALOR) END), 0) AS ALIMENTACAO, "
	            + "    NVL(SUM(CASE WHEN FR.RUBRICA = 7334 AND FR.VALOR > 0 THEN ABS(FR.VALOR) END), 0) AS PLANO_SAUDE_PATRONAL, "
	            + "    NVL(SUM(CASE WHEN FR.RUBRICA = 1311 AND FR.DESC_VANT = 1 THEN ABS(FR.VALOR) END), 0) AS ADICIONAL_CARGO_CHEFIA, "
	            + "    NVL(SUM(CASE WHEN FR.RUBRICA = 1063 AND FR.DESC_VANT = 1 THEN ABS(FR.VALOR) END), 0) AS FUNCAO_CONFIANCA "
	            + " FROM FICHAS_RUBRICAS FR "
	            + " WHERE FR.FICHA IN ( "
	            + "    SELECT FICHA FROM FITABANCO "
	            + "    WHERE MES_ANO = TO_DATE('01/03/2026', 'DD/MM/YYYY') "
	            + "      AND NUMERO = 1 "
	            + " ) ";

	    // queryForMap é perfeito quando você sabe que o SQL retorna exatamente 1 linha com várias colunas
	    return dev1JdbcTemplate.queryForMap(sql);
	}
	

}
