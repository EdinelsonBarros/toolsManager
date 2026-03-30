package com.gesfo.toolsManager.custoFolha;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/custofolha")
public class CustoFolhaRestController {
	private final CustoFolhaService service;

	public CustoFolhaRestController(CustoFolhaService service) {
		this.service = service;
	}
	
	@GetMapping("/totalproventos")
	public ResponseEntity<BigDecimal> custos(){
		return ResponseEntity.ok(service.buscarTotalProventos());
	}
	
	@GetMapping("/indicadores")
	public ResponseEntity<List<CustoFolhaDTO>>  buscarIndicadoresEstado(){
		return ResponseEntity.ok(service.buscarIndicadoresEstado());
	}
	
}
