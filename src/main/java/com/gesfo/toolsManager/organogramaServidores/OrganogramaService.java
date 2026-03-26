package com.gesfo.toolsManager.organogramaServidores;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

@Service
public class OrganogramaService {
	private final OrganogramaRepository repository;

    public OrganogramaService(OrganogramaRepository repository) {
        this.repository = repository;
    }

    public List<SetorDTO> buscarArvoreSetores() {
        List<Map<String, Object>> rows = repository.buscarSetores();

        Map<String, SetorDTO> mapa = new LinkedHashMap<>();

        // Monta mapa de setores
        for (Map<String, Object> row : rows) {
            SetorDTO dto = new SetorDTO();
            
            Double hiraquia_num = numero(row, "HIERARQUIA_NUM");
            String nomeSetor = str(row, "NOMESETOR");
            if (nomeSetor != null && nomeSetor.toUpperCase().startsWith("SUPERI")) {
                nomeSetor = nomeSetor.toUpperCase();
            } else if (hiraquia_num <= 77) { nomeSetor = nomeSetor.toUpperCase();}
            dto.setNomeSetor(nomeSetor);
            
            dto.setSetor(str(row, "SETOR"));
            //dto.setNomeSetor(str(row, "NOMESETOR"));
            dto.setPaiSetor(str(row, "PAISETOR"));
            dto.setHierarquia_setores(str(row, "HIERARQUIA_SETORES"));
            

            
            if (hiraquia_num <= 77) {
                nomeSetor = nomeSetor.toUpperCase();
            }
            dto.setNomeSetor(nomeSetor);
            
            //dto.setHierarquia_num(str(row, "HIERARQUIA_NUM"));
            mapa.put(dto.getSetor(), dto);
        }

        // Vincula filhos ao pai
        List<SetorDTO> raizes = new ArrayList<>();
        for (SetorDTO setor : mapa.values()) {
            String codPai = setor.getPaiSetor();
            if (codPai != null && mapa.containsKey(codPai)) {
                mapa.get(codPai).getFilhos().add(setor);
            } else {
                raizes.add(setor);
            }
        }

        return raizes;
    }

    public List<ServidorDTO> buscarServidoresPorSetor(String codSetor) {
        List<Map<String, Object>> rows = repository.buscarServidoresPorSetor(codSetor);
        List<ServidorDTO> servidores = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            ServidorDTO dto = new ServidorDTO();
            dto.setNumfunc(str(row, "NUMFUNC"));
            dto.setNome(str(row, "NOME"));
            dto.setNomeCargo(str(row, "NOME_CARGO_FUNCAO"));
            dto.setTipoCargo(str(row, "TIPO_CARGO"));
            dto.setCodSetor(str(row, "SETOR"));
            dto.setHierarquiaNum(numero(row, "HIERARQUIA_NUM"));
            servidores.add(dto);
        }

        return servidores;
    }

    private String str(Map<String, Object> row, String col) {
        Object val = row.get(col);
        return val != null ? val.toString().trim() : "";
    }
    
    private Double numero(Map<String, Object> row, String col) {
        Object val = row.get(col);
        if (val == null) return null;
        return ((Number) val).doubleValue();
    }
}
