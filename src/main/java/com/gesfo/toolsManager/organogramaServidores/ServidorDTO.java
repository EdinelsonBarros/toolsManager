package com.gesfo.toolsManager.organogramaServidores;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

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
    private String setoresPai;
    private String paiSetor;
    private Double hierarquiaNum;
    
    @JsonProperty("children")
    private List<ServidorDTO> children = new ArrayList<>();
    private String nomeSetor;
    
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
	public String getNomeSetor() {
		return nomeSetor;
	}
	public void setNomeSetor(String nomeSetor) {
		this.nomeSetor = nomeSetor;
	}
	public String getPaiSetor() {
		return paiSetor;
	}
	public void setPaiSetor(String paiSetor) {
		this.paiSetor = paiSetor;
	}
	public String getSetoresPai() {
		return setoresPai;
	}
	public void setSetoresPai(String setoresPai) {
		this.setoresPai = setoresPai;
	}
	public List<ServidorDTO> getChildren() {
		return children;
	}
	public void setChildren(ServidorDTO children) {
		this.children.add(children);
	}
	
	
    
	
    
}
