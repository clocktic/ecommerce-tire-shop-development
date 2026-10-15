import type { ContentLang } from "@/lib/i18n/config"
import type { Market } from "@/lib/markets"

// Own courier first; when it cannot close a route the parcel goes to a partner.
export const OWN_CARRIER = "Contact Patch Courier"
export const PARTNER_CARRIERS: Record<Market, readonly string[]> = {
  us: ["UPS", "FedEx"],
  eu: ["DHL", "DPD"],
}
export function carriersFor(market: Market): string[] {
  return [OWN_CARRIER, ...PARTNER_CARRIERS[market]]
}

export const SHIPMENT_STATUSES = [
  "label_created",
  "collected",
  "at_warehouse",
  "sorted",
  "in_transit",
  "at_delivery_point",
  "out_for_delivery",
  "delivery_attempted",
  "handed_to_partner",
  "awaiting_pickup",
  "address_issue",
  "delayed",
  "customs",
  "returning",
  "returned",
  "delivered",
] as const

export type ShipmentStatus = (typeof SHIPMENT_STATUSES)[number]

export function isShipmentStatus(value: string): value is ShipmentStatus {
  return (SHIPMENT_STATUSES as readonly string[]).includes(value)
}

// Admin only. Customers always see the label in their store language.
export const ADMIN_STATUS_LABELS: Record<ShipmentStatus, string> = {
  label_created: "Трек-номер создан",
  collected: "Курьер забрал посылку",
  at_warehouse: "Принята на складе",
  sorted: "Отсортирована",
  in_transit: "В пути",
  at_delivery_point: "Прибыла в пункт доставки",
  out_for_delivery: "Курьер везёт получателю",
  delivery_attempted: "Неудачная попытка доставки",
  handed_to_partner: "Неудачная доставка — заказ передан партнёру ({carrier})",
  awaiting_pickup: "Ожидает получения",
  address_issue: "Проблема с адресом",
  delayed: "Задержка",
  customs: "Таможенное оформление",
  returning: "Возвращается отправителю",
  returned: "Возвращена отправителю",
  delivered: "Доставлена",
}

const STATUS_LABELS: Record<ContentLang, Record<ShipmentStatus, string>> = {
  en: {
    label_created: "Tracking number created",
    collected: "Courier collected the parcel",
    at_warehouse: "Accepted at the warehouse",
    sorted: "Sorted",
    in_transit: "In transit",
    at_delivery_point: "Arrived at the delivery point",
    out_for_delivery: "Out for delivery",
    delivery_attempted: "Delivery attempt failed",
    handed_to_partner: "Unsuccessful delivery — handed to {carrier}",
    awaiting_pickup: "Awaiting collection",
    address_issue: "Address problem",
    delayed: "Delayed",
    customs: "Customs clearance",
    returning: "Returning to sender",
    returned: "Returned to sender",
    delivered: "Delivered",
  },
  "es-419": {
    label_created: "Número de rastreo creado",
    collected: "El mensajero recogió el paquete",
    at_warehouse: "Recibido en el almacén",
    sorted: "Clasificado",
    in_transit: "En tránsito",
    at_delivery_point: "Llegó al punto de entrega",
    out_for_delivery: "En ruta de entrega",
    delivery_attempted: "Intento de entrega fallido",
    handed_to_partner: "Entrega fallida — enviado con {carrier}",
    awaiting_pickup: "Listo para recoger",
    address_issue: "Problema con la dirección",
    delayed: "Retrasado",
    customs: "Trámite aduanal",
    returning: "En devolución al remitente",
    returned: "Devuelto al remitente",
    delivered: "Entregado",
  },
  de: {
    label_created: "Sendungsnummer erstellt",
    collected: "Kurier hat das Paket abgeholt",
    at_warehouse: "Im Lager angenommen",
    sorted: "Sortiert",
    in_transit: "Unterwegs",
    at_delivery_point: "Am Zustellpunkt angekommen",
    out_for_delivery: "In Zustellung",
    delivery_attempted: "Zustellversuch fehlgeschlagen",
    handed_to_partner: "Zustellung fehlgeschlagen — an {carrier} übergeben",
    awaiting_pickup: "Wartet auf Abholung",
    address_issue: "Adressproblem",
    delayed: "Verzögert",
    customs: "Zollabfertigung",
    returning: "Rücksendung an den Absender",
    returned: "An den Absender zurückgesandt",
    delivered: "Zugestellt",
  },
  fr: {
    label_created: "Numéro de suivi créé",
    collected: "Colis pris en charge par le coursier",
    at_warehouse: "Accepté à l'entrepôt",
    sorted: "Trié",
    in_transit: "En transit",
    at_delivery_point: "Arrivé au point de livraison",
    out_for_delivery: "En cours de livraison",
    delivery_attempted: "Tentative de livraison échouée",
    handed_to_partner: "Livraison non aboutie — remis à {carrier}",
    awaiting_pickup: "En attente de retrait",
    address_issue: "Problème d'adresse",
    delayed: "Retard",
    customs: "Dédouanement",
    returning: "Retour à l'expéditeur",
    returned: "Retourné à l'expéditeur",
    delivered: "Livré",
  },
  it: {
    label_created: "Numero di tracciamento creato",
    collected: "Ritirato dal corriere",
    at_warehouse: "Accettato in magazzino",
    sorted: "Smistato",
    in_transit: "In transito",
    at_delivery_point: "Arrivato al punto di consegna",
    out_for_delivery: "In consegna",
    delivery_attempted: "Tentativo di consegna non riuscito",
    handed_to_partner: "Consegna non riuscita — affidato a {carrier}",
    awaiting_pickup: "In attesa di ritiro",
    address_issue: "Problema di indirizzo",
    delayed: "In ritardo",
    customs: "Sdoganamento",
    returning: "In restituzione al mittente",
    returned: "Restituito al mittente",
    delivered: "Consegnato",
  },
  es: {
    label_created: "Número de seguimiento creado",
    collected: "El mensajero ha recogido el paquete",
    at_warehouse: "Recibido en el almacén",
    sorted: "Clasificado",
    in_transit: "En tránsito",
    at_delivery_point: "Ha llegado al punto de entrega",
    out_for_delivery: "En reparto",
    delivery_attempted: "Intento de entrega fallido",
    handed_to_partner: "Entrega fallida — entregado a {carrier}",
    awaiting_pickup: "Pendiente de recogida",
    address_issue: "Problema con la dirección",
    delayed: "Retrasado",
    customs: "Despacho de aduanas",
    returning: "Devolviéndose al remitente",
    returned: "Devuelto al remitente",
    delivered: "Entregado",
  },
  nl: {
    label_created: "Trackingnummer aangemaakt",
    collected: "Koerier heeft het pakket opgehaald",
    at_warehouse: "Ontvangen in het magazijn",
    sorted: "Gesorteerd",
    in_transit: "Onderweg",
    at_delivery_point: "Aangekomen bij het afleverpunt",
    out_for_delivery: "Wordt bezorgd",
    delivery_attempted: "Bezorgpoging mislukt",
    handed_to_partner: "Bezorging mislukt — overgedragen aan {carrier}",
    awaiting_pickup: "Klaar om op te halen",
    address_issue: "Adresprobleem",
    delayed: "Vertraagd",
    customs: "Douaneafhandeling",
    returning: "Terug naar afzender",
    returned: "Teruggestuurd naar afzender",
    delivered: "Bezorgd",
  },
}

export function statusLabel(status: string, lang: ContentLang, carrier?: string | null): string {
  if (!isShipmentStatus(status)) return status
  return STATUS_LABELS[lang][status].replace("{carrier}", carrier || PARTNER_CARRIERS.eu[0])
}

export function adminStatusLabel(status: string, carrier?: string | null): string {
  if (!isShipmentStatus(status)) return status
  return ADMIN_STATUS_LABELS[status].replace("{carrier}", carrier || "партнёр")
}

// Progress bar stages on the public tracking page.
export const TRACK_STAGES = ["label_created", "in_transit", "out_for_delivery", "delivered"] as const
export function stageIndex(status: string): number {
  if (status === "delivered") return 3
  if (["out_for_delivery", "delivery_attempted", "awaiting_pickup", "at_delivery_point"].includes(status)) return 2
  if (status === "label_created") return 0
  return 1
}

export const ORDER_STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]
export const ADMIN_ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Ожидает оплаты",
  paid: "Оплачен",
  processing: "Собирается",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменён",
  refunded: "Возврат",
}
