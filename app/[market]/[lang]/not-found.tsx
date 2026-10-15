"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { isStoreLang } from "@/lib/i18n/config"
import { isMarket } from "@/lib/markets"

// not-found.tsx gets no params, so the language is read from the URL.
const COPY = {
  en: { title: "Page not found", text: "The page you are looking for has moved or never existed.", back: "Back to the store" },
  de: { title: "Seite nicht gefunden", text: "Die gesuchte Seite wurde verschoben oder existiert nicht.", back: "Zurück zum Shop" },
  fr: { title: "Page introuvable", text: "La page que vous cherchez a été déplacée ou n’existe pas.", back: "Retour à la boutique" },
  it: { title: "Pagina non trovata", text: "La pagina che cerchi è stata spostata o non esiste.", back: "Torna al negozio" },
  es: { title: "Página no encontrada", text: "La página que buscas se ha movido o no existe.", back: "Volver a la tienda" },
  nl: { title: "Pagina niet gevonden", text: "De pagina die u zoekt is verplaatst of bestaat niet.", back: "Terug naar de winkel" },
} as const

export default function NotFound() {
  const pathname = usePathname()
  const [, market, lang] = pathname.split("/")
  const copy = COPY[lang as keyof typeof COPY] ?? COPY.en
  const home = isMarket(market) ? `/${market}/${isStoreLang(market, lang) ? lang : "en"}` : "/"

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-start gap-4 px-4 py-24 md:px-6">
      <p className="label-caps text-primary">404</p>
      <h1 className="font-expanded text-3xl font-extrabold uppercase">{copy.title}</h1>
      <p className="leading-relaxed text-muted-foreground">{copy.text}</p>
      <Link href={home} className="underline underline-offset-4">
        {copy.back}
      </Link>
    </div>
  )
}
