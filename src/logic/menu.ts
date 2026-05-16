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

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function guessColor(category: string) {
  if (category === "Doces") return COLORS.danger;
  return COLORS.accent;
}

function buildIngredients(description: string) {
  const parts = description
    .replace(/\s+/g, " ")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return parts.slice(0, 6);
}

const PIZZA_IMAGE_SALGADA = "/pizzas/pizza-salgada.webp";
const PIZZA_IMAGE_DOCE = "/pizzas/pizza-doce.webp";

function svgDataUrl(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function drinkKindFromName(name?: string) {
  const n = String(name || "").toLowerCase();
  if (/(coca|guaran|schweppes)/.test(n)) return "refrigerantes";
  return "bebidas";
}

const DRINK_IMAGE_BEBIDAS = svgDataUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1411"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient><radialGradient id="glow" cx="30%" cy="25%" r="60%"><stop offset="0" stop-color="#25c522" stop-opacity="0.45"/><stop offset="1" stop-color="#25c522" stop-opacity="0"/></radialGradient></defs><rect width="900" height="600" rx="48" fill="url(#bg)"/><rect width="900" height="600" rx="48" fill="url(#glow)"/><g opacity="0.25" fill="#ffffff"><circle cx="740" cy="120" r="84"/><circle cx="740" cy="120" r="48"/></g><g fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M300 140h86l18 44v60c0 22-18 40-40 40h-42c-22 0-40-18-40-40v-60l18-44z"/><path d="M318 140v-30h50v30"/><path d="M520 170h86v254c0 34-28 62-62 62h-24c-34 0-62-28-62-62V170z"/><path d="M520 170v-28c0-18 14-32 32-32h22c18 0 32 14 32 32v28"/></g><text x="60" y="105" fill="#ffffff" fill-opacity="0.95" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial" font-size="56" font-weight="900" letter-spacing="4">BEBIDAS</text><text x="60" y="155" fill="#ffffff" fill-opacity="0.78" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial" font-size="22" font-weight="800" letter-spacing="1.5">SUCOS • ÁGUAS • CERVEJAS</text></svg>`
);

const DRINK_IMAGE_REFRIGERANTES = svgDataUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0b1411"/><stop offset="1" stop-color="#0a0a0a"/></linearGradient><radialGradient id="glow" cx="30%" cy="25%" r="60%"><stop offset="0" stop-color="#25c522" stop-opacity="0.45"/><stop offset="1" stop-color="#25c522" stop-opacity="0"/></radialGradient></defs><rect width="900" height="600" rx="48" fill="url(#bg)"/><rect width="900" height="600" rx="48" fill="url(#glow)"/><g opacity="0.25" fill="#ffffff"><circle cx="745" cy="118" r="86"/><circle cx="745" cy="118" r="52"/></g><g fill="none" stroke="#ffffff" stroke-opacity="0.9" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M340 150h72l14 34v78c0 22-18 40-40 40h-20c-22 0-40-18-40-40v-78l14-34z"/><path d="M350 150v-34h52v34"/><path d="M520 160h92v258c0 38-30 68-68 68h-24c-38 0-68-30-68-68V160z"/><path d="M520 160v-26c0-18 14-32 32-32h28c18 0 32 14 32 32v26"/></g><text x="60" y="105" fill="#ffffff" fill-opacity="0.95" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial" font-size="50" font-weight="900" letter-spacing="3.5">REFRIGERANTES</text><text x="60" y="155" fill="#ffffff" fill-opacity="0.78" font-family="system-ui,-apple-system,Segoe UI,Roboto,Arial" font-size="22" font-weight="800" letter-spacing="1.5">COCA • GUARANÁ • SCHWEPPES</text></svg>`
);

export function getPizzaImage(
  pizza: { imageUrl?: string; category?: string; name?: string } | null
) {
  if (pizza?.imageUrl) return pizza.imageUrl;
  if (pizza?.category === "Bebidas") {
    return drinkKindFromName(pizza?.name) === "refrigerantes"
      ? DRINK_IMAGE_REFRIGERANTES
      : DRINK_IMAGE_BEBIDAS;
  }
  if (pizza?.category === "Doces") return PIZZA_IMAGE_DOCE;
  return PIZZA_IMAGE_SALGADA;
}

function makePizza({
  id,
  name,
  description,
  category,
  priceG,
  imageUrl,
}: {
  id: number;
  name: string;
  description: string;
  category: string;
  priceG: number;
  imageUrl?: string;
}) {
  const glowColor = guessColor(category);
  const isDrink = category === "Bebidas";
  const defaultImageUrl = isDrink
    ? drinkKindFromName(name) === "refrigerantes"
      ? DRINK_IMAGE_REFRIGERANTES
      : DRINK_IMAGE_BEBIDAS
    : category === "Doces"
      ? PIZZA_IMAGE_DOCE
      : PIZZA_IMAGE_SALGADA;
  return {
    id,
    name,
    category,
    description,
    imageUrl: imageUrl || defaultImageUrl,
    glowColor,
    tag: category === "Doces" ? "Doce" : isDrink ? "Bebida" : "Salgada",
    tagColor: glowColor,
    temps: "30min",
    rating: 4.8,
    sizes: isDrink
      ? { U: round2(priceG) }
      : {
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
  { name: "Margherita", description: "Molho de tomate pelati, mussarela, tomates italianos e Pesto de Manjericão.", priceG: 61.8, category: "Salgadas", imageUrl: "/Margherita.webp" },
  { name: "Provoleta", description: "Molho de tomate, queijo provolone, tomatinhos assados e chimichurri.", priceG: 64.06, category: "Salgadas" },
  { name: "Calabresa", description: "Molho de tomate pelati, mussarela e calabresa.", priceG: 67.59, category: "Salgadas", imageUrl: "/calabresa.webp" },
  { name: "Marinara", description: "Molho de tomate pelado, alho fresco, parmesão e pesto de manjericão.", priceG: 68.75, category: "Salgadas" },
  { name: "Portuguesa", description: "Molho de tomate pelado, presunto, tomates, ovo, azeitonas, cebola e mussarela.", priceG: 76.29, category: "Salgadas" },
  { name: "Siciliana", description: "Mussarela, calabresa, azeitonas, bacon e pimenta calabresa.", priceG: 78.78, category: "Salgadas" },
  { name: "Milho Verde", description: "Molho de pelati, milho, tomatinhos, champignons, mussarela e CATUPIRY®.", priceG: 82.93, category: "Salgadas" },
  { name: "Lombinho", description: "Pelati, lombo canadense, mussarela e CATUPIRY®.", priceG: 84.26, category: "Salgadas" },
  { name: "Frango Pollo", description: "Molho de tomate, mussarela, frango com CATUPIRY®, champignons e azeitonas.", priceG: 85.09, category: "Salgadas", imageUrl: "/Frango Pollo.webp" },
  { name: "Presunto", description: "Molho de pelati, mussarela, presunto, orégano, azeite e parmesão.", priceG: 85.39, category: "Salgadas" },
  { name: "Melanzane", description: "Berinjela frita marinada, molho de tomate, mussarela e amêndoas defumadas.", priceG: 85.5, category: "Salgadas" },
  { name: "Pépe", description: "Calabresa moída com pimenta dedo de moça, cebola e mussarela.", priceG: 86.54, category: "Salgadas" },
  { name: "Quatro Queijos", description: "Mussarela, provolone, CATUPIRY® e gorgonzola sobre molho de tomates.", priceG: 86.89, category: "Salgadas" },
  { name: "Calábria", description: "Molho de pelati, mussarela, calabresa, tomate, azeitonas, cebola e parmesão.", priceG: 89.22, category: "Salgadas", imageUrl: "/Calábria.webp" },
  { name: "Presunto com Catupiry", description: "Molho, mussarela, presunto e CATUPIRY®.", priceG: 89.94, category: "Salgadas" },
  { name: "Camponesa", description: "Mussarela, lombinho, tomatinhos, champignons, cebola e orégano.", priceG: 90.92, category: "Salgadas" },
  { name: "Jardins do Guará", description: "Brócolis, tomatinhos, champignons, cebola roxa, azeitona, molho tarê, parmesão e amêndoas.", priceG: 92.7, category: "Salgadas" },
  { name: "Portuguesa Alla Cana", description: "Portuguesa clássica adicionada de calabresa e bacon em fatias.", priceG: 97.71, category: "Salgadas" },
  { name: "Provençal", description: "Molho de tomate, alho, berinjela marinada, abobrinha, chimichurri, tomatinhos, azeitonas e parmesão.", priceG: 97.81, category: "Salgadas", imageUrl: "/Provençal.webp" },
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
  { name: "Enzo", description: "Molho de tomate pelado, rosbife, gorgonzola, cebola caramelizada no Vinho do Porto e bacon.", priceG: 126.82, category: "Salgadas", imageUrl: "/Enzo.webp" },
  { name: "Atum", description: "Molho de tomate pelado, atum, tomate, azeitonas, mussarela e CATUPIRY®.", priceG: 131.9, category: "Salgadas" },
  { name: "Dolce Vita", description: "Molho de tomate, damasco, mussarela, brie, mel e amêndoas.", priceG: 132.63, category: "Salgadas", imageUrl: "/Dolce Vita.webp" },
  { name: "Atum Clássico", description: "Molho de tomate pelado, atum em pedaços, mussarela, tomatinhos, cebola, azeitonas e parmesão.", priceG: 133.69, category: "Salgadas" },
  { name: "Camarão", description: "Camarões no alho e azeite, CATUPIRY®, mussarela e tomatinhos assados.", priceG: 138.91, category: "Salgadas", imageUrl: "/Camarão.webp" },
  { name: "Atum Contemporâneo", description: "Molho pelati, atum em azeite, alcaparras, cebola, gorgonzola e raspas de limão.", priceG: 142.41, category: "Salgadas" },
  { name: "Alici", description: "Molho de tomate pelado, filé de anchovas argentinas, azeitonas, tomatinhos e orégano.", priceG: 158.34, category: "Salgadas" },
  { name: "Banana", description: "Banana, mussarela e canela com açúcar.", priceG: 45.54, category: "Doces" },
  { name: "Banca", description: "Mussarela, banana, bacon e melado de cana.", priceG: 65.01, category: "Doces", imageUrl: "/Banca.webp" },
  { name: "Lombo a Weslley", description: "Queijo derretido, lombo canadense e compota de abacaxi.", priceG: 69.74, category: "Doces" },
  { name: "Banana com Chocolate", description: "Banana e chocolate.", priceG: 75.99, category: "Doces", imageUrl: "/Banana com Chocolate.webp" },
  { name: "Suflair", description: "Chocolate Suflair e queijo.", priceG: 116.4, category: "Doces" },
  { name: "Nutella", description: "NUTELLA® e pistache.", priceG: 126.16, category: "Doces" },
  { name: "Suco Néctar Del Valle 1L - Manga", description: "Suco Néctar Del Valle 1 litro - Manga.", priceG: 17.99, category: "Bebidas" },
  { name: "Suco Néctar Del Valle 1L - Maracujá", description: "Suco Néctar Del Valle 1 litro - Maracujá.", priceG: 17.99, category: "Bebidas" },
  { name: "Suco Néctar Del Valle 1L - Uva", description: "Suco Néctar Del Valle 1 litro - Uva.", priceG: 17.99, category: "Bebidas" },
  { name: "Matte Leão Original 1,5L", description: "Matte Leão Original 1,5 litro.", priceG: 19.75, category: "Bebidas" },
  { name: "Coca-Cola 2L", description: "Coca-Cola 2 litros.", priceG: 19.99, category: "Bebidas" },
  { name: "Schweppes Citrus 1,5L", description: "Schweppes Citrus 1,5 litro.", priceG: 18.63, category: "Bebidas" },
  { name: "Coca Zero 2L", description: "Coca Zero 2 litros.", priceG: 19.99, category: "Bebidas" },
  { name: "Guaraná Zero 1,5L", description: "Guaraná Zero 1,5 litro.", priceG: 13.25, category: "Bebidas" },
  { name: "Coca-Cola 600ml", description: "Coca-Cola 600ml.", priceG: 9.87, category: "Bebidas" },
  { name: "Coca Zero 600ml", description: "Coca Zero 600ml.", priceG: 9.78, category: "Bebidas" },
  { name: "Guaraná 600ml", description: "Guaraná 600ml.", priceG: 9.11, category: "Bebidas" },
  { name: "Guaraná Zero 600ml", description: "Guaraná Zero 600ml.", priceG: 8.99, category: "Bebidas" },
  { name: "Matte Leão Original 300ml", description: "Matte Leão Original 300ml.", priceG: 7.68, category: "Bebidas" },
  { name: "Coca-Cola Lata", description: "Coca-Cola lata.", priceG: 5.24, category: "Bebidas" },
  { name: "Coca Zero Lata", description: "Coca Zero lata.", priceG: 5.15, category: "Bebidas" },
  { name: "Guaraná Lata", description: "Guaraná lata.", priceG: 4.99, category: "Bebidas" },
  { name: "Guaraná Zero Lata", description: "Guaraná Zero lata.", priceG: 4.99, category: "Bebidas" },
  { name: "Schweppes Tônica Lata", description: "Schweppes Tônica lata.", priceG: 5.84, category: "Bebidas" },
  { name: "Schweppes Citrus Lata", description: "Schweppes Citrus lata.", priceG: 5.61, category: "Bebidas" },
  { name: "Água com Gás", description: "Água com gás.", priceG: 4.0, category: "Bebidas" },
  { name: "Água sem Gás", description: "Água sem gás.", priceG: 3.0, category: "Bebidas" },
  { name: "Cerveja Heineken Lata", description: "Cerveja Heineken lata.", priceG: 10.0, category: "Bebidas" },
];

export const PIZZAS = PIZZA_DATA.map((p, index) => makePizza({ id: index + 1, ...p }));
