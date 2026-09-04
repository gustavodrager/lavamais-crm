using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.AcoesComerciais.Dominio;

public enum SituacaoDaAcaoComercial { Rascunho = 1, AguardandoAprovacao = 2, Preparada = 3, EmProcessamento = 4, Concluida = 5, ConcluidaComFalhas = 6, Cancelada = 7, Rejeitada = 8 }
public enum SituacaoDoEnvio { Pendente = 1, Enviado = 2 }
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
    public Guid? ItemDeCatalogoId { get; private set; }
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

    public static AcaoComercial Criar(Guid tenantId, string usuarioId, string nome, string? objetivo, Guid? itemId, Guid? versaoModeloId, string criteriosJson, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        var acao = new AcaoComercial(tenantId, usuarioId, agora); acao.Atualizar(nome, objetivo, itemId, versaoModeloId, criteriosJson, agora); return acao;
    }

    public void Atualizar(string nome, string? objetivo, Guid? itemId, Guid? versaoModeloId, string criteriosJson, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.Rascunho) throw new ExcecaoDeConflito("acao_nao_editavel", "Somente uma acao em rascunho pode ser alterada.");
        if (string.IsNullOrWhiteSpace(nome) || nome.Trim().Length > 160) throw new ExcecaoDeRegraDeNegocio("nome_invalido", "O nome e obrigatorio e deve possuir ate 160 caracteres.");
        if (itemId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("item_invalido", "O item de catalogo informado e invalido.");
        Nome = nome.Trim(); Objetivo = string.IsNullOrWhiteSpace(objetivo) ? null : objetivo.Trim(); ItemDeCatalogoId = itemId;
        VersaoModeloId = versaoModeloId; CriteriosSegmentacaoJson = criteriosJson; DataAtualizacao = agora;
    }

    public void Preparar(string? nomeItem, IReadOnlyCollection<DestinatarioPreparado> destinatarios, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.AguardandoAprovacao) throw new ExcecaoDeConflito("acao_nao_aguarda_aprovacao", "A acao comercial nao esta aguardando aprovacao.");
        if (VersaoModeloId is null) throw new ExcecaoDeRegraDeNegocio("modelo_obrigatorio", "Uma versao publicada de modelo e obrigatoria para preparar.");
        if (destinatarios.Count == 0) throw new ExcecaoDeRegraDeNegocio("publico_vazio", "A acao nao possui clientes elegiveis.");
        foreach (var destinatario in destinatarios.DistinctBy(x => x.ClienteId))
            Destinatarios.Add(new DestinatarioDaAcao(TenantId, Id, destinatario.ClienteId, destinatario.NomeCliente, destinatario.Destino, destinatario.ConteudoPreVisualizacao));
        NomeItemSnapshot = nomeItem; QuantidadeDestinatarios = Destinatarios.Count; Situacao = SituacaoDaAcaoComercial.Preparada; DataPreparacao = agora; DataAtualizacao = agora;
    }

    public void SolicitarAprovacao(DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.Rascunho) throw new ExcecaoDeConflito("acao_nao_editavel", "Somente uma acao em rascunho pode ser enviada para aprovacao.");
        if (VersaoModeloId is null) throw new ExcecaoDeRegraDeNegocio("modelo_obrigatorio", "Escolha uma mensagem aprovada antes de enviar a acao para aprovacao.");
        Situacao = SituacaoDaAcaoComercial.AguardandoAprovacao; DataAtualizacao = agora;
    }

    public void Rejeitar(string motivo, DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.AguardandoAprovacao) throw new ExcecaoDeConflito("acao_nao_aguarda_aprovacao", "A acao comercial nao esta aguardando aprovacao.");
        if (string.IsNullOrWhiteSpace(motivo)) throw new ExcecaoDeRegraDeNegocio("motivo_obrigatorio", "Informe o motivo da rejeicao.");
        Situacao = SituacaoDaAcaoComercial.Rejeitada; DataAtualizacao = agora;
    }

    public void Cancelar(string motivo, string usuarioId, DateTimeOffset agora)
    {
        if (Situacao is not (SituacaoDaAcaoComercial.Rascunho or SituacaoDaAcaoComercial.AguardandoAprovacao or SituacaoDaAcaoComercial.Preparada))
            throw new ExcecaoDeConflito("acao_nao_cancelavel", "A acao comercial nao pode mais ser cancelada.");
        if (string.IsNullOrWhiteSpace(motivo) || motivo.Trim().Length > 300)
            throw new ExcecaoDeRegraDeNegocio("motivo_invalido", "Informe o motivo do cancelamento.");
        Situacao = SituacaoDaAcaoComercial.Cancelada;
        DataAtualizacao = agora;
    }

    public DestinatarioDaAcao ConfirmarEnvio(Guid destinatarioId, string usuarioId, DateTimeOffset agora)
    {
        if (Situacao is not (SituacaoDaAcaoComercial.Preparada or SituacaoDaAcaoComercial.EmProcessamento))
            throw new ExcecaoDeConflito("acao_nao_disponivel_para_envio", "A acao comercial nao esta disponivel para envio.");

        var destinatario = Destinatarios.SingleOrDefault(x => x.Id == destinatarioId)
            ?? throw new ExcecaoDeRecursoNaoEncontrado("Destinatario da acao nao encontrado.");
        destinatario.ConfirmarEnvio(usuarioId, agora);
        DataAtualizacao = agora;

        if (Situacao == SituacaoDaAcaoComercial.Preparada)
        {
            Situacao = SituacaoDaAcaoComercial.EmProcessamento;
            DataInicioProcessamento = agora;
        }

        RecalcularConclusao(agora);
        return destinatario;
    }

    public void RecalcularConclusao(DateTimeOffset agora)
    {
        if (Situacao != SituacaoDaAcaoComercial.EmProcessamento || Destinatarios.Count == 0) return;
        if (Destinatarios.Any(x => x.SituacaoEnvio != SituacaoDoEnvio.Enviado)) return;
        Situacao = SituacaoDaAcaoComercial.Concluida;
        DataAtualizacao = agora;
    }
}

public sealed record DestinatarioPreparado(Guid ClienteId, string NomeCliente, string Destino, string ConteudoPreVisualizacao);

public sealed class DestinatarioDaAcao
{
    private DestinatarioDaAcao() { }
    internal DestinatarioDaAcao(Guid tenantId, Guid acaoId, Guid clienteId, string nome, string destino, string conteudo)
    { Id = Guid.NewGuid(); TenantId = tenantId; AcaoComercialId = acaoId; ClienteId = clienteId; NomeClienteSnapshot = nome; DestinoSnapshot = destino; ConteudoPreVisualizacaoSnapshot = conteudo; SituacaoEnvio = SituacaoDoEnvio.Pendente; }
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid AcaoComercialId { get; private set; }
    public Guid ClienteId { get; private set; }
    public string NomeClienteSnapshot { get; private set; } = string.Empty;
    public string DestinoSnapshot { get; private set; } = string.Empty;
    public string ConteudoPreVisualizacaoSnapshot { get; private set; } = string.Empty;
    public SituacaoDoEnvio SituacaoEnvio { get; private set; }
    public DateTimeOffset? DataEnvioConfirmado { get; private set; }
    public string? UsuarioEnvioConfirmadoId { get; private set; }
    public ResultadoComercial ResultadoComercial { get; private set; } = ResultadoComercial.NaoInformado;
    public decimal? ValorConvertido { get; private set; }
    public DateTimeOffset? DataResultadoComercial { get; private set; }
    public string? UsuarioResultadoId { get; private set; }
    public uint Versao { get; private set; }
    internal void ConfirmarEnvio(string usuarioId, DateTimeOffset agora)
    {
        if (SituacaoEnvio != SituacaoDoEnvio.Pendente)
            throw new ExcecaoDeConflito("destinatario_ja_confirmado", "O envio deste destinatario ja foi confirmado.");
        if (string.IsNullOrWhiteSpace(usuarioId))
            throw new ExcecaoDeRegraDeNegocio("usuario_invalido", "O usuario que confirmou o envio e obrigatorio.");
        SituacaoEnvio = SituacaoDoEnvio.Enviado;
        DataEnvioConfirmado = agora;
        UsuarioEnvioConfirmadoId = usuarioId;
    }
    public void RegistrarResultado(ResultadoComercial resultado, decimal? valorConvertido, string usuarioId, DateTimeOffset agora)
    {
        if (SituacaoEnvio != SituacaoDoEnvio.Enviado) throw new ExcecaoDeConflito("envio_nao_confirmado", "Confirme o envio da mensagem antes de registrar o resultado comercial.");
        if (resultado == ResultadoComercial.NaoInformado) throw new ExcecaoDeRegraDeNegocio("resultado_invalido", "Informe um resultado comercial.");
        if (resultado != ResultadoComercial.Convertido && valorConvertido is not null) throw new ExcecaoDeRegraDeNegocio("valor_invalido", "O valor somente pode ser informado para resultado convertido.");
        if (valorConvertido < 0) throw new ExcecaoDeRegraDeNegocio("valor_invalido", "O valor convertido nao pode ser negativo.");
        ResultadoComercial = resultado; ValorConvertido = valorConvertido; UsuarioResultadoId = usuarioId; DataResultadoComercial = agora;
    }
}
