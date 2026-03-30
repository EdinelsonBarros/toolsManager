package com.gesfo.toolsManager.custoFolha;

import java.math.BigDecimal;

public class CustoFolhaDTO {
	private BigDecimal custoProventos;
	private BigDecimal inss_patronal;
	private BigDecimal vale_alimentacao;
	private BigDecimal plano_saude_patronal;
	private BigDecimal adicional_cargo_chefia;
	private BigDecimal funcao_confianca;

	public BigDecimal getInss_patronal() {
		return inss_patronal;
	}

	public void setInss_patronal(BigDecimal inss_patronal) {
		this.inss_patronal = inss_patronal;
	}

	public BigDecimal getVale_alimentacao() {
		return vale_alimentacao;
	}

	public void setVale_alimentacao(BigDecimal vale_alimentacao) {
		this.vale_alimentacao = vale_alimentacao;
	}

	public BigDecimal getPlano_saude_patronal() {
		return plano_saude_patronal;
	}

	public void setPlano_saude_patronal(BigDecimal plano_saude_patronal) {
		this.plano_saude_patronal = plano_saude_patronal;
	}

	public BigDecimal getAdicional_cargo_chefia() {
		return adicional_cargo_chefia;
	}

	public void setAdicional_cargo_chefia(BigDecimal adicional_cargo_chefia) {
		this.adicional_cargo_chefia = adicional_cargo_chefia;
	}

	public BigDecimal getFuncao_confianca() {
		return funcao_confianca;
	}

	public void setFuncao_confianca(BigDecimal funcao_confianca) {
		this.funcao_confianca = funcao_confianca;
	}

	public BigDecimal getCustoProventos() {
		return custoProventos;
	}

	public void setCustoProventos(BigDecimal custoProventos) {
		this.custoProventos = custoProventos;
	}
	
	

}
