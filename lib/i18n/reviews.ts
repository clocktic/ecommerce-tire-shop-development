import { localeMeta, type ContentLang, type Store } from "@/lib/i18n/config"

export type ReviewsCopy = {
  nav: string
  productTitle: string
  homeEyebrow: string
  homeTitle: string
  homeLead: string
  pageTitle: string
  pageLead: string
  metaDescription: string
  basedOn: string
  reviewsOne: string
  reviewsMany: string
  ratingLabel: string
  starsOne: string
  starsMany: string
  verified: string
  reply: string
  viewAll: string
  readMore: string
  all: string
  filterLabel: string
  showing: string
  prev: string
  next: string
  emptyFilter: string
  noReviewsTitle: string
  noReviewsLead: string
  reviewedProduct: string
  collectedBy: string
  footerBadge: string
  carouselPrev: string
  carouselNext: string
}

const en: ReviewsCopy = {
  nav: "Reviews",
  productTitle: "Customer reviews",
  homeEyebrow: "Verified by Stamped.io",
  homeTitle: "Drivers rate us",
  homeLead: "Real reviews from customers who bought and fitted our tires and wheels.",
  pageTitle: "Customer reviews",
  pageLead:
    "Every review published for TiresShop on Stamped.io. Reviews are collected from verified buyers after delivery and are shown as written.",
  metaDescription: "Verified TiresShop customer reviews on tires, wheels and brakes, collected by Stamped.io.",
  basedOn: "Based on {count}",
  reviewsOne: "{count} review",
  reviewsMany: "{count} reviews",
  ratingLabel: "Rated {rating} out of 5",
  starsOne: "{n} star",
  starsMany: "{n} stars",
  verified: "Verified buyer",
  reply: "Reply from TiresShop",
  viewAll: "All reviews",
  readMore: "Read all reviews",
  all: "All",
  filterLabel: "Filter by rating",
  showing: "{from}–{to} of {total}",
  prev: "Previous page",
  next: "Next page",
  emptyFilter: "No reviews match this filter yet.",
  noReviewsTitle: "No reviews for this product yet",
  noReviewsLead: "We ask every buyer for a review after delivery. Meanwhile, see what customers say about other products.",
  reviewedProduct: "Reviewed product",
  collectedBy: "Reviews collected by Stamped.io",
  footerBadge: "Stamped.io rating {rating} out of 5 from {count} reviews. Read all reviews",
  carouselPrev: "Previous reviews",
  carouselNext: "Next reviews",
}

const es419: ReviewsCopy = {
  nav: "Opiniones",
  productTitle: "Opiniones de clientes",
  homeEyebrow: "Verificado por Stamped.io",
  homeTitle: "Lo que dicen los conductores",
  homeLead: "Opiniones reales de clientes que compraron y montaron nuestras llantas y rines.",
  pageTitle: "Opiniones de clientes",
  pageLead:
    "Todas las opiniones publicadas sobre TiresShop en Stamped.io. Se recogen de compradores verificados después de la entrega y se muestran tal como fueron escritas.",
  metaDescription: "Opiniones verificadas de clientes de TiresShop sobre llantas, rines y frenos, recogidas por Stamped.io.",
  basedOn: "Basado en {count}",
  reviewsOne: "{count} opinión",
  reviewsMany: "{count} opiniones",
  ratingLabel: "Calificación {rating} de 5",
  starsOne: "{n} estrella",
  starsMany: "{n} estrellas",
  verified: "Comprador verificado",
  reply: "Respuesta de TiresShop",
  viewAll: "Todas las opiniones",
  readMore: "Leer todas las opiniones",
  all: "Todas",
  filterLabel: "Filtrar por calificación",
  showing: "{from}–{to} de {total}",
  prev: "Página anterior",
  next: "Página siguiente",
  emptyFilter: "Aún no hay opiniones con este filtro.",
  noReviewsTitle: "Este producto aún no tiene opiniones",
  noReviewsLead: "Pedimos una opinión a cada comprador después de la entrega. Mientras tanto, mira lo que dicen de otros productos.",
  reviewedProduct: "Producto evaluado",
  collectedBy: "Opiniones recogidas por Stamped.io",
  footerBadge: "Calificación en Stamped.io: {rating} de 5 con {count} opiniones. Leer todas las opiniones",
  carouselPrev: "Opiniones anteriores",
  carouselNext: "Opiniones siguientes",
}

const es: ReviewsCopy = {
  ...es419,
  homeLead: "Opiniones reales de clientes que compraron y montaron nuestros neumáticos y llantas.",
  metaDescription: "Opiniones verificadas de clientes de TiresShop sobre neumáticos, llantas y frenos, recogidas por Stamped.io.",
  noReviewsLead: "Pedimos una opinión a cada comprador tras la entrega. Mientras tanto, mira lo que dicen de otros productos.",
}

const de: ReviewsCopy = {
  nav: "Bewertungen",
  productTitle: "Kundenbewertungen",
  homeEyebrow: "Verifiziert von Stamped.io",
  homeTitle: "Das sagen Autofahrer",
  homeLead: "Echte Bewertungen von Kunden, die unsere Reifen und Felgen gekauft und montiert haben.",
  pageTitle: "Kundenbewertungen",
  pageLead:
    "Alle auf Stamped.io veröffentlichten Bewertungen für TiresShop. Sie werden nach der Lieferung von verifizierten Käufern eingeholt und unverändert angezeigt.",
  metaDescription: "Verifizierte Kundenbewertungen zu Reifen, Felgen und Bremsen bei TiresShop, gesammelt von Stamped.io.",
  basedOn: "Basierend auf {count}",
  reviewsOne: "{count} Bewertung",
  reviewsMany: "{count} Bewertungen",
  ratingLabel: "Bewertet mit {rating} von 5",
  starsOne: "{n} Stern",
  starsMany: "{n} Sterne",
  verified: "Verifizierter Käufer",
  reply: "Antwort von TiresShop",
  viewAll: "Alle Bewertungen",
  readMore: "Alle Bewertungen lesen",
  all: "Alle",
  filterLabel: "Nach Bewertung filtern",
  showing: "{from}–{to} von {total}",
  prev: "Vorherige Seite",
  next: "Nächste Seite",
  emptyFilter: "Für diesen Filter gibt es noch keine Bewertungen.",
  noReviewsTitle: "Noch keine Bewertungen für dieses Produkt",
  noReviewsLead: "Wir bitten jeden Käufer nach der Lieferung um eine Bewertung. Sehen Sie sich bis dahin an, was Kunden über andere Produkte sagen.",
  reviewedProduct: "Bewertetes Produkt",
  collectedBy: "Bewertungen gesammelt von Stamped.io",
  footerBadge: "Stamped.io-Bewertung {rating} von 5 aus {count} Bewertungen. Alle Bewertungen lesen",
  carouselPrev: "Vorherige Bewertungen",
  carouselNext: "Weitere Bewertungen",
}

const fr: ReviewsCopy = {
  nav: "Avis",
  productTitle: "Avis clients",
  homeEyebrow: "Vérifié par Stamped.io",
  homeTitle: "Les conducteurs nous notent",
  homeLead: "De vrais avis de clients qui ont acheté et monté nos pneus et jantes.",
  pageTitle: "Avis clients",
  pageLead:
    "Tous les avis publiés pour TiresShop sur Stamped.io. Ils sont recueillis auprès d’acheteurs vérifiés après la livraison et affichés tels quels.",
  metaDescription: "Avis clients vérifiés sur les pneus, jantes et freins TiresShop, recueillis par Stamped.io.",
  basedOn: "Sur la base de {count}",
  reviewsOne: "{count} avis",
  reviewsMany: "{count} avis",
  ratingLabel: "Noté {rating} sur 5",
  starsOne: "{n} étoile",
  starsMany: "{n} étoiles",
  verified: "Acheteur vérifié",
  reply: "Réponse de TiresShop",
  viewAll: "Tous les avis",
  readMore: "Lire tous les avis",
  all: "Tous",
  filterLabel: "Filtrer par note",
  showing: "{from}–{to} sur {total}",
  prev: "Page précédente",
  next: "Page suivante",
  emptyFilter: "Aucun avis ne correspond encore à ce filtre.",
  noReviewsTitle: "Pas encore d’avis pour ce produit",
  noReviewsLead: "Nous demandons un avis à chaque acheteur après la livraison. En attendant, découvrez ce que disent les clients d’autres produits.",
  reviewedProduct: "Produit évalué",
  collectedBy: "Avis recueillis par Stamped.io",
  footerBadge: "Note Stamped.io {rating} sur 5 pour {count} avis. Lire tous les avis",
  carouselPrev: "Avis précédents",
  carouselNext: "Avis suivants",
}

const it: ReviewsCopy = {
  nav: "Recensioni",
  productTitle: "Recensioni dei clienti",
  homeEyebrow: "Verificato da Stamped.io",
  homeTitle: "Il giudizio degli automobilisti",
  homeLead: "Recensioni reali di clienti che hanno acquistato e montato i nostri pneumatici e cerchi.",
  pageTitle: "Recensioni dei clienti",
  pageLead:
    "Tutte le recensioni pubblicate per TiresShop su Stamped.io. Vengono raccolte da acquirenti verificati dopo la consegna e mostrate così come scritte.",
  metaDescription: "Recensioni verificate dei clienti TiresShop su pneumatici, cerchi e freni, raccolte da Stamped.io.",
  basedOn: "Su {count}",
  reviewsOne: "{count} recensione",
  reviewsMany: "{count} recensioni",
  ratingLabel: "Valutato {rating} su 5",
  starsOne: "{n} stella",
  starsMany: "{n} stelle",
  verified: "Acquirente verificato",
  reply: "Risposta di TiresShop",
  viewAll: "Tutte le recensioni",
  readMore: "Leggi tutte le recensioni",
  all: "Tutte",
  filterLabel: "Filtra per valutazione",
  showing: "{from}–{to} di {total}",
  prev: "Pagina precedente",
  next: "Pagina successiva",
  emptyFilter: "Nessuna recensione corrisponde ancora a questo filtro.",
  noReviewsTitle: "Ancora nessuna recensione per questo prodotto",
  noReviewsLead: "Chiediamo una recensione a ogni acquirente dopo la consegna. Nel frattempo, scopri cosa dicono i clienti di altri prodotti.",
  reviewedProduct: "Prodotto recensito",
  collectedBy: "Recensioni raccolte da Stamped.io",
  footerBadge: "Valutazione Stamped.io {rating} su 5 da {count} recensioni. Leggi tutte le recensioni",
  carouselPrev: "Recensioni precedenti",
  carouselNext: "Recensioni successive",
}

const nl: ReviewsCopy = {
  nav: "Reviews",
  productTitle: "Klantreviews",
  homeEyebrow: "Geverifieerd door Stamped.io",
  homeTitle: "Wat bestuurders zeggen",
  homeLead: "Echte reviews van klanten die onze banden en velgen hebben gekocht en gemonteerd.",
  pageTitle: "Klantreviews",
  pageLead:
    "Alle reviews die voor TiresShop op Stamped.io zijn gepubliceerd. Ze worden na levering bij geverifieerde kopers verzameld en ongewijzigd getoond.",
  metaDescription: "Geverifieerde klantreviews over banden, velgen en remmen bij TiresShop, verzameld door Stamped.io.",
  basedOn: "Op basis van {count}",
  reviewsOne: "{count} review",
  reviewsMany: "{count} reviews",
  ratingLabel: "Beoordeeld met {rating} van 5",
  starsOne: "{n} ster",
  starsMany: "{n} sterren",
  verified: "Geverifieerde koper",
  reply: "Reactie van TiresShop",
  viewAll: "Alle reviews",
  readMore: "Alle reviews lezen",
  all: "Alle",
  filterLabel: "Filteren op beoordeling",
  showing: "{from}–{to} van {total}",
  prev: "Vorige pagina",
  next: "Volgende pagina",
  emptyFilter: "Er zijn nog geen reviews voor dit filter.",
  noReviewsTitle: "Nog geen reviews voor dit product",
  noReviewsLead: "We vragen elke koper na levering om een review. Bekijk intussen wat klanten over andere producten zeggen.",
  reviewedProduct: "Beoordeeld product",
  collectedBy: "Reviews verzameld door Stamped.io",
  footerBadge: "Stamped.io-score {rating} van 5 uit {count} reviews. Alle reviews lezen",
  carouselPrev: "Vorige reviews",
  carouselNext: "Volgende reviews",
}

const COPY: Record<ContentLang, ReviewsCopy> = { en, "es-419": es419, es, de, fr, it, nl }

export function getReviewsCopy(store: Store): ReviewsCopy {
  return COPY[localeMeta(store).content]
}

export function reviewCountLabel(copy: ReviewsCopy, count: number) {
  return (count === 1 ? copy.reviewsOne : copy.reviewsMany).replace("{count}", String(count))
}

export function formatRating(store: Store, value: number) {
  return new Intl.NumberFormat(localeMeta(store).intlLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value)
}

export function formatReviewDate(store: Store, iso: string) {
  return new Intl.DateTimeFormat(localeMeta(store).intlLocale, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" }).format(
    new Date(iso),
  )
}

export function starsLabel(copy: ReviewsCopy, n: number) {
  return (n === 1 ? copy.starsOne : copy.starsMany).replace("{n}", String(n))
}
