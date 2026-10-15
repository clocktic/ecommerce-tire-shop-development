import { localeMeta, type ContentLang, type Store } from "@/lib/i18n/config"
import type { OrderStatus } from "@/lib/shipping/tracking"

// Strings for account, orders, tracking, contact form, live chat and theme.
// Kept apart from the main dictionaries so those stay focused on catalog and law.
export type Extras = {
  theme: { toggle: string; light: string; dark: string }
  account: {
    signIn: string
    title: string
    lead: string
    google: string
    apple: string
    facebook: string
    unavailable: string
    noneConfigured: string
    consent: string
    account: string
    greeting: string
    orders: string
    noOrders: string
    signOut: string
    placed: string
    status: string
    total: string
    error: string
  }
  orderStatus: Record<OrderStatus, string>
  order: {
    title: string
    lead: string
    number: string
    payment: string
    track: string
    viewAccount: string
    continue: string
    items: string
  }
  checkout: { placing: string; error: string; signedInAs: string; signInHint: string }
  track: {
    nav: string
    title: string
    lead: string
    placeholder: string
    submit: string
    notFound: string
    carrier: string
    number: string
    order: string
    history: string
    stages: [string, string, string, string]
    noEvents: string
  }
  contactForm: {
    title: string
    name: string
    email: string
    orderNumber: string
    subject: string
    message: string
    send: string
    sending: string
    sent: string
    error: string
  }
  chat: {
    open: string
    title: string
    greeting: string
    placeholder: string
    send: string
    close: string
    hours: string
    team: string
    error: string
  }
  email: {
    orderSubject: string
    orderBody: string
    shipSubject: string
    shipBody: string
    trackCta: string
    signoff: string
  }
}

const en: Extras = {
  theme: { toggle: "Switch colour theme", light: "Light", dark: "Dark" },
  account: {
    signIn: "Sign in",
    title: "Sign in",
    lead: "Use an account you already have. We only receive your name and email address.",
    google: "Continue with Google",
    apple: "Continue with Apple",
    facebook: "Continue with Facebook",
    unavailable: "Not available yet",
    noneConfigured: "Sign-in is being set up. You can still order as a guest — tracking works with your order number.",
    consent: "By signing in you agree to our Terms and acknowledge the Privacy Policy.",
    account: "Account",
    greeting: "Signed in as {email}",
    orders: "Your orders",
    noOrders: "No orders yet. Orders placed while signed in appear here.",
    signOut: "Sign out",
    placed: "Placed",
    status: "Status",
    total: "Total",
    error: "Sign-in failed. Please try again.",
  },
  orderStatus: {
    pending: "Awaiting payment",
    paid: "Paid",
    processing: "Being prepared",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
    refunded: "Refunded",
  },
  order: {
    title: "Order received",
    lead: "Thank you. Your order {number} is saved and a confirmation is on its way to {email}.",
    number: "Order number",
    payment: "Online payment is not connected yet. We will contact you by email to complete payment before dispatch.",
    track: "Track this order",
    viewAccount: "View in your account",
    continue: "Continue shopping",
    items: "Items",
  },
  checkout: {
    placing: "Placing order…",
    error: "We could not place the order. Check the details and try again.",
    signedInAs: "Ordering as {email}",
    signInHint: "Sign in to see this order in your account later.",
  },
  track: {
    nav: "Track order",
    title: "Track a shipment",
    lead: "Enter the tracking number from your shipping email, or your order number.",
    placeholder: "Tracking or order number",
    submit: "Track",
    notFound: "We could not find a shipment with that number. Check it and try again.",
    carrier: "Carrier",
    number: "Tracking number",
    order: "Order",
    history: "Shipment history",
    stages: ["Label created", "In transit", "Out for delivery", "Delivered"],
    noEvents: "Your order is being prepared. Tracking updates appear here once it ships.",
  },
  contactForm: {
    title: "Send us a message",
    name: "Name",
    email: "Email",
    orderNumber: "Order number (optional)",
    subject: "Subject",
    message: "Message",
    send: "Send message",
    sending: "Sending…",
    sent: "Thank you — your message is with our team. We reply within one business day.",
    error: "Your message could not be sent. Check the fields and try again.",
  },
  chat: {
    open: "Chat with us",
    title: "Live chat",
    greeting: "Hi! Ask us about sizes, fitment or an order — a person from our team will reply here.",
    placeholder: "Type a message",
    send: "Send",
    close: "Close chat",
    hours: "We reply within minutes during business hours.",
    team: "Support",
    error: "Message not sent. Try again.",
  },
  email: {
    orderSubject: "Order {number} received",
    orderBody: "Thank you for your order {number}. Total: {total}. We will email you again when it ships.",
    shipSubject: "Order {number}: {status}",
    shipBody: "There is an update for your order {number}: {status}.",
    trackCta: "Track your parcel",
    signoff: "The Contact Patch team",
  },
}

const es419: Extras = {
  theme: { toggle: "Cambiar tema de color", light: "Claro", dark: "Oscuro" },
  account: {
    signIn: "Iniciar sesión",
    title: "Iniciar sesión",
    lead: "Usa una cuenta que ya tengas. Solo recibimos tu nombre y tu correo electrónico.",
    google: "Continuar con Google",
    apple: "Continuar con Apple",
    facebook: "Continuar con Facebook",
    unavailable: "Aún no disponible",
    noneConfigured: "Estamos configurando el inicio de sesión. Puedes comprar como invitado; el rastreo funciona con tu número de pedido.",
    consent: "Al iniciar sesión aceptas nuestros Términos y reconoces el Aviso de privacidad.",
    account: "Cuenta",
    greeting: "Sesión iniciada como {email}",
    orders: "Tus pedidos",
    noOrders: "Aún no tienes pedidos. Los pedidos hechos con la sesión iniciada aparecen aquí.",
    signOut: "Cerrar sesión",
    placed: "Fecha",
    status: "Estado",
    total: "Total",
    error: "No se pudo iniciar sesión. Inténtalo de nuevo.",
  },
  orderStatus: {
    pending: "Pendiente de pago",
    paid: "Pagado",
    processing: "En preparación",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
  },
  order: {
    title: "Pedido recibido",
    lead: "Gracias. Guardamos tu pedido {number} y enviamos la confirmación a {email}.",
    number: "Número de pedido",
    payment: "El pago en línea aún no está conectado. Te escribiremos por correo para completar el pago antes del envío.",
    track: "Rastrear este pedido",
    viewAccount: "Ver en tu cuenta",
    continue: "Seguir comprando",
    items: "Artículos",
  },
  checkout: {
    placing: "Enviando pedido…",
    error: "No pudimos registrar el pedido. Revisa los datos e inténtalo de nuevo.",
    signedInAs: "Comprando como {email}",
    signInHint: "Inicia sesión para ver este pedido después en tu cuenta.",
  },
  track: {
    nav: "Rastrear pedido",
    title: "Rastrear un envío",
    lead: "Escribe el número de rastreo del correo de envío o tu número de pedido.",
    placeholder: "Número de rastreo o de pedido",
    submit: "Rastrear",
    notFound: "No encontramos un envío con ese número. Revísalo e inténtalo de nuevo.",
    carrier: "Paquetería",
    number: "Número de rastreo",
    order: "Pedido",
    history: "Historial del envío",
    stages: ["Guía creada", "En tránsito", "En ruta de entrega", "Entregado"],
    noEvents: "Estamos preparando tu pedido. Las actualizaciones aparecerán aquí cuando se envíe.",
  },
  contactForm: {
    title: "Envíanos un mensaje",
    name: "Nombre",
    email: "Correo electrónico",
    orderNumber: "Número de pedido (opcional)",
    subject: "Asunto",
    message: "Mensaje",
    send: "Enviar mensaje",
    sending: "Enviando…",
    sent: "Gracias, tu mensaje ya está con nuestro equipo. Respondemos en un día hábil.",
    error: "No se pudo enviar el mensaje. Revisa los campos e inténtalo de nuevo.",
  },
  chat: {
    open: "Chatea con nosotros",
    title: "Chat en vivo",
    greeting: "¡Hola! Pregúntanos por medidas, compatibilidad o un pedido; alguien de nuestro equipo te responderá aquí.",
    placeholder: "Escribe un mensaje",
    send: "Enviar",
    close: "Cerrar chat",
    hours: "Respondemos en minutos en horario de atención.",
    team: "Soporte",
    error: "Mensaje no enviado. Inténtalo de nuevo.",
  },
  email: {
    orderSubject: "Pedido {number} recibido",
    orderBody: "Gracias por tu pedido {number}. Total: {total}. Te escribiremos de nuevo cuando se envíe.",
    shipSubject: "Pedido {number}: {status}",
    shipBody: "Hay una actualización de tu pedido {number}: {status}.",
    trackCta: "Rastrear tu paquete",
    signoff: "El equipo de Contact Patch",
  },
}

const es: Extras = {
  ...es419,
  theme: { toggle: "Cambiar tema de color", light: "Claro", dark: "Oscuro" },
  account: {
    ...es419.account,
    lead: "Utiliza una cuenta que ya tengas. Solo recibimos tu nombre y tu dirección de correo.",
    noneConfigured: "Estamos configurando el inicio de sesión. Puedes comprar como invitado; el seguimiento funciona con tu número de pedido.",
    consent: "Al iniciar sesión aceptas nuestras Condiciones y reconoces la Política de privacidad.",
  },
  order: {
    ...es419.order,
    payment: "El pago online aún no está conectado. Te escribiremos por correo para completar el pago antes del envío.",
    track: "Seguir este pedido",
  },
  track: {
    nav: "Seguir pedido",
    title: "Seguimiento de un envío",
    lead: "Introduce el número de seguimiento del correo de envío o tu número de pedido.",
    placeholder: "Número de seguimiento o de pedido",
    submit: "Buscar",
    notFound: "No hemos encontrado ningún envío con ese número. Compruébalo e inténtalo de nuevo.",
    carrier: "Transportista",
    number: "Número de seguimiento",
    order: "Pedido",
    history: "Historial del envío",
    stages: ["Etiqueta creada", "En tránsito", "En reparto", "Entregado"],
    noEvents: "Estamos preparando tu pedido. Las actualizaciones aparecerán aquí cuando se envíe.",
  },
  chat: { ...es419.chat, greeting: "¡Hola! Pregúntanos por medidas, compatibilidad o un pedido; una persona de nuestro equipo te responderá aquí." },
  email: { ...es419.email, trackCta: "Seguir tu paquete" },
}

const de: Extras = {
  theme: { toggle: "Farbschema wechseln", light: "Hell", dark: "Dunkel" },
  account: {
    signIn: "Anmelden",
    title: "Anmelden",
    lead: "Nutzen Sie ein bestehendes Konto. Wir erhalten nur Ihren Namen und Ihre E-Mail-Adresse.",
    google: "Weiter mit Google",
    apple: "Weiter mit Apple",
    facebook: "Weiter mit Facebook",
    unavailable: "Noch nicht verfügbar",
    noneConfigured: "Die Anmeldung wird gerade eingerichtet. Sie können als Gast bestellen — die Sendungsverfolgung funktioniert mit Ihrer Bestellnummer.",
    consent: "Mit der Anmeldung akzeptieren Sie unsere AGB und nehmen die Datenschutzerklärung zur Kenntnis.",
    account: "Konto",
    greeting: "Angemeldet als {email}",
    orders: "Ihre Bestellungen",
    noOrders: "Noch keine Bestellungen. Bestellungen, die Sie angemeldet aufgeben, erscheinen hier.",
    signOut: "Abmelden",
    placed: "Datum",
    status: "Status",
    total: "Summe",
    error: "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
  },
  orderStatus: {
    pending: "Zahlung ausstehend",
    paid: "Bezahlt",
    processing: "In Vorbereitung",
    shipped: "Versandt",
    delivered: "Zugestellt",
    cancelled: "Storniert",
    refunded: "Erstattet",
  },
  order: {
    title: "Bestellung eingegangen",
    lead: "Vielen Dank. Ihre Bestellung {number} ist gespeichert, die Bestätigung geht an {email}.",
    number: "Bestellnummer",
    payment: "Die Online-Zahlung ist noch nicht angebunden. Wir kontaktieren Sie per E-Mail, um die Zahlung vor dem Versand abzuschließen.",
    track: "Diese Bestellung verfolgen",
    viewAccount: "Im Konto ansehen",
    continue: "Weiter einkaufen",
    items: "Artikel",
  },
  checkout: {
    placing: "Bestellung wird gesendet…",
    error: "Die Bestellung konnte nicht aufgegeben werden. Prüfen Sie die Angaben und versuchen Sie es erneut.",
    signedInAs: "Sie bestellen als {email}",
    signInHint: "Melden Sie sich an, um diese Bestellung später in Ihrem Konto zu sehen.",
  },
  track: {
    nav: "Sendung verfolgen",
    title: "Sendung verfolgen",
    lead: "Geben Sie die Sendungsnummer aus der Versand-E-Mail oder Ihre Bestellnummer ein.",
    placeholder: "Sendungs- oder Bestellnummer",
    submit: "Verfolgen",
    notFound: "Zu dieser Nummer wurde keine Sendung gefunden. Bitte prüfen Sie die Eingabe.",
    carrier: "Versanddienstleister",
    number: "Sendungsnummer",
    order: "Bestellung",
    history: "Sendungsverlauf",
    stages: ["Label erstellt", "Unterwegs", "In Zustellung", "Zugestellt"],
    noEvents: "Ihre Bestellung wird vorbereitet. Sendungsdaten erscheinen hier nach dem Versand.",
  },
  contactForm: {
    title: "Schreiben Sie uns",
    name: "Name",
    email: "E-Mail",
    orderNumber: "Bestellnummer (optional)",
    subject: "Betreff",
    message: "Nachricht",
    send: "Nachricht senden",
    sending: "Wird gesendet…",
    sent: "Vielen Dank — Ihre Nachricht ist bei unserem Team. Wir antworten innerhalb eines Werktags.",
    error: "Die Nachricht konnte nicht gesendet werden. Prüfen Sie die Felder und versuchen Sie es erneut.",
  },
  chat: {
    open: "Chatten Sie mit uns",
    title: "Live-Chat",
    greeting: "Hallo! Fragen Sie uns zu Größen, Passform oder einer Bestellung — eine Person aus unserem Team antwortet hier.",
    placeholder: "Nachricht eingeben",
    send: "Senden",
    close: "Chat schließen",
    hours: "Während der Geschäftszeiten antworten wir innerhalb weniger Minuten.",
    team: "Kundenservice",
    error: "Nachricht nicht gesendet. Bitte erneut versuchen.",
  },
  email: {
    orderSubject: "Bestellung {number} eingegangen",
    orderBody: "Vielen Dank für Ihre Bestellung {number}. Summe: {total}. Wir melden uns erneut, sobald sie versandt ist.",
    shipSubject: "Bestellung {number}: {status}",
    shipBody: "Neuigkeiten zu Ihrer Bestellung {number}: {status}.",
    trackCta: "Paket verfolgen",
    signoff: "Ihr Contact-Patch-Team",
  },
}

const fr: Extras = {
  theme: { toggle: "Changer le thème de couleur", light: "Clair", dark: "Sombre" },
  account: {
    signIn: "Se connecter",
    title: "Se connecter",
    lead: "Utilisez un compte existant. Nous ne recevons que votre nom et votre adresse e-mail.",
    google: "Continuer avec Google",
    apple: "Continuer avec Apple",
    facebook: "Continuer avec Facebook",
    unavailable: "Pas encore disponible",
    noneConfigured: "La connexion est en cours de configuration. Vous pouvez commander en tant qu'invité — le suivi fonctionne avec votre numéro de commande.",
    consent: "En vous connectant, vous acceptez nos CGV et prenez connaissance de la Politique de confidentialité.",
    account: "Compte",
    greeting: "Connecté en tant que {email}",
    orders: "Vos commandes",
    noOrders: "Aucune commande pour l'instant. Les commandes passées en étant connecté apparaissent ici.",
    signOut: "Se déconnecter",
    placed: "Date",
    status: "Statut",
    total: "Total",
    error: "La connexion a échoué. Veuillez réessayer.",
  },
  orderStatus: {
    pending: "En attente de paiement",
    paid: "Payée",
    processing: "En préparation",
    shipped: "Expédiée",
    delivered: "Livrée",
    cancelled: "Annulée",
    refunded: "Remboursée",
  },
  order: {
    title: "Commande reçue",
    lead: "Merci. Votre commande {number} est enregistrée et la confirmation part à {email}.",
    number: "Numéro de commande",
    payment: "Le paiement en ligne n'est pas encore connecté. Nous vous contacterons par e-mail pour finaliser le paiement avant l'expédition.",
    track: "Suivre cette commande",
    viewAccount: "Voir dans votre compte",
    continue: "Continuer mes achats",
    items: "Articles",
  },
  checkout: {
    placing: "Envoi de la commande…",
    error: "La commande n'a pas pu être passée. Vérifiez les informations et réessayez.",
    signedInAs: "Vous commandez en tant que {email}",
    signInHint: "Connectez-vous pour retrouver cette commande dans votre compte.",
  },
  track: {
    nav: "Suivre ma commande",
    title: "Suivre un envoi",
    lead: "Saisissez le numéro de suivi de l'e-mail d'expédition ou votre numéro de commande.",
    placeholder: "Numéro de suivi ou de commande",
    submit: "Suivre",
    notFound: "Aucun envoi trouvé pour ce numéro. Vérifiez-le et réessayez.",
    carrier: "Transporteur",
    number: "Numéro de suivi",
    order: "Commande",
    history: "Historique de l'envoi",
    stages: ["Étiquette créée", "En transit", "En cours de livraison", "Livré"],
    noEvents: "Votre commande est en préparation. Le suivi apparaîtra ici après l'expédition.",
  },
  contactForm: {
    title: "Envoyez-nous un message",
    name: "Nom",
    email: "E-mail",
    orderNumber: "Numéro de commande (facultatif)",
    subject: "Objet",
    message: "Message",
    send: "Envoyer le message",
    sending: "Envoi…",
    sent: "Merci — votre message est bien parvenu à notre équipe. Nous répondons sous un jour ouvré.",
    error: "Le message n'a pas pu être envoyé. Vérifiez les champs et réessayez.",
  },
  chat: {
    open: "Discuter avec nous",
    title: "Chat en direct",
    greeting: "Bonjour ! Posez-nous vos questions sur les dimensions, la compatibilité ou une commande — un membre de l'équipe vous répondra ici.",
    placeholder: "Écrire un message",
    send: "Envoyer",
    close: "Fermer le chat",
    hours: "Nous répondons en quelques minutes pendant les heures d'ouverture.",
    team: "Service client",
    error: "Message non envoyé. Réessayez.",
  },
  email: {
    orderSubject: "Commande {number} reçue",
    orderBody: "Merci pour votre commande {number}. Total : {total}. Nous vous écrirons à nouveau lors de l'expédition.",
    shipSubject: "Commande {number} : {status}",
    shipBody: "Du nouveau pour votre commande {number} : {status}.",
    trackCta: "Suivre votre colis",
    signoff: "L'équipe Contact Patch",
  },
}

const it: Extras = {
  theme: { toggle: "Cambia tema colore", light: "Chiaro", dark: "Scuro" },
  account: {
    signIn: "Accedi",
    title: "Accedi",
    lead: "Usa un account che hai già. Riceviamo solo il tuo nome e il tuo indirizzo e-mail.",
    google: "Continua con Google",
    apple: "Continua con Apple",
    facebook: "Continua con Facebook",
    unavailable: "Non ancora disponibile",
    noneConfigured: "L'accesso è in fase di configurazione. Puoi ordinare come ospite: il tracciamento funziona con il numero d'ordine.",
    consent: "Accedendo accetti le nostre Condizioni e prendi atto dell'Informativa sulla privacy.",
    account: "Account",
    greeting: "Accesso effettuato come {email}",
    orders: "I tuoi ordini",
    noOrders: "Nessun ordine. Gli ordini effettuati dopo l'accesso compaiono qui.",
    signOut: "Esci",
    placed: "Data",
    status: "Stato",
    total: "Totale",
    error: "Accesso non riuscito. Riprova.",
  },
  orderStatus: {
    pending: "In attesa di pagamento",
    paid: "Pagato",
    processing: "In preparazione",
    shipped: "Spedito",
    delivered: "Consegnato",
    cancelled: "Annullato",
    refunded: "Rimborsato",
  },
  order: {
    title: "Ordine ricevuto",
    lead: "Grazie. Il tuo ordine {number} è registrato e la conferma è in arrivo a {email}.",
    number: "Numero d'ordine",
    payment: "Il pagamento online non è ancora attivo. Ti contatteremo via e-mail per completare il pagamento prima della spedizione.",
    track: "Traccia questo ordine",
    viewAccount: "Vedi nel tuo account",
    continue: "Continua lo shopping",
    items: "Articoli",
  },
  checkout: {
    placing: "Invio dell'ordine…",
    error: "Non è stato possibile inviare l'ordine. Controlla i dati e riprova.",
    signedInAs: "Ordini come {email}",
    signInHint: "Accedi per ritrovare questo ordine nel tuo account.",
  },
  track: {
    nav: "Traccia ordine",
    title: "Traccia una spedizione",
    lead: "Inserisci il numero di tracciamento dell'e-mail di spedizione o il numero d'ordine.",
    placeholder: "Numero di tracciamento o d'ordine",
    submit: "Traccia",
    notFound: "Nessuna spedizione trovata con questo numero. Controllalo e riprova.",
    carrier: "Corriere",
    number: "Numero di tracciamento",
    order: "Ordine",
    history: "Cronologia della spedizione",
    stages: ["Etichetta creata", "In transito", "In consegna", "Consegnato"],
    noEvents: "Stiamo preparando il tuo ordine. Gli aggiornamenti compariranno qui dopo la spedizione.",
  },
  contactForm: {
    title: "Scrivici",
    name: "Nome",
    email: "E-mail",
    orderNumber: "Numero d'ordine (facoltativo)",
    subject: "Oggetto",
    message: "Messaggio",
    send: "Invia messaggio",
    sending: "Invio…",
    sent: "Grazie, il tuo messaggio è arrivato al nostro team. Rispondiamo entro un giorno lavorativo.",
    error: "Impossibile inviare il messaggio. Controlla i campi e riprova.",
  },
  chat: {
    open: "Chatta con noi",
    title: "Chat dal vivo",
    greeting: "Ciao! Chiedici di misure, compatibilità o di un ordine: una persona del nostro team ti risponderà qui.",
    placeholder: "Scrivi un messaggio",
    send: "Invia",
    close: "Chiudi chat",
    hours: "Rispondiamo in pochi minuti durante l'orario di servizio.",
    team: "Assistenza",
    error: "Messaggio non inviato. Riprova.",
  },
  email: {
    orderSubject: "Ordine {number} ricevuto",
    orderBody: "Grazie per il tuo ordine {number}. Totale: {total}. Ti scriveremo di nuovo alla spedizione.",
    shipSubject: "Ordine {number}: {status}",
    shipBody: "Aggiornamento sul tuo ordine {number}: {status}.",
    trackCta: "Traccia il pacco",
    signoff: "Il team Contact Patch",
  },
}

const nl: Extras = {
  theme: { toggle: "Kleurthema wisselen", light: "Licht", dark: "Donker" },
  account: {
    signIn: "Inloggen",
    title: "Inloggen",
    lead: "Gebruik een account dat je al hebt. We ontvangen alleen je naam en e-mailadres.",
    google: "Doorgaan met Google",
    apple: "Doorgaan met Apple",
    facebook: "Doorgaan met Facebook",
    unavailable: "Nog niet beschikbaar",
    noneConfigured: "Inloggen wordt ingericht. Je kunt als gast bestellen — volgen werkt met je bestelnummer.",
    consent: "Door in te loggen ga je akkoord met onze Voorwaarden en neem je kennis van het Privacybeleid.",
    account: "Account",
    greeting: "Ingelogd als {email}",
    orders: "Je bestellingen",
    noOrders: "Nog geen bestellingen. Bestellingen die je ingelogd plaatst, verschijnen hier.",
    signOut: "Uitloggen",
    placed: "Datum",
    status: "Status",
    total: "Totaal",
    error: "Inloggen mislukt. Probeer het opnieuw.",
  },
  orderStatus: {
    pending: "Wacht op betaling",
    paid: "Betaald",
    processing: "Wordt klaargemaakt",
    shipped: "Verzonden",
    delivered: "Bezorgd",
    cancelled: "Geannuleerd",
    refunded: "Terugbetaald",
  },
  order: {
    title: "Bestelling ontvangen",
    lead: "Bedankt. Je bestelling {number} is opgeslagen en de bevestiging gaat naar {email}.",
    number: "Bestelnummer",
    payment: "Online betalen is nog niet gekoppeld. We nemen per e-mail contact op om de betaling vóór verzending af te ronden.",
    track: "Deze bestelling volgen",
    viewAccount: "Bekijk in je account",
    continue: "Verder winkelen",
    items: "Artikelen",
  },
  checkout: {
    placing: "Bestelling wordt geplaatst…",
    error: "De bestelling kon niet worden geplaatst. Controleer de gegevens en probeer het opnieuw.",
    signedInAs: "Je bestelt als {email}",
    signInHint: "Log in om deze bestelling later in je account te zien.",
  },
  track: {
    nav: "Bestelling volgen",
    title: "Zending volgen",
    lead: "Vul het trackingnummer uit je verzendmail of je bestelnummer in.",
    placeholder: "Tracking- of bestelnummer",
    submit: "Volgen",
    notFound: "Geen zending gevonden met dit nummer. Controleer het en probeer opnieuw.",
    carrier: "Vervoerder",
    number: "Trackingnummer",
    order: "Bestelling",
    history: "Verloop van de zending",
    stages: ["Label aangemaakt", "Onderweg", "Wordt bezorgd", "Bezorgd"],
    noEvents: "Je bestelling wordt klaargemaakt. Updates verschijnen hier zodra ze verzonden is.",
  },
  contactForm: {
    title: "Stuur ons een bericht",
    name: "Naam",
    email: "E-mail",
    orderNumber: "Bestelnummer (optioneel)",
    subject: "Onderwerp",
    message: "Bericht",
    send: "Bericht versturen",
    sending: "Versturen…",
    sent: "Bedankt — je bericht is bij ons team. We antwoorden binnen één werkdag.",
    error: "Je bericht kon niet worden verstuurd. Controleer de velden en probeer opnieuw.",
  },
  chat: {
    open: "Chat met ons",
    title: "Livechat",
    greeting: "Hoi! Vraag ons naar maten, pasvorm of een bestelling — iemand van ons team antwoordt hier.",
    placeholder: "Typ een bericht",
    send: "Versturen",
    close: "Chat sluiten",
    hours: "Tijdens kantooruren antwoorden we binnen enkele minuten.",
    team: "Klantenservice",
    error: "Bericht niet verstuurd. Probeer opnieuw.",
  },
  email: {
    orderSubject: "Bestelling {number} ontvangen",
    orderBody: "Bedankt voor je bestelling {number}. Totaal: {total}. We mailen je opnieuw zodra ze verzonden is.",
    shipSubject: "Bestelling {number}: {status}",
    shipBody: "Er is nieuws over je bestelling {number}: {status}.",
    trackCta: "Volg je pakket",
    signoff: "Het Contact Patch-team",
  },
}

const EXTRAS: Record<ContentLang, Extras> = { en, "es-419": es419, es, de, fr, it, nl }

export function getExtras(store: Store): Extras {
  return EXTRAS[localeMeta(store).content]
}

export function extrasFor(lang: ContentLang): Extras {
  return EXTRAS[lang]
}
