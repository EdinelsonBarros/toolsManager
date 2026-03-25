package com.gesfo.toolsManager.infra;

import org.springframework.jdbc.datasource.DelegatingDataSource;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class OracleSessionDataSource extends DelegatingDataSource{
	private final int empresa;
    private final String usuario;

    public OracleSessionDataSource(DataSource targetDataSource, int empresa, String usuario) {
        super(targetDataSource);
        this.empresa = empresa;
        this.usuario = usuario;
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection connection = super.getConnection();
        initSession(connection);
        return connection;
    }

    @Override
    public Connection getConnection(String username, String password) throws SQLException {
        Connection connection = super.getConnection(username, password);
        initSession(connection);
        return connection;
    }

    private void initSession(Connection connection) throws SQLException {
    	 try (Statement stmt = connection.createStatement()) {
    	        stmt.execute(" BEGIN FLAG_PACK.SET_EMPRESA(%d); FLAG_PACK.SET_USUARIO('%s'); END; ".formatted(empresa, usuario));
    	    }
    }
}
