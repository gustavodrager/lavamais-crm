using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.MovimentacoesComerciais;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Roteiros;
using LavaMais.Crm.Modulos.Clientes.Dominio;
using LavaMais.Crm.Modulos.Clientes.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace LavaMais.Crm.Modulos.Clientes.Aplicacao;

public sealed class GerenciadorDeClientes(ContextoDeClientes banco, IContextoDoUsuario contexto, TimeProvider relogio)
{
    public async Task<(List<Cliente> Itens, int Total)> Listar(string? busca, int pagina, int tamanho, CancellationToken ct)
    {
        pagina = Math.Max(1, pagina); tamanho = Math.Clamp(tamanho, 1, 100);
        var consulta = banco.Clientes.AsNoTracking().Include(x => x.Contatos).Include(x => x.Endereco).Include(x => x.Permissoes).Include(x => x.Etiquetas).AsQueryable();
        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim(); var telefone = new string(termo.Where(char.IsDigit).ToArray());
            consulta = consulta.Where(x => EF.Functions.ILike(x.Nome, $"%{termo}%") || (x.Endereco != null && EF.Functions.ILike(x.Endereco.Bairro!, $"%{termo}%")) || (telefone != "" && x.Contatos.Any(c => c.ValorNormalizado.Contains(telefone))));
        }
        var total = await consulta.CountAsync(ct);
        var itens = await consulta.OrderBy(x => x.Nome).Skip((pagina - 1) * tamanho).Take(tamanho).ToListAsync(ct);
        return (itens, total);
    }

    public Task<Cliente?> Obter(Guid id, CancellationToken ct) => banco.Clientes.AsNoTracking().Include(x => x.Contatos).Include(x => x.Endereco).Include(x => x.Permissoes).Include(x => x.Etiquetas).SingleOrDefaultAsync(x => x.Id == id, ct);

    public async Task<Cliente> Criar(DadosDoCliente dados, CancellationToken ct)
    {
        await ValidarEtiquetas(dados.EtiquetaIds, ct);
        var cliente = Cliente.Criar(contexto.TenantId, dados.Nome, dados.Whatsapp, relogio.GetUtcNow());
        Aplicar(cliente, dados);
        AplicarDadosDeOrigem(cliente, dados);
        await ValidarCodigoExterno(cliente.CodigoExterno, null, ct);
        if (await WhatsappExiste(cliente, null, ct)) throw new ExcecaoDeConflito("whatsapp_duplicado", "Ja existe cliente ativo com este WhatsApp no tenant.");
        banco.Add(cliente); await banco.SaveChangesAsync(ct); return cliente;
    }

    public async Task Atualizar(Guid id, DadosDoCliente dados, CancellationToken ct)
    {
        var cliente = await banco.Clientes.Include(x => x.Contatos).Include(x => x.Permissoes).Include(x => x.Etiquetas).Include(x => x.Endereco).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Cliente nao encontrado.");
        await ValidarEtiquetas(dados.EtiquetaIds, ct); Aplicar(cliente, dados);
        AplicarDadosDeOrigem(cliente, dados);
        await ValidarCodigoExterno(cliente.CodigoExterno, id, ct);
        if (await WhatsappExiste(cliente, id, ct)) throw new ExcecaoDeConflito("whatsapp_duplicado", "Ja existe cliente ativo com este WhatsApp no tenant.");
        await banco.SaveChangesAsync(ct);
    }

    public async Task<ResultadoDaImportacaoDeCliente> ImportarOuAtualizar(DadosDoCliente dados, CancellationToken ct)
    {
        await ValidarEtiquetas(dados.EtiquetaIds, ct);
        var whatsapp = NormalizadorDeWhatsapp.Normalizar(dados.Whatsapp);
        var codigoExterno = string.IsNullOrWhiteSpace(dados.CodigoExterno) ? null : dados.CodigoExterno.Trim();
        var candidatos = await banco.Clientes.Include(x => x.Contatos).Include(x => x.Permissoes).Include(x => x.Etiquetas).Include(x => x.Endereco)
            .Where(x => (codigoExterno != null && x.CodigoExterno == codigoExterno) || x.Contatos.Any(c => c.Tipo == TipoDeContato.Whatsapp && c.ValorNormalizado == whatsapp))
            .Take(2).ToListAsync(ct);
        if (candidatos.Count > 1) throw new ExcecaoDeConflito("dados_origem_ambiguos", "O codigo externo e o WhatsApp identificam clientes diferentes.");
        var cliente = candidatos.SingleOrDefault();
        if (cliente is null)
            return new(await Criar(dados, ct), false);

        Aplicar(cliente, dados);
        AplicarDadosDeOrigem(cliente, dados);
        await ValidarCodigoExterno(cliente.CodigoExterno, cliente.Id, ct);
        if (await WhatsappExiste(cliente, cliente.Id, ct)) throw new ExcecaoDeConflito("whatsapp_duplicado", "Ja existe outro cliente ativo com este WhatsApp no tenant.");
        await banco.SaveChangesAsync(ct);
        return new(cliente, true);
    }

    public async Task<ResultadoDaImportacaoDeCliente> ImportarDadosBasicosDaOrigem(
        DadosBasicosDoClienteNaOrigem dados,
        CancellationToken ct)
    {
        var codigoExterno = string.IsNullOrWhiteSpace(dados.CodigoExterno)
            ? throw new ExcecaoDeRegraDeNegocio("codigo_externo_obrigatorio", "O codigo externo e obrigatorio para a carga controlada.")
            : dados.CodigoExterno.Trim();
        var whatsapp = NormalizadorDeWhatsapp.Normalizar(dados.Whatsapp);
        var cliente = await banco.Clientes
            .Include(x => x.Contatos)
            .SingleOrDefaultAsync(x => x.CodigoExterno == codigoExterno, ct);

        if (cliente is null)
        {
            var telefoneJaVinculado = await banco.Clientes
                .Where(x => x.Situacao == SituacaoDoCliente.Ativo)
                .AnyAsync(x => x.Contatos.Any(c => c.Tipo == TipoDeContato.Whatsapp && c.ValorNormalizado == whatsapp), ct);
            if (telefoneJaVinculado)
                throw new ExcecaoDeConflito("whatsapp_ja_vinculado", "O WhatsApp ja pertence a outro cliente e exige conciliacao manual.");

            var criado = await Criar(new DadosDoCliente(
                dados.Nome,
                dados.Whatsapp,
                null,
                null,
                null,
                null,
                false,
                null,
                [],
                codigoExterno,
                dados.DataCadastroOrigem), ct);
            return new(criado, false);
        }

        if (cliente.Situacao != SituacaoDoCliente.Ativo)
            throw new ExcecaoDeConflito("cliente_inativo", "O cliente da origem esta inativo no CRM e exige conciliacao manual.");

        cliente.AtualizarDadosBasicosDaOrigem(
            dados.Nome,
            dados.Whatsapp,
            codigoExterno,
            dados.DataCadastroOrigem,
            relogio.GetUtcNow());
        if (await WhatsappExiste(cliente, cliente.Id, ct))
            throw new ExcecaoDeConflito("whatsapp_duplicado", "Ja existe outro cliente ativo com este WhatsApp no tenant.");
        await banco.SaveChangesAsync(ct);
        return new(cliente, true);
    }

    public void DescartarAlteracoesPendentes() => banco.ChangeTracker.Clear();

    public async Task Inativar(Guid id, CancellationToken ct)
    {
        var cliente = await banco.Clientes.Include(x => x.Contatos).SingleOrDefaultAsync(x => x.Id == id, ct) ?? throw new ExcecaoDeRecursoNaoEncontrado("Cliente nao encontrado.");
        cliente.Inativar(relogio.GetUtcNow()); await banco.SaveChangesAsync(ct);
    }

    public async Task<Etiqueta> CriarEtiqueta(string nome, CancellationToken ct)
    {
        var etiqueta = Etiqueta.Criar(contexto.TenantId, nome, relogio.GetUtcNow());
        if (await banco.Etiquetas.AnyAsync(x => x.NomeNormalizado == etiqueta.NomeNormalizado, ct)) throw new ExcecaoDeConflito("etiqueta_duplicada", "A etiqueta ja existe.");
        banco.Add(etiqueta); await banco.SaveChangesAsync(ct); return etiqueta;
    }

    public Task<List<Etiqueta>> ListarEtiquetas(CancellationToken ct) => banco.Etiquetas.AsNoTracking().OrderBy(x => x.Nome).ToListAsync(ct);

    private void Aplicar(Cliente cliente, DadosDoCliente d)
    {
        var clienteJaRastreado = banco.Entry(cliente).State != EntityState.Detached;
        var enderecoExistia = cliente.Endereco is not null;
        var contatosExistentes = cliente.Contatos.Select(x => x.Id).ToHashSet();
        var permissoesExistentes = cliente.Permissoes.Select(x => x.Id).ToHashSet();
        cliente.Atualizar(d.Nome, d.Whatsapp, d.NomeFantasia, d.Tipo, d.Email, d.DataNascimento, d.PermiteMarketingWhatsapp,
            d.Endereco is null ? null : new EnderecoDoCliente(contexto.TenantId, d.Endereco.Logradouro, d.Endereco.Numero, d.Endereco.Complemento, d.Endereco.Bairro, d.Endereco.Cidade, d.Endereco.Estado, d.Endereco.Cep), d.EtiquetaIds, relogio.GetUtcNow());
        if (clienteJaRastreado)
        {
            if (!enderecoExistia && cliente.Endereco is not null)
                banco.Entry(cliente.Endereco).State = EntityState.Added;
            foreach (var contato in cliente.Contatos.Where(x => !contatosExistentes.Contains(x.Id)))
                banco.Entry(contato).State = EntityState.Added;
            foreach (var permissao in cliente.Permissoes.Where(x => !permissoesExistentes.Contains(x.Id)))
                banco.Entry(permissao).State = EntityState.Added;
        }
    }

    private void AplicarDadosDeOrigem(Cliente cliente, DadosDoCliente dados)
    {
        if (dados.CodigoExterno is not null || dados.DataCadastroOrigem is not null)
            cliente.DefinirDadosDeOrigem(dados.CodigoExterno, dados.DataCadastroOrigem, relogio.GetUtcNow());
    }

    private async Task ValidarCodigoExterno(string? codigoExterno, Guid? ignorarId, CancellationToken ct)
    {
        if (codigoExterno is not null && await banco.Clientes.AnyAsync(x => x.CodigoExterno == codigoExterno && x.Id != ignorarId, ct))
            throw new ExcecaoDeConflito("codigo_externo_duplicado", "Ja existe cliente com este codigo externo no tenant.");
    }

    private async Task<bool> WhatsappExiste(Cliente cliente, Guid? ignorarId, CancellationToken ct)
    {
        var whatsapp = cliente.Contatos.Single(x => x.Tipo == TipoDeContato.Whatsapp).ValorNormalizado;
        return await banco.Clientes.Where(x => x.Situacao == SituacaoDoCliente.Ativo && x.Id != ignorarId).AnyAsync(x => x.Contatos.Any(c => c.Tipo == TipoDeContato.Whatsapp && c.ValorNormalizado == whatsapp), ct);
    }

    private async Task ValidarEtiquetas(IEnumerable<Guid> ids, CancellationToken ct)
    {
        var distintos = ids.Distinct().ToArray();
        if (await banco.Etiquetas.CountAsync(x => distintos.Contains(x.Id), ct) != distintos.Length) throw new ExcecaoDeRegraDeNegocio("etiqueta_invalida", "Uma ou mais etiquetas nao pertencem ao tenant.");
    }
}

public sealed record DadosDoCliente(string Nome, string Whatsapp, string? NomeFantasia, string? Tipo, string? Email, DateOnly? DataNascimento, bool PermiteMarketingWhatsapp, DadosDoEndereco? Endereco, IReadOnlyCollection<Guid> EtiquetaIds, string? CodigoExterno = null, DateTimeOffset? DataCadastroOrigem = null);
public sealed record DadosBasicosDoClienteNaOrigem(string CodigoExterno, string Nome, string Whatsapp, DateTimeOffset? DataCadastroOrigem = null);
public sealed record DadosDoEndereco(string? Logradouro, string? Numero, string? Complemento, string? Bairro, string? Cidade, string? Estado, string? Cep);
public sealed record ResultadoDaImportacaoDeCliente(Cliente Cliente, bool Atualizado);

public sealed class ConsultaDeClientesParaSegmentacao(ContextoDeClientes banco)
{
    public async Task<List<ClienteParaSegmentacao>> Consultar(FiltroDeClientesParaSegmentacao filtro, CancellationToken ct, DbTransaction? transacao = null)
    {
        if (transacao is not null) { banco.Database.SetDbConnection(transacao.Connection!, false); await banco.Database.UseTransactionAsync(transacao, ct); }
        var consulta = banco.Clientes.AsNoTracking().AsQueryable();
        if (filtro.ClienteIds.Count > 0) consulta = consulta.Where(x => filtro.ClienteIds.Contains(x.Id));
        if (!string.IsNullOrWhiteSpace(filtro.Tipo)) consulta = consulta.Where(x => x.Tipo == filtro.Tipo);
        if (filtro.Cidades.Count > 0) consulta = consulta.Where(x => x.Endereco != null && filtro.Cidades.Contains(x.Endereco.Cidade!));
        if (filtro.Bairros.Count > 0) consulta = consulta.Where(x => x.Endereco != null && filtro.Bairros.Contains(x.Endereco.Bairro!));
        foreach (var etiquetaId in filtro.EtiquetaIds) consulta = consulta.Where(x => x.Etiquetas.Any(e => e.EtiquetaId == etiquetaId));
        if (filtro.CadastradoApartirDe is not null) consulta = consulta.Where(x => x.DataCriacao >= filtro.CadastradoApartirDe);
        if (filtro.DataNascimentoDe is not null) consulta = consulta.Where(x => x.DataNascimento >= filtro.DataNascimentoDe);
        if (filtro.DataNascimentoAte is not null) consulta = consulta.Where(x => x.DataNascimento <= filtro.DataNascimentoAte);
        return await consulta.OrderBy(x => x.Nome).Select(x => new ClienteParaSegmentacao(
            x.Id, x.Nome, x.Situacao == SituacaoDoCliente.Ativo, x.DataCriacao,
            x.Contatos.Where(c => c.Tipo == TipoDeContato.Whatsapp).Select(c => c.ValorNormalizado).FirstOrDefault(),
            x.Contatos.Any(c => c.Tipo == TipoDeContato.Whatsapp && c.Situacao == SituacaoDoContato.Ativo),
            x.Permissoes.Any(p => p.Canal == TipoDeContato.Whatsapp && p.Finalidade == "Marketing" && p.Permitida))).ToListAsync(ct);
    }
}

public sealed record FiltroDeClientesParaSegmentacao(IReadOnlyCollection<Guid> ClienteIds, string? Tipo, IReadOnlyCollection<string> Cidades, IReadOnlyCollection<string> Bairros, IReadOnlyCollection<Guid> EtiquetaIds, DateTimeOffset? CadastradoApartirDe, DateOnly? DataNascimentoDe, DateOnly? DataNascimentoAte);
public sealed record ClienteParaSegmentacao(Guid Id, string Nome, bool Ativo, DateTimeOffset DataCriacao, string? Whatsapp, bool ContatoWhatsappAtivo, bool PermiteMarketingWhatsapp);

public sealed class ConsultaDeClienteParaMovimentacao(ContextoDeClientes banco) : IConsultaDeClienteParaMovimentacao
{
    public Task<ClienteDisponivelParaMovimentacao?> ObterAtivo(Guid id, CancellationToken ct) =>
        banco.Clientes.AsNoTracking().Where(x => x.Id == id && x.Situacao == SituacaoDoCliente.Ativo)
            .Select(x => new ClienteDisponivelParaMovimentacao(x.Id, x.Nome)).SingleOrDefaultAsync(ct);
}

public sealed class ConsultaDeClienteParaRoteiro(ContextoDeClientes banco) : IConsultaDeClienteParaRoteiro
{
    public async Task<ClienteDisponivelParaRoteiro?> ObterAtivo(Guid id, CancellationToken ct)
    {
        var cliente = await banco.Clientes.AsNoTracking().Include(x => x.Contatos).Include(x => x.Endereco).SingleOrDefaultAsync(x => x.Id == id && x.Situacao == SituacaoDoCliente.Ativo, ct);
        if (cliente?.Endereco is null) return null;
        if (string.IsNullOrWhiteSpace(cliente.Endereco.Logradouro) || string.IsNullOrWhiteSpace(cliente.Endereco.Numero) || string.IsNullOrWhiteSpace(cliente.Endereco.Cidade)) return null;
        var partes = new[] { cliente.Endereco.Logradouro, cliente.Endereco.Numero, cliente.Endereco.Complemento, cliente.Endereco.Bairro, cliente.Endereco.Cidade, cliente.Endereco.Estado, cliente.Endereco.Cep }.Where(x => !string.IsNullOrWhiteSpace(x));
        var endereco = string.Join(", ", partes);
        if (string.IsNullOrWhiteSpace(endereco)) return null;
        var whatsapp = cliente.Contatos.Single(x => x.Tipo == TipoDeContato.Whatsapp).ValorNormalizado;
        return new(cliente.Id, cliente.Nome, whatsapp, endereco);
    }
}
