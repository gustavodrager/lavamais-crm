const clients = [
  {
    id: "vanessa",
    name: "Vanessa Drager",
    whatsapp: "(13) 99123-1450",
    phoneDigits: "5513991231450",
    status: "VIP",
    since: "2024",
    lastVisit: "há 9 dias",
    bag: "#145",
    neighborhood: "Canto do Forte",
    tags: ["vip", "recuperado", "aniversariante"]
  },
  {
    id: "gustavo",
    name: "Gustavo Drager",
    whatsapp: "(13) 99844-2210",
    phoneDigits: "5513998442210",
    status: "Ativo",
    since: "2025",
    lastVisit: "há 16 dias",
    bag: "#102",
    neighborhood: "Boqueirão",
    tags: ["novo", "recuperado"]
  },
  {
    id: "anderson",
    name: "Anderson Mendes",
    whatsapp: "(13) 99720-8841",
    phoneDigits: "5513997208841",
    status: "Inativo",
    since: "2023",
    lastVisit: "há 48 dias",
    bag: "#077",
    neighborhood: "Guilhermina",
    tags: ["inativo"]
  },
  {
    id: "maria",
    name: "Maria Oliveira",
    whatsapp: "(13) 99618-5520",
    phoneDigits: "5513996185520",
    status: "Em risco",
    since: "2024",
    lastVisit: "há 95 dias",
    bag: "#208",
    neighborhood: "Aviação",
    tags: ["risco"]
  }
];

const pieces = [
  { id: "camiseta", icon: "👕", name: "Camiseta", popular: true },
  { id: "calca", icon: "👖", name: "Calça", popular: true },
  { id: "camisa-social", icon: "👔", name: "Camisa Social", popular: true },
  { id: "meia", icon: "🧦", name: "Meia", popular: true },
  { id: "bermuda", icon: "🩳", name: "Bermuda", popular: true },
  { id: "jaqueta", icon: "🧥", name: "Jaqueta", popular: true },
  { id: "tenis", icon: "👟", name: "Tênis", popular: true },
  { id: "edredom", icon: "🛏️", name: "Edredom", popular: true },
  { id: "bone", icon: "🧢", name: "Boné", popular: false },
  { id: "vestido", icon: "👗", name: "Vestido", popular: false },
  { id: "terno", icon: "🤵", name: "Terno", popular: false },
  { id: "toalha", icon: "🧺", name: "Toalha", popular: false },
  { id: "lencol", icon: "🛏️", name: "Lençol", popular: false },
  { id: "tapete", icon: "▦", name: "Tapete", popular: false }
];

let selectedClientId = "";
let cart = {};
let lastAddedPieceId = "";
let lastReceipt = {
  total: 0,
  clientName: ""
};

const views = document.querySelectorAll(".view");
const flowSteps = document.querySelectorAll("[data-step]");
const clientSearch = document.getElementById("clientSearch");
const clientResults = document.getElementById("clientResults");
const recentClients = document.getElementById("recentClients");
const clientStage = document.getElementById("clientStage");
const receiveHeader = document.getElementById("receiveHeader");
const lastPiecesCard = document.getElementById("lastPiecesCard");
const pieceSearch = document.getElementById("pieceSearch");
const pieceListTitle = document.getElementById("pieceListTitle");
const pieceGrid = document.getElementById("pieceGrid");
const cartList = document.getElementById("cartList");
const inlineTotal = document.getElementById("inlineTotal");
const footerTotal = document.getElementById("footerTotal");
const footerTotalBox = document.getElementById("footerTotalBox");
const confirmReceive = document.getElementById("confirmReceive");
const bagNote = document.getElementById("bagNote");
const successPieces = document.getElementById("successPieces");
const successClientName = document.getElementById("successClientName");
const whatsappModal = document.getElementById("whatsappModal");
const whatsappMessage = document.getElementById("whatsappMessage");
const whatsappLink = document.getElementById("whatsappLink");
const newClientModal = document.getElementById("newClientModal");
const newClientForm = document.getElementById("newClientForm");
const toast = document.getElementById("toast");
const profileSelector = document.getElementById("profileSelector");
const adminShell = document.getElementById("adminShell");
const receptionShell = document.getElementById("receptionShell");
const mobileBottomNav = document.getElementById("mobileBottomNav");
const adminCounters = document.querySelectorAll("[data-count]");
const adminNavItems = document.querySelectorAll("[data-admin-section]");
const adminPages = document.querySelectorAll("[data-admin-page]");
const adminClientSearch = document.getElementById("adminClientSearch");
const adminClientList = document.getElementById("adminClientList");
const adminClientProfile = document.getElementById("adminClientProfile");
const clientFilterLabel = document.getElementById("clientFilterLabel");
const clientFilterButtons = document.querySelectorAll("[data-client-filter]");
const adminWhatsappTitle = document.getElementById("adminWhatsappTitle");
const adminWhatsappText = document.getElementById("adminWhatsappText");
const adminWhatsappContext = document.getElementById("adminWhatsappContext");
const adminWhatsappProbability = document.getElementById("adminWhatsappProbability");
const adminWhatsappTicket = document.getElementById("adminWhatsappTicket");

let activeClientFilter = "vip";
let activeAdminClientId = "vanessa";
let currentProfile = "selector";

const clientIntelligence = {
  vanessa: {
    stars: "★★★★★",
    label: "Cliente VIP.",
    probability: "92%",
    channel: "WhatsApp",
    bestTime: "14h às 17h",
    category: "Camisa Social",
    ticket: "R$ 138",
    campaign: "Delivery",
    lastPieces: ["Camisa Social", "Calça", "Camiseta", "Tênis"],
    cycle: "13 dias",
    cycleOrigin: "Histórico do Cliente",
    favoriteShare: [
      ["Camisa Social", 45],
      ["Roupa do Dia", 28],
      ["Edredom", 12],
      ["Tapete", 8],
      ["Outros", 7]
    ]
  },
  gustavo: {
    stars: "★★★★☆",
    label: "Cliente ativo.",
    probability: "84%",
    channel: "WhatsApp",
    bestTime: "10h às 12h",
    category: "Roupa do dia a dia",
    ticket: "R$ 112",
    campaign: "Camisa Social",
    lastPieces: ["Camiseta", "Calça", "Camisa Social", "Meia"],
    cycle: "16 dias",
    cycleOrigin: "Histórico do Cliente",
    favoriteShare: [
      ["Roupa do Dia", 42],
      ["Camisa Social", 31],
      ["Tênis", 11],
      ["Edredom", 9],
      ["Outros", 7]
    ]
  },
  anderson: {
    stars: "★★☆☆☆",
    label: "Cliente inativo.",
    probability: "41%",
    channel: "WhatsApp",
    bestTime: "18h às 20h",
    category: "Roupa do dia a dia",
    ticket: "R$ 89",
    campaign: "Reativação",
    lastPieces: ["Camiseta", "Bermuda", "Tênis", "Boné"],
    cycle: "30 dias",
    cycleOrigin: "Média padrão da categoria",
    favoriteShare: [
      ["Roupa do Dia", 54],
      ["Tênis", 18],
      ["Bermuda", 12],
      ["Tapete", 8],
      ["Outros", 8]
    ]
  },
  maria: {
    stars: "★★★☆☆",
    label: "Cliente em risco.",
    probability: "68%",
    channel: "WhatsApp",
    bestTime: "15h às 17h",
    category: "Edredom",
    ticket: "R$ 156",
    campaign: "Edredom",
    lastPieces: ["Edredom", "Lençol", "Toalha", "Tapete"],
    cycle: "90 dias",
    cycleOrigin: "Média padrão da categoria",
    favoriteShare: [
      ["Edredom", 46],
      ["Roupa de Cama", 24],
      ["Tapete", 14],
      ["Roupa do Dia", 9],
      ["Outros", 7]
    ]
  }
};

const clientFilterNames = {
  todos: "Todos os clientes",
  vip: "Clientes VIP",
  risco: "Clientes em risco",
  inativo: "Clientes inativos",
  recuperado: "Clientes recuperados",
  aniversariante: "Aniversariantes",
  novo: "Novos clientes"
};

const adminPageParents = {
  "cliente-perfil": "clientes",
  campanhas: "relacionamento",
  whatsapp: "relacionamento",
  alertas: "insights"
};

function normalize(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, "");
}

function digits(value) {
  return value.replace(/\D/g, "");
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function statusClass(status) {
  return `status-${normalize(status).replace(/\s+/g, "-")}`;
}

function getClient() {
  return clients.find((client) => client.id === selectedClientId) || clients[0];
}

function getPiece(pieceId) {
  return pieces.find((piece) => piece.id === pieceId);
}

function getIntelligence(clientId = selectedClientId) {
  return clientIntelligence[clientId] || clientIntelligence.vanessa;
}

function totalPieces() {
  return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
}

function formatPieces(total) {
  return `${total} ${total === 1 ? "PEÇA" : "PEÇAS"}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function renderMobileNav(activeTarget = "") {
  if (!mobileBottomNav) return;

  if (currentProfile === "selector") {
    mobileBottomNav.hidden = true;
    mobileBottomNav.innerHTML = "";
    return;
  }

  const items = currentProfile === "admin"
    ? [
        ["dashboard", "🏠", "Dashboard"],
        ["clientes", "👥", "Clientes"],
        ["relacionamento", "💬", "Relação"],
        ["insights", "📈", "Insights"],
        ["configuracoes", "⚙️", "Mais"]
      ]
    : [
        ["inicio", "🏠", "Início"],
        ["clientes", "👥", "Clientes"],
        ["recepcao", "🛎️", "Recepção"],
        ["relacionamento", "💬", "Relação"],
        ["mais", "⚙️", "Mais"]
      ];

  mobileBottomNav.innerHTML = items.map(([target, icon, label]) => `
    <button class="${target === activeTarget ? "active" : ""}" type="button" data-mobile-nav="${target}">
      <span class="mobile-nav-icon" aria-hidden="true">${icon}</span>
      <span>${label}</span>
    </button>
  `).join("");
  mobileBottomNav.hidden = false;
}

function receptionMobileTarget(viewId) {
  if (viewId === "cliente") return "clientes";
  if (viewId === "receber" || viewId === "sucesso") return "recepcao";
  return "inicio";
}

function showProfileSelector() {
  currentProfile = "selector";
  profileSelector.hidden = false;
  adminShell.hidden = true;
  receptionShell.hidden = true;
  mobileBottomNav.hidden = true;
  document.body.classList.add("profile-mode");
  document.body.classList.remove("admin-mode", "reception-mode");
  document.title = "LavaMais CRM - Escolha o Perfil";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showAdmin(pageId = "dashboard") {
  currentProfile = "admin";
  profileSelector.hidden = true;
  adminShell.hidden = false;
  receptionShell.hidden = true;
  mobileBottomNav.hidden = false;
  document.body.classList.add("admin-mode");
  document.body.classList.remove("profile-mode", "reception-mode");
  document.title = "LavaMais CRM - Administrador";
  showAdminPage(pageId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showReception(viewId = "recepcao") {
  currentProfile = "reception";
  profileSelector.hidden = true;
  adminShell.hidden = true;
  receptionShell.hidden = false;
  mobileBottomNav.hidden = false;
  document.body.classList.add("reception-mode");
  document.body.classList.remove("profile-mode", "admin-mode");
  document.title = "LavaMais CRM - Recepção";
  showView(viewId);
  if (viewId === "recepcao") {
    window.setTimeout(() => clientSearch.focus(), 180);
  }
}

function showAdminPage(pageId) {
  const page = document.querySelector(`[data-admin-page="${pageId}"]`);
  const navPageId = adminPageParents[pageId] || pageId;

  if (!page) {
    showToast(`${pageId[0].toUpperCase()}${pageId.slice(1)} selecionado no protótipo.`);
    return;
  }

  adminPages.forEach((item) => {
    item.classList.toggle("active", item === page);
  });

  adminNavItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.adminSection === navPageId);
  });

  document.querySelectorAll("#mobileBottomNav [data-mobile-nav]").forEach((item) => {
    item.classList.toggle("active", item.dataset.adminSection === navPageId);
  });

  if (currentProfile === "admin") {
    renderMobileNav(navPageId);
  }

  if (pageId === "clientes") {
    renderAdminClients();
    window.setTimeout(() => adminClientSearch?.focus(), 160);
  }

  if (pageId === "cliente-perfil") {
    renderAdminClientProfile(activeAdminClientId);
  }

  if (pageId === "whatsapp") {
    renderAdminWhatsapp(activeAdminClientId);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function animateAdminCounters() {
  adminCounters.forEach((counter) => {
    const target = Number(counter.dataset.count || 0);
    const prefix = counter.dataset.prefix || "";
    const suffix = counter.dataset.suffix || "";
    const duration = 900;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = `${prefix}${value.toLocaleString("pt-BR")}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  });
}

function showView(viewId) {
  const target = document.getElementById(viewId);

  if (!target) return;

  views.forEach((view) => {
    view.classList.toggle("active", view === target);
  });

  flowSteps.forEach((step) => {
    step.classList.toggle("active", step.dataset.step === viewId);
  });

  if (viewId === "receber") {
    renderReceiveHeader();
    renderLastPieces();
    renderPieces();
    renderCart();
    window.setTimeout(() => pieceSearch.focus(), 180);
  }

  if (viewId === "sucesso") {
    renderSuccess();
  }

  if (currentProfile === "reception") {
    renderMobileNav(receptionMobileTarget(viewId));
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function selectClient(clientId) {
  selectedClientId = clientId;
  cart = {};
  lastAddedPieceId = "";
  pieceSearch.value = "";
  bagNote.value = "";
  renderClient();
  renderReceiveHeader();
  renderLastPieces();
  renderCart();
  showView("cliente");
}

function renderClientResults(query = "") {
  const cleanQuery = normalize(query.trim());
  const phoneQuery = digits(query);

  if (!cleanQuery && !phoneQuery) {
    clientResults.innerHTML = "";
    return;
  }

  const matches = clients.filter((client) => {
    const nameMatch = normalize(client.name).includes(cleanQuery);
    const phoneMatch = phoneQuery && digits(client.whatsapp).includes(phoneQuery);
    return nameMatch || phoneMatch;
  });

  if (!matches.length) {
    clientResults.innerHTML = `<div class="empty-result">Nenhum cliente encontrado.</div>`;
    return;
  }

  clientResults.innerHTML = matches.map((client) => `
    <button class="client-result" type="button" data-select-client="${client.id}">
      <div>
        <strong>${client.name}</strong>
        <span>${client.whatsapp} · ${client.bag}</span>
      </div>
      <span class="status-pill ${statusClass(client.status)}">${client.status}</span>
    </button>
  `).join("");
}

function renderRecentClients() {
  const orderedClients = [clients[1], clients[0], clients[3], clients[2]];

  recentClients.innerHTML = orderedClients.map((client) => `
    <button class="recent-item" type="button" data-select-client="${client.id}">
      <div class="avatar" aria-hidden="true">${initials(client.name)}</div>
      <div>
        <strong>${client.name}</strong>
        <span>${client.lastVisit} · ${client.bag}</span>
      </div>
    </button>
  `).join("");
}

function matchesClientFilter(client, filter) {
  if (filter === "todos") return true;
  return client.tags?.includes(filter);
}

function renderAdminClients() {
  if (!adminClientList) return;

  const query = normalize(adminClientSearch?.value || "");
  const visibleClients = clients.filter((client) => {
    const intelligence = getIntelligence(client.id);
    const searchable = normalize(`${client.name} ${client.whatsapp} ${client.status} ${client.neighborhood} ${intelligence.category}`);
    return matchesClientFilter(client, activeClientFilter) && (!query || searchable.includes(query));
  });

  if (clientFilterLabel) {
    clientFilterLabel.textContent = clientFilterNames[activeClientFilter] || "Clientes";
  }

  if (!visibleClients.length) {
    adminClientList.innerHTML = `<div class="empty-result">Nenhum cliente encontrado para este filtro.</div>`;
    return;
  }

  adminClientList.innerHTML = visibleClients.map((client) => {
    const intelligence = getIntelligence(client.id);
    return `
      <article class="relationship-client-card">
        <div class="relationship-card-top">
          <div class="avatar" aria-hidden="true">${initials(client.name)}</div>
          <div>
            <h3>${client.name}</h3>
            <div class="relationship-card-badges">
              <span class="stars-line">${intelligence.stars}</span>
              <span class="status-pill ${statusClass(client.status)}">${client.status}</span>
            </div>
          </div>
        </div>
        <div class="relationship-card-grid">
          <div><span>Última visita</span><strong>${client.lastVisit}</strong></div>
          <div><span>Probabilidade de retorno</span><strong>${intelligence.probability}</strong></div>
          <div><span>Ticket médio</span><strong>${intelligence.ticket}</strong></div>
          <div><span>Categoria favorita</span><strong>${intelligence.category}</strong></div>
        </div>
        <button type="button" data-open-client-profile="${client.id}">Abrir Perfil</button>
      </article>
    `;
  }).join("");
}

function renderAdminClientProfile(clientId) {
  if (!adminClientProfile) return;

  const client = clients.find((item) => item.id === clientId) || clients[0];
  const intelligence = getIntelligence(client.id);
  activeAdminClientId = client.id;

  adminClientProfile.innerHTML = `
    <button class="profile-back-button" type="button" data-admin-page-target="clientes">← Voltar para Clientes</button>

    <section class="customer-profile-grid">
      <article class="customer-main-card">
        <div class="customer-hero">
          <div class="avatar large" aria-hidden="true">${initials(client.name)}</div>
          <div>
            <h2>${client.name}</h2>
            <span class="status-pill ${statusClass(client.status)}">${client.status}</span>
          </div>
        </div>
        <div class="customer-main-facts">
          <div><span>Cliente desde</span><strong>${client.since}</strong></div>
          <div><span>Telefone</span><strong>${client.whatsapp}</strong></div>
          <div><span>WhatsApp</span><strong>${client.whatsapp}</strong></div>
          <div><span>Bairro</span><strong>${client.neighborhood}</strong></div>
          <div><span>Sacola vinculada</span><strong>${client.bag}</strong></div>
        </div>
        <div class="client-actions">
          <button class="action-button primary" type="button" data-admin-page-target="whatsapp">WhatsApp</button>
          <button class="action-button secondary" type="button" data-admin-receive-client="${client.id}">Receber Sacola</button>
          <button class="action-button secondary" type="button" data-admin-toast="Entrega registrada no protótipo.">Entregar Roupas</button>
        </div>
      </article>

      <aside class="smart-profile-card admin-profile-smart">
        <span class="stars">${intelligence.stars}</span>
        <h2>🧠 Perfil Inteligente</h2>
        <p>${intelligence.label}</p>
        <div class="probability">
          <span>Probabilidade de retorno</span>
          <strong>${intelligence.probability}</strong>
        </div>
        <div class="smart-facts">
          <div><span>Canal preferido</span><strong>${intelligence.channel}</strong></div>
          <div><span>Melhor horário</span><strong>${intelligence.bestTime}</strong></div>
          <div><span>Categoria favorita</span><strong>${intelligence.category}</strong></div>
          <div><span>Ticket médio</span><strong>${intelligence.ticket}</strong></div>
          <div><span>Última campanha convertida</span><strong>${intelligence.campaign}</strong></div>
          <div><span>Cliente costuma retornar a cada</span><strong>${intelligence.cycle}</strong></div>
          <div><span>Origem do ciclo</span><strong>${intelligence.cycleOrigin}</strong></div>
        </div>
      </aside>
    </section>

    <section class="customer-profile-grid lower">
      <article class="commercial-assistant-card">
        <span class="badge yellow">Assistente Comercial</span>
        <h2>🧠 Oportunidades para este cliente</h2>
        <div class="assistant-opportunities">
          <div><strong>Cliente está 2 dias acima do ciclo médio.</strong><button type="button" data-admin-page-target="whatsapp">Enviar WhatsApp</button></div>
          <div><strong>Hoje é um bom dia para contato.</strong><button type="button" data-admin-page-target="whatsapp">Enviar WhatsApp</button></div>
          <div><strong>Campanha recomendada: ${intelligence.category}.</strong><button type="button" data-admin-page-target="campanhas">Criar Campanha</button></div>
          <div><strong>Cliente nunca utilizou Delivery.</strong><button type="button" data-admin-page-target="campanhas">Criar Campanha</button></div>
          <div><strong>Hoje é aniversário.</strong><button type="button" data-admin-page-target="whatsapp">Enviar WhatsApp</button></div>
          <div><strong>Cliente possui roupas prontas.</strong><button type="button" data-admin-receive-client="${client.id}">Receber Sacola</button></div>
        </div>
      </article>

      <article class="relationship-timeline-card">
        <span class="badge">Histórico como feed</span>
        <h2>Timeline de Relacionamento</h2>
        <div class="timeline-feed customer-feed">
          <article><time>Hoje</time><span>Roupa entregue.</span></article>
          <article><time>12 dias atrás</time><span>Recebimento de Sacola.</span></article>
          <article><time>15 dias atrás</time><span>Campanha enviada.</span></article>
          <article><time>16 dias atrás</time><span>WhatsApp enviado.</span></article>
          <article><time>90 dias atrás</time><span>Lavagem de Edredom.</span></article>
          <article><time>365 dias atrás</time><span>Cliente cadastrado.</span></article>
        </div>
      </article>
    </section>

    <section class="customer-profile-grid lower">
      <article class="commercial-history-card">
        <span class="badge">Últimas utilizações</span>
        <h2>Histórico Comercial</h2>
        <div class="history-card-grid">
          <article><strong>15 peças</strong><span>R$ 128</span><small>Camisa Social · Última utilização</small></article>
          <article><strong>9 peças</strong><span>R$ 86</span><small>Roupa do dia · 12 dias atrás</small></article>
          <article><strong>1 peça</strong><span>R$ 142</span><small>Edredom · 90 dias atrás</small></article>
        </div>
      </article>

      <article class="product-usage-card">
        <span class="badge yellow">Top categorias</span>
        <h2>Produtos Mais Utilizados</h2>
        <div class="usage-bars">
          ${intelligence.favoriteShare.map(([label, value]) => `
            <div>
              <span>${label}</span>
              <strong>${value}%</strong>
              <i><b style="--progress: ${value}%"></b></i>
            </div>
          `).join("")}
        </div>
      </article>
    </section>

    <section class="communication-card">
      <span class="badge">Histórico de relacionamento</span>
      <h2>Comunicação</h2>
      <div class="communication-feed">
        <article><time>Hoje</time><strong>WhatsApp enviado.</strong></article>
        <article><time>15 dias atrás</time><strong>Campanha aberta.</strong></article>
        <article><time>15 dias atrás</time><strong>Campanha convertida.</strong></article>
        <article><time>32 dias atrás</time><strong>Aniversário.</strong></article>
        <article><time>48 dias atrás</time><strong>Ligação registrada.</strong></article>
      </div>
    </section>
  `;
}

function renderAdminWhatsapp(clientId) {
  const client = clients.find((item) => item.id === clientId) || clients[0];
  const intelligence = getIntelligence(client.id);
  const firstName = client.name.split(" ")[0];
  const message = `Oi, ${firstName}! Tudo bem? Aqui é da LavaMais Praia Grande. Percebemos que já está perto do seu período habitual de lavar ${intelligence.category}. Quer agendar uma retirada ou prefere passar aqui hoje?`;

  activeAdminClientId = client.id;

  if (adminWhatsappTitle) {
    adminWhatsappTitle.textContent = `${client.name} · retorno provável`;
  }

  if (adminWhatsappText) {
    adminWhatsappText.value = message;
  }

  if (adminWhatsappContext) {
    adminWhatsappContext.textContent = `Cliente ${client.status}, alta recorrência em ${intelligence.category}, última visita ${client.lastVisit} e melhor horário entre ${intelligence.bestTime}.`;
  }

  if (adminWhatsappProbability) {
    adminWhatsappProbability.textContent = intelligence.probability;
  }

  if (adminWhatsappTicket) {
    adminWhatsappTicket.textContent = intelligence.ticket;
  }
}

function renderClient() {
  const client = getClient();
  const intelligence = getIntelligence(client.id);

  clientStage.innerHTML = `
    <div class="client-intelligence-layout">
      <article class="client-card">
        <div class="client-found-top">
          <div class="avatar" aria-hidden="true">${initials(client.name)}</div>
          <div>
            <h1>${client.name}</h1>
            <span class="status-pill ${statusClass(client.status)}">${client.status}</span>
          </div>
        </div>

        <div class="client-facts">
          <div class="fact">
            <span>Telefone</span>
            <strong>${client.whatsapp}</strong>
          </div>
          <div class="fact">
            <span>Status</span>
            <strong>${client.status}</strong>
          </div>
          <div class="fact">
            <span>Última visita</span>
            <strong>${client.lastVisit}</strong>
          </div>
          <div class="fact">
            <span>Sacola</span>
            <strong>${client.bag}</strong>
          </div>
        </div>

        <div class="client-actions">
          <button class="action-button primary" type="button" data-action="receive">Receber Sacola</button>
          <button class="action-button secondary" type="button" data-action="deliver">Entregar Roupas</button>
          <button class="action-button secondary" type="button" data-action="whatsapp">WhatsApp</button>
        </div>
      </article>

      <aside class="smart-profile-card">
        <span class="stars">${intelligence.stars}</span>
        <h2>Perfil Inteligente</h2>
        <p>${intelligence.label}</p>
        <div class="probability">
          <span>Probabilidade de retorno</span>
          <strong>${intelligence.probability}</strong>
        </div>
        <div class="smart-facts">
          <div><span>Canal preferido</span><strong>${intelligence.channel}</strong></div>
          <div><span>Melhor horário</span><strong>${intelligence.bestTime}</strong></div>
          <div><span>Categoria mais utilizada</span><strong>${intelligence.category}</strong></div>
          <div><span>Ticket médio</span><strong>${intelligence.ticket}</strong></div>
          <div><span>Última campanha convertida</span><strong>${intelligence.campaign}</strong></div>
        </div>
      </aside>
    </div>
  `;
}

function renderReceiveHeader() {
  const client = getClient();

  receiveHeader.innerHTML = `
    <div class="receive-photo" aria-hidden="true">${initials(client.name)}</div>
    <div class="receive-name">
      <h2>${client.name}</h2>
      <span class="status-pill ${statusClass(client.status)}">Cliente ${client.status}</span>
    </div>
    <div class="receive-info">
      <span>Cliente desde</span>
      <strong>${client.since}</strong>
    </div>
    <div class="receive-info">
      <span>Sacola</span>
      <strong>${client.bag}</strong>
    </div>
  `;
}

function renderLastPieces() {
  const client = getClient();
  const intelligence = getIntelligence(client.id);

  lastPiecesCard.innerHTML = `
    <strong>Últimas peças registradas para este cliente:</strong>
    ${intelligence.lastPieces.map((item) => `<span>${item}</span>`).join("")}
  `;
}

function renderPieces() {
  const query = pieceSearch.value.trim();
  const normalizedQuery = normalize(query);
  const visiblePieces = query
    ? pieces.filter((piece) => normalize(piece.name).includes(normalizedQuery))
    : pieces.filter((piece) => piece.popular);

  pieceListTitle.textContent = query ? "Resultado da busca" : "Mais utilizadas";

  if (!visiblePieces.length) {
    pieceGrid.innerHTML = `<div class="empty-result">Nenhuma peça encontrada.</div>`;
    return;
  }

  pieceGrid.innerHTML = visiblePieces.map((piece) => `
    <button class="piece-button" type="button" data-piece-id="${piece.id}">
      <span class="piece-icon" aria-hidden="true">${piece.icon}</span>
      <span class="piece-name">${piece.name}</span>
    </button>
  `).join("");
}

function renderCart() {
  const total = totalPieces();
  const orderedIds = Object.keys(cart);

  if (!orderedIds.length) {
    cartList.innerHTML = `<div class="cart-empty">Toque em uma peça para adicionar à sacola.</div>`;
  } else {
    cartList.innerHTML = orderedIds.map((pieceId) => {
      const piece = getPiece(pieceId);
      const quantity = cart[pieceId];
      const entering = pieceId === lastAddedPieceId ? " entering" : "";

      return `
        <div class="cart-line${entering}" data-cart-line="${pieceId}">
          <span class="cart-icon" aria-hidden="true">${piece.icon}</span>
          <span class="cart-name">${piece.name}</span>
          <button class="cart-button" type="button" data-cart-decrease="${pieceId}" aria-label="Diminuir ${piece.name}">-</button>
          <span class="cart-qty">${quantity}</span>
          <button class="cart-button" type="button" data-cart-increase="${pieceId}" aria-label="Aumentar ${piece.name}">+</button>
          <button class="remove-button" type="button" data-cart-remove="${pieceId}" aria-label="Remover ${piece.name}">🗑 Remover</button>
        </div>
      `;
    }).join("");
  }

  const totalText = formatPieces(total);
  inlineTotal.textContent = totalText;
  footerTotal.textContent = totalText;
  confirmReceive.disabled = total === 0;
  pulseTotal();

  window.clearTimeout(renderCart.enterTimer);
  renderCart.enterTimer = window.setTimeout(() => {
    lastAddedPieceId = "";
  }, 320);
}

function pulseTotal() {
  inlineTotal.classList.remove("pulse");
  footerTotalBox.classList.remove("pulse");
  void inlineTotal.offsetWidth;
  inlineTotal.classList.add("pulse");
  footerTotalBox.classList.add("pulse");
}

function addPiece(pieceId) {
  cart[pieceId] = (cart[pieceId] || 0) + 1;
  lastAddedPieceId = pieceId;
  renderCart();
}

function changePiece(pieceId, delta) {
  if (!cart[pieceId]) return;

  cart[pieceId] += delta;

  if (cart[pieceId] <= 0) {
    delete cart[pieceId];
  }

  renderCart();
}

function removePiece(pieceId) {
  delete cart[pieceId];
  renderCart();
}

function confirmReceipt() {
  const total = totalPieces();

  if (!total) {
    showToast("Adicione pelo menos uma peça.");
    return;
  }

  lastReceipt = {
    total,
    clientName: getClient().name
  };

  showView("sucesso");
}

function renderSuccess() {
  successPieces.textContent = `${lastReceipt.total} ${lastReceipt.total === 1 ? "peça registrada" : "peças registradas"}.`;
  successClientName.textContent = lastReceipt.clientName;
}

function resetForNextCustomer() {
  selectedClientId = "";
  cart = {};
  lastAddedPieceId = "";
  lastReceipt = { total: 0, clientName: "" };
  clientSearch.value = "";
  clientResults.innerHTML = "";
  bagNote.value = "";
  pieceSearch.value = "";
  renderCart();
  showView("recepcao");
  window.setTimeout(() => clientSearch.focus(), 180);
}

function openWhatsapp() {
  const client = getClient();
  const intelligence = getIntelligence(client.id);
  const firstName = client.name.split(" ")[0];
  const message = `Oi, ${firstName}! Tudo bem? Aqui é da LavaMais Praia Grande. Vi que ${intelligence.category} costuma aparecer nos seus atendimentos e seu melhor horário costuma ser ${intelligence.bestTime}. Quer agendar uma retirada ou prefere passar aqui hoje?`;
  whatsappMessage.value = message;
  whatsappLink.href = `https://wa.me/${client.phoneDigits}?text=${encodeURIComponent(message)}`;
  whatsappModal.hidden = false;
  whatsappMessage.focus();
}

function closeWhatsapp() {
  whatsappModal.hidden = true;
}

function openNewClient() {
  newClientModal.hidden = false;
  document.getElementById("newClientName").focus();
}

function closeNewClient() {
  newClientModal.hidden = true;
  newClientForm.reset();
}

function handleMobileNav(target) {
  if (currentProfile === "admin") {
    showAdminPage(target);
    return;
  }

  if (currentProfile !== "reception") return;

  if (target === "inicio") {
    showReception("recepcao");
    return;
  }

  if (target === "clientes") {
    if (selectedClientId) {
      showReception("cliente");
      return;
    }

    showReception("recepcao");
    showToast("Busque ou selecione um cliente para abrir o perfil.");
    return;
  }

  if (target === "recepcao") {
    if (selectedClientId) {
      showReception("receber");
      return;
    }

    showReception("recepcao");
    showToast("Selecione um cliente antes de receber a sacola.");
    return;
  }

  if (target === "relacionamento") {
    if (selectedClientId) {
      renderMobileNav("relacionamento");
      openWhatsapp();
      return;
    }

    showReception("recepcao");
    showToast("Selecione um cliente para abrir o relacionamento.");
    return;
  }

  if (target === "mais") {
    showProfileSelector();
  }
}

clientSearch.addEventListener("input", () => {
  renderClientResults(clientSearch.value);
});

adminClientSearch?.addEventListener("input", renderAdminClients);

clientFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeClientFilter = button.dataset.clientFilter;
    clientFilterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderAdminClients();
  });
});

clientSearch.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;

  const firstClient = clientResults.querySelector("[data-select-client]");
  if (firstClient) {
    event.preventDefault();
    firstClient.click();
  }
});

pieceSearch.addEventListener("input", renderPieces);

pieceSearch.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;

  const firstPiece = pieceGrid.querySelector("[data-piece-id]");
  if (firstPiece) {
    event.preventDefault();
    firstPiece.click();
  }
});

document.getElementById("qrButton").addEventListener("click", () => {
  clientSearch.value = "Sacola #145";
  selectClient("vanessa");
  showToast("QR lido: Vanessa Drager · Sacola #145.");
});

document.getElementById("newClientButton").addEventListener("click", openNewClient);
confirmReceive.addEventListener("click", confirmReceipt);
document.getElementById("nextBagButton").addEventListener("click", resetForNextCustomer);
document.getElementById("backReceptionButton").addEventListener("click", resetForNextCustomer);

document.addEventListener("click", (event) => {
  const enterProfileButton = event.target.closest("[data-enter-profile]");
  const switchProfileButton = event.target.closest("[data-switch-profile]");
  const mobileNavButton = event.target.closest("[data-mobile-nav]");
  const openReceptionButton = event.target.closest("[data-open-reception]");
  const openAdminButton = event.target.closest("[data-open-admin]");
  const adminToastButton = event.target.closest("[data-admin-toast]");
  const adminSectionButton = event.target.closest("[data-admin-section]");
  const adminPageTarget = event.target.closest("[data-admin-page-target]");
  const openClientProfileButton = event.target.closest("[data-open-client-profile]");
  const clearClientFilterButton = event.target.closest("[data-clear-client-filter]");
  const adminReceiveClientButton = event.target.closest("[data-admin-receive-client]");
  const adminWhatsappClientButton = event.target.closest("[data-admin-whatsapp-client]");
  const selectButton = event.target.closest("[data-select-client]");
  const actionButton = event.target.closest("[data-action]");
  const pieceButton = event.target.closest("[data-piece-id]");
  const increaseButton = event.target.closest("[data-cart-increase]");
  const decreaseButton = event.target.closest("[data-cart-decrease]");
  const removeButton = event.target.closest("[data-cart-remove]");
  const closeWhatsappButton = event.target.closest("[data-close-whatsapp]");
  const closeNewClientButton = event.target.closest("[data-close-new-client]");

  if (enterProfileButton) {
    if (enterProfileButton.dataset.enterProfile === "admin") {
      showAdmin("dashboard");
    } else {
      showReception("recepcao");
    }
    return;
  }

  if (switchProfileButton) {
    showProfileSelector();
    return;
  }

  if (mobileNavButton) {
    handleMobileNav(mobileNavButton.dataset.mobileNav);
    return;
  }

  if (openReceptionButton) {
    showReception("recepcao");
    return;
  }

  if (openAdminButton) {
    showAdmin("dashboard");
    return;
  }

  if (adminPageTarget) {
    showAdminPage(adminPageTarget.dataset.adminPageTarget);
    return;
  }

  if (openClientProfileButton) {
    activeAdminClientId = openClientProfileButton.dataset.openClientProfile;
    renderAdminClientProfile(activeAdminClientId);
    showAdminPage("cliente-perfil");
    return;
  }

  if (clearClientFilterButton) {
    activeClientFilter = "todos";
    clientFilterButtons.forEach((item) => item.classList.remove("active"));
    renderAdminClients();
    return;
  }

  if (adminReceiveClientButton) {
    selectClient(adminReceiveClientButton.dataset.adminReceiveClient);
    showReception("receber");
    return;
  }

  if (adminWhatsappClientButton) {
    activeAdminClientId = adminWhatsappClientButton.dataset.adminWhatsappClient;
    showAdminPage("whatsapp");
    return;
  }

  if (adminToastButton) {
    showToast(adminToastButton.dataset.adminToast);
    return;
  }

  if (adminSectionButton) {
    showAdminPage(adminSectionButton.dataset.adminSection);
    return;
  }

  if (selectButton) {
    selectClient(selectButton.dataset.selectClient);
    return;
  }

  if (actionButton) {
    const action = actionButton.dataset.action;

    if (action === "receive") {
      showView("receber");
      return;
    }

    if (action === "deliver") {
      showToast("Entrega registrada no protótipo.");
      return;
    }

    if (action === "whatsapp") {
      openWhatsapp();
      return;
    }
  }

  if (pieceButton) {
    addPiece(pieceButton.dataset.pieceId);
    return;
  }

  if (increaseButton) {
    changePiece(increaseButton.dataset.cartIncrease, 1);
    return;
  }

  if (decreaseButton) {
    changePiece(decreaseButton.dataset.cartDecrease, -1);
    return;
  }

  if (removeButton) {
    removePiece(removeButton.dataset.cartRemove);
    return;
  }

  if (closeWhatsappButton) {
    closeWhatsapp();
    return;
  }

  if (closeNewClientButton) {
    closeNewClient();
  }
});

whatsappModal.addEventListener("click", (event) => {
  if (event.target === whatsappModal) {
    closeWhatsapp();
  }
});

newClientModal.addEventListener("click", (event) => {
  if (event.target === newClientModal) {
    closeNewClient();
  }
});

newClientForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("newClientName").value.trim();
  const whatsapp = document.getElementById("newClientWhatsapp").value.trim();
  const bag = document.getElementById("newClientBag").value.trim();
  const id = normalize(name).replace(/\s+/g, "-") || `cliente-${Date.now()}`;

  clients.push({
    id,
    name,
    whatsapp,
    phoneDigits: `55${digits(whatsapp)}`,
    status: "Ativo",
    since: "2026",
    lastVisit: "primeiro atendimento",
    bag,
    neighborhood: "Praia Grande",
    tags: ["novo"]
  });

  closeNewClient();
  renderRecentClients();
  selectClient(id);
  showToast("Cliente cadastrado.");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeWhatsapp();
    closeNewClient();
  }
});

renderRecentClients();
renderAdminClients();
renderCart();
animateAdminCounters();
requestAnimationFrame(() => {
  adminShell.classList.add("ready");
});
window.setTimeout(() => {
  document.body.classList.add("loaded");
}, 650);
