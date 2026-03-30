package com.gesfo.toolsManager.custoFolha;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gesfo.toolsManager.organogramaServidores.ServidorDTO;

@Service
public class CustoFolhaService {
	private final CustoFolhaRepository repository;

	public CustoFolhaService(CustoFolhaRepository repository) {
		this.repository = repository;
	}
	
	public BigDecimal buscarTotalProventos() {
		BigDecimal totalProventos = repository.buscarCustoProventos();
		return totalProventos;
	}
	
	private CustoFolhaDTO mapToIndicadoresDTO(Map<String, Object> row) {
	    CustoFolhaDTO dto = new CustoFolhaDTO();

	    dto.setCustoProventos(numero(row, "SALARIOS"));
	    dto.setInss_patronal(numero(row, "INSS_PATRONAL"));
	    dto.setVale_alimentacao(numero(row, "ALIMENTACAO"));
	    dto.setPlano_saude_patronal(numero(row, "PLANO_SAUDE_PATRONAL"));
	    dto.setAdicional_cargo_chefia(numero(row, "ADICIONAL_CARGO_CHEFIA"));
	    dto.setFuncao_confianca(numero(row, "FUNCAO_CONFIANCA"));

	    return dto;
	}
	
	public List<CustoFolhaDTO> buscarIndicadoresEstado() {
	    Map<String, Object> row = repository.buscarIndicadoresEstado();

	    CustoFolhaDTO dto = new CustoFolhaDTO();
	    dto.setCustoProventos((BigDecimal) row.get("SALARIOS"));
	    dto.setInss_patronal((BigDecimal) row.get("INSS_PATRONAL"));
	    dto.setVale_alimentacao((BigDecimal) row.get("ALIMENTACAO"));
	    dto.setPlano_saude_patronal((BigDecimal) row.get("PLANO_SAUDE_PATRONAL"));
	    dto.setAdicional_cargo_chefia((BigDecimal) row.get("ADICIONAL_CARGO_CHEFIA"));
	    dto.setFuncao_confianca((BigDecimal) row.get("FUNCAO_CONFIANCA"));

	    System.out.println(dto.getCustoProventos());
	    return List.of(dto);
	}
	
	 // Método auxiliar para converter valor do Map em BigDecimal
    private BigDecimal numero(Map<String, Object> row, String col) {
        Object val = row.get(col);
        if (val == null) return BigDecimal.ZERO;
        return new BigDecimal(val.toString());
    }

	
}
