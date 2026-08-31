using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace LavaMais.Crm.Modulos.Integracoes.Aplicacao;

public sealed class ClienteWhatsMiau(HttpClient http, IOptions<OpcoesDeNotificacoes> opcoes)
{
    private readonly OpcoesDoWhatsMiau opcoes = opcoes.Value.WhatsMiau;

    public async Task<string> EnviarTexto(string telefone, string conteudo, CancellationToken ct)
    {
        var numero = new string(telefone.Where(char.IsAsciiDigit).ToArray());
        if (string.IsNullOrWhiteSpace(numero))
            throw new ExcecaoDeNotificacaoPermanente("telefone_invalido", "O telefone do destinatario e invalido.");

        using var requisicao = new HttpRequestMessage(
            HttpMethod.Post,
            $"message/sendText/{Uri.EscapeDataString(opcoes.NomeInstancia)}")
        {
            Content = JsonContent.Create(new { number = numero, text = conteudo })
        };
        requisicao.Headers.Add("apikey", opcoes.ApiKey);

        HttpResponseMessage resposta;
        try
        {
            resposta = await http.SendAsync(requisicao, HttpCompletionOption.ResponseHeadersRead, ct);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            throw new ExcecaoDeNotificacaoPermanente(
                "resultado_envio_indeterminado",
                "O WhatsMiau nao confirmou o resultado do envio antes do tempo limite.");
        }
        catch (HttpRequestException ex)
        {
            throw new ExcecaoDeNotificacaoPermanente(
                "resultado_envio_indeterminado",
                "Nao foi possivel confirmar se o WhatsMiau recebeu a mensagem.",
                ex);
        }

        using (resposta)
        {
            if (resposta.StatusCode == HttpStatusCode.TooManyRequests)
                throw new ExcecaoDeNotificacaoTransitoria($"O WhatsMiau respondeu com HTTP {(int)resposta.StatusCode}.");

            if (resposta.StatusCode == HttpStatusCode.RequestTimeout || (int)resposta.StatusCode >= 500)
                throw new ExcecaoDeNotificacaoPermanente(
                    "resultado_envio_indeterminado",
                    $"O WhatsMiau respondeu com HTTP {(int)resposta.StatusCode} sem confirmar o resultado do envio.");

            if (!resposta.IsSuccessStatusCode)
                throw new ExcecaoDeNotificacaoPermanente(
                    "whatsmiau_rejeitou_envio",
                    $"O WhatsMiau rejeitou o envio com HTTP {(int)resposta.StatusCode}.");

            try
            {
                await using var corpo = await resposta.Content.ReadAsStreamAsync(ct);
                using var json = await JsonDocument.ParseAsync(corpo, cancellationToken: ct);
                if (json.RootElement.TryGetProperty("key", out var chave)
                    && chave.TryGetProperty("id", out var id)
                    && !string.IsNullOrWhiteSpace(id.GetString()))
                    return id.GetString()!;
            }
            catch (JsonException ex)
            {
                throw new ExcecaoDeNotificacaoPermanente(
                    "resposta_whatsmiau_invalida",
                    "O WhatsMiau retornou uma resposta invalida.",
                    ex);
            }
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)
            {
                throw new ExcecaoDeNotificacaoPermanente(
                    "resultado_envio_indeterminado",
                    "O WhatsMiau aceitou a conexao, mas nao confirmou o identificador antes do tempo limite.");
            }
            catch (Exception ex) when (ex is HttpRequestException or IOException)
            {
                throw new ExcecaoDeNotificacaoPermanente(
                    "resultado_envio_indeterminado",
                    "O WhatsMiau aceitou a conexao, mas a resposta foi interrompida antes do identificador.",
                    ex);
            }

            throw new ExcecaoDeNotificacaoPermanente(
                "resposta_sem_identificador",
                "O WhatsMiau nao retornou o identificador da mensagem.");
        }
    }

}
