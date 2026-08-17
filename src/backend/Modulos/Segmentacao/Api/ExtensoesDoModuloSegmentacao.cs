using LavaMais.Crm.Modulos.Segmentacao.Aplicacao;
using Microsoft.Extensions.DependencyInjection;

namespace LavaMais.Crm.Modulos.Segmentacao.Api;

public static class ExtensoesDoModuloSegmentacao
{
    public static IServiceCollection AdicionarModuloSegmentacao(this IServiceCollection servicos)
    { servicos.AddScoped<SimuladorDePublico>(); return servicos; }
}
