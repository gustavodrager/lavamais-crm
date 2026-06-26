const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav");
const title = document.getElementById("title");
const subtitle = document.getElementById("subtitle");
const toast = document.getElementById("toast");

const pageMeta = {
  dashboard: {
    title: "Dashboard Comercial",
    subtitle: "Visão do dia, oportunidades de relacionamento e foco comercial."
  },
  central: {
    title: "Central de Relacionamento",
    subtitle: "Clientes priorizados, alertas e próxima melhor ação para a equipe."
  },
  clientes: {
    title: "Clientes 360°",
    subtitle: "Base comercial com histórico, tags, filtros e ações rápidas."
  },
  perfil: {
    title: "Perfil 360° do Cliente",
    subtitle: "Dados, contexto, histórico comercial, interações e próxima melhor ação."
  },
  "perfil-joao": {
    title: "Perfil 360° do Cliente",
    subtitle: "Cliente inativo de alto valor com plano de reativação comercial."
  },
  whatsapp: {
    title: "WhatsApp Manual",
    subtitle: "Mensagem preparada no sistema e enviada pela equipe via WhatsApp."
  },
  "whatsapp-confirmacao": {
    title: "Confirmar Envio",
    subtitle: "Registro manual para manter o histórico do Cliente 360° confiável."
  },
  "whatsapp-registrado": {
    title: "WhatsApp Registrado",
    subtitle: "A comunicação passa a fazer parte da linha do tempo do cliente."
  },
  interacao: {
    title: "Nova Interação",
    subtitle: "Registro de relacionamento humano com o cliente."
  },
  "interacao-ok": {
    title: "Interação Salva",
    subtitle: "A informação aparece no Perfil 360° e orienta a próxima ação."
  },
  campanhas: {
    title: "Campanhas",
    subtitle: "Ações comerciais por segmento, com WhatsApp manual e retorno medido."
  },
  "nova-campanha": {
    title: "Nova Campanha",
    subtitle: "Segmentação simples para a primeira fase de implantação."
  },
  "detalhe-campanha": {
    title: "Detalhe da Campanha",
    subtitle: "Acompanhe aberturas, respostas, clientes recuperados e valor gerado."
  },
  notificacoes: {
    title: "Notificações",
    subtitle: "Histórico de mensagens por cliente, canal, status e responsável."
  },
  metas: {
    title: "Metas Comerciais",
    subtitle: "Meta mensal, realizado, faltante, projeção e indicadores comerciais."
  },
  relatorios: {
    title: "Relatórios Comerciais",
    subtitle: "Visões para acompanhar vendas, campanhas, bairros e clientes."
  }
};

const templates = {
  vip: "Oi, Maria! Aqui é da LavaMais Praia Grande. Passando para saber se ficou tudo certo no último atendimento e se podemos ajudar em algo esta semana. Se preferir, já deixo uma retirada agendada para o melhor horário.",
  inativo: "Oi, João! Sentimos sua falta aqui na LavaMais Praia Grande. Quer que eu deixe uma retirada agendada para esta semana? Posso te ajudar pelo WhatsApp mesmo.",
  aniversario: "Oi, Ana! A equipe da LavaMais Praia Grande deseja um feliz aniversário. Que seu dia seja muito especial. Quando precisar, será um prazer atender você novamente.",
  reclamacao: "Oi, Roberto! Aqui é da LavaMais Praia Grande. Estou retornando sobre o ponto que você comentou e quero acompanhar pessoalmente para resolver da melhor forma.",
  corporativo: "Olá! Aqui é da LavaMais Praia Grande. Podemos conversar sobre uma condição de atendimento para sua empresa ou condomínio? Quero entender sua necessidade e montar uma proposta simples."
};

function showPage(pageId) {
  const target = document.getElementById(pageId);

  if (!target) {
    showToast(`Tela "${pageId}" não encontrada neste protótipo.`);
    return;
  }

  pages.forEach((page) => page.classList.toggle("active", page === target));

  const activeNav = target.dataset.nav || pageId;
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === activeNav);
  });

  const meta = pageMeta[pageId] || pageMeta[activeNav] || pageMeta.dashboard;
  title.textContent = meta.title;
  subtitle.textContent = meta.subtitle;

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

document.addEventListener("click", (event) => {
  const nav = event.target.closest("[data-page]");
  const go = event.target.closest("[data-go]");
  const resolver = event.target.closest(".resolve-action");

  if (nav) {
    showPage(nav.dataset.page);
    return;
  }

  if (go) {
    showPage(go.dataset.go);
    return;
  }

  if (resolver) {
    resolver.textContent = "Resolvido";
    resolver.disabled = true;
    resolver.classList.add("resolved");
    showToast("Pendência marcada como resolvida no protótipo.");
  }
});

const centralFilterButtons = document.querySelectorAll("[data-filter]");
const centralCards = document.querySelectorAll(".client-alert");
const centralCount = document.getElementById("central-count");

function applyCentralFilter(filter) {
  let visible = 0;

  centralCards.forEach((card) => {
    const tags = card.dataset.tags || "";
    const shouldShow = filter === "todos" || tags.includes(filter);
    card.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });

  if (centralCount) {
    centralCount.textContent = visible;
  }
}

centralFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    centralFilterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applyCentralFilter(button.dataset.filter);
  });
});

const clientSearch = document.getElementById("client-search");
const clearClientSearch = document.getElementById("clear-client-search");
const clientFilterButtons = document.querySelectorAll("[data-client-filter]");
const clientRows = document.querySelectorAll(".client-row");
const clientEmpty = document.getElementById("client-empty");
let activeClientFilter = "todos";

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function applyClientFilters() {
  const query = normalizeText(clientSearch?.value || "");
  let visible = 0;

  clientRows.forEach((row) => {
    const search = normalizeText(row.dataset.search || row.textContent);
    const tags = row.dataset.clientTags || "";
    const matchesSearch = !query || search.includes(query);
    const matchesFilter = activeClientFilter === "todos" || tags.includes(activeClientFilter);
    const shouldShow = matchesSearch && matchesFilter;
    row.hidden = !shouldShow;
    if (shouldShow) visible += 1;
  });

  if (clientEmpty) {
    clientEmpty.hidden = visible > 0;
  }
}

clientSearch?.addEventListener("input", applyClientFilters);

clearClientSearch?.addEventListener("click", () => {
  clientSearch.value = "";
  activeClientFilter = "todos";
  clientFilterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.clientFilter === "todos");
  });
  applyClientFilters();
});

clientFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeClientFilter = button.dataset.clientFilter;
    clientFilterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applyClientFilters();
  });
});

const templateSelect = document.getElementById("template-select");
const messagePreview = document.getElementById("message-preview");
const messageRendered = document.getElementById("message-rendered");
const openWhatsapp = document.getElementById("open-whatsapp");

function updateMessagePreview() {
  if (!templateSelect || !messagePreview || !messageRendered) return;

  const selected = templateSelect.value;
  messagePreview.value = templates[selected] || templates.vip;
  messageRendered.textContent = messagePreview.value;
}

templateSelect?.addEventListener("change", updateMessagePreview);

messagePreview?.addEventListener("input", () => {
  if (messageRendered) {
    messageRendered.textContent = messagePreview.value;
  }
});

openWhatsapp?.addEventListener("click", () => {
  showToast("Protótipo: WhatsApp seria aberto via link wa.me com o texto pronto.");
  showPage("whatsapp-confirmacao");
});

applyCentralFilter("todos");
applyClientFilters();
