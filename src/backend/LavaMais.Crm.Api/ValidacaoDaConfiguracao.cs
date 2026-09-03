using LavaMais.Crm.BlocosDeConstrucao.Infraestrutura.BancoDeDados;
using LavaMais.Crm.Modulos.Identidade.Aplicacao;

internal static class ValidacaoDaConfiguracao
{
    public static void Validar(IConfiguration configuracao, IHostEnvironment ambiente)
    {
        if (!ambiente.IsProduction() && !ambiente.IsEnvironment("Homologacao"))
            return;

        _ = ConfiguracaoPostgres.ObterStringDeConexao(configuracao);

        var hosts = configuracao["AllowedHosts"];
        if (string.IsNullOrWhiteSpace(hosts) || hosts == "*")
            throw new InvalidOperationException("AllowedHosts deve listar os hosts autorizados fora de desenvolvimento.");

        if (!configuracao.GetValue("IdentidadeLocal:Habilitada", true))
            return;

        var opcoes = configuracao.GetSection("IdentidadeLocal").Get<OpcoesDeIdentidadeLocal>()
            ?? throw new InvalidOperationException("IdentidadeLocal deve ser configurada por secret store ou variaveis de ambiente.");
        if (opcoes.TenantId == Guid.Empty || string.IsNullOrWhiteSpace(opcoes.NomeTenant))
            throw new InvalidOperationException("TenantId e NomeTenant da identidade local sao obrigatorios.");
        if (opcoes.UsuariosIniciais.Count == 0)
            throw new InvalidOperationException("UsuariosIniciais deve conter ao menos o administrador inicial.");
        if (opcoes.UsuariosIniciais.Any(usuario =>
                string.IsNullOrWhiteSpace(usuario.Nome)
                || string.IsNullOrWhiteSpace(usuario.Telefone)
                || usuario.Telefone.Any(caractere => !char.IsDigit(caractere))
                || usuario.Papel is not ("Administrador" or "Gerente" or "Operador")))
            throw new InvalidOperationException("UsuariosIniciais possui entrada invalida.");
        if (!opcoes.UsuariosIniciais.Any(usuario => usuario.Papel == "Administrador"))
            throw new InvalidOperationException("UsuariosIniciais deve conter um Administrador.");
    }
}
