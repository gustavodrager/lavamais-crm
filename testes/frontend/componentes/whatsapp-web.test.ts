import { criarLinkWhatsapp } from "../../../src/web/src/lib/whatsapp-web";

describe("criarLinkWhatsapp", () => {
  it("normaliza o telefone e preserva a mensagem pronta na URL oficial", () => {
    expect(criarLinkWhatsapp("+55 (13) 99999-9999", "Olá, Gustavo! Tudo bem?")).toBe(
      "https://wa.me/5513999999999?text=Ol%C3%A1%2C%20Gustavo!%20Tudo%20bem%3F",
    );
  });

  it("inclui o codigo do Brasil quando o cadastro informa somente DDD e numero", () => {
    expect(criarLinkWhatsapp("11 99999-9999", "Mensagem")).toBe(
      "https://wa.me/5511999999999?text=Mensagem",
    );
  });

  it.each(["", "123", "+55 13 ABC"])("rejeita o telefone inválido %p", (telefone) => {
    expect(() => criarLinkWhatsapp(telefone, "Mensagem")).toThrow("Telefone de WhatsApp invalido");
  });
});
