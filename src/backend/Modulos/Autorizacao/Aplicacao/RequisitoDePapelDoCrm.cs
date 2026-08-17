using LavaMais.Crm.Modulos.Autorizacao.Dominio;
using Microsoft.AspNetCore.Authorization;

namespace LavaMais.Crm.Modulos.Autorizacao.Aplicacao;

public sealed record RequisitoDePapelDoCrm(PapelDoCrm? Papel, PapelDoCrm? PapelAlternativo = null) : IAuthorizationRequirement;
