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
                .Select(referencia => new
                {
                    Projeto = projeto,
                    Destino = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(projeto)!, (string)referencia.Attribute("Include")!))
                }))
            .Where(referencia => referencia.Destino.Contains($"{Path.DirectorySeparatorChar}Modulos{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase))
            .Where(referencia => !(referencia.Projeto.Contains($"Modulos{Path.DirectorySeparatorChar}Importacoes", StringComparison.OrdinalIgnoreCase)
                && referencia.Destino.Contains($"Modulos{Path.DirectorySeparatorChar}Clientes", StringComparison.OrdinalIgnoreCase)))
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
