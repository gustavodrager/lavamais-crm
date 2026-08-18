using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace LavaMais.Crm.BlocosDeConstrucao.Api.Observabilidade;

public static class ObservabilidadeDoCrm
{
    public const string Nome = "LavaMais.Crm";
    public static readonly ActivitySource Atividades = new(Nome);
    public static readonly Meter Metricas = new(Nome);
    public static readonly Counter<long> Requisicoes = Metricas.CreateCounter<long>("crm.http.requisicoes");
    public static readonly Histogram<double> DuracaoDasRequisicoes = Metricas.CreateHistogram<double>("crm.http.duracao", "ms");
}
