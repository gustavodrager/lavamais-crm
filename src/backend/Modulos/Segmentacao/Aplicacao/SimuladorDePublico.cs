using LavaMais.Crm.Modulos.Clientes.Aplicacao;
using LavaMais.Crm.Modulos.Segmentacao.Dominio;
using System.Data.Common;

namespace LavaMais.Crm.Modulos.Segmentacao.Aplicacao;

public sealed class SimuladorDePublico(ConsultaDeClientesParaSegmentacao clientes)
{
    public async Task<ResultadoDaSimulacao> Simular(CriteriosDeSegmentacao criterios, int pagina, int tamanhoPagina, CancellationToken ct, DbTransaction? transacao = null)
    {
        criterios.Validar(); pagina = Math.Max(1, pagina); tamanhoPagina = Math.Clamp(tamanhoPagina == 0 ? 20 : tamanhoPagina, 1, 100);
        var filtro = new FiltroDeClientesParaSegmentacao(
            criterios.Modo == ModoDeSelecao.Manual ? (criterios.ClienteIds ?? []).Distinct().ToArray() : [],
            Limpar(criterios.TipoCliente), Limpar(criterios.Cidades), Limpar(criterios.Bairros), (criterios.EtiquetaIds ?? []).Distinct().ToArray(), criterios.CadastradoApartirDe, criterios.DataNascimentoDe, criterios.DataNascimentoAte);
        var encontrados = await clientes.Consultar(filtro, ct, transacao);
        var excluidos = (criterios.ClienteIdsExcluidos ?? []).ToHashSet();
        var contatosElegiveis = new HashSet<string>(StringComparer.Ordinal);
        var avaliados = encontrados.Select(cliente =>
        {
            MotivoDeExclusao? motivo = excluidos.Contains(cliente.Id) ? MotivoDeExclusao.ExcluidoManualmente
                : !cliente.Ativo ? MotivoDeExclusao.ClienteInativo
                : !cliente.ContatoWhatsappAtivo || string.IsNullOrWhiteSpace(cliente.Whatsapp) ? MotivoDeExclusao.ContatoInvalido
                : !cliente.PermiteMarketingWhatsapp ? MotivoDeExclusao.SemPermissao
                : !contatosElegiveis.Add(cliente.Whatsapp) ? MotivoDeExclusao.ContatoDuplicado : null;
            return new ClienteSimulado(cliente.Id, cliente.Nome, cliente.Whatsapp, motivo is null, motivo);
        }).ToArray();
        return new(encontrados.Count, avaliados.Count(x => x.Elegivel), pagina, tamanhoPagina,
            avaliados.Skip((pagina - 1) * tamanhoPagina).Take(tamanhoPagina).ToArray());
    }

    private static string? Limpar(string? valor) => string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    private static string[] Limpar(IReadOnlyCollection<string>? valores) => (valores ?? []).Where(x => !string.IsNullOrWhiteSpace(x)).Select(x => x.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
}

public sealed record ClienteSimulado(Guid ClienteId, string Nome, string? Whatsapp, bool Elegivel, MotivoDeExclusao? MotivoExclusao);
public sealed record ResultadoDaSimulacao(int QuantidadeEncontrada, int QuantidadeElegivel, int Pagina, int TamanhoPagina, IReadOnlyCollection<ClienteSimulado> Clientes);
