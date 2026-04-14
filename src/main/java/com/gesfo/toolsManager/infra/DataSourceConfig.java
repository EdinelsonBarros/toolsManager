package com.gesfo.toolsManager.infra;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class DataSourceConfig {



    // ── Oracle ──────────────────────────────────────────────────
    // Injete usuário e empresa do application.properties
    @Value("${app.session.empresa}")
    private int empresa;

    @Value("${app.session.usuario}")
    private String usuario;
    
    @Value("${spring.datasource.oracle.password}")
    private String dbpass;
    
    @Value("${spring.datasource.oracle.username}")
    private String dbuser;

    @Bean(name = "oracleDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.oracle")
    public DataSource oracleDataSourceBase() {
        //return DataSourceBuilder.create().build();
    	
    	DataSource ds = DataSourceBuilder.create().build();
        
        // Log temporário para debug
        HikariDataSource hikari = (HikariDataSource) ds;
        
        return ds;
    }

    // Sobrescreve o DataSource com o wrapper
    @Bean(name = "oracleDataSourceWrapped")
    public DataSource oracleDataSourceWrapped(
            @Qualifier("oracleDataSource") DataSource base) {
    	
        return new OracleSessionDataSource(base, dbuser, dbpass);
    }
    
    //(DataSource targetDataSource, int empresa, String usuario, String dbuser, String dbpass)

    @Bean(name = "oracleJdbcTemplate")
    public JdbcTemplate oracleJdbcTemplate(
            @Qualifier("oracleDataSourceWrapped") DataSource ds) {
        return new JdbcTemplate(ds);
    }

}
