using System.Xml.Linq;

namespace LavaMais.Crm.Testes.Arquitetura;

public sealed class DependenciasDosModulosTestes
{
    [Fact]
    public void Modulos_nao_devem_referenciar_outros_modulos()
    {
        var raiz = EncontrarRaizDoRepositorio();
        var projetos = Directory.GetFiles(
            Path.Combine(raiz, "src", "backend", "Modulos"),
            "*.csproj",
            SearchOption.AllDirectories);

        var referenciasInvalidas = projetos
            .SelectMany(projeto => XDocument.Load(projeto)
                .Descendants("ProjectReference")
                .Select(referencia => new { Projeto = projeto, Caminho = (string?)referencia.Attribute("Include") }))
            .Where(referencia => referencia.Caminho?.Contains("Modulos", StringComparison.OrdinalIgnoreCase) == true)
            .ToArray();

        Assert.Empty(referenciasInvalidas);
    }

    private static string EncontrarRaizDoRepositorio()
    {
        var diretorio = new DirectoryInfo(AppContext.BaseDirectory);
        while (diretorio is not null && !File.Exists(Path.Combine(diretorio.FullName, "LavaMais.Crm.slnx")))
        {
            diretorio = diretorio.Parent;
        }

        return diretorio?.FullName ?? throw new InvalidOperationException("Raiz do repositorio nao encontrada.");
    }
}
