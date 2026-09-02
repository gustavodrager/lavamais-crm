const somenteDigitos = /\D/g;

export function criarLinkWhatsapp(telefone: string, mensagem: string) {
  let numero = telefone.replace(somenteDigitos, "");
  if (numero.length === 10 || numero.length === 11) numero = `55${numero}`;
  if (numero.length < 12 || numero.length > 15) throw new Error("Telefone de WhatsApp invalido.");
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
}
