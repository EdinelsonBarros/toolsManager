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
    public ResponseEntity<List<ServidorDTO>> servidores(
            @RequestParam String setor) {
        return ResponseEntity.ok(service.buscarServidoresPorSetor(setor));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ServidorDTO>> buscar(
            @RequestParam String termo) {
        return ResponseEntity.ok(service.buscarServidoresPorTermo(termo));
    }
}
