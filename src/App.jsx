import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
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
import { PizzaCard } from "./components/PizzaCard";
import { ProductModal } from "./components/ProductModal";
import { useCart } from "./logic/useCart";
import { getPizzaImage, PIZZAS, SITE_INFO } from "./logic/menu";
import {
  calculateDiscount,
  findBestCoupon,
  getNewlyUnlockedThresholdCoupon,
} from "./logic/promotions";
import { PromotionPopup } from "./components/PromotionPopup";
import { formatWhatsAppMessage } from "./logic/formatWhatsAppMessage";

export default function App() {
  const [selectedPizza, setSelectedPizza] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [drinksOpen, setDrinksOpen] = useState(false);
  const [checkoutSummaryOpen, setCheckoutSummaryOpen] = useState(true);
  const [reviewSlideIndex, setReviewSlideIndex] = useState(0);
  const [whatsAppBadgeVisible, setWhatsAppBadgeVisible] = useState(false);
  const [headerActive, setHeaderActive] = useState(false);
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
  const cartScrollRef = useRef(null);
  const mostOrderedCardRefs = useRef([]);
  const mostOrderedRafRef = useRef(0);
  const [mostOrderedActiveIndex, setMostOrderedActiveIndex] = useState(0);
  const [mostOrderedHoverIndex, setMostOrderedHoverIndex] = useState(null);
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

  const visiblePizzas = PIZZAS.filter((p) => p.category !== "Bebidas");
  const drinkOptions = PIZZAS.filter((p) => p.category === "Bebidas").sort(
    (a, b) => String(a.name).localeCompare(String(b.name))
  );
  const salgadasPizzas = visiblePizzas.filter((p) => p.category === "Salgadas");
  const docesPizzas = visiblePizzas.filter((p) => p.category === "Doces");

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

  useEffect(() => {
    if (!cartOpen) setDrinksOpen(false);
    if (checkoutStep !== 1) setDrinksOpen(false);
  }, [cartOpen, checkoutStep]);

  useEffect(() => {
    if (!cartOpen) setCheckoutSummaryOpen(true);
  }, [cartOpen]);

  const openDirectionsToSitari = () => {
    const w = window.open("about:blank", "_blank");
    const fallback = mapsDirectionsBaseUrl;

    if (!w) {
      window.location.href = fallback;
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

  const findDrinkCartItem = (drinkName) =>
    items.find(
      (it) =>
        it?.sizeKey === "U" &&
        it?.name === drinkName &&
        Array.isArray(it?.flavors) &&
        it.flavors.length === 1 &&
        it.flavors[0] === drinkName
    );

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

  const reviewSlides = [
    {
      text: SITE_INFO.review.text,
      author: SITE_INFO.review.author,
      source: SITE_INFO.review.source,
    },
    {
      text: "Atendimento impecável e a pizza chega sempre quentinha. A massa fininha é perfeita!",
      author: "Bruno",
      source: "Google Maps",
    },
    {
      text: "Sabor incrível, ingredientes frescos e muito bem servida. Melhor da região!",
      author: "Camila",
      source: "Google Maps",
    },
    {
      text: "Entrega rápida e capricho em cada detalhe. Virou minha pizzaria favorita.",
      author: "Diego",
      source: "Google Maps",
    },
    {
      text: "A Sitari nunca decepciona. Queijo no ponto certo e recheio bem equilibrado.",
      author: "Fernanda",
      source: "Google Maps",
    },
    {
      text: "Pizza deliciosa e atendimento super educado. Dá pra sentir a qualidade dos ingredientes.",
      author: "Gustavo",
      source: "Google Maps",
    },
    {
      text: "Sabor marcante e massa leve. Pedi duas vezes na semana e foi excelente nas duas.",
      author: "Isabela",
      source: "Google Maps",
    },
    {
      text: "Chegou antes do prazo e estava maravilhosa. Recomendo demais!",
      author: "João",
      source: "Google Maps",
    },
    {
      text: "Preço justo pelo que entrega. Pizza muito bem feita e saborosa.",
      author: "Larissa",
      source: "Google Maps",
    },
    {
      text: "O molho e o tempero são perfeitos. Dá pra perceber que é tudo bem feito.",
      author: "Marcos",
      source: "Google Maps",
    },
    {
      text: "Experiência excelente do começo ao fim. A pizza é simplesmente sensacional.",
      author: "Paula",
      source: "Google Maps",
    },
  ];

  useEffect(() => {
    if (!reviewSlides.length) return;
    const id = window.setInterval(() => {
      setReviewSlideIndex((i) => (i + 1) % reviewSlides.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, [reviewSlides.length]);

  useEffect(() => {
    let hideId = 0;
    const showId = window.setTimeout(() => {
      setWhatsAppBadgeVisible(true);
      hideId = window.setTimeout(() => setWhatsAppBadgeVisible(false), 60000);
    }, 60000);
    return () => {
      window.clearTimeout(showId);
      if (hideId) window.clearTimeout(hideId);
    };
  }, []);

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
    let resumeId = 0;
    let paused = false;
    let lastAutoMoveAt = 0;
    const speed = 0.28;

    const stop = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
    };

    const start = () => {
      if (raf || paused) return;
      raf = window.requestAnimationFrame(tick);
    };

    const pauseFor = (ms) => {
      paused = true;
      stop();
      if (resumeId) window.clearTimeout(resumeId);
      resumeId = window.setTimeout(() => {
        paused = false;
        start();
      }, ms);
    };

    const tick = () => {
      const node = mostOrderedScrollRef.current;
      if (!node) return;
      const max = node.scrollWidth - node.clientWidth;
      if (max > 0) {
        lastAutoMoveAt = performance.now();
        node.scrollLeft += speed;
        if (node.scrollLeft >= max - 1) node.scrollLeft = 0;
      }
      raf = window.requestAnimationFrame(tick);
    };

    const onUserIntent = () => pauseFor(2600);
    const onScroll = () => {
      const now = performance.now();
      if (now - lastAutoMoveAt > 120) pauseFor(2600);
    };

    el.addEventListener("wheel", onUserIntent, { passive: true });
    el.addEventListener("touchstart", onUserIntent, { passive: true });
    el.addEventListener("pointerdown", onUserIntent, { passive: true });
    el.addEventListener("scroll", onScroll, { passive: true });

    start();
    return () => {
      el.removeEventListener("wheel", onUserIntent);
      el.removeEventListener("touchstart", onUserIntent);
      el.removeEventListener("pointerdown", onUserIntent);
      el.removeEventListener("scroll", onScroll);
      stop();
      if (resumeId) window.clearTimeout(resumeId);
    };
  }, []);

  useEffect(() => {
    const scroller = mostOrderedScrollRef.current;
    if (!scroller) return;

    const computeActive = () => {
      mostOrderedRafRef.current = 0;
      const containerRect = scroller.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let i = 0; i < mostOrderedCardRefs.current.length; i += 1) {
        const card = mostOrderedCardRefs.current[i];
        if (!card) continue;
        const rect = card.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(center - containerCenter);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = i;
        }
      }

      setMostOrderedActiveIndex(bestIndex);
    };

    const onScroll = () => {
      if (mostOrderedRafRef.current) return;
      mostOrderedRafRef.current = window.requestAnimationFrame(computeActive);
    };

    computeActive();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (mostOrderedRafRef.current) {
        window.cancelAnimationFrame(mostOrderedRafRef.current);
        mostOrderedRafRef.current = 0;
      }
    };
  }, [mostOrderedPizzas.length]);

  useEffect(() => {
    const onScroll = () => {
      setHeaderActive(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!headerActive) setHoursOpen(false);
  }, [headerActive]);

  useEffect(() => {
    const node = cartScrollRef.current;
    if (!node) return;
    let t = 0;
    const onScroll = () => {
      node.classList.add("is-scrolling");
      if (t) window.clearTimeout(t);
      t = window.setTimeout(() => node.classList.remove("is-scrolling"), 900);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      if (t) window.clearTimeout(t);
    };
  }, [cartOpen]);

  return (
    <div
      className="min-h-screen text-black font-sans selection:bg-[#145a2c]/20 relative overflow-x-hidden"
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
        style={{
          WebkitBackdropFilter: "blur(6px)",
          backdropFilter: "blur(6px)",
          background: "rgba(255,255,255,0.42)",
        }}
      />
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[45%] h-[45%] bg-[#145a2c]/12 blur-[120px] rounded-full" />
        <div className="absolute top-[25%] -right-[10%] w-[35%] h-[35%] bg-[#145a2c]/8 blur-[130px] rounded-full" />
      </div>

      <header
        className={`fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-red-500/40 px-6 py-4 flex items-center transition-all duration-200 ${
          headerActive
            ? "opacity-100 translate-y-0 pointer-events-auto shadow-sm"
            : "opacity-0 -translate-y-3 pointer-events-none"
        }`}
      >
        <div className="sm:hidden">
          <h1 className="leading-none">
            <div className="text-base font-black tracking-tighter">
              SITARI{" "}
              <span className="text-black/70 font-black text-[10px] ml-0.5 tracking-widest uppercase">
                Pizzaria
              </span>
            </div>
            <div className="text-[#145a2c] font-black text-xs tracking-widest uppercase mt-1">
              Delivery
            </div>
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <img
            src="/logosemfundo1.png"
            alt="Sitari Pizzaria"
            fetchpriority="high"
            loading="eager"
            decoding="sync"
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
            <div className="text-[#145a2c] font-black text-xs tracking-widest uppercase mt-1">
              Delivery
            </div>
          </h1>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className="relative inline-block">
            <button
              onClick={() => setHoursOpen((v) => !v)}
              className={`px-4 py-2 rounded-full bg-white border text-xs font-black flex items-center gap-2 shadow-sm ${
                status.isOpen ? "border-[#145a2c]" : "border-red-500"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status.isOpen ? "bg-[#145a2c]" : "bg-red-500"
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
                  className="absolute left-1/2 top-full mt-3 w-[260px] rounded-2xl bg-white border border-[#145a2c]/50 shadow-lg p-4 z-50"
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
                          ? "font-black text-[#145a2c]"
                          : "font-bold text-black";
                      const hoursClass = isClosed
                        ? "font-black text-red-500"
                        : isToday
                          ? "font-black text-[#145a2c]"
                          : "text-black/60";
                      return (
                        <div
                          key={d.index}
                          className={`flex ${
                            isToday ? "justify-center gap-3" : "justify-between"
                          } ${
                            isToday
                              ? `rounded-xl ${isClosed ? "bg-red-500/10" : "bg-[#145a2c]/10"} px-2 py-1`
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

        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            type="button"
            onClick={openDirectionsToSitari}
            className="w-11 h-11 rounded-2xl bg-white/80 border border-red-500/20 shadow-sm flex items-center justify-center text-black hover:bg-white"
            aria-label="Abrir rota no Google Maps"
          >
            <MapPin size={20} />
          </button>
          <a
            href={SITE_INFO.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="w-11 h-11 rounded-2xl bg-white/80 border border-red-500/20 shadow-sm flex items-center justify-center text-black hover:bg-white"
            aria-label="Abrir Instagram"
          >
            <Instagram size={20} />
          </a>
        </div>

      </header>

      <main className="relative z-10 pb-32">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 lg:pr-28 py-8">
          <div className="mb-10">
            <img
              src="/logosemfundo1.png"
              alt="Sitari Pizzaria"
              fetchpriority="high"
              loading="eager"
              decoding="sync"
              className="sm:hidden mx-auto h-24 w-24 object-contain drop-shadow-xl mb-4"
              draggable="false"
            />
            <h2
              className="text-3xl sm:text-4xl font-black tracking-tighter leading-none mb-2 text-center text-white mx-auto max-w-[26ch]"
              style={{
                textShadow:
                  "0 1px 0 rgba(0,0,0,0.55), 0 2px 0 rgba(0,0,0,0.40), 0 10px 18px rgba(0,0,0,0.35)",
              }}
            >
              {(() => {
                const title = String(SITE_INFO.intro.title || "");
                const m = title.match(/sit[aá]ri/i);
                if (!m || m.index == null) return title;
                const before = title.slice(0, m.index);
                const word = title.slice(m.index, m.index + m[0].length);
                const after = title.slice(m.index + m[0].length);
                return (
                  <>
                    {before}
                    <span
                      className="text-[#145a2c]"
                      style={{
                        textShadow:
                          "0 1px 0 rgba(0,0,0,0.55), 0 2px 0 rgba(0,0,0,0.40), 0 10px 18px rgba(0,0,0,0.35)",
                      }}
                    >
                      {word.toUpperCase()}
                    </span>
                    {after}
                  </>
                );
              })()}
            </h2>
            <div className="flex justify-center gap-1.5 mb-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg
                  key={i}
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  className="shrink-0"
                  style={{
                    animation: "starPulse 1.8s ease-in-out infinite",
                    animationDelay: `${i * 0.14}s`,
                    filter:
                      "drop-shadow(0 2px 4px rgba(0,0,0,0.18)) drop-shadow(0 0 10px rgba(250,204,21,0.35))",
                  }}
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id={`introStarGrad-${i}`}
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="1"
                    >
                      <stop offset="0" stopColor="#fff1b8" />
                      <stop offset="0.45" stopColor="#facc15" />
                      <stop offset="1" stopColor="#f59e0b" />
                    </linearGradient>
                    <linearGradient
                      id={`introStarShine-${i}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"
                    fill={`url(#introStarGrad-${i})`}
                    stroke="#b45309"
                    strokeWidth="0.75"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 3.4l2.7 5.47 6.04.88-4.37 4.26 1.03 6.01L12 17.1 6.6 20.02l1.03-6.01L3.26 9.75l6.04-.88L12 3.4z"
                    fill={`url(#introStarShine-${i})`}
                    opacity="0.35"
                  />
                </svg>
              ))}
            </div>
            <p
              className="text-white/80 font-medium"
              style={{
                textShadow:
                  "0 1px 0 rgba(0,0,0,0.55), 0 2px 0 rgba(0,0,0,0.40), 0 10px 18px rgba(0,0,0,0.35)",
              }}
            >
              {SITE_INFO.tagline}
            </p>
            <p
              className="text-white/70 text-sm mt-3"
              style={{
                textShadow:
                  "0 1px 0 rgba(0,0,0,0.55), 0 2px 0 rgba(0,0,0,0.40), 0 10px 18px rgba(0,0,0,0.35)",
              }}
            >
              {SITE_INFO.intro.text}
            </p>
            <p className="text-black text-sm mt-4 font-bold sitari-shimmer">
              {SITE_INFO.intro.promo}
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {whatsAppBadgeVisible && (
                <a
                  href={`https://wa.me/${SITE_INFO.whatsappDigits}?text=${encodeURIComponent(
                    "Pedido de pizza"
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-2xl bg-[#145a2c] text-white border border-white/20 font-black flex items-center gap-2 shadow-[0_10px_30px_rgba(20,90,44,0.18)]"
                  aria-label="Abrir WhatsApp com mensagem de pedido"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M20.5 11.9c0 4.7-3.8 8.5-8.5 8.5c-1.5 0-3-.4-4.3-1.1l-4.2 1.1l1.1-4.1c-.8-1.3-1.3-2.9-1.3-4.5c0-4.7 3.8-8.5 8.5-8.5s8.7 3.8 8.7 8.6zm-8.5-6.8c-3.8 0-6.9 3-6.9 6.8c0 1.5.5 2.9 1.3 4.1l-.7 2.7l2.8-.7c1.1.7 2.4 1.1 3.6 1.1c3.8 0 6.9-3 6.9-6.8c0-3.9-3.1-7.2-7-7.2zm4 8.5c-.2-.1-1.2-.6-1.4-.6c-.2-.1-.4-.1-.5.1c-.2.2-.6.6-.7.7c-.1.1-.3.1-.5 0c-.2-.1-.8-.3-1.5-.9c-.6-.5-.9-1.1-1-1.3c-.1-.2 0-.3.1-.4l.3-.4c.1-.1.2-.3.2-.4c.1-.1 0-.3 0-.4c0-.1-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.1 0-.3.1-.5.3c-.2.2-.7.7-.7 1.7s.7 2 .8 2.1c.1.2 1.4 2.3 3.5 3.1c.5.2.9.4 1.2.5c.5.1.9.1 1.3 0c.4-.1 1.2-.5 1.3-.9c.2-.4.2-.8.1-.9c0-.1-.1-.2-.3-.3z"
                    />
                  </svg>
                  <span>Faça seu pedido agora</span>
                </a>
              )}
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
            <div className="px-3 py-1.5 rounded-full bg-[#145a2c]/15 border border-[#145a2c]/40 text-[#145a2c] font-black text-xs">
              Mais pedidas
            </div>
          </div>

          <div
            ref={mostOrderedScrollRef}
            className="mt-5 -mx-1 px-1 py-3 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth"
          >
            <div className="flex gap-3 min-w-max">
              {mostOrderedPizzas.map((pizza, index) => {
                const focusIndex =
                  typeof mostOrderedHoverIndex === "number"
                    ? mostOrderedHoverIndex
                    : mostOrderedActiveIndex;
                const isFocused = index === focusIndex;

                return (
                <div
                  key={pizza.id}
                  ref={(el) => {
                    mostOrderedCardRefs.current[index] = el;
                  }}
                  onMouseEnter={() => setMostOrderedHoverIndex(index)}
                  onMouseLeave={() => setMostOrderedHoverIndex(null)}
                  className={`w-[260px] h-[340px] shrink-0 snap-center rounded-2xl bg-black border border-red-500/20 shadow-sm overflow-hidden transition-all duration-300 ${
                    isFocused
                      ? "scale-[1.02] opacity-100 blur-0 ring-2 ring-[#145a2c]/45"
                      : "scale-[0.98] opacity-70 blur-[1.2px]"
                  }`}
                >
                  <button
                    onClick={() => setSelectedPizza(pizza)}
                    className="relative w-full h-full text-left"
                  >
                    <img
                      src={pizza.imageUrl}
                      alt={pizza.name}
                      fetchpriority="high"
                      loading="eager"
                      decoding="sync"
                      className="absolute inset-0 h-full w-full object-cover"
                      draggable="false"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-black bg-[#145a2c] text-white">
                      MAIS PEDIDA
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <p className="text-white font-black text-lg leading-tight">
                        {pizza.name}
                      </p>
                      <p
                        className="text-white/85 text-xs leading-snug mt-1"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {mostOrderedByName.get(pizza.name) || pizza.description}
                      </p>
                      <div className="mt-3 inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-[#145a2c] text-white font-black text-xs">
                        PEÇA AGORA!
                      </div>
                    </div>
                  </button>
                </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 lg:pr-28 mt-8">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
            Cardápio
          </p>
          <h3 className="text-lg font-black text-white mt-1">PIZZAS SALGADAS</h3>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 lg:pr-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {salgadasPizzas.map((pizza) => (
              <PizzaCard
                key={pizza.id}
                pizza={pizza}
                onSelect={setSelectedPizza}
              />
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 lg:pr-28 mt-10">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
            Cardápio
          </p>
          <h3 className="text-lg font-black text-white mt-1">PIZZAS DOCES</h3>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10 lg:pr-28">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
            {docesPizzas.map((pizza) => (
              <PizzaCard
                key={pizza.id}
                pizza={pizza}
                onSelect={setSelectedPizza}
              />
            ))}
          </div>
        </div>

          <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="hidden rounded-2xl bg-white/80 border border-red-500/20 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="text-[#145a2c]" size={18} />
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
                                  ? "text-[#145a2c] fill-[#145a2c]"
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
                      <MapPin className="text-[#145a2c]" size={18} />
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
              <div className="flex items-center gap-0.5 mt-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    className="shrink-0"
                    style={{
                      filter:
                        "drop-shadow(0 2px 2px rgba(0,0,0,0.18)) drop-shadow(0 0 10px rgba(251,191,36,0.35))",
                    }}
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient
                        id={`reviewStarGrad-${i}`}
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#fff7c2" />
                        <stop offset="35%" stopColor="#fde68a" />
                        <stop offset="65%" stopColor="#fbbf24" />
                        <stop offset="100%" stopColor="#b45309" />
                      </linearGradient>
                      <linearGradient
                        id={`reviewStarShine-${i}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="rgba(255,255,255,0.75)" />
                        <stop offset="55%" stopColor="rgba(255,255,255,0.0)" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill={`url(#reviewStarGrad-${i})`}
                      stroke="#a16207"
                      strokeWidth="1.2"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                      fill={`url(#reviewStarShine-${i})`}
                      stroke="rgba(255,255,255,0.35)"
                      strokeWidth="0.6"
                      strokeLinejoin="round"
                      transform="translate(0,-0.3)"
                    />
                  </svg>
                ))}
              </div>
              <div className="relative mt-3 min-h-[96px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={reviewSlideIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28, ease: "easeOut" }}
                  >
                    <p className="text-black/80 text-sm leading-relaxed">
                      “{reviewSlides[reviewSlideIndex]?.text || ""}”
                    </p>
                    <p className="text-black/50 text-sm mt-4">
                      {reviewSlides[reviewSlideIndex]?.author || ""}, via{" "}
                      {reviewSlides[reviewSlideIndex]?.source || "Google Maps"}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
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
              className="group relative w-full bg-[#145a2c] text-white py-4 rounded-2xl shadow-[0_10px_30px_rgba(20,90,44,0.22)] flex justify-between items-center px-6 overflow-hidden"
            >
              <span className="pointer-events-none absolute inset-0 sitari-btn-shimmer opacity-35" />
              <span className="pointer-events-none absolute inset-0 sitari-btn-shimmer opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
              <div className="relative flex items-center gap-3">
                <ShoppingBag size={20} />
                <span className="font-black tracking-wide">FINALIZAR O PEDIDO</span>
              </div>
              <span className="relative font-black text-lg">
                R$ {total.toFixed(2)}
              </span>
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
              <div
                ref={cartScrollRef}
                className="sitari-scroll w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl border border-red-500/20 shadow-lg flex flex-col max-h-[92dvh] sm:max-h-[85dvh] overflow-y-auto overflow-x-hidden"
              >
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
                    <div className="p-4 space-y-3">
                      {drinkOptions.length > 0 && (
                        <div className="rounded-2xl bg-white/80 border border-red-500/20 p-3 shadow-sm">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                            Bebidas
                          </p>
                          <h4 className="text-black font-black text-sm mt-1">
                            Adicionar bebidas
                          </h4>

                          <button
                            type="button"
                            onClick={() => setDrinksOpen(true)}
                            className="mt-3 w-full rounded-2xl overflow-hidden border border-red-500/20 bg-black relative text-left"
                          >
                            <img
                              src={getPizzaImage(drinkOptions[0])}
                              alt="Bebidas"
                              className="absolute inset-0 h-full w-full object-cover"
                              draggable="false"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
                            <div className="relative p-3 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-white font-black text-sm leading-tight">
                                  Bebidas
                                </p>
                                <p className="text-white/80 text-[11px] font-bold mt-1">
                                  Toque para adicionar
                                </p>
                              </div>
                              <div className="shrink-0 px-3 py-1.5 rounded-2xl bg-[#145a2c] text-white font-black text-[11px]">
                                Abrir
                              </div>
                            </div>
                          </button>
                        </div>
                      )}

                      {items.map((item) => {
                        const qty = item.qty || 1;
                        const unit =
                          item.price +
                          (item.extras || []).reduce((s, e) => s + e.price, 0);
                        const lineTotal = unit * qty;

                        return (
                          <div
                            key={item.cartId}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-black/5 p-3 rounded-xl border border-red-500/20"
                          >
                            <div className="flex gap-4 items-center min-w-0">
                              <img
                                src={item.imageUrl || getPizzaImage(null)}
                                alt={item.name}
                                className="h-10 w-10 object-contain shrink-0"
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
                                  className="w-8 h-8 rounded-xl bg-white border border-red-500/20 text-black flex items-center justify-center"
                                >
                                  <Minus size={16} />
                                </button>
                                <button
                                  onClick={() => incrementItem(item.cartId)}
                                  className="w-8 h-8 rounded-xl bg-[#145a2c] text-white flex items-center justify-center"
                                >
                                  <Plus size={16} />
                                </button>
                                <button
                                  onClick={() => removeItem(item.cartId)}
                                  className="w-8 h-8 rounded-xl bg-white border border-red-500/20 text-black/60 flex items-center justify-center"
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
                        className="w-full py-5 rounded-2xl bg-[#145a2c] text-white font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(20,90,44,0.2)]"
                      >
                        Continuar
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-6 space-y-6">
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
                            className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#145a2c] outline-none"
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
                            className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#145a2c] outline-none"
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
                                  ? "bg-[#145a2c]/20 border-[#145a2c] text-black"
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
                              className="sm:col-span-2 w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#145a2c] outline-none"
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
                              className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#145a2c] outline-none"
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
                              className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#145a2c] outline-none"
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
                              className="sm:col-span-2 w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#145a2c] outline-none"
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
                              className="sm:col-span-2 w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#145a2c] outline-none"
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
                                  ? "bg-[#145a2c]/20 border-[#145a2c] text-black"
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
                                    ? "bg-[#145a2c]/20 border-[#145a2c] text-black"
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
                            className="w-full bg-black/5 border border-red-500/20 rounded-xl px-4 py-3 text-sm focus:border-[#145a2c] outline-none mt-2"
                          />
                        </div>
                      )}
                    </div>

                    <div className="p-6 bg-white border-t border-red-500/20 space-y-3">
                      <button
                        type="button"
                        onClick={() => setCheckoutSummaryOpen((v) => !v)}
                        className="w-full flex items-center justify-between gap-4 text-left"
                      >
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                            Resumo do pedido
                          </p>
                          <p className="text-black font-black text-base mt-1">
                            Total R$ {finalTotal.toFixed(2)}
                          </p>
                        </div>
                        <ChevronDown
                          size={22}
                          className={`shrink-0 text-black/60 transition-transform ${
                            checkoutSummaryOpen ? "rotate-180" : "rotate-0"
                          }`}
                        />
                      </button>

                      {checkoutSummaryOpen && (
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
                                style={{ color: "#145a2c" }}
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
                      )}
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
                          className={`py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_40px_rgba(20,90,44,0.2)] ${
                            !customer.name.trim() || !customer.whatsapp.trim()
                              ? "bg-black/10 text-black/40"
                              : 
                            fulfillment === "Entrega" &&
                            (!deliveryAddress.street.trim() ||
                              !deliveryAddress.number.trim() ||
                              !deliveryAddress.neighborhood.trim())
                              ? "bg-black/10 text-black/40"
                              : "bg-[#145a2c] text-white"
                          }`}
                        >
                          <Phone size={20} /> WhatsApp
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <AnimatePresence>
                  {drinksOpen && checkoutStep === 1 && drinkOptions.length > 0 && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm"
                        onClick={() => setDrinksOpen(false)}
                      />
                      <motion.div
                        initial={{ y: 18, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 18, opacity: 0 }}
                        className="fixed inset-0 z-[61] flex items-end sm:items-center justify-center p-3 sm:p-6"
                        onClick={() => setDrinksOpen(false)}
                      >
                        <div
                          className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl border border-red-500/20 overflow-hidden shadow-lg flex flex-col max-h-[86dvh] overflow-x-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="p-5 border-b border-red-500/20 flex items-center justify-between gap-4">
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                                Bebidas
                              </p>
                              <h3 className="text-black font-black text-lg mt-1">
                                Escolha suas bebidas
                              </h3>
                            </div>
                            <button
                              onClick={() => setDrinksOpen(false)}
                              className="w-10 h-10 rounded-2xl bg-white border border-red-500/20 text-black flex items-center justify-center shrink-0"
                            >
                              <X />
                            </button>
                          </div>

                          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2">
                            {drinkOptions.map((drink) => {
                              const price = drink?.sizes?.U ?? 0;
                              const cartItem = findDrinkCartItem(drink.name);
                              const qty = cartItem?.qty ?? 0;

                              return (
                                <div
                                  key={drink.id}
                                  className="rounded-2xl bg-black/5 border border-red-500/20 p-3 flex items-center gap-3"
                                >
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-black shrink-0 border border-red-500/20 relative">
                                    <img
                                      src={getPizzaImage(drink)}
                                      alt={drink.name}
                                      className="absolute inset-0 h-full w-full object-cover"
                                      draggable="false"
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="text-black font-black text-sm leading-tight whitespace-normal break-words">
                                      {drink.name}
                                    </p>
                                    <p className="text-black/60 text-xs font-bold mt-1">
                                      R$ {price.toFixed(2).replace(".", ",")}
                                    </p>
                                  </div>

                                  <div className="shrink-0 flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        if (!cartItem) return;
                                        decrementItem(cartItem.cartId);
                                      }}
                                      disabled={!cartItem || qty <= 0}
                                      className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                                        !cartItem || qty <= 0
                                          ? "bg-black/5 border-red-500/20 text-black/30"
                                          : "bg-white border-red-500/20 text-black"
                                      }`}
                                    >
                                      <Minus size={16} />
                                    </button>
                                    <div className="w-7 text-center text-black font-black text-sm">
                                      {qty}
                                    </div>
                                    <button
                                      onClick={() =>
                                        addItem({
                                          name: drink.name,
                                          flavorsCount: 1,
                                          flavors: [drink.name],
                                          size: "Unidade",
                                          sizeKey: "U",
                                          price,
                                          extras: [],
                                          imageUrl: getPizzaImage(drink),
                                        })
                                      }
                                      className="w-9 h-9 rounded-xl bg-[#145a2c] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(20,90,44,0.22)]"
                                    >
                                      <Plus size={16} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <div className="p-4 border-t border-red-500/20 bg-white">
                            <button
                              onClick={() => setDrinksOpen(false)}
                              className="w-full py-3 rounded-2xl bg-[#145a2c] text-white font-black text-sm"
                            >
                              Concluir
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
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
        .sitari-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .sitari-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
        .sitari-scroll::-webkit-scrollbar-track { background: transparent; }
        .sitari-scroll::-webkit-scrollbar-thumb { background-color: transparent; border-radius: 9999px; border: 2px solid transparent; background-clip: content-box; }
        .sitari-scroll:hover::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.35); }
        .sitari-scroll.is-scrolling { scrollbar-color: rgba(0,0,0,0.35) transparent; }
        .sitari-scroll.is-scrolling::-webkit-scrollbar-thumb { background-color: rgba(0,0,0,0.35); }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  );
}
