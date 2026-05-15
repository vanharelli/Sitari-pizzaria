export const CATEGORIES = ["Todas", "Salgadas", "Doces"];

export const COLORS = {
  accent: "#25c522ff",
  danger: "#ef4444",
  black: "#000000",
  white: "#ffffff",
};

export const SITE_INFO = {
  brand: "Sitári Pizzaria Delivery",
  tagline: "Escolha até 4 sabores por pizza, sem sair de casa.",
  about:
    "Chegamos trazendo a essência da tradicional pizza brasileira. Sitári (σιτάρι) em grego significa Trigo, a base de tudo.",
  phoneDisplay: "(61) 99883-8898",
  whatsappDigits: "5561998838898",
  instagramUrl: "https://www.instagram.com/sitaripizzaria",
  addressLine1: "QE36 Comércio Local A, Loja 35",
  addressLine2: "Guará 2, Brasília/DF, 71065-613",
  hoursLabel: "De terça a domingo • 18h às 22h30",
  orderUrl: "https://sitaripizzaria.saipos.com/home",
  google: {
    placeUrl:
      "https://www.google.com/maps/place/Sit%C3%A1ri+Pizzaria+-+Guar%C3%A1/@-15.8424298,-47.9694567,17z/data=!3m1!4b1!4m6!3m5!1s0x935a2f9fe0a9e9e9:0x3150f9fbd0ce4c02!8m2!3d-15.8424298!4d-47.9668818!16s%2Fg%2F11s1w52bfh?entry=ttu&g_ep=EgoyMDI2MDUxMi4wIKXMDSoASAFQAw%3D%3D",
    location: {
      lat: -15.8424298,
      lng: -47.9668818,
    },
    rating: 4.9,
  },
  review: {
    author: "Letícia",
    source: "Google Maps",
    text:
      "A pizza é sempre muito gostosa. A massa tradicional é fininha e saborosa, ingredientes frescos e de qualidade. Sitári ganhou meu coração e é sempre minha escolha quando penso em pizza.",
  },
  intro: {
    title: "Bem-vindos à Sitári Pizzaria, onde a paixão vira sabor!",
    text:
      "Se você busca mais que uma simples pizza, está no lugar certo. Na Sitári, nossa paixão se traduz em sabores diferenciados e combinações únicas, tudo preparado com ingredientes de alta qualidade. Venha descobrir o que torna nossa pizza tão especial. Um sabor que você nunca vai esquecer.",
    promo: "APROVEITE NOSSOS CUPONS DE DESCONTOS!",
  },
  sizes: {
    M: { label: "Pizza Média", startingAt: 34.18 },
    G: { label: "Pizza Grande", startingAt: 45.54 },
  },
};

const MEDIA_FACTOR = SITE_INFO.sizes.M.startingAt / SITE_INFO.sizes.G.startingAt;

function round2(value) {
  return Math.round(value * 100) / 100;
}

function guessEmoji(name, category) {
  const n = name.toLowerCase();
  if (category === "Doces") {
    if (n.includes("banana")) return "🍌";
    if (n.includes("nutella")) return "🍫";
    if (n.includes("suflair")) return "🍫";
    return "🍯";
  }
  if (n.includes("camar")) return "🍤";
  if (n.includes("atum")) return "🐟";
  if (n.includes("pepperoni")) return "🔥";
  if (n.includes("carne")) return "🥩";
  if (n.includes("bacon")) return "🥓";
  if (n.includes("frango")) return "🐔";
  return "🍕";
}

function guessColor(category) {
  if (category === "Doces") return COLORS.danger;
  return COLORS.accent;
}

function buildIngredients(description) {
  const parts = description
    .replace(/\s+/g, " ")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.slice(0, 6);
}

const PIZZA_IMAGE_SALGADA = "/pizzas/pizza-salgada.webp";
const PIZZA_IMAGE_DOCE = "/pizzas/pizza-doce.webp";

export function getPizzaImage(pizza) {
  if (pizza?.imageUrl) return pizza.imageUrl;
  if (pizza?.category === "Doces") return PIZZA_IMAGE_DOCE;
  return PIZZA_IMAGE_SALGADA;
}

function makePizza({ id, name, description, category, priceG }) {
  const glowColor = guessColor(category);
  return {
    id,
    name,
    category,
    description,
    imageUrl: category === "Doces" ? PIZZA_IMAGE_DOCE : PIZZA_IMAGE_SALGADA,
    glowColor,
    tag: category === "Doces" ? "Doce" : "Salgada",
    tagColor: glowColor,
    temps: "30min",
    rating: 4.8,
    sizes: {
      M: round2(priceG * MEDIA_FACTOR),
      G: round2(priceG),
    },
    extras: [],
    ingredients: buildIngredients(description),
  };
}

const PIZZA_DATA = [
  { name: "Mussarela", description: "Molho de tomate pelado, mussarela e orégano.", priceG: 56.91, category: "Salgadas" },
  { name: "Zucchine", description: "Abobrinhas fatiadas, chimichurri e queijo parmesão.", priceG: 58.67, category: "Salgadas" },
  { name: "Margherita", description: "Molho de tomate pelati, mussarela, tomates italianos e Pesto de Manjericão.", priceG: 61.8, category: "Salgadas" },
  { name: "Provoleta", description: "Molho de tomate, queijo provolone, tomatinhos assados e chimichurri.", priceG: 64.06, category: "Salgadas" },
  { name: "Calabresa", description: "Molho de tomate pelati, mussarela e calabresa.", priceG: 67.59, category: "Salgadas" },
  { name: "Marinara", description: "Molho de tomate pelado, alho fresco, parmesão e pesto de manjericão.", priceG: 68.75, category: "Salgadas" },
  { name: "Portuguesa", description: "Molho de tomate pelado, presunto, tomates, ovo, azeitonas, cebola e mussarela.", priceG: 76.29, category: "Salgadas" },
  { name: "Siciliana", description: "Mussarela, calabresa, azeitonas, bacon e pimenta calabresa.", priceG: 78.78, category: "Salgadas" },
  { name: "Milho Verde", description: "Molho de pelati, milho, tomatinhos, champignons, mussarela e CATUPIRY®.", priceG: 82.93, category: "Salgadas" },
  { name: "Lombinho", description: "Pelati, lombo canadense, mussarela e CATUPIRY®.", priceG: 84.26, category: "Salgadas" },
  { name: "Frango Pollo", description: "Molho de tomate, mussarela, frango com CATUPIRY®, champignons e azeitonas.", priceG: 85.09, category: "Salgadas" },
  { name: "Presunto", description: "Molho de pelati, mussarela, presunto, orégano, azeite e parmesão.", priceG: 85.39, category: "Salgadas" },
  { name: "Melanzane", description: "Berinjela frita marinada, molho de tomate, mussarela e amêndoas defumadas.", priceG: 85.5, category: "Salgadas" },
  { name: "Pépe", description: "Calabresa moída com pimenta dedo de moça, cebola e mussarela.", priceG: 86.54, category: "Salgadas" },
  { name: "Quatro Queijos", description: "Mussarela, provolone, CATUPIRY® e gorgonzola sobre molho de tomates.", priceG: 86.89, category: "Salgadas" },
  { name: "Calábria", description: "Molho de pelati, mussarela, calabresa, tomate, azeitonas, cebola e parmesão.", priceG: 89.22, category: "Salgadas" },
  { name: "Presunto com Catupiry", description: "Molho, mussarela, presunto e CATUPIRY®.", priceG: 89.94, category: "Salgadas" },
  { name: "Camponesa", description: "Mussarela, lombinho, tomatinhos, champignons, cebola e orégano.", priceG: 90.92, category: "Salgadas" },
  { name: "Jardins do Guará", description: "Brócolis, tomatinhos, champignons, cebola roxa, azeitona, molho tarê, parmesão e amêndoas.", priceG: 92.7, category: "Salgadas" },
  { name: "Portuguesa Alla Cana", description: "Portuguesa clássica adicionada de calabresa e bacon em fatias.", priceG: 97.71, category: "Salgadas" },
  { name: "Provençal", description: "Molho de tomate, alho, berinjela marinada, abobrinha, chimichurri, tomatinhos, azeitonas e parmesão.", priceG: 97.81, category: "Salgadas" },
  { name: "Bacon", description: "Molho de tomate pelado, mussarela, cebola caramelizada e bacon.", priceG: 102.27, category: "Salgadas" },
  { name: "Carne Seca", description: "Carne refogada na manteiga de garrafa, molho de tomate, mussarela e CATUPIRY®.", priceG: 102.63, category: "Salgadas" },
  { name: "Pepperoni", description: "Molho de tomate, mussarela e salame tipo pepperoni.", priceG: 102.63, category: "Salgadas" },
  { name: "Babbo Césare", description: "Molho de tomate, mussarela, presunto, calabresa, cebola e alho dourado.", priceG: 104.25, category: "Salgadas" },
  { name: "Porteña", description: "Molho, rosbife, cebola roxa, chimichurri e queijo.", priceG: 104.5, category: "Salgadas" },
  { name: "Pesto & Tal", description: "Molho de tomate pelati, mussarela, tomatinhos assados, presunto cru e Pesto de Manjericão.", priceG: 104.81, category: "Salgadas" },
  { name: "Palmito", description: "Molho de tomate pelati, palmito fatiado, tomatinhos assados, mussarela e CATUPIRY®.", priceG: 104.99, category: "Salgadas" },
  { name: "Calabresa com Catupiry", description: "Calabresa e CATUPIRY®.", priceG: 107.18, category: "Salgadas" },
  { name: "Melanzane Alla Putanesca", description: "Berinjela marinada, molho puttanesca (tomate, alici, azeitonas, alcaparras, pimenta), parmesão e manjericão.", priceG: 107.36, category: "Salgadas" },
  { name: "Franguito 36", description: "Molho de tomate, mussarela, frango, azeitonas Azapa, parmesão e bacon.", priceG: 113.83, category: "Salgadas" },
  { name: "Alla Páprika", description: "Molho de tomate pelado, gorgonzola, presunto cru, pistache e limão siciliano.", priceG: 117.54, category: "Salgadas" },
  { name: "Stoner", description: "Molho de pelati, mussarela, pepperoni, bacon, azeitonas, orégano e pimenta calabresa.", priceG: 124.56, category: "Salgadas" },
  { name: "Enzo", description: "Molho de tomate pelado, rosbife, gorgonzola, cebola caramelizada no Vinho do Porto e bacon.", priceG: 126.82, category: "Salgadas" },
  { name: "Atum", description: "Molho de tomate pelado, atum, tomate, azeitonas, mussarela e CATUPIRY®.", priceG: 131.9, category: "Salgadas" },
  { name: "Dolce Vita", description: "Molho de tomate, damasco, mussarela, brie, mel e amêndoas.", priceG: 132.63, category: "Salgadas" },
  { name: "Atum Clássico", description: "Molho de tomate pelado, atum em pedaços, mussarela, tomatinhos, cebola, azeitonas e parmesão.", priceG: 133.69, category: "Salgadas" },
  { name: "Camarão", description: "Camarões no alho e azeite, CATUPIRY®, mussarela e tomatinhos assados.", priceG: 138.91, category: "Salgadas" },
  { name: "Atum Contemporâneo", description: "Molho pelati, atum em azeite, alcaparras, cebola, gorgonzola e raspas de limão.", priceG: 142.41, category: "Salgadas" },
  { name: "Alici", description: "Molho de tomate pelado, filé de anchovas argentinas, azeitonas, tomatinhos e orégano.", priceG: 158.34, category: "Salgadas" },
  { name: "Banana", description: "Banana, mussarela e canela com açúcar.", priceG: 45.54, category: "Doces" },
  { name: "Banca", description: "Mussarela, banana, bacon e melado de cana.", priceG: 65.01, category: "Doces" },
  { name: "Lombo a Weslley", description: "Queijo derretido, lombo canadense e compota de abacaxi.", priceG: 69.74, category: "Doces" },
  { name: "Banana com Chocolate", description: "Banana e chocolate.", priceG: 75.99, category: "Doces" },
  { name: "Suflair", description: "Chocolate Suflair e queijo.", priceG: 116.4, category: "Doces" },
  { name: "Nutella", description: "NUTELLA® e pistache.", priceG: 126.16, category: "Doces" },
];

export const PIZZAS = PIZZA_DATA.map((p, index) =>
  makePizza({ id: index + 1, ...p })
);
