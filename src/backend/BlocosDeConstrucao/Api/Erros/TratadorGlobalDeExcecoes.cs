using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Dominio;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace LavaMais.Crm.BlocosDeConstrucao.Api.Erros;

public sealed class TratadorGlobalDeExcecoes(
    IProblemDetailsService problemDetails,
    ILogger<TratadorGlobalDeExcecoes> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext contexto, Exception excecao, CancellationToken cancellationToken)
    {
        var (status, titulo, codigo) = excecao switch
        {
            ExcecaoDeRecursoNaoEncontrado => (StatusCodes.Status404NotFound, "Recurso nao encontrado", "recurso_nao_encontrado"),
            ExcecaoDeConflito conflito => (StatusCodes.Status409Conflict, "Conflito", conflito.Codigo),
            ExcecaoDeRegraDeNegocio regra => (StatusCodes.Status422UnprocessableEntity, "Regra de negocio nao atendida", regra.Codigo),
            ExcecaoDeDominio => (StatusCodes.Status422UnprocessableEntity, "Regra de dominio nao atendida", "regra_de_dominio"),
            BadHttpRequestException => (StatusCodes.Status400BadRequest, "Requisicao invalida", "requisicao_invalida"),
            _ => (StatusCodes.Status500InternalServerError, "Erro interno", "erro_interno")
        };

        logger.Log(
            status >= 500 ? LogLevel.Error : LogLevel.Warning,
            excecao,
            "Falha ao processar requisicao com codigo {CodigoDoErro}",
            codigo);

        contexto.Response.StatusCode = status;
        var detalhes = new ProblemDetails
        {
            Status = status,
            Title = titulo,
            Detail = status >= 500 ? "Ocorreu um erro inesperado." : excecao.Message,
            Instance = contexto.Request.Path,
            Type = $"https://httpstatuses.com/{status}"
        };
        detalhes.Extensions["codigo"] = codigo;
        detalhes.Extensions["correlationId"] = contexto.TraceIdentifier;

        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = contexto,
            ProblemDetails = detalhes,
            Exception = excecao
        });
    }
}
