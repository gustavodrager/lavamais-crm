using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;

namespace LavaMais.Crm.Modulos.Integracoes.Dominio;

public enum SituacaoDaNotificacaoLocal
{
    Pendente = 1,
    Enviada = 2,
    Falhou = 3,
    Enviando = 4
}

public enum SituacaoDeEntregaLocal
{
    NaoRastreada = 1,
    Submetida = 2,
    Entregue = 3,
    Lida = 4,
    NaoEntregue = 5
}

public sealed class NotificacaoLocal
{
    private NotificacaoLocal() { }

    private NotificacaoLocal(
        Guid tenantId,
        SolicitacaoDeNotificacao solicitacao,
        string parametrosJson,
        DateTimeOffset agora)
    {
        Id = Guid.NewGuid();
        TenantId = tenantId;
        Canal = solicitacao.Canal;
        ChaveModelo = solicitacao.ChaveModelo;
        ChaveIdempotencia = solicitacao.ChaveIdempotencia;
        NomeDestinatario = solicitacao.NomeDestinatario;
        TelefoneDestinatario = solicitacao.TelefoneDestinatario;
        ConteudoSnapshot = solicitacao.Conteudo;
        ParametrosJson = parametrosJson;
        Situacao = SituacaoDaNotificacaoLocal.Pendente;
        SituacaoEntrega = SituacaoDeEntregaLocal.NaoRastreada;
        DataCriacao = agora;
        DataAtualizacao = agora;
    }

    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Canal { get; private set; } = string.Empty;
    public string ChaveModelo { get; private set; } = string.Empty;
    public string ChaveIdempotencia { get; private set; } = string.Empty;
    public string NomeDestinatario { get; private set; } = string.Empty;
    public string TelefoneDestinatario { get; private set; } = string.Empty;
    public string ConteudoSnapshot { get; private set; } = string.Empty;
    public string ParametrosJson { get; private set; } = string.Empty;
    public SituacaoDaNotificacaoLocal Situacao { get; private set; }
    public SituacaoDeEntregaLocal SituacaoEntrega { get; private set; }
    public string? IdentificadorNoProvedor { get; private set; }
    public int Tentativas { get; private set; }
    public string? CodigoFalha { get; private set; }
    public string? UltimoErro { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public DateTimeOffset? DataEnvio { get; private set; }
    public uint Versao { get; private set; }

    public static NotificacaoLocal Criar(
        Guid tenantId,
        SolicitacaoDeNotificacao solicitacao,
        string parametrosJson,
        DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ArgumentException("O tenant e obrigatorio.", nameof(tenantId));
        if (string.IsNullOrWhiteSpace(solicitacao.ChaveIdempotencia)) throw new ArgumentException("A chave de idempotencia e obrigatoria.", nameof(solicitacao));
        if (string.IsNullOrWhiteSpace(solicitacao.TelefoneDestinatario)) throw new ArgumentException("O telefone do destinatario e obrigatorio.", nameof(solicitacao));
        if (string.IsNullOrWhiteSpace(solicitacao.Conteudo)) throw new ArgumentException("O conteudo da notificacao e obrigatorio.", nameof(solicitacao));

        return new NotificacaoLocal(tenantId, solicitacao, parametrosJson, agora);
    }

    public bool Finalizada => Situacao is SituacaoDaNotificacaoLocal.Enviada or SituacaoDaNotificacaoLocal.Falhou;

    public void RegistrarTentativa(DateTimeOffset agora)
    {
        if (Finalizada) return;
        Tentativas++;
        Situacao = SituacaoDaNotificacaoLocal.Enviando;
        DataAtualizacao = agora;
        UltimoErro = null;
    }

    public void RegistrarErroTemporario(string erro, DateTimeOffset agora)
    {
        if (Finalizada) return;
        Situacao = SituacaoDaNotificacaoLocal.Pendente;
        UltimoErro = Limitar(erro, 1000);
        DataAtualizacao = agora;
    }

    public void RegistrarEnvio(string identificadorNoProvedor, DateTimeOffset agora)
    {
        if (Finalizada) return;
        if (string.IsNullOrWhiteSpace(identificadorNoProvedor)) throw new ArgumentException("O identificador no provedor e obrigatorio.", nameof(identificadorNoProvedor));

        IdentificadorNoProvedor = identificadorNoProvedor.Trim();
        Situacao = SituacaoDaNotificacaoLocal.Enviada;
        SituacaoEntrega = SituacaoDeEntregaLocal.Submetida;
        DataEnvio = agora;
        DataAtualizacao = agora;
        CodigoFalha = null;
        UltimoErro = null;
    }

    public void RegistrarFalha(string codigo, string erro, DateTimeOffset agora)
    {
        if (Finalizada) return;
        Situacao = SituacaoDaNotificacaoLocal.Falhou;
        SituacaoEntrega = SituacaoDeEntregaLocal.NaoEntregue;
        CodigoFalha = Limitar(codigo, 100);
        UltimoErro = Limitar(erro, 1000);
        DataAtualizacao = agora;
    }

    public void AtualizarEntrega(SituacaoDeEntregaLocal novaSituacao, DateTimeOffset agora)
    {
        if (Situacao == SituacaoDaNotificacaoLocal.Falhou || SituacaoEntrega == SituacaoDeEntregaLocal.Lida) return;

        if (novaSituacao == SituacaoDeEntregaLocal.NaoEntregue)
        {
            if (SituacaoEntrega is SituacaoDeEntregaLocal.Entregue or SituacaoDeEntregaLocal.Lida) return;
            Situacao = SituacaoDaNotificacaoLocal.Falhou;
            SituacaoEntrega = novaSituacao;
            CodigoFalha = "whatsmiau_nao_entregue";
            DataAtualizacao = agora;
            return;
        }

        if (Ordem(novaSituacao) <= Ordem(SituacaoEntrega)) return;
        SituacaoEntrega = novaSituacao;
        DataAtualizacao = agora;
    }

    public EstadoConsolidadoDaNotificacao Consolidar() => Situacao switch
    {
        SituacaoDaNotificacaoLocal.Pendente => new(SituacaoTecnicaDaNotificacao.Pendente),
        SituacaoDaNotificacaoLocal.Enviando => new(SituacaoTecnicaDaNotificacao.Processando),
        SituacaoDaNotificacaoLocal.Falhou => new(SituacaoTecnicaDaNotificacao.Falhou, CodigoFalha),
        _ => SituacaoEntrega switch
        {
            SituacaoDeEntregaLocal.Lida => new(SituacaoTecnicaDaNotificacao.Lida),
            SituacaoDeEntregaLocal.Entregue => new(SituacaoTecnicaDaNotificacao.Entregue),
            SituacaoDeEntregaLocal.NaoEntregue => new(SituacaoTecnicaDaNotificacao.Falhou, CodigoFalha),
            _ => new(SituacaoTecnicaDaNotificacao.Enviada)
        }
    };

    private static int Ordem(SituacaoDeEntregaLocal situacao) => situacao switch
    {
        SituacaoDeEntregaLocal.NaoRastreada => 0,
        SituacaoDeEntregaLocal.Submetida => 1,
        SituacaoDeEntregaLocal.Entregue => 2,
        SituacaoDeEntregaLocal.Lida => 3,
        _ => -1
    };

    private static string Limitar(string valor, int limite) => valor.Length > limite ? valor[..limite] : valor;
}
