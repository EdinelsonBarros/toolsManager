package com.gesfo.toolsManager.organogramaServidores;

import java.util.ArrayList;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SetorDTO {
	private String setor;
    private String nomeSetor;
    private String paiSetor;
    private String hierarquia_setores;
    private String hierarquia_num;
    private List<SetorDTO> filhos = new ArrayList<>();
	public String getSetor() {
		return setor;
	}
	public void setSetor(String setor) {
		this.setor = setor;
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
	public String getHierarquia_setores() {
		return hierarquia_setores;
	}
	public void setHierarquia_setores(String hierarquia_setores) {
		this.hierarquia_setores = hierarquia_setores;
	}
	public String getHierarquia_num() {
		return hierarquia_num;
	}
	public void setHierarquia_num(String hierarquia_num) {
		this.hierarquia_num = hierarquia_num;
	}
	public List<SetorDTO> getFilhos() {
		return filhos;
	}
	public void setFilhos(List<SetorDTO> filhos) {
		this.filhos = filhos;
	}
	
	
	
	
    
    
}
