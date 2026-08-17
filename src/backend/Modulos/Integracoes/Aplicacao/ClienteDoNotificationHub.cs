using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using LavaMais.Crm.BlocosDeConstrucao.Aplicacao.Integracoes;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class OpcoesDoNotificationHub { public string BaseUrl { get; set; } = ""; public string ApiKey { get; set; } = ""; public string Source { get; set; } = "lavamais-crm"; }
public sealed class ClienteDoNotificationHub(HttpClient http, IOptions<OpcoesDoNotificationHub> opcoes)
{
    private readonly OpcoesDoNotificationHub opcoes = opcoes.Value;
    public async Task<string> Criar(SolicitacaoNotificationHub solicitacao, CancellationToken ct)
    {
        using var req = new HttpRequestMessage(HttpMethod.Post, "/api/v1/notifications") { Content = JsonContent.Create(solicitacao) }; req.Headers.Add("X-Api-Key", opcoes.ApiKey);
        using var resp = await http.SendAsync(req, ct); resp.EnsureSuccessStatusCode(); using var json = JsonDocument.Parse(await resp.Content.ReadAsStreamAsync(ct));
        return json.RootElement.TryGetProperty("id", out var id) ? id.GetString()! : throw new InvalidOperationException("O Notification Hub nao retornou o identificador.");
    }
    public async Task<EstadoDaNotificacao> Obter(string id, CancellationToken ct)
    { using var req = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/notifications/{id}"); req.Headers.Add("X-Api-Key", opcoes.ApiKey); using var resp = await http.SendAsync(req, ct); resp.EnsureSuccessStatusCode(); return (await resp.Content.ReadFromJsonAsync<EstadoDaNotificacao>(cancellationToken: ct))!; }
}
public sealed record EstadoDaNotificacao(string Status, string? FailureCode);
