# Fiore Residences — Landing Page

Landing page de captação de leads para o lançamento **Fiore Residences** (Nova Iguaçu, RJ).
Cliente: Wilson / Absoluto Engenharia. Marketing: Inovar Mídia.

## Stack
Padrão **Griffe Cinematográfico** (HTML + CSS + JS puro, zero build).
GSAP 3.12 + ScrollTrigger + Lenis via CDN. Fontes Fontshare: Zodiak (serif display) + Satoshi (corpo).
Paleta: espresso escuro + champagne gold. Tudo estático, Vercel só serve.

## Estrutura
- `index.html` — página única
- `css/style.css` — design system retintado do template Griffe
- `js/main.js` — motor de animação (cópia verbatim do template) + script inline do formulário
- `img/` — 8 renders extraídos do PDF `HCB- Imagens Fachada Fiore-R02.pdf`, otimizados para web

## Seções
Hero · Marquee · O Empreendimento · Arquitetura (lista índice, 8 itens) · Galeria (carrossel pinado) ·
Estilo de vida (4 cards) · Natureza · Plantas/Material (WhatsApp) · Cadastre-se (form) · Localização · CTA final · Footer.

## Formulário de captação
O form em `#cadastro` não usa backend. Ao enviar, monta uma mensagem com nome, WhatsApp, e-mail e
interesse, e abre o `wa.me` do time de vendas. Robusto e sem dependência.
Para enviar leads direto ao **Pipedrive** (CRM do projeto), trocar o handler por um POST ao
webhook/Formspree/endpoint do CRM. Marcado no `<script>` ao fim do `index.html`.

## PLACEHOLDERS — confirmar com o Wilson antes de divulgar
- **WhatsApp do time de vendas:** está usando `5521991024201` (número Absoluto do cérebro). Confirmar se é o número de vendas do Fiore.
- **Instagram:** `instagram.com/fiore.residences` (placeholder). Trocar pelo handle real.
- **E-mail:** `contato@absolutoengenharia.com.br` (do cérebro).
- **Endereço exato:** mantido genérico ("Nova Iguaçu · RJ"). Mapa centrado na cidade. Inserir rua quando liberado.
- **Specs reais:** a copy é qualitativa e fiel aos renders (cobogó, varandas, rooftop, serra). Não há m², nº de dormitórios, tipologias, preço nem data de entrega (não foram informados). Inserir quando houver tabela/memorial.
- **Plantas:** seção "Plantas & Tipologias" hoje leva ao WhatsApp. Adicionar as plantas reais quando disponíveis.

## Deploy
Estático. Na pasta do projeto: `vercel deploy --prod --yes` (ou `git push` → Vercel).
`.vercelignore` exclui `_raw/`, `.claude/` e este `NOTAS.md`.

## Preview local
`python3 -m http.server 4173 --directory .` e abrir http://localhost:4173
(ou usar o painel de preview do Claude — config em `.claude/launch.json`).
