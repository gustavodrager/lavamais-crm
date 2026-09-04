using LavaMais.Crm.Modulos.MovimentacoesComerciais.Dominio;
using LavaMais.Crm.Modulos.MovimentacoesComerciais.Infraestrutura;
using Microsoft.EntityFrameworkCore;

namespace LavaMais.Crm.Modulos.MovimentacoesComerciais.Aplicacao;

public sealed class ConsultaDeSugestoesDeAcoes(ContextoDeMovimentacoesComerciais banco, TimeProvider relogio)
{
    private static readonly DateOnly InicioDaLacuna = new(2025, 9, 3);
    private static readonly DateOnly FimDaLacuna = new(2026, 1, 2);

    public async Task<IReadOnlyCollection<SugestaoDeAcao>> Listar(CancellationToken ct)
    {
        var hoje = DateOnly.FromDateTime(relogio.GetUtcNow().UtcDateTime);
        var movimentos = await banco.Movimentacoes.AsNoTracking()
            .Where(x => x.Situacao == SituacaoDaMovimentacao.Registrada)
            .Select(x => new MovimentoDaAnalise(x.ClienteId, x.DataMovimentacao, x.ValorTotal, x.CodigoExterno))
            .ToListAsync(ct);
        var clientes = movimentos.GroupBy(x => x.ClienteId).Select(grupo => CriarCliente(grupo, hoje)).ToArray();
        var maioresReceitas = clientes.OrderByDescending(x => x.Receita).Take((int)Math.Ceiling(clientes.Length * .10m)).Select(x => x.ClienteId).ToHashSet();

        return
        [
            Criar("atraso-ciclo", "Atrasados no ciclo individual", "Clientes que ultrapassaram em 25% o intervalo em que costumam retornar.",
                "Oi, {{nomeCliente}}! Faz um pouco mais de tempo que o seu intervalo habitual. Tem alguma roupa para lavar?", 1,
                clientes.Where(x => x.IntervalosValidos.Length >= 2 && x.CicloMediano is > 0 && x.Recencia > x.CicloMediano * 1.25m && x.Recencia <= 90)),
            Criar("alto-valor-risco", "Alto valor em risco", "Clientes do grupo de maior receita que estão há mais de 30 dias sem retornar.",
                "Oi, {{nomeCliente}}! Sentimos sua falta por aqui. Se tiver roupas aguardando, podemos ajudar com a retirada.", 2,
                clientes.Where(x => maioresReceitas.Contains(x.ClienteId) && x.Recencia > 30)),
            Criar("proxima-recompra", "Próximos da recompra", "Clientes próximos do próprio momento habitual de retorno.",
                "Oi, {{nomeCliente}}! Já está chegando a época em que você costuma usar a LavaMais. Precisa de retirada?", 3,
                clientes.Where(x => x.IntervalosValidos.Length >= 2 && x.CicloMediano is > 0 && x.Recencia >= x.CicloMediano * .8m && x.Recencia <= x.CicloMediano * 1.2m)),
            Criar("segunda-compra", "Cliente novo: segunda compra", "Clientes com uma compra realizada entre 7 e 30 dias atrás.",
                "Oi, {{nomeCliente}}! Tudo certo com o serviço da LavaMais? Quando precisar novamente, podemos ajudar.", 4,
                clientes.Where(x => x.Quantidade == 1 && x.Recencia is >= 7 and <= 30)),
            Criar("recuperado-retencao", "Recuperado: retenção", "Clientes que retornaram nos últimos 30 dias depois de mais de 60 dias sem movimento.",
                "Oi, {{nomeCliente}}! Foi muito bom receber você novamente. Sempre que precisar, conte com a LavaMais.", 5,
                clientes.Where(x => x.Recencia <= 30 && x.UltimoIntervaloValido is > 60))
        ];
    }

    private static ClienteDaAnalise CriarCliente(IGrouping<Guid, MovimentoDaAnalise> grupo, DateOnly hoje)
    {
        var ordenados = grupo.OrderBy(x => x.Data).ThenBy(x => x.CodigoExterno).ToArray();
        var intervalos = ordenados.Zip(ordenados.Skip(1), (anterior, atual) => new
        {
            Anterior = DateOnly.FromDateTime(anterior.Data.UtcDateTime),
            Atual = DateOnly.FromDateTime(atual.Data.UtcDateTime)
        }).Where(x => !(x.Anterior <= InicioDaLacuna && x.Atual >= FimDaLacuna)).Select(x => x.Atual.DayNumber - x.Anterior.DayNumber).ToArray();
        var ultima = DateOnly.FromDateTime(ordenados[^1].Data.UtcDateTime);
        return new(grupo.Key, ordenados.Length, grupo.Sum(x => x.Valor), hoje.DayNumber - ultima.DayNumber,
            intervalos, Mediana(intervalos), intervalos.LastOrDefault());
    }

    private static decimal? Mediana(int[] valores)
    {
        if (valores.Length == 0) return null;
        var ordenados = valores.Order().ToArray();
        return ordenados.Length % 2 == 1 ? ordenados[ordenados.Length / 2] : (ordenados[ordenados.Length / 2 - 1] + ordenados[ordenados.Length / 2]) / 2m;
    }

    private static SugestaoDeAcao Criar(string codigo, string nome, string motivo, string mensagem, int prioridade, IEnumerable<ClienteDaAnalise> clientes)
    {
        var publico = clientes.OrderByDescending(x => x.Receita).ToArray();
        return new(codigo, nome, motivo, mensagem, prioridade, publico.Length, publico.Sum(x => x.Receita), publico.Select(x => x.ClienteId).ToArray());
    }

    private sealed record MovimentoDaAnalise(Guid ClienteId, DateTimeOffset Data, decimal Valor, string? CodigoExterno);
    private sealed record ClienteDaAnalise(Guid ClienteId, int Quantidade, decimal Receita, int Recencia, int[] IntervalosValidos, decimal? CicloMediano, int UltimoIntervaloValido);
}

public sealed record SugestaoDeAcao(string Codigo, string Nome, string Motivo, string MensagemSugerida, int Prioridade, int QuantidadeClientes, decimal ReceitaHistorica, IReadOnlyCollection<Guid> ClienteIds);
