package com.gesfo.toolsManager.organogramaServidores;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServidorDTO {
    private String numfunc;
    private String nome;
    private String nomeCargo;
    private String tipoCargo;
    private String codSetor;
    private Double hierarquiaNum;
	public String getNumfunc() {
		return numfunc;
	}
	public void setNumfunc(String numfunc) {
		this.numfunc = numfunc;
	}
	public String getNome() {
		return nome;
	}
	public void setNome(String nome) {
		this.nome = nome;
	}
	public String getNomeCargo() {
		return nomeCargo;
	}
	public void setNomeCargo(String nomeCargo) {
		this.nomeCargo = nomeCargo;
	}
	public String getTipoCargo() {
		return tipoCargo;
	}
	public void setTipoCargo(String tipoCargo) {
		this.tipoCargo = tipoCargo;
	}
	public String getCodSetor() {
		return codSetor;
	}
	public void setCodSetor(String codSetor) {
		this.codSetor = codSetor;
	}
	public Double getHierarquiaNum() {
		return hierarquiaNum;
	}
	public void setHierarquiaNum(Double hierarquiaNum) {
		this.hierarquiaNum = hierarquiaNum;
	}
    
    
}
