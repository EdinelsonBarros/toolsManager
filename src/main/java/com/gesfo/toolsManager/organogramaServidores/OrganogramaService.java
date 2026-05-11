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
		Map<String, Integer> quantidades = repository.buscarQuantidadePorSetor();

		Map<String, SetorDTO> arvoreSetores = new LinkedHashMap<>();

		// Monta mapa de setores
		for (Map<String, Object> row : rows) {
			SetorDTO dto = new SetorDTO();
			Double hierarquia_num = numero(row, "HIERARQUIA_NUM");
			String nomeSetor = str(row, "NOMESETOR");
			String valor = str(row, "HIERARQUIA_NUM");
			String formatado = "";
			if (nomeSetor != null && nomeSetor.toUpperCase().startsWith("SUPERI")) {
				nomeSetor = nomeSetor.toUpperCase();
			} else if (hierarquia_num <= 77) {
				nomeSetor = nomeSetor.toUpperCase();
				formatado = "0".repeat(Math.max(0, 3 - valor.length())) + valor;
			}

			if (!formatado.isEmpty()) {

				dto.setSetor(formatado);
				dto.setCodSetor(formatado);
			} else {
				dto.setSetor(valor);
			}

			dto.setNomeSetor(nomeSetor);
			dto.setPaiSetor(str(row, "PAISETOR"));
			dto.setSetor(str(row, "SETOR"));
			dto.setCodSetor(str(row, "SETOR"));
			dto.setHierarquia_setores(str(row, "HIERARQUIA_SETORES"));
			dto.setQuantidadeServ(quantidades.getOrDefault(dto.getSetor(), 0));
			dto.setHierarquia_num(numero(row, "HIERARQUIA_NUM"));
			arvoreSetores.put(dto.getSetor(), dto);
		}

		// Vincula filhos ao pai
		List<SetorDTO> raizes = new ArrayList<>();
		for (SetorDTO setor : arvoreSetores.values()) {

			String codPai = setor.getPaiSetor();

			if (codPai != null) {
				String codPaiFormatado = codPai.length() < 3 ? "0".repeat(3 - codPai.length()) + codPai : codPai;

				if (arvoreSetores.containsKey(codPaiFormatado)) {
					arvoreSetores.get(codPaiFormatado).getChildren().add(setor);
				} else {
					raizes.add(setor);
				}
			} 

		}

		return raizes;
	}

	public List<ServidorDTO> buscarServidoresPorSetor(String codSetor) {
		List<Map<String, Object>> rows = repository.buscarServPorSetor(codSetor);
		List<ServidorDTO> servidores = new ArrayList<>();

		for (Map<String, Object> row : rows) {
			ServidorDTO dto = new ServidorDTO();
			dto.setNumfunc(str(row, "NUMFUNC"));
			dto.setNome(str(row, "NOME"));
			dto.setNomeCargo(str(row, "NOME_CARGO_FUNCAO"));
			dto.setTipoCargo(str(row, "TIPO_CARGO"));
			dto.setCodSetor(str(row, "SETOR"));
			dto.setHierarquiaNum(numero(row, "HIERARQUIA_NUM"));
			dto.setPaiSetor(str(row, "PAISETOR"));
			servidores.add(dto);
		}

		System.out.println(">>> setor recebido = [" + codSetor + "]");
		System.out.println(">>> setor recebido = [" + servidores + "]");

		return servidores;
	}

	public List<ServidorDTO> buscarServidoresPorPaiSetor(String codSetor) {
		List<Map<String, Object>> rows = repository.buscarServPorSetor(codSetor);
		List<ServidorDTO> servidores = new ArrayList<>();

		for (Map<String, Object> row : rows) {
			ServidorDTO dto = new ServidorDTO();
			dto.setNumfunc(str(row, "NUMFUNC"));
			dto.setNome(str(row, "NOME"));
			dto.setNomeCargo(str(row, "NOME_CARGO_FUNCAO"));
			dto.setTipoCargo(str(row, "TIPO_CARGO"));
			dto.setCodSetor(str(row, "SETOR"));
			dto.setHierarquiaNum(numero(row, "HIERARQUIA_NUM"));
			dto.setPaiSetor(str(row, "PAISETOR"));
			servidores.add(dto);
		}

		System.out.println(">>> setor recebido = [" + codSetor + "]");
		System.out.println(">>> setor recebido = [" + servidores + "]");

		return servidores;
	}

	public List<ServidorDTO> buscarNoArv(String codSetor) {
		List<Map<String, Object>> rows = repository.buscarServPorSetor(codSetor);
		List<ServidorDTO> servidores = new ArrayList<>();
		List<ServidorDTO> noArv = new ArrayList<>();

		for (Map<String, Object> row : rows) {
			ServidorDTO dto = new ServidorDTO();
			dto.setNumfunc(str(row, "NUMFUNC"));
			dto.setNome(str(row, "NOME"));
			dto.setNomeCargo(str(row, "NOME_CARGO_FUNCAO"));
			dto.setTipoCargo(str(row, "TIPO_CARGO"));
			dto.setCodSetor(str(row, "SETOR"));
			dto.setSetoresPai(str(row, "SETORES_PAI"));
			dto.setHierarquiaNum(numero(row, "HIERARQUIA_NUM"));
			dto.setPaiSetor(str(row, "PAISETOR"));
			servidores.add(dto);
		}

		for (ServidorDTO chefe : servidores) {
			if ("CHEFIA".equals(chefe.getTipoCargo())) {

				noArv.add(chefe);
				break;
			}
		}

		for (ServidorDTO servidor : servidores) {

			if (!"CHEFIA".equals(servidor.getTipoCargo())) {

				noArv.get(0).getChildren().add(servidor);

			}
		}

		return noArv;
	}

	public List<ServidorDTO> montarArvore(String numfunc) {
		ServidorDTO servidor = repository.buscarServidor(numfunc.trim());
		List<ServidorDTO> noRaiz = new ArrayList<>();
		List<ServidorDTO> nopai = new ArrayList<>();
		List<ServidorDTO> arvore = new ArrayList<>();
		System.out.println("Servidor: " + servidor.toString());

		nopai.add(buscarNoArv(servidor.getCodSetor()).get(0));
		System.out.println("Nó pai: " + nopai.get(0));
		noRaiz.add(buscarNoArv(servidor.getPaiSetor()).get(0));

		noRaiz.get(0).getChildren().add(nopai.get(0));
		System.out.println("Nó raiz: " + noRaiz.get(0));

		arvore.add(noRaiz.get(0));

		return arvore;

	}

	public List<ServidorDTO> buscarServidoresPorTermo(String termo) {
		if (termo == null || termo.trim().length() < 3)
			return List.of();
		List<Map<String, Object>> rows = repository.buscarServidoresPorTermo(termo.trim());
		return mapearServidores(rows);
	}

	private List<ServidorDTO> mapearServidores(List<Map<String, Object>> rows) {
		List<ServidorDTO> servidores = new ArrayList<>();
		for (Map<String, Object> row : rows) {
			ServidorDTO dto = new ServidorDTO();
			dto.setNumfunc(str(row, "NUMFUNC"));
			dto.setNome(str(row, "NOME"));
			dto.setNomeCargo(str(row, "NOME_CARGO_FUNCAO"));
			dto.setTipoCargo(str(row, "TIPO_CARGO"));
			dto.setHierarquiaNum(numero(row, "HIERARQUIA_NUM"));
			dto.setCodSetor(str(row, "SETOR"));
			dto.setNomeSetor(str(row, "NOMESETOR"));
			servidores.add(dto);
		}
		return servidores;
	}

	public Long buscarQuantServEstado() {
		Long quantServEst = repository.buscarQuantServEstado();
		return quantServEst;
	}

	private String str(Map<String, Object> row, String col) {
		Object val = row.get(col);
		return val != null ? val.toString().trim() : "";
	}

	private Double numero(Map<String, Object> row, String col) {
		Object val = row.get(col);
		if (val == null)
			return null;
		return ((Number) val).doubleValue();
	}
}
