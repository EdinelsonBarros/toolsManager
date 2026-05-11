package com.gesfo.toolsManager.organogramaServidores;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/organograma")
public class OrganogramaRestController {
	 private final OrganogramaService service;

	    public OrganogramaRestController(OrganogramaService service) {
	        this.service = service;
	    }

	    @GetMapping("/servidores")
	    public ResponseEntity<List<ServidorDTO>> servidores(@RequestParam String setor) {
	    	// Retorna servidor
	        return ResponseEntity.ok(service.buscarServidoresPorSetor(setor));
	    }
	    
	    @GetMapping("/servidoresPaiSetor")
	    public ResponseEntity<List<ServidorDTO>> servidoresPaiSetor(@RequestParam String setor) {
	    	//recebe um setor e retorna pedaço da arvore
	    	return ResponseEntity.ok(service.buscarServidoresPorPaiSetor(setor));
	    }
	    
	    
	    
	    // end point responsavel por retornar dados para campo pesquisa
	    @GetMapping("/buscar")
	    public ResponseEntity<List<ServidorDTO>> buscar(@RequestParam String termo) {
	        return ResponseEntity.ok(service.buscarServidoresPorTermo(termo));
	    }
	    
	    
	    
	    
	    @GetMapping("/noarvore")
	    public ResponseEntity<List<ServidorDTO>> buscarNo(String servidor) {
	    	return ResponseEntity.ok(service.montarArvore(servidor));
	    }
	    
	    @GetMapping("/treemap")
	    public ResponseEntity<List<SetorDTO>> treemap() {
	        return ResponseEntity.ok(service.buscarArvoreSetores());
	    }
	    
	    
}
