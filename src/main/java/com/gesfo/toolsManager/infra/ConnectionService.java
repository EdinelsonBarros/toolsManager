package com.gesfo.toolsManager.infra;



import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ConnectionService {
    private final JdbcTemplate producaoJdbcTemplate;
    private final JdbcTemplate dipagJdbcTemplate;
    private final JdbcTemplate dev1JdbcTemplate;
   

    public ConnectionService(
            @Qualifier("producaoJdbcTemplate") JdbcTemplate producaoJdbcTemplate,
            @Qualifier("dipagJdbcTemplate")    JdbcTemplate dipagJdbcTemplate,
            @Qualifier("dev1JdbcTemplate")     JdbcTemplate dev1JdbcTemplate) {
        this.producaoJdbcTemplate = producaoJdbcTemplate;
        this.dipagJdbcTemplate    = dipagJdbcTemplate;
        this.dev1JdbcTemplate     = dev1JdbcTemplate;
        
    }

    public List<Map<String, Object>> buscaNome() {
        String sql = " SELECT nome FROM FUNCIONARIOS F   WHERE F.NUMERO = 12014389 ";

        return producaoJdbcTemplate.queryForList(sql);
    }
    
    public List<Map<String, Object>> buscaOrganograma() {
    	String sql = " SELECT * FROM GTO_VWM_ORGANOGRAMA_SERVIDORES";
    	
    	return producaoJdbcTemplate.queryForList(sql);
    }
}