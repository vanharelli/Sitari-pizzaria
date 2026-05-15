import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  ExternalLink,
  Instagram,
  MapPin,
  Minus,
  Phone,
  Plus,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { CategoryFilter } from "./components/CategoryFilter";
import { PizzaCard } from "./components/PizzaCard";
import { ProductModal } from "./components/ProductModal";
import { useCart } from "./hooks/useCart";
import { getPizzaImage, PIZZAS, SITE_INFO } from "./data/menu";
import {
  calculateDiscount,
  findBestCoupon,
  getNewlyUnlockedThresholdCoupon,
  PromotionPopup,
} from "./sitari-menu";
import { formatWhatsAppMessage } from "./utils/formatWhatsAppMessage";

export default function App() {
  const [category, setCategory] = useState("Todas");
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [fulfillment, setFulfillment] = useState("Entrega");
  const [payment, setPayment] = useState("PIX");
  const [cardType, setCardType] = useState("Crédito");
  const [changeFor, setChangeFor] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [promoOpen, setPromoOpen] = useState(false);
  const [promoOffer, setPromoOffer] = useState(null);
  const [customer, setCustomer] = useState({
    name: "",
    whatsapp: "",
  });
  const mostOrderedScrollRef = useRef(null);
  const promoMetaRef = useRef({ lastShownCode: "", lastSubtotal: 0 });
  const { items, addItem, incrementItem, decrementItem, removeItem, total } =
    useCart();
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    reference: "",
  });

  const getBusinessStatus = () => {
    const now = new Date();
    const day = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const openDays = new Set([0, 2, 3, 4, 5, 6]);
    const openMinutes = 18 * 60;
    const closeMinutes = 22 * 60 + 30;
    const isOpen =
      openDays.has(day) && minutes >= openMinutes && minutes <= closeMinutes;
    return {
      isOpen,
      label: isOpen ? "Aberto agora" : "Fechado agora",
    };
  };

  const status = getBusinessStatus();
  const todayIndex = new Date().getDay();
  const couponDiscount = couponCode
    ? calculateDiscount(total, payment, couponCode)
    : 0;
  const finalTotal = Math.max(0, total - couponDiscount);
  const bestOffer = findBestCoupon(total, payment);

  const filtered =
    category === "Todas" ? PIZZAS : PIZZAS.filter((p) => p.category === category);

  const destinationLat = SITE_INFO.google?.location?.lat;
  const destinationLng = SITE_INFO.google?.location?.lng;
  const destination =
    typeof destinationLat === "number" && typeof destinationLng === "number"
      ? `${destinationLat},${destinationLng}`
      : `${SITE_INFO.addressLine1}, ${SITE_INFO.addressLine2}`;

  const mapsPlaceUrl = SITE_INFO.google?.placeUrl;
  const mapsEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(
    destination
  )}&z=17&output=embed`;

  const mapsDirectionsBaseUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    destination
  )}&travelmode=driving`;

  const openDirectionsToSitari = () => {
    const w = window.open("about:blank", "_blank");
    const fallback = mapsDirectionsBaseUrl;

    if (!w) {
      window.open(fallback);
      return;
    }

    if (!navigator.geolocation) {
      w.location.href = fallback;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
        w.location.href = `${fallback}&origin=${encodeURIComponent(origin)}`;
      },
      () => {
        w.location.href = fallback;
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  const openPromotion = (offer) => {
    if (!offer) return;
    setPromoOffer(offer);
    setPromoOpen(true);
    promoMetaRef.current.lastShownCode = offer.code;
  };

  useEffect(() => {
    if (!cartOpen) return;
    if (checkoutStep !== 2) return;
    if (items.length === 0) return;
    if (promoOpen) return;
    if (!bestOffer || bestOffer.discount <= 0) return;
    if (couponCode && couponDiscount > 0) return;
    if (bestOffer.code === couponCode) return;
    if (bestOffer.code === promoMetaRef.current.lastShownCode) return;
    openPromotion(bestOffer);
  }, [
    cartOpen,
    checkoutStep,
    items.length,
    promoOpen,
    bestOffer,
    couponCode,
    couponDiscount,
  ]);

  useEffect(() => {
    if (cartOpen) return;
    promoMetaRef.current.lastShownCode = "";
  }, [cartOpen]);

  useEffect(() => {
    if (checkoutStep === 2) return;
    if (!promoOpen) return;
    setPromoOpen(false);
  }, [checkoutStep, promoOpen]);

  useEffect(() => {
    const prev = promoMetaRef.current.lastSubtotal || 0;
    promoMetaRef.current.lastSubtotal = total;

    if (!cartOpen) return;
    if (checkoutStep !== 2) return;
    if (items.length === 0) return;
    if (promoOpen) return;
    if (couponCode && couponDiscount > 0) return;
    if (!bestOffer || bestOffer.discount <= 0) return;

    const unlocked = getNewlyUnlockedThresholdCoupon(prev, total);
    if (!unlocked) return;
    if (bestOffer.code === promoMetaRef.current.lastShownCode) return;
    if (bestOffer.code === couponCode) return;

    openPromotion(bestOffer);
  }, [
    total,
    payment,
    cartOpen,
    checkoutStep,
    items.length,
    promoOpen,
    bestOffer,
    couponCode,
    couponDiscount,
  ]);

  const recordOrder = () => {
    try {
      const current = Number(localStorage.getItem("sitari_orders_count") || "0");
      const next = Number.isFinite(current) ? current + 1 : 1;
      localStorage.setItem("sitari_orders_count", String(next));
    } catch {}
  };

  const mostOrderedMeta = [
    {
      name: "Calabresa",
      description: "Pizza feita com molho de tomate pellati, mussarela e calabresa.",
    },
    {
      name: "Margherita",
      description:
        "Pizza feita com molho de tomate pelatti, mussarela, tomate italiano e pesto de manjericão.",
    },
    {
      name: "Frango Pollo",
      description:
        "Pizza feita com molho de tomate pelatti, mussarela, frango ao creme de catupiry, champignons e azeitonas.",
    },
    {
      name: "Provençal",
      description:
        "Pizza feita com molho de tomate pelatti, berinjela, abobrinha, tomatinhos, azeitonas portuguesa, parmesão, alho e chimichurri da casa.",
    },
    {
      name: "Calábria",
      description:
        "Pizza feita com molho de tomate pelatti, mussarela, calabresa, tomate, azeitonas, cebola e parmesão.",
    },
    {
      name: "Dolce Vita",
      description:
        "Pizza feita com molho de tomate pelatti, mussarela, damasco, queijo brie, mel e amêndoas.",
    },
    {
      name: "Camarão",
      description:
        "Pizza feita com molho de tomate pelatti, catupiry, mussarela, camarões salteados com alho e tomatinhos.",
    },
    {
      name: "Enzo",
      description:
        "Pizza feita com molho de tomate pelatti, rosbife, gorgonzola, cebola caramelizada em vinho do porto e bacon.",
    },
    {
      name: "Banana com Chocolate",
      description:
        "Pizza feita com banana, mussarela e chocolate ao leite.",
    },
    {
      name: "Banca",
      description:
        "Pizza feita com mussarela, banana, bacon e melado de cana.",
    },
  ];

  const mostOrderedByName = new Map(
    mostOrderedMeta.map((p) => [p.name, p.description])
  );

  const mostOrderedPizzas = mostOrderedMeta
    .map((m) => PIZZAS.find((p) => p.name === m.name))
    .filter(Boolean);

  useEffect(() => {
    const el = mostOrderedScrollRef.current;
    if (!el) return;
    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (prefersReduced) return;

    let raf = 0;
    const speed = 0.35;
    const step = () => {
      const node = mostOrderedScrollRef.current;
      if (!node) return;
      const max = node.scrollWidth - node.clientWidth;
      if (max > 0) {
        node.scrollLeft += speed;
        if (node.scrollLeft >= max - 1) node.scrollLeft = 0;
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="min-h-screen text-black font-sans selection:bg-[#25c522ff]/20 relative overflow-x-hidden"
      style={{
        backgroundImage: "url(/back3.avif?v=1)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backdropFilter: "blur(6px)", background: "rgba(255,255,255,0.42)" }}
      />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] bg-[#25c522ff]/12 blur-[120px] rounded-full" />
        <div className="absolute top-[25%] -right-[10%] w-[35%] h-[35%] bg-[#25c522ff]/8 blur-[130px] rounded-full" />
      </div>

      <header className="z-40 bg-white/80 backdrop-blur-2xl border-b border-red-500/40 px-6 py-4 flex items-center relative">
        <div className="sm:hidden">
          <h1 className="leading-none">
            <div className="text-base font-black tracking-tighter">
              SITARI{" "}
              <span className="text-black/70 font-black text-[10px] ml-0.5 tracking-widest uppercase">
                Pizzaria
              </span>
            </div>
            <div className="text-[#25c522ff] font-black text-xs tracking-widest uppercase mt-1">
              Delivery
            </div>
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <img
            src="/logosemfundo.png"
            alt="Sitari Pizzaria"
            className="h-11 w-11 sm:h-12 sm:w-12 object-contain shrink-0"
            draggable="false"
          />
          <h1 className="leading-none">
            <div className="text-lg sm:text-xl font-black tracking-tighter">
              SITARI{" "}
              <span className="text-black/70 font-black text-xs sm:text-sm ml-0.5 sm:ml-1 tracking-widest uppercase">
                Pizzaria
              </span>
            </div>
            <div className="text-[#25c522ff] font-black text-xs tracking-widest uppercase mt-1">
              Delivery
            </div>
          </h1>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="relative inline-block">
            <button
              onClick={() => setHoursOpen((v) => !v)}
              className={`px-4 py-2 rounded-full bg-white border text-xs font-black flex items-center gap-2 shadow-sm ${
                status.isOpen ? "border-[#25c522ff]" : "border-red-500"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status.isOpen ? "bg-[#25c522ff]" : "bg-red-500"
                }`}
              />
              {status.isOpen ? "ONLINE" : "FECHADO"}
            </button>

            <AnimatePresence>
              {hoursOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, x: "-50%" }}
                  animate={{ opacity: 1, y: 0, x: "-50%" }}
                  exit={{ opacity: 0, y: 8, x: "-50%" }}
                  className="absolute left-1/2 top-full mt-3 w-[260px] rounded-2xl bg-white border border-[#25c522ff]/50 shadow-lg p-4 z-50"
                >
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                    Horário de funcionamento
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
                    {[
                      { label: "Domingo", hours: "18:00–22:30", index: 0 },
                      { label: "Segunda", hours: "Fechado", index: 1 },
                      { label: "Terça", hours: "18:00–22:30", index: 2 },
                      { label: "Quarta", hours: "18:00–22:30", index: 3 },
                      { label: "Quinta", hours: "18:00–22:30", index: 4 },
                      { label: "Sexta", hours: "18:00–22:30", index: 5 },
                      { label: "Sábado", hours: "18:00–22:30", index: 6 },
                    ].map((d) => {
                      const isToday = d.index === todayIndex;
                      const isClosed = d.hours === "Fechado";
                      const dayClass = isClosed
                        ? "font-black text-red-500"
                        : isToday
                          ? "font-black text-[#25c522ff]"
                          : "font-bold text-black";
                      const hoursClass = isClosed
                        ? "font-black text-red-500"
                        : isToday
                          ? "font-black text-[#25c522ff]"
                          : "text-black/60";
                      return (
                        <div
                          key={d.index}
                          className={`flex ${
                            isToday ? "justify-center gap-3" : "justify-between"
                          } ${
                            isToday
                              ? `rounded-xl ${isClosed ? "bg-red-500/10" : "bg-[#25c522ff]/10"} px-2 py-1`
                              : ""
                          }`}
                        >
                          <span className={dayClass}>{d.label}</span>
                          <span className={hoursClass}>{d.hours}</span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <a
          href={SITE_INFO.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-white/80 border border-red-500/20 shadow-sm flex items-center justify-center text-black hover:bg-white"
        >
          <Instagram size={20} />
        </a>
      </header>

      <main className="relative z-10 pb-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 lg:pr-28 py-8">
          <div className="mb-10">
            <img
              src="/logosemfundo.png"
              alt="Sitari Pizzaria"
              className="sm:hidden mx-auto h-24 w-24 object-contain drop-shadow-xl mb-4"
              draggable="false"
            />
            <h2 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none mb-2">
              {SITE_INFO.intro.title}
            </h2>
            <p className="text-black/70 font-medium">{SITE_INFO.tagline}</p>
            <p className="text-black/60 text-sm mt-3">{SITE_INFO.intro.text}</p>
            <p className="text-black text-sm mt-4 font-bold">
              {SITE_INFO.intro.promo}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={`tel:${SITE_INFO.phoneDisplay.replace(/[^\d+]/g, "")}`}
                className="px-5 py-3 rounded-2xl bg-white text-black border border-red-500/30 font-bold flex items-center gap-2"
              >
                <Phone size={16} /> {SITE_INFO.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="rounded-2xl bg-white/80 border border-red-500/20 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                As mais pedidas
              </p>
              <h3 className="text-lg font-black text-black mt-1">
                AS MAIS PEDIDAS
              </h3>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-[#25c522ff]/15 border border-[#25c522ff]/40 text-[#25c522ff] font-black text-xs">
              Mais pedidas
            </div>
          </div>

          <div
            ref={mostOrderedScrollRef}
            className="mt-5 -mx-1 px-1 overflow-x-auto no-scrollbar"
          >
            <div className="flex gap-3 min-w-max">
              {mostOrderedPizzas.map((pizza) => (
                <div
                  key={pizza.id}
                  className="w-[260px] rounded-2xl bg-white border border-red-500/20 shadow-sm overflow-hidden"
                >
                  <div
                    className="h-32 flex items-center justify-center relative"
                    style={{
                      background: `radial-gradient(circle, ${pizza.glowColor}18, transparent)`,
                    }}
                  >
                    <img
                      src={pizza.imageUrl}
                      alt={pizza.name}
                      className="h-24 w-24 object-contain drop-shadow-2xl"
                      draggable="false"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black bg-[#25c522ff] text-black">
                      MAIS PEDIDA
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-black font-black text-base leading-tight">
                      {pizza.name}
                    </p>
                    <p className="text-black/60 text-xs mt-2 leading-snug">
                      {mostOrderedByName.get(pizza.name) || pizza.description}
                    </p>
                    <button
                      onClick={() => setSelectedPizza(pizza)}
                      className="mt-4 w-full py-3 rounded-2xl bg-[#25c522ff] text-black font-black text-sm"
                    >
                      PEÇA AGORA!
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

          <CategoryFilter active={category} onChange={setCategory} />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
          {filtered.map((pizza) => (
            <PizzaCard
              key={pizza.id}
              pizza={pizza}
              onSelect={setSelectedPizza}
            />
          ))}
          </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/80 border border-red-500/20 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="text-[#25c522ff]" size={18} />
                <h3 className="text-black font-black text-lg">Onde estamos</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden border border-red-500/20 bg-white shadow-sm">
                  <iframe
                    title="Mapa Sitari Pizzaria"
                    src={mapsEmbedUrl}
                    className="w-full h-48 lg:h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <button
                    onClick={() =>
                      window.open(mapsPlaceUrl || mapsDirectionsBaseUrl)
                    }
                    className="absolute top-3 left-3 right-3 flex items-center justify-between gap-3 rounded-2xl bg-white/90 border border-red-500/20 px-4 py-3 text-left shadow-sm"
                  >
                    <div className="min-w-0">
                      <p className="text-black font-black text-sm truncate">
                        Sitári Pizzaria
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={14}
                              className={`${
                                i <= Math.round(SITE_INFO.google?.rating || 0)
                                  ? "text-[#25c522ff] fill-[#25c522ff]"
                                  : "text-black/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-black/60 text-xs font-bold">
                          {SITE_INFO.google?.rating?.toFixed
                            ? SITE_INFO.google.rating
                                .toFixed(1)
                                .replace(".", ",")
                            : "—"}{" "}
                          no Google
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <MapPin className="text-[#25c522ff]" size={18} />
                      <span className="text-black font-black text-xs">Ver</span>
                    </div>
                  </button>
                </div>
                <div>
                  <p className="text-black/80 text-sm">{SITE_INFO.addressLine1}</p>
                  <p className="text-black/60 text-sm">{SITE_INFO.addressLine2}</p>
                  <div className="flex flex-wrap gap-3 mt-5">
                    <button
                      onClick={openDirectionsToSitari}
                      className="px-5 py-3 rounded-2xl bg-black/5 border border-red-500/20 text-black font-bold flex items-center gap-2"
                    >
                      <MapPin size={16} /> Abrir no Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/80 border border-red-500/20 p-6 shadow-sm">
              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                Avaliações
              </p>
              <p className="text-black/80 text-sm mt-3 leading-relaxed">
                “{SITE_INFO.review.text}”
              </p>
              <p className="text-black/50 text-sm mt-4">
                {SITE_INFO.review.author}, via {SITE_INFO.review.source}
              </p>
              <button
                onClick={() => window.open(mapsPlaceUrl || mapsDirectionsBaseUrl)}
                className="mt-5 px-5 py-3 rounded-2xl bg-black/5 border border-red-500/20 text-black font-bold"
              >
                Ver no Google Maps
              </button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {items.length > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-6 right-6 z-40"
          >
            <button
              onClick={() => {
                setCheckoutStep(1);
                setCartOpen(true);
              }}
              className="w-full bg-[#25c522ff] text-black py-4 rounded-2xl shadow-[0_10px_30px_rgba(37,197,34,0.22)] flex justify-between items-center px-6"
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <span className="font-bold">Ver meu pedido</span>
              </div>
              <span className="font-black text-lg">R$ {total.toFixed(2)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPizza && (
          <ProductModal
            pizza={selectedPizza}
            allPizzas={PIZZAS}
            onClose={() => setSelectedPizza(null)}
            onAdd={addItem}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6"
            >
              <div className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-red-500/20 overflow-hidden shadow-lg flex flex-col max-h-[92dvh] sm:max-h-[85dvh] overflow-x-hidden">
                <div className="p-6 border-b border-red-500/20 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                      Pedido
                    </p>
                    <h3 className="text-xl font-black text-black">
                      {checkoutStep === 1 ? "Seu pedido" : "Finalizar pedido"}
                    </h3>
                  </div>
                  <button onClick={() => setCartOpen(false)}>
                    <X />
                  </button>
                </div>

                {checkoutStep === 1 ? (
                  <>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4">
                      {items.map((item) => {
                        const qty = item.qty || 1;
                        const unit =
                          item.price +
                          (item.extras || []).reduce((s, e) => s + e.price, 0);
                        const lineTotal = unit * qty;

                        return (
                          <div
                            key={item.cartId}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-black/5 p-4 rounded-xl border border-red-500/20"
                          >
                            <div className="flex gap-4 items-center min-w-0">
                              <img
                                src={item.imageUrl || getPizzaImage(null)}
                                alt={item.name}
                                className="h-12 w-12 object-contain shrink-0"
                                draggable="false"
                              />
                              <div className="min-w-0">
                                <p className="font-bold text-sm text-black whitespace-normal break-words leading-tight">
                                  {item.name}
                                </p>
                                {Array.isArray(item.flavors) &&
                                  item.flavors.length > 1 && (
                                    <p className="text-[10px] text-black/50 whitespace-normal break-words leading-tight mt-1">
                                      Sabores: {item.flavors.join(" / ")}
                                    </p>
                                  )}
                                <p className="text-[10px] text-black/50">
                                  Tamanho {item.size}
                                </p>
                                <p className="text-[10px] text-black/50">
                                  Quantidade {qty}
                                </p>
                              </div>
                            </div>
                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
                              <span className="font-bold text-sm text-black whitespace-nowrap">
                                R$ {lineTotal.toFixed(2)}
                              </span>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  onClick={() => decrementItem(item.cartId)}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-red-500/20 text-black flex items-center justify-center"
                                >
                                  <Minus size={16} />
                                </button>
                                <button
                                  onClick={() => incrementItem(item.cartId)}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#25c522ff] text-black flex items-center justify-center"
                                >
                                  <Plus size={16} />
                                </button>
                                <button
                                  onClick={() => removeItem(item.cartId)}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-red-500/20 text-black/60 flex items-center justify-center"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-6 bg-white border-t border-red-500/20 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-black/50 font-bold">Total</span>
                        <span className="text-black text-3xl font-black">
                          R$ {total.toFixed(2)}
                        </span>
                      </div>
                      <button
                        onClick={() => setCheckoutStep(2)}
                        className="w-full py-5 rounded-2xl bg-[#25c522ff] text-black font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(37,197,34,0.2)]"
                      >
                        Continuar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                          Seus dados
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            placeholder="Seu nome"
                            value={customer.name}
                            onChange={(e) =>
                              setCustomer((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#25c522ff] outline-none"
                          />
                          <input
                            placeholder="Seu WhatsApp"
                            value={customer.whatsapp}
                            onChange={(e) =>
                              setCustomer((prev) => ({
                                ...prev,
                                whatsapp: e.target.value,
                              }))
                            }
                            className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#25c522ff] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                          Retirada ou Entrega
                        </p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {["Retirada", "Entrega"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setFulfillment(opt)}
                              className={`py-3 rounded-xl border font-bold text-sm transition-all ${
                                fulfillment === opt
                                  ? "bg-[#25c522ff]/20 border-[#25c522ff] text-black"
                                  : "bg-black/5 border-red-500/20 text-black/60"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {fulfillment === "Entrega" && (
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                            Endereço
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              placeholder="Rua / Avenida"
                              value={deliveryAddress.street}
                              onChange={(e) =>
                                setDeliveryAddress((prev) => ({
                                  ...prev,
                                  street: e.target.value,
                                }))
                              }
                              className="sm:col-span-2 w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#25c522ff] outline-none"
                            />
                            <input
                              placeholder="Número"
                              value={deliveryAddress.number}
                              onChange={(e) =>
                                setDeliveryAddress((prev) => ({
                                  ...prev,
                                  number: e.target.value,
                                }))
                              }
                              className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#25c522ff] outline-none"
                            />
                            <input
                              placeholder="Bairro"
                              value={deliveryAddress.neighborhood}
                              onChange={(e) =>
                                setDeliveryAddress((prev) => ({
                                  ...prev,
                                  neighborhood: e.target.value,
                                }))
                              }
                              className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#25c522ff] outline-none"
                            />
                            <input
                              placeholder="Complemento (opcional)"
                              value={deliveryAddress.complement}
                              onChange={(e) =>
                                setDeliveryAddress((prev) => ({
                                  ...prev,
                                  complement: e.target.value,
                                }))
                              }
                              className="sm:col-span-2 w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#25c522ff] outline-none"
                            />
                            <input
                              placeholder="Ponto de referência (opcional)"
                              value={deliveryAddress.reference}
                              onChange={(e) =>
                                setDeliveryAddress((prev) => ({
                                  ...prev,
                                  reference: e.target.value,
                                }))
                              }
                              className="sm:col-span-2 w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#25c522ff] outline-none"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                          Forma de Pagamento
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          {["Cartão", "PIX", "Dinheiro"].map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setPayment(opt)}
                              className={`py-3 rounded-xl border font-bold text-xs transition-all ${
                                payment === opt
                                  ? "bg-[#25c522ff]/20 border-[#25c522ff] text-black"
                                  : "bg-black/5 border-red-500/20 text-black/60"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      {payment === "Cartão" && (
                        <div>
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                            Crédito ou Débito
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            {["Crédito", "Débito"].map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setCardType(opt)}
                                className={`py-3 rounded-xl border font-bold text-sm transition-all ${
                                  cardType === opt
                                    ? "bg-[#25c522ff]/20 border-[#25c522ff] text-black"
                                    : "bg-black/5 border-red-500/20 text-black/60"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {payment === "Dinheiro" && (
                        <div>
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                            Troco
                          </p>
                          <input
                            placeholder="Troco para quanto? (opcional)"
                            value={changeFor}
                            onChange={(e) => setChangeFor(e.target.value)}
                            className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#25c522ff] outline-none mt-2"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-white border-t border-red-500/20 space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-black/50 font-bold">
                            Subtotal
                          </span>
                          <span className="text-black font-black">
                            R$ {total.toFixed(2)}
                          </span>
                        </div>
                        {couponCode && couponDiscount > 0 && (
                          <div className="flex justify-between items-center">
                            <span className="text-black/50 font-bold">
                              Cupom {String(couponCode).toUpperCase()}
                            </span>
                            <span
                              className="font-black"
                              style={{ color: "#25c522ff" }}
                            >
                              - R$ {couponDiscount.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-black/50 font-bold">Total</span>
                          <span className="text-black text-3xl font-black">
                            R$ {finalTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setCheckoutStep(1)}
                          className="py-4 rounded-2xl bg-black/5 border border-red-500/20 text-black font-black text-lg"
                        >
                          Voltar
                        </button>
                        <button
                          disabled={
                            !customer.name.trim() ||
                            !customer.whatsapp.trim() ||
                            fulfillment === "Entrega" &&
                            (!deliveryAddress.street.trim() ||
                              !deliveryAddress.number.trim() ||
                              !deliveryAddress.neighborhood.trim())
                          }
                          onClick={() =>
                            (() => {
                              const url = `https://wa.me/${
                                SITE_INFO.whatsappDigits
                              }?text=${encodeURIComponent(
                                formatWhatsAppMessage(items, {
                                  addressParts:
                                    fulfillment === "Entrega"
                                      ? deliveryAddress
                                      : null,
                                  customer,
                                  fulfillment,
                                  payment,
                                  paymentDetail:
                                    payment === "Cartão" ? cardType : "",
                                  changeFor:
                                    payment === "Dinheiro" ? changeFor : "",
                                  couponCode:
                                    couponCode && couponDiscount > 0
                                      ? String(couponCode).toUpperCase()
                                      : "",
                                  discount:
                                    couponCode && couponDiscount > 0
                                      ? couponDiscount
                                      : 0,
                                })
                              )}`;

                              window.open(url);
                              recordOrder();
                            })()
                          }
                          className={`py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(37,197,34,0.2)] ${
                            !customer.name.trim() || !customer.whatsapp.trim()
                              ? "bg-black/10 text-black/40"
                              : 
                            fulfillment === "Entrega" &&
                            (!deliveryAddress.street.trim() ||
                              !deliveryAddress.number.trim() ||
                              !deliveryAddress.neighborhood.trim())
                              ? "bg-black/10 text-black/40"
                              : "bg-[#25c522ff] text-black"
                          }`}
                        >
                          <Phone size={20} /> WhatsApp
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <PromotionPopup
        open={promoOpen}
        coupon={promoOffer}
        onActivate={(code) => {
          setCouponCode(String(code || "").toUpperCase());
        }}
        onClose={() => setPromoOpen(false)}
      />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
