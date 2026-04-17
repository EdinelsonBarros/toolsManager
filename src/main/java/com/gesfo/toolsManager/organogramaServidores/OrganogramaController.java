package com.gesfo.toolsManager.organogramaServidores;


import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;




@Controller
public class OrganogramaController {

    private final OrganogramaService service;

    public OrganogramaController(OrganogramaService service) {
        this.service = service;
    }

    @GetMapping("/organograma")
    public String organograma(Model model) {
        model.addAttribute("setores", service.buscarArvoreSetores());
        return "organograma/organograma";
    }
    
    @GetMapping("/treeServ")
    public String treeServ() {
        //model.addAttribute("setores", service.buscarArvoreSetores());
        return "organograma/treeServ";
    }
}
