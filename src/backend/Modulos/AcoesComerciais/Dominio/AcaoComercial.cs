using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.AcoesComerciais.Dominio;

public enum SituacaoDaAcaoComercial { Rascunho = 1, Preparada = 2, EmProcessamento = 3, Concluida = 4, ConcluidaComFalhas = 5, Cancelada = 6 }
public enum SituacaoDoEnvio { Pendente = 1, AguardandoSolicitacao = 2, Solicitado = 3, Enviado = 4, Entregue = 5, Lido = 6, Falhou = 7 }
public enum ResultadoComercial { NaoInformado = 1, SemRetorno = 2, Respondeu = 3, Interessado = 4, Convertido = 5, NaoTemInteresse = 6 }

public sealed class AcaoComercial
{
    private AcaoComercial() { }
    private AcaoComercial(Guid tenantId, string usuarioId, DateTimeOffset agora)
    { Id = Guid.NewGuid(); TenantId = tenantId; UsuarioCriacaoId = usuarioId; Situacao = SituacaoDaAcaoComercial.Rascunho; DataCriacao = agora; }

    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Nome { get; private set; } = string.Empty;
    public string? Objetivo { get; private set; }
    public Guid ItemDeCatalogoId { get; private set; }
    public string? NomeItemSnapshot { get; private set; }
    public Guid? VersaoModeloId { get; private set; }
    public string CriteriosSegmentacaoJson { get; private set; } = string.Empty;
    public SituacaoDaAcaoComercial Situacao { get; private set; }
    public string UsuarioCriacaoId { get; private set; } = string.Empty;
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public DateTimeOffset? DataPreparacao { get; private set; }
    public DateTimeOffset? DataInicioProcessamento { get; private set; }
    public int QuantidadeDestinatarios { get; private set; }
    public uint Versao { get; private set; }
    public ICollection<DestinatarioDaAcao> Destinatarios { get; private set; } = new List<DestinatarioDaAcao>();

    public static AcaoComercial Criar(Guid tenantId, string usuarioId, string nome, string? objetivo, Guid itemId, Guid? versaoModeloId, string criteriosJson, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        var acao = new AcaoComercial(tenantId, usuarioId, agora); acao.Atualizar(nome, objetivo, itemId, versaoModeloId, criteriosJson, agora); return acao;
    }

    public void Atualizar(string nome, string? objetivo, Guid itemId, Guid? versaoModeloId, string criteriosJson, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.Rascunho) throw new ExcecaoDeConflito("acao_nao_editavel", "Somente uma acao em rascunho pode ser alterada.");
        if (string.IsNullOrWhiteSpace(nome) || nome.Trim().Length > 160) throw new ExcecaoDeRegraDeNegocio("nome_invalido", "O nome e obrigatorio e deve possuir ate 160 caracteres.");
        if (itemId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("item_obrigatorio", "O item de catalogo e obrigatorio.");
        Nome = nome.Trim(); Objetivo = string.IsNullOrWhiteSpace(objetivo) ? null : objetivo.Trim(); ItemDeCatalogoId = itemId;
        VersaoModeloId = versaoModeloId; CriteriosSegmentacaoJson = criteriosJson; DataAtualizacao = agora;
    }

    public void Preparar(string nomeItem, IReadOnlyCollection<DestinatarioPreparado> destinatarios, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.Rascunho) throw new ExcecaoDeConflito("acao_ja_preparada", "A acao comercial nao esta em rascunho.");
        if (VersaoModeloId is null) throw new ExcecaoDeRegraDeNegocio("modelo_obrigatorio", "Uma versao publicada de modelo e obrigatoria para preparar.");
        if (destinatarios.Count == 0) throw new ExcecaoDeRegraDeNegocio("publico_vazio", "A acao nao possui clientes elegiveis.");
        foreach (var destinatario in destinatarios.DistinctBy(x => x.ClienteId))
            Destinatarios.Add(new DestinatarioDaAcao(TenantId, Id, destinatario.ClienteId, destinatario.NomeCliente, destinatario.Destino, destinatario.ConteudoPreVisualizacao, destinatario.ChaveTemplate, destinatario.PayloadJson));
        NomeItemSnapshot = nomeItem; QuantidadeDestinatarios = Destinatarios.Count; Situacao = SituacaoDaAcaoComercial.Preparada; DataPreparacao = agora; DataAtualizacao = agora;
    }

    public DestinatarioDaAcao SolicitarEnvio(Guid destinatarioId, DateTimeOffset agora)
    {
        if (Situacao is not (SituacaoDaAcaoComercial.Preparada or SituacaoDaAcaoComercial.EmProcessamento))
            throw new ExcecaoDeConflito("acao_nao_disponivel_para_envio", "A acao comercial nao esta disponivel para envio.");

        var destinatario = Destinatarios.SingleOrDefault(x => x.Id == destinatarioId)
            ?? throw new ExcecaoDeRecursoNaoEncontrado("Destinatario da acao nao encontrado.");
        destinatario.SolicitarEnvio($"acao:{Id}:destinatario:{destinatario.Id}:v1");

        if (Situacao == SituacaoDaAcaoComercial.Preparada)
        {
            Situacao = SituacaoDaAcaoComercial.EmProcessamento;
            DataInicioProcessamento = agora;
            DataAtualizacao = agora;
        }

        return destinatario;
    }

    public void RecalcularConclusao(DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.EmProcessamento || Destinatarios.Count == 0) return;
        if (Destinatarios.Any(x => x.SituacaoEnvio is not (SituacaoDoEnvio.Entregue or SituacaoDoEnvio.Lido or SituacaoDoEnvio.Falhou))) return;
        Situacao = Destinatarios.Any(x => x.SituacaoEnvio == SituacaoDoEnvio.Falhou) ? SituacaoDaAcaoComercial.ConcluidaComFalhas : SituacaoDaAcaoComercial.Concluida;
        DataAtualizacao = agora;
    }
}

public sealed record DestinatarioPreparado(Guid ClienteId, string NomeCliente, string Destino, string ConteudoPreVisualizacao, string ChaveTemplate, string PayloadJson);

public sealed class DestinatarioDaAcao
{
    private DestinatarioDaAcao() { }
    internal DestinatarioDaAcao(Guid tenantId, Guid acaoId, Guid clienteId, string nome, string destino, string conteudo, string chaveTemplate, string payloadJson)
    { Id = Guid.NewGuid(); TenantId = tenantId; AcaoComercialId = acaoId; ClienteId = clienteId; NomeClienteSnapshot = nome; DestinoSnapshot = destino; ConteudoPreVisualizacaoSnapshot = conteudo; ChaveTemplateNotificacaoSnapshot = chaveTemplate; PayloadNotificacaoJson = payloadJson; SituacaoEnvio = SituacaoDoEnvio.Pendente; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid AcaoComercialId { get; private set; }
    public Guid ClienteId { get; private set; }
    public string NomeClienteSnapshot { get; private set; } = string.Empty;
    public string DestinoSnapshot { get; private set; } = string.Empty;
    public string ConteudoPreVisualizacaoSnapshot { get; private set; } = string.Empty;
    public SituacaoDoEnvio SituacaoEnvio { get; private set; }
    public string ChaveTemplateNotificacaoSnapshot { get; private set; } = string.Empty;
    public string PayloadNotificacaoJson { get; private set; } = string.Empty;
    public string? ChaveIdempotencia { get; private set; }
    public string? NotificacaoExternaId { get; private set; }
    public DateTimeOffset? DataUltimaReconciliacao { get; private set; }
    public string? CodigoFalha { get; private set; }
    public ResultadoComercial ResultadoComercial { get; private set; } = ResultadoComercial.NaoInformado;
    public decimal? ValorConvertido { get; private set; }
    public DateTimeOffset? DataResultadoComercial { get; private set; }
    public string? UsuarioResultadoId { get; private set; }
    public uint Versao { get; private set; }
    internal void SolicitarEnvio(string chave)
    {
        if (SituacaoEnvio != SituacaoDoEnvio.Pendente)
            throw new ExcecaoDeConflito("destinatario_ja_solicitado", "O envio deste destinatario ja foi solicitado.");
        ChaveIdempotencia = chave;
        SituacaoEnvio = SituacaoDoEnvio.AguardandoSolicitacao;
    }
    public void RegistrarSolicitacao(string id)
    {
        if (SituacaoEnvio != SituacaoDoEnvio.AguardandoSolicitacao)
            throw new ExcecaoDeConflito("destinatario_nao_aguarda_solicitacao", "O destinatario nao possui intencao de envio pendente.");
        NotificacaoExternaId = id;
        SituacaoEnvio = SituacaoDoEnvio.Solicitado;
    }
    public void AtualizarEstado(SituacaoDoEnvio estado, string? codigo, DateTimeOffset agora) { SituacaoEnvio = estado; CodigoFalha = codigo; DataUltimaReconciliacao = agora; }
    public void RegistrarResultado(ResultadoComercial resultado, decimal? valorConvertido, string usuarioId, DateTimeOffset agora)
    {
        if (resultado == ResultadoComercial.NaoInformado) throw new ExcecaoDeRegraDeNegocio("resultado_invalido", "Informe um resultado comercial.");
        if (resultado != ResultadoComercial.Convertido && valorConvertido is not null) throw new ExcecaoDeRegraDeNegocio("valor_invalido", "O valor somente pode ser informado para resultado convertido.");
        if (valorConvertido < 0) throw new ExcecaoDeRegraDeNegocio("valor_invalido", "O valor convertido nao pode ser negativo.");
        ResultadoComercial = resultado; ValorConvertido = valorConvertido; UsuarioResultadoId = usuarioId; DataResultadoComercial = agora;
    }
}
