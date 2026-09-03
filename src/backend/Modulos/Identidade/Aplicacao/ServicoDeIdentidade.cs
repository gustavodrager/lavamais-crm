using System.Security.Cryptography;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Auditoria;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Identidade;
using LavaMais.Crm.Modulos.Identidade.Dominio;
using LavaMais.Crm.Modulos.Identidade.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Modulos.Identidade.Aplicacao;

public sealed class OpcoesDeIdentidadeLocal
{
    public bool Habilitada { get; set; } = true;
    public string TelefonePermitido { get; set; } = string.Empty;
    public Guid TenantId { get; set; }
    public string NomeTenant { get; set; } = string.Empty;
    public string NomeUsuario { get; set; } = string.Empty;
    public List<UsuarioInicialDeIdentidade> UsuariosIniciais { get; set; } = [];
}
public sealed class UsuarioInicialDeIdentidade
{
    public string Telefone { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public string Papel { get; set; } = "Administrador";
}
public sealed record ResultadoDaSessao(string Token, DateTimeOffset ExpiraEm, string Nome, string NomeTenant, string Papel);

public sealed class ServicoDeIdentidade(ContextoDeIdentidade banco, IAutorizacaoDaIdentidade autorizacao, IOptions<OpcoesDeIdentidadeLocal> opcoes, TimeProvider relogio, IRegistradorDeAuditoriaDeIdentidade auditoria)
{
    public async Task<bool> PrimeiroAcessoDisponivel(CancellationToken ct)
    {
        var telefonesAtivados = await banco.Usuarios.AsNoTracking().Select(usuario => usuario.Telefone).ToListAsync(ct);
        return UsuariosPermitidos().Any(usuario => !telefonesAtivados.Contains(Normalizar(usuario.Telefone)));
    }

    public async Task<ResultadoDaSessao> PrimeiroAcesso(string telefone, string senha, CancellationToken ct)
    {
        var normalizado = Normalizar(telefone); var usuarioInicial = ObterUsuarioPermitido(normalizado); ValidarSenha(senha);
        if (await banco.Usuarios.AnyAsync(usuario => usuario.Telefone == normalizado, ct))
            throw new ExcecaoDeRegraDeNegocio("primeiro_acesso_indisponivel", "A senha deste usuario ja foi definida.");
        var agora = relogio.GetUtcNow();
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var usuario = UsuarioDeIdentidade.Ativar(opcoes.Value.TenantId, normalizado, usuarioInicial.Nome, usuarioInicial.Papel, ProtegerSenha(senha), agora);
        banco.Add(usuario);
        await banco.SaveChangesAsync(ct);
        await autorizacao.ProvisionarUsuarioInicial(usuario.TenantId, usuario.Id.ToString(), usuarioInicial.Papel, transacao.GetDbTransaction(), agora, ct);
        var resultado = await CriarSessao(usuario, agora, ct);
        await auditoria.Registrar(EventoDeAuditoriaDeIdentidade.UsuarioInicialAtivado, usuario.TenantId, usuario.Id, transacao.GetDbTransaction(), agora, ct);
        await auditoria.Registrar(EventoDeAuditoriaDeIdentidade.SessaoCriada, usuario.TenantId, usuario.Id, transacao.GetDbTransaction(), agora, ct);
        await transacao.CommitAsync(ct);
        return resultado;
    }
    public async Task<ResultadoDaSessao> Entrar(string telefone, string senha, CancellationToken ct)
    {
        var usuario = await banco.Usuarios.SingleOrDefaultAsync(x => x.Telefone == Normalizar(telefone), ct);
        if (usuario is null || !usuario.Ativo || !VerificarSenha(senha, usuario.SenhaProtegida)) throw new ExcecaoDeRegraDeNegocio("credenciais_invalidas", "Telefone ou senha invalidos.");
        var agora = relogio.GetUtcNow();
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        var resultado = await CriarSessao(usuario, agora, ct);
        await auditoria.Registrar(EventoDeAuditoriaDeIdentidade.SessaoCriada, usuario.TenantId, usuario.Id, transacao.GetDbTransaction(), agora, ct);
        await transacao.CommitAsync(ct);
        return resultado;
    }
    public async Task Revogar(string token, CancellationToken ct)
    {
        var sessao = await banco.Sessoes.SingleOrDefaultAsync(x => x.TokenHash == Hash(token), ct);
        if (sessao is null) return;
        var agora = relogio.GetUtcNow();
        await using var transacao = await banco.Database.BeginTransactionAsync(ct);
        sessao.Revogar(agora);
        await banco.SaveChangesAsync(ct);
        await auditoria.Registrar(EventoDeAuditoriaDeIdentidade.SessaoRevogada, opcoes.Value.TenantId, sessao.UsuarioId, transacao.GetDbTransaction(), agora, ct);
        await transacao.CommitAsync(ct);
    }
    private async Task<ResultadoDaSessao> CriarSessao(UsuarioDeIdentidade usuario, DateTimeOffset agora, CancellationToken ct)
    {
        var papel = await autorizacao.ObterPapelAtivo(usuario.TenantId, usuario.Id.ToString(), ct)
            ?? throw new ExcecaoDeRegraDeNegocio("usuario_sem_autorizacao", "O usuario nao possui autorizacao ativa no CRM.");
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var expira = agora.AddHours(12);
        banco.Add(new SessaoDeIdentidade(usuario.Id, Hash(token), agora, expira));
        await banco.SaveChangesAsync(ct);
        return new(token, expira, usuario.Nome, opcoes.Value.NomeTenant, papel);
    }
    private UsuarioInicialDeIdentidade ObterUsuarioPermitido(string telefone)
    {
        var usuarios = UsuariosPermitidos();
        var usuario = usuarios.SingleOrDefault(item => Normalizar(item.Telefone) == telefone);
        return usuario ?? throw new ExcecaoDeRegraDeNegocio("telefone_nao_permitido", "Este telefone nao possui acesso ao CRM.");
    }

    private IReadOnlyList<UsuarioInicialDeIdentidade> UsuariosPermitidos()
    {
        var usuarios = opcoes.Value.UsuariosIniciais.Where(usuario => !string.IsNullOrWhiteSpace(usuario.Telefone)).ToList();
        if (usuarios.Count == 0)
            usuarios.Add(new UsuarioInicialDeIdentidade { Telefone = opcoes.Value.TelefonePermitido, Nome = opcoes.Value.NomeUsuario, Papel = "Administrador" });

        var duplicado = usuarios.GroupBy(usuario => Normalizar(usuario.Telefone)).FirstOrDefault(grupo => grupo.Count() > 1);
        if (duplicado is not null) throw new ExcecaoDeRegraDeNegocio("telefone_duplicado", "A configuracao possui usuarios iniciais com telefone duplicado.");
        return usuarios;
    }

    private static string Normalizar(string valor) => new(valor.Where(char.IsDigit).ToArray());
    private static void ValidarSenha(string senha) { if (senha.Length < 10) throw new ExcecaoDeRegraDeNegocio("senha_fraca", "A senha deve possuir pelo menos 10 caracteres."); }
    private static string ProtegerSenha(string senha) { var salt = RandomNumberGenerator.GetBytes(16); var hash = Rfc2898DeriveBytes.Pbkdf2(senha, salt, 210_000, HashAlgorithmName.SHA256, 32); return $"210000.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}"; }
    private static bool VerificarSenha(string senha, string protegida) { try { var p = protegida.Split('.'); var salt = Convert.FromBase64String(p[1]); var esperado = Convert.FromBase64String(p[2]); var atual = Rfc2898DeriveBytes.Pbkdf2(senha, salt, int.Parse(p[0]), HashAlgorithmName.SHA256, esperado.Length); return CryptographicOperations.FixedTimeEquals(atual, esperado); } catch { return false; } }
    public static string Hash(string token) => Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token)));
}
