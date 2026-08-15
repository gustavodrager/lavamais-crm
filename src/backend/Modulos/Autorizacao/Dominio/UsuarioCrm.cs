using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;

namespace LavaMais.Crm.Modulos.Autorizacao.Dominio;

public sealed class UsuarioCrm
{
    private UsuarioCrm() { }

    private UsuarioCrm(Guid tenantId, string usuarioIdentidadeId, PapelDoCrm papel, DateTimeOffset agora)
    {
        if (tenantId == Guid.Empty) throw new ExcecaoDeRegraDeNegocio("tenant_invalido", "O tenant e obrigatorio.");
        if (string.IsNullOrWhiteSpace(usuarioIdentidadeId)) throw new ExcecaoDeRegraDeNegocio("usuario_invalido", "O identificador do usuario e obrigatorio.");

        Id = Guid.NewGuid();
        TenantId = tenantId;
        UsuarioIdentidadeId = usuarioIdentidadeId.Trim();
        Papel = papel;
        Situacao = SituacaoDoUsuarioCrm.Ativo;
        DataCriacao = agora;
        DataAtualizacao = agora;
    }

    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string UsuarioIdentidadeId { get; private set; } = string.Empty;
    public PapelDoCrm Papel { get; private set; }
    public SituacaoDoUsuarioCrm Situacao { get; private set; }
    public DateTimeOffset DataCriacao { get; private set; }
    public DateTimeOffset DataAtualizacao { get; private set; }
    public uint Versao { get; private set; }

    public static UsuarioCrm Criar(Guid tenantId, string usuarioIdentidadeId, PapelDoCrm papel, DateTimeOffset agora) =>
        new(tenantId, usuarioIdentidadeId, papel, agora);

    public void AlterarPapel(PapelDoCrm papel, DateTimeOffset agora)
    {
        if (Situacao == SituacaoDoUsuarioCrm.Inativo)
            throw new ExcecaoDeRegraDeNegocio("usuario_inativo", "Nao e permitido alterar o papel de um usuario inativo.");

        Papel = papel;
        DataAtualizacao = agora;
    }

    public void Inativar(DateTimeOffset agora)
    {
        Situacao = SituacaoDoUsuarioCrm.Inativo;
        DataAtualizacao = agora;
    }
}
