using System.Security.Cryptography;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao;
using LavaMais.Crm.Modulos.Identidade.Dominio;
using LavaMais.Crm.Modulos.Identidade.Infraestrutura;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Modulos.Identidade.Aplicacao;

public sealed class OpcoesDeIdentidadeLocal
{
    public bool Habilitada { get; set; } = true; public string TelefonePermitido { get; set; } = "11997372540";
    public Guid TenantId { get; set; } public string NomeTenant { get; set; } = "LavaMais"; public string NomeUsuario { get; set; } = "Administrador LavaMais";
}
public sealed record ResultadoDaSessao(string Token, DateTimeOffset ExpiraEm, string Nome, string NomeTenant, string Papel);

public sealed class ServicoDeIdentidade(ContextoDeIdentidade banco, IOptions<OpcoesDeIdentidadeLocal> opcoes, TimeProvider relogio)
{
    public async Task<bool> PrimeiroAcessoDisponivel(CancellationToken ct) => !await banco.Usuarios.AnyAsync(ct);
    public async Task<ResultadoDaSessao> PrimeiroAcesso(string telefone, string senha, CancellationToken ct)
    {
        var normalizado = Normalizar(telefone); ValidarTelefonePermitido(normalizado); ValidarSenha(senha);
        if (await banco.Usuarios.AnyAsync(ct)) throw new ExcecaoDeRegraDeNegocio("primeiro_acesso_indisponivel", "O primeiro acesso ja foi concluido.");
        var agora = relogio.GetUtcNow(); var usuario = UsuarioDeIdentidade.Ativar(opcoes.Value.TenantId, normalizado, opcoes.Value.NomeUsuario, ProtegerSenha(senha), agora);
        banco.Add(usuario); return await CriarSessao(usuario, agora, ct);
    }
    public async Task<ResultadoDaSessao> Entrar(string telefone, string senha, CancellationToken ct)
    {
        var usuario = await banco.Usuarios.SingleOrDefaultAsync(x => x.Telefone == Normalizar(telefone), ct);
        if (usuario is null || !usuario.Ativo || !VerificarSenha(senha, usuario.SenhaProtegida)) throw new ExcecaoDeRegraDeNegocio("credenciais_invalidas", "Telefone ou senha invalidos.");
        return await CriarSessao(usuario, relogio.GetUtcNow(), ct);
    }
    public async Task Revogar(string token, CancellationToken ct) { var sessao = await banco.Sessoes.SingleOrDefaultAsync(x => x.TokenHash == Hash(token), ct); if (sessao is not null) { sessao.Revogar(relogio.GetUtcNow()); await banco.SaveChangesAsync(ct); } }
    private async Task<ResultadoDaSessao> CriarSessao(UsuarioDeIdentidade usuario, DateTimeOffset agora, CancellationToken ct)
    { var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32)); var expira = agora.AddHours(12); banco.Add(new SessaoDeIdentidade(usuario.Id, Hash(token), agora, expira)); await banco.SaveChangesAsync(ct); return new(token, expira, usuario.Nome, opcoes.Value.NomeTenant, usuario.Papel); }
    private void ValidarTelefonePermitido(string telefone) { if (telefone != Normalizar(opcoes.Value.TelefonePermitido)) throw new ExcecaoDeRegraDeNegocio("telefone_nao_permitido", "Este telefone nao possui acesso ao CRM."); }
    private static string Normalizar(string valor) => new(valor.Where(char.IsDigit).ToArray());
    private static void ValidarSenha(string senha) { if (senha.Length < 10) throw new ExcecaoDeRegraDeNegocio("senha_fraca", "A senha deve possuir pelo menos 10 caracteres."); }
    private static string ProtegerSenha(string senha) { var salt = RandomNumberGenerator.GetBytes(16); var hash = Rfc2898DeriveBytes.Pbkdf2(senha, salt, 210_000, HashAlgorithmName.SHA256, 32); return $"210000.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}"; }
    private static bool VerificarSenha(string senha, string protegida) { try { var p = protegida.Split('.'); var salt = Convert.FromBase64String(p[1]); var esperado = Convert.FromBase64String(p[2]); var atual = Rfc2898DeriveBytes.Pbkdf2(senha, salt, int.Parse(p[0]), HashAlgorithmName.SHA256, esperado.Length); return CryptographicOperations.FixedTimeEquals(atual, esperado); } catch { return false; } }
    public static string Hash(string token) => Convert.ToHexString(SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token)));
}
