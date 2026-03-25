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
	 // ── PRODUÇÃO ──────────────────────────────────────────────
    @Bean(name = "producaoDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.producao")
    public DataSource producaoDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "producaoJdbcTemplate")
    public JdbcTemplate producaoJdbcTemplate(
            @Qualifier("producaoDataSource") DataSource ds) {
        return new JdbcTemplate(ds);
    }

    // ── DIPAG ─────────────────────────────────────────────────
    @Bean(name = "dipagDataSource")
    @ConfigurationProperties(prefix = "spring.datasource.dipag")
    public DataSource dipagDataSource() {
        return DataSourceBuilder.create().build();
    }

    @Bean(name = "dipagJdbcTemplate")
    public JdbcTemplate dipagJdbcTemplate(
            @Qualifier("dipagDataSource") DataSource ds) {
        return new JdbcTemplate(ds);
    }

    // ── DEV1 ──────────────────────────────────────────────────
    // Injete usuário e empresa do application.properties
    @Value("${oracle.session.empresa}")
    private int empresa;

    @Value("${oracle.session.usuario}")
    private String usuario;

    @Bean(name = "dev1DataSource")
    @ConfigurationProperties(prefix = "spring.datasource.dev1")
    public DataSource dev1DataSourceBase() {
        //return DataSourceBuilder.create().build();
    	
    	DataSource ds = DataSourceBuilder.create().build();
        
        // Log temporário para debug
        HikariDataSource hikari = (HikariDataSource) ds;
        System.out.println(">>> USUARIO: " + hikari.getUsername());
        System.out.println(">>> URL: " + hikari.getJdbcUrl());
        
        return ds;
    }

    // Sobrescreve o DataSource com o wrapper
    @Bean(name = "dev1DataSourceWrapped")
    public DataSource dev1DataSourceWrapped(
            @Qualifier("dev1DataSource") DataSource base) {
        return new OracleSessionDataSource(base, empresa, usuario);
    }

    @Bean(name = "dev1JdbcTemplate")
    public JdbcTemplate dev1JdbcTemplate(
            @Qualifier("dev1DataSourceWrapped") DataSource ds) {
        return new JdbcTemplate(ds);
    }

}
