package com.gesfo.toolsManager.infra;



import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class ConnectionService {

    private final JdbcTemplate oracleJdbcTemplate;
   

    public ConnectionService(
            @Qualifier("oracleJdbcTemplate")     JdbcTemplate oracleJdbcTemplate) {

        this.oracleJdbcTemplate = oracleJdbcTemplate;
        
    }

 
    
    public List<Map<String, Object>> buscaOrganograma() {
    	String sql = " SELECT * FROM GTO_VWM_ORGANOGRAMA_SERVIDORES";
    	
    	return oracleJdbcTemplate.queryForList(sql);
    }
}