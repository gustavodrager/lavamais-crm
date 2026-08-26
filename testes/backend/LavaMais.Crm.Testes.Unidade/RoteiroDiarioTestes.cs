using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.Modulos.Roteiros.Dominio;

namespace LavaMais.Crm.Testes.Unidade;
public sealed class RoteiroDiarioTestes
{
    [Fact]
    public void Deve_ordenar_publicar_e_finalizar_um_roteiro()
    {
        var agora = DateTimeOffset.Parse("2026-08-25T12:00:00Z"); var roteiro = RoteiroDiario.Criar(Guid.NewGuid(), new DateOnly(2026, 8, 25), "Carlos", agora);
        var primeira = roteiro.Adicionar(Guid.NewGuid(), "Ana", "5513999999999", "Rua A, 10", TipoDaParada.Entrega, "Manha", null, agora);
        var segunda = roteiro.Adicionar(Guid.NewGuid(), "Bia", "5513988888888", "Rua B, 20", TipoDaParada.Coleta, "Tarde", null, agora);
        roteiro.Reordenar([segunda.Id, primeira.Id], agora); roteiro.Publicar(agora); segunda.Iniciar(agora); segunda.Concluir(agora); roteiro.AtualizarSituacao(agora); primeira.NaoRealizar("Cliente ausente", agora); roteiro.AtualizarSituacao(agora);
        Assert.Equal(1, segunda.Ordem); Assert.Equal(SituacaoDoRoteiro.Finalizado, roteiro.Situacao);
    }
    [Fact]
    public void Nao_deve_publicar_roteiro_vazio() { var roteiro = RoteiroDiario.Criar(Guid.NewGuid(), new DateOnly(2026, 8, 25), "Carlos", DateTimeOffset.UtcNow); Assert.Throws<ExcecaoDeRegraDeNegocio>(() => roteiro.Publicar(DateTimeOffset.UtcNow)); }

    [Fact]
    public void Deve_adiar_parada_pendente_sem_encerrar_roteiro()
    {
        var agora = DateTimeOffset.Parse("2026-08-25T12:00:00Z"); var roteiro = RoteiroDiario.Criar(Guid.NewGuid(), new DateOnly(2026, 8, 25), "Carlos", agora);
        var primeira = roteiro.Adicionar(Guid.NewGuid(), "Ana", "5513999999999", "Rua A, 10", TipoDaParada.Coleta, "Manha", null, agora);
        var segunda = roteiro.Adicionar(Guid.NewGuid(), "Bia", "5513988888888", "Rua B, 20", TipoDaParada.Entrega, "Tarde", null, agora);
        roteiro.Publicar(agora); roteiro.Adiar(primeira.Id, agora);
        Assert.Equal(SituacaoDoRoteiro.Publicado, roteiro.Situacao); Assert.Equal(1, segunda.Ordem); Assert.Equal(2, primeira.Ordem);
    }

    [Fact]
    public void Nao_deve_reordenar_parada_ja_executada()
    {
        var agora = DateTimeOffset.Parse("2026-08-25T12:00:00Z"); var roteiro = RoteiroDiario.Criar(Guid.NewGuid(), new DateOnly(2026, 8, 25), "Carlos", agora);
        var primeira = roteiro.Adicionar(Guid.NewGuid(), "Ana", "5513999999999", "Rua A, 10", TipoDaParada.Coleta, "Manha", null, agora);
        var segunda = roteiro.Adicionar(Guid.NewGuid(), "Bia", "5513988888888", "Rua B, 20", TipoDaParada.Entrega, "Tarde", null, agora);
        roteiro.Publicar(agora); primeira.Iniciar(agora); primeira.Concluir(agora); roteiro.AtualizarSituacao(agora);
        Assert.Throws<ExcecaoDeRegraDeNegocio>(() => roteiro.Reordenar([segunda.Id, primeira.Id], agora));
    }
}
