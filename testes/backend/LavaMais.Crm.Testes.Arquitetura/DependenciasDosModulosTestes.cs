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
            .Where(referencia => !Permitida(referencia.Projeto, referencia.Destino))
            .ToArray();

        Assert.Empty(referenciasInvalidas);
    }

    private static bool Permitida(string projeto, string destino)
    {
        var separador = Path.DirectorySeparatorChar;
        bool Modulo(string caminho, string modulo) => caminho.Contains($"Modulos{separador}{modulo}", StringComparison.OrdinalIgnoreCase);
        return Modulo(projeto, "Importacoes") && Modulo(destino, "Clientes")
            || Modulo(projeto, "Segmentacao") && Modulo(destino, "Clientes")
            || Modulo(projeto, "AcoesComerciais") && (Modulo(destino, "Catalogo") || Modulo(destino, "Segmentacao") || Modulo(destino, "ModelosDeMensagem"));
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
