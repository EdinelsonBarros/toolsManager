package com.gesfo.toolsManager.infra;

import org.springframework.jdbc.datasource.DelegatingDataSource;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class OracleSessionDataSource extends DelegatingDataSource{
	private final int empresa;
    private final String usuario;
    private final String dbuser;
    private final String dbpass;
   

    public OracleSessionDataSource(DataSource targetDataSource, String dbuser, String dbpass) {
        super(targetDataSource);
		this.empresa = 0;
		this.usuario = "";
        this.dbuser = dbuser;
        this.dbpass = dbpass;
    }

    @Override
    public Connection getConnection() throws SQLException {
        Connection connection = super.getConnection();
        initSession(connection);
        return connection;
    }

    @Override
    public Connection getConnection(String dbuser, String dbpass) throws SQLException {
        Connection connection = super.getConnection(dbuser, dbpass);
        initSession(connection);
        return connection;
    }

    private void initSession(Connection connection) throws SQLException {
    	 try (Statement stmt = connection.createStatement()) {
    	        stmt.execute(" BEGIN FLAG_PACK.SET_EMPRESA(%d); FLAG_PACK.SET_USUARIO('%s'); END; ".formatted(empresa, usuario));
    	    }
    }
}
