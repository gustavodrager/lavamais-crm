using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.Modulos.Autorizacao.Dominio;

namespace LavaMais.Crm.Testes.Integracao;

public sealed class UsuarioCrmTestes
{
    [Fact]
    public void Nao_deve_permitir_alterar_papel_de_usuario_inativo()
    {
        var agora = DateTimeOffset.UtcNow;
        var usuario = UsuarioCrm.Criar(Guid.NewGuid(), "usuario", PapelDoCrm.Operador, agora);
        usuario.Inativar(agora);

        var erro = Assert.Throws<ExcecaoDeRegraDeNegocio>(() => usuario.AlterarPapel(PapelDoCrm.Gerente, agora));

        Assert.Equal("usuario_inativo", erro.Codigo);
    }
}
