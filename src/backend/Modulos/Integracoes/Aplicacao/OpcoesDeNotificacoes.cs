using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public enum ModoDeNotificacoes
{
    Desabilitado = 1,
    Local = 2,
    Central = 3
}

public sealed class OpcoesDeNotificacoes
{
    public const string Secao = "Notificacoes";

    public ModoDeNotificacoes Modo { get; set; } = ModoDeNotificacoes.Desabilitado;
    public OpcoesDoWhatsMiau WhatsMiau { get; set; } = new();
    public OpcoesDaCentralDeNotificacoes Central { get; set; } = new();
}

public sealed class OpcoesDoWhatsMiau
{
    public string BaseUrl { get; set; } = "https://api.whatsmiau.dev/v2";
    public string ApiKey { get; set; } = string.Empty;
    public string NomeInstancia { get; set; } = string.Empty;
    public string SegredoWebhook { get; set; } = string.Empty;
}

public sealed class OpcoesDaCentralDeNotificacoes
{
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string Origem { get; set; } = "lavamais-crm";
}

public sealed class DisponibilidadeDeNotificacoes(IOptions<OpcoesDeNotificacoes> opcoes) : IDisponibilidadeDeNotificacoes
{
    public bool Habilitado => opcoes.Value.Modo != ModoDeNotificacoes.Desabilitado;
}

public sealed class ValidadorDeOpcoesDeNotificacoes : IValidateOptions<OpcoesDeNotificacoes>
{
    public ValidateOptionsResult Validate(string? name, OpcoesDeNotificacoes opcoes)
    {
        if (!Enum.IsDefined(opcoes.Modo))
            return ValidateOptionsResult.Fail("Notificacoes:Modo possui um valor invalido.");
        if (opcoes.Modo == ModoDeNotificacoes.Desabilitado) return ValidateOptionsResult.Success;

        var erros = new List<string>();
        if (opcoes.Modo == ModoDeNotificacoes.Local)
        {
            ValidarUrl(opcoes.WhatsMiau.BaseUrl, "Notificacoes:WhatsMiau:BaseUrl", erros);
            Exigir(opcoes.WhatsMiau.ApiKey, "Notificacoes:WhatsMiau:ApiKey", erros);
            Exigir(opcoes.WhatsMiau.NomeInstancia, "Notificacoes:WhatsMiau:NomeInstancia", erros);
            Exigir(opcoes.WhatsMiau.SegredoWebhook, "Notificacoes:WhatsMiau:SegredoWebhook", erros);
            if (!string.IsNullOrWhiteSpace(opcoes.WhatsMiau.SegredoWebhook) && opcoes.WhatsMiau.SegredoWebhook.Length < 24)
                erros.Add("Notificacoes:WhatsMiau:SegredoWebhook deve possuir ao menos 24 caracteres.");
        }
        else
        {
            ValidarUrl(opcoes.Central.BaseUrl, "Notificacoes:Central:BaseUrl", erros);
            Exigir(opcoes.Central.ApiKey, "Notificacoes:Central:ApiKey", erros);
            Exigir(opcoes.Central.Origem, "Notificacoes:Central:Origem", erros);
        }

        return erros.Count == 0 ? ValidateOptionsResult.Success : ValidateOptionsResult.Fail(erros);
    }

    private static void Exigir(string valor, string campo, ICollection<string> erros)
    {
        if (string.IsNullOrWhiteSpace(valor)) erros.Add($"{campo} e obrigatorio no modo selecionado.");
    }

    private static void ValidarUrl(string valor, string campo, ICollection<string> erros)
    {
        if (!Uri.TryCreate(valor, UriKind.Absolute, out _)) erros.Add($"{campo} deve ser uma URL absoluta.");
    }
}
