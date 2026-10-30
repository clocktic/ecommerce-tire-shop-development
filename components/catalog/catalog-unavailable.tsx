import Link from "next/link"
import { storePath, type Store } from "@/lib/i18n"

const copy = {
  en: {
    title: "Live catalog temporarily unavailable",
    body: "We cannot load current products, prices or availability. Please try again later. You can still browse our tire reference guide or contact us for help.",
    reference: "Browse tire reference guide",
    contact: "Contact us",
  },
  de: {
    title: "Live-Katalog vorübergehend nicht verfügbar",
    body: "Produkte, Preise und Verfügbarkeit können derzeit nicht geladen werden. Bitte versuchen Sie es später erneut. Der Reifenratgeber und unsere Kontaktseite bleiben verfügbar.",
    reference: "Reifenratgeber ansehen",
    contact: "Kontakt",
  },
  fr: {
    title: "Catalogue temporairement indisponible",
    body: "Les produits, prix et disponibilités ne peuvent pas être chargés. Réessayez plus tard. Notre guide des pneus et notre page de contact restent accessibles.",
    reference: "Consulter le guide des pneus",
    contact: "Nous contacter",
  },
  it: {
    title: "Catalogo temporaneamente non disponibile",
    body: "Non possiamo caricare prodotti, prezzi e disponibilità. Riprova più tardi. Puoi ancora consultare la guida agli pneumatici o contattarci.",
    reference: "Consulta la guida agli pneumatici",
    contact: "Contattaci",
  },
  es: {
    title: "Catálogo temporalmente no disponible",
    body: "No podemos cargar los productos, precios ni disponibilidad. Inténtalo más tarde. Puedes consultar nuestra guía de neumáticos o contactarnos.",
    reference: "Consultar la guía de neumáticos",
    contact: "Contactar",
  },
  nl: {
    title: "Actuele catalogus tijdelijk niet beschikbaar",
    body: "Producten, prijzen en beschikbaarheid kunnen niet worden geladen. Probeer het later opnieuw. Je kunt nog steeds onze bandengids bekijken of contact opnemen.",
    reference: "Bekijk de bandengids",
    contact: "Contact opnemen",
  },
} satisfies Record<Store["lang"], { title: string; body: string; reference: string; contact: string }>

const accountCopy = {
  en: { title: "Saved vehicles temporarily unavailable", body: "Your saved vehicles could not be loaded. Your account and saved data have not been changed. Please try again later." },
  de: { title: "Gespeicherte Fahrzeuge vorübergehend nicht verfügbar", body: "Ihre gespeicherten Fahrzeuge konnten nicht geladen werden. Ihr Konto und Ihre Daten wurden nicht verändert. Bitte versuchen Sie es später erneut." },
  fr: { title: "Véhicules enregistrés temporairement indisponibles", body: "Vos véhicules enregistrés n’ont pas pu être chargés. Votre compte et vos données n’ont pas été modifiés. Réessayez plus tard." },
  it: { title: "Veicoli salvati temporaneamente non disponibili", body: "Non è stato possibile caricare i veicoli salvati. Il tuo account e i tuoi dati non sono stati modificati. Riprova più tardi." },
  es: { title: "Vehículos guardados temporalmente no disponibles", body: "No se pudieron cargar tus vehículos guardados. Tu cuenta y tus datos no se han modificado. Inténtalo más tarde." },
  nl: { title: "Opgeslagen voertuigen tijdelijk niet beschikbaar", body: "Je opgeslagen voertuigen konden niet worden geladen. Je account en gegevens zijn niet gewijzigd. Probeer het later opnieuw." },
} satisfies Record<Store["lang"], { title: string; body: string }>

export function CatalogUnavailable({ store, scope = "catalog" }: { store: Store; scope?: "catalog" | "account" }) {
  const text = scope === "account" ? { ...copy[store.lang], ...accountCopy[store.lang] } : copy[store.lang]
  return (
    <section role="status" className="mx-auto my-8 flex max-w-7xl flex-col items-start gap-4 border border-border bg-card p-6 md:p-8">
      <h2 className="font-expanded text-xl font-extrabold uppercase">{text.title}</h2>
      <p className="max-w-2xl leading-relaxed text-muted-foreground">{text.body}</p>
      <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
        <Link href={storePath(store, "/tire-catalog")} className="underline underline-offset-4">{text.reference}</Link>
        <Link href={storePath(store, "/contact")} className="underline underline-offset-4">{text.contact}</Link>
      </div>
    </section>
  )
}
