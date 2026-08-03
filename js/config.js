/**
 * Configuração central do site — Ateliê do Bordado.
 * Edite aqui número de WhatsApp, Instagram, endereço, horários,
 * categorias do portfólio e mensagens automáticas.
 */

const SITE_CONFIG = {
  businessName: "Ateliê do Bordado",

  // Número real do ateliê: (33) 8818-4591
  whatsappNumber: "553388184591",

  instagramUrl: "https://www.instagram.com/atelie_do_bordado/",

  businessAddress: "Rua Caio Martins, 123 — Centro",

  businessHours: "Segunda a sexta, das 8h às 18h · Sábado, das 8h às 12h",

  // Categorias do portfólio — associe imagens a cada categoria em PORTFOLIO_ITEMS abaixo
  categories: [
    { id: "todos", label: "Todos" },
    { id: "enxovais", label: "Enxovais" },
    { id: "fraldas", label: "Fraldas Bordadas" },
    { id: "toalhas", label: "Toalhas" },
    { id: "mantas", label: "Mantas" },
    { id: "batizado", label: "Batizado" },
    { id: "kits", label: "Kits Personalizados" },
    { id: "presentes", label: "Presentes" },
    { id: "pronta-entrega", label: "Pronta Entrega" },
  ],

  // Itens do portfólio. Substitua "image" pelos arquivos reais em /img
  // e ajuste "category" e "alt" conforme a peça verdadeira.
  portfolioItems: [
    { image: "img/portfolio-01.jpeg", category: "presentes", alt: "Peça bordada personalizada — substituir por descrição real" },
    { image: "img/portfolio-02.jpeg", category: "pronta-entrega", alt: "Vitrine do ateliê — substituir por descrição real" },
    { image: "img/portfolio-03.jpeg", category: "mantas", alt: "Manta bordada com tema de balão — substituir por descrição real" },
    { image: "img/portfolio-04.jpeg", category: "enxovais", alt: "Almofada bordada com nome — substituir por descrição real" },
    { image: "img/portfolio-05.jpeg", category: "batizado", alt: "Peça bordada para batizado — substituir por descrição real" },
    { image: "img/portfolio-06.jpeg", category: "toalhas", alt: "Toalha bordada personalizada — substituir por descrição real" },
    { image: "img/portfolio-07.jpeg", category: "kits", alt: "Kit personalizado bordado — substituir por descrição real" },
    { image: "img/portfolio-08.jpeg", category: "fraldas", alt: "Fralda bordada personalizada — substituir por descrição real" },
    { image: "img/portfolio-09.jpeg", category: "batizado", alt: "Peça de batizado bordada — substituir por descrição real" },
    { image: "img/portfolio-10.jpeg", category: "presentes", alt: "Presente personalizado bordado — substituir por descrição real" },
    { image: "img/portfolio-11.jpeg", category: "enxovais", alt: "Peça de enxoval bordada — substituir por descrição real" },
    { image: "img/portfolio-12.jpeg", category: "mantas", alt: "Manta bordada — substituir por descrição real" },
    { image: "img/portfolio-13.jpeg", category: "toalhas", alt: "Toalha bordada — substituir por descrição real" },
    { image: "img/portfolio-14.jpeg", category: "kits", alt: "Kit bordado — substituir por descrição real" },
    { image: "img/portfolio-15.jpeg", category: "fraldas", alt: "Fralda bordada — substituir por descrição real" },
    { image: "img/portfolio-16.jpeg", category: "pronta-entrega", alt: "Peça de pronta entrega — substituir por descrição real" },
    { image: "img/portfolio-17.jpeg", category: "presentes", alt: "Presente bordado — substituir por descrição real" },
  ],

  // Mensagens automáticas do WhatsApp, por origem do clique
  messages: {
    hero: "Olá! Conheci o Ateliê do Bordado pelo site e gostaria de criar uma peça personalizada.",
    identification: "Olá! Gostaria de contar sobre o momento especial que quero tornar ainda mais marcante.",
    benefits: "Olá! Gostaria de conversar sobre a minha ideia de peça personalizada.",
    portfolio: "Olá! Vi um trabalho no portfólio e gostaria de solicitar algo semelhante, com outra personalização.",
    customization: "Olá! Gostaria de enviar uma inspiração e verificar a possibilidade de personalização.",
    howItWorks: "Olá! Gostaria de começar meu atendimento para uma peça personalizada.",
    occasions: "Olá! Estou procurando uma ideia para presentear e gostaria de sugestões.",
    about: "Olá! Gostaria de saber mais sobre o trabalho do Ateliê do Bordado.",
    faq: "Olá! Tenho uma dúvida sobre os produtos e a personalização.",
    final: "Olá! Quero criar minha peça personalizada com o Ateliê do Bordado.",
  },
};
