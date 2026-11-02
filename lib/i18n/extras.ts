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
    orEmail: string
    name: string
    email: string
    password: string
    confirmPassword: string
    signUpTitle: string
    createAccount: string
    signInSubmit: string
    switchToSignUp: string
    switchToSignIn: string
    emailExists: string
    weakPassword: string
    passwordMismatch: string
  }
  captcha: { label: string; refresh: string; error: string }
  garage: {
    addVehicle: string
    addFitment: string
    change: string
    remove: string
    vehicleTab: string
    vehicleTabHint: string
    sizeTab: string
    sizeTabHint: string
    vehicleTitle: string
    sizeTitle: string
    make: string
    model: string
    year: string
    size: string
    width: string
    ratio: string
    diameter: string
    orType: string
    typedPlaceholder: string
    error: string
    shopTires: string
    useThisSize: string
    yourGarage: string
    signInToSave: string
    savedHint: string
    active: string
    setActive: string
    noVehicles: string
    addAnother: string
    pageTitle: string
    pageLead: string
    inStock: string
    listed: string
    makesCount: string
    topMakes: string
    allMakes: string
    popularSizes: string
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
  memberDiscount: {
    topbarTag: string
    badge: string
    activeBadge: string
    eyebrow: string
    headline: string
    activeHeadline: string
    lead: string
    activeLead: string
    perks: [string, string, string]
    ctaRegister: string
    ctaShop: string
    productCallout: string
    productActive: string
    cartDiscountRow: string
    cartGuestPrompt: string
    cartGuestCta: string
    cartActiveNotice: string
    accountBannerTitle: string
    accountBannerLead: string
    accountActiveTitle: string
    accountActiveLead: string
    instantCheckout: string
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
    orEmail: "Or continue with email",
    name: "Full name",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    signUpTitle: "Create your account",
    createAccount: "Create account",
    signInSubmit: "Sign in",
    switchToSignUp: "Need an account? Create one",
    switchToSignIn: "Already have an account? Sign in",
    emailExists: "An account with that email already exists.",
    weakPassword: "Password must be at least 8 characters.",
    passwordMismatch: "Passwords do not match.",
  },
  captcha: {
    label: "Enter the code shown",
    refresh: "New code",
    error: "That code didn't match. Try the new one.",
  },
  garage: {
    addVehicle: "Add Vehicle",
    addFitment: "Add Vehicle / Tire Size",
    change: "Change",
    remove: "Remove",
    vehicleTab: "Vehicle",
    vehicleTabHint: "For tires & parts",
    sizeTab: "Tire Size",
    sizeTabHint: "Tires only",
    vehicleTitle: "Tell us about your vehicle",
    sizeTitle: "Let's get your tire size",
    make: "Make",
    model: "Model",
    year: "Year",
    size: "Factory size",
    width: "Width",
    ratio: "Ratio",
    diameter: "Diameter",
    orType: "Or type the size",
    typedPlaceholder: "225/45 R17",
    error: "Enter the size as width/ratio R diameter, e.g. 225/45R17.",
    shopTires: "Shop tires for this vehicle",
    useThisSize: "Shop this size",
    yourGarage: "Your garage",
    signInToSave: "Sign in to save this to your account",
    savedHint: "Saved to your account",
    active: "Active",
    setActive: "Use this",
    noVehicles: "No saved vehicles yet.",
    addAnother: "Add another vehicle",
    pageTitle: "My garage",
    pageLead: "Vehicles and tire sizes you've looked up. The active one shows under the header everywhere you shop.",
    inStock: "In stock",
    listed: "Size saved — matching tires coming soon",
    makesCount: "{makes} makes · {fitments} OEM fitments",
    topMakes: "Top makes",
    allMakes: "All makes ({n})",
    popularSizes: "Popular OEM Sizes",
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
    payment: "Card payment confirmed via secure 3D Secure checkout. Your order is now queued for warehouse dispatch and we will email your tracking number as soon as it ships.",
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
    signoff: "The TiresShop team",
  },
  memberDiscount: {
    topbarTag: "−7% Member Discount on Registration",
    badge: "MEMBER PRIVILEGE · −7%",
    activeBadge: "MEMBER PRIVILEGE ACTIVE · −7%",
    eyebrow: "Drivers Club · Instant Registration Reward",
    headline: "Register your account & unlock 7% off every order",
    activeHeadline: "Your 7% member discount is active across the store",
    lead: "Create a free TiresShop account in 30 seconds. Your 7% privilege applies automatically at checkout to tires, wheels, and brake kits — plus saved vehicle fitment and live shipment tracking.",
    activeLead: "Signed in as {email}. A 7% member discount is automatically deducted from every cart and checkout total.",
    perks: [
      "Instant −7% on all tires, wheels & brakes",
      "Saved garage & verified OEM fitment",
      "Priority dispatch & one-click order tracking",
    ],
    ctaRegister: "Create account & get −7%",
    ctaShop: "Shop with −7% applied",
    productCallout: "Member price: {price} (save {save} · −7%) when you register",
    productActive: "Member privilege −7% active: {price} at checkout (save {save})",
    cartDiscountRow: "Member discount (−7%)",
    cartGuestPrompt: "Register or sign in to save {amount} (−7%) on this order",
    cartGuestCta: "Unlock −7%",
    cartActiveNotice: "−7% member discount applied (−{amount})",
    accountBannerTitle: "Unlock 7% off every order",
    accountBannerLead: "Register or sign in below — your 7% member discount is applied automatically in the cart and at checkout.",
    accountActiveTitle: "7% Member Privilege Active",
    accountActiveLead: "Your 7% discount is automatically applied to every order you place while signed in.",
    instantCheckout: "Instant Checkout",
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
    orEmail: "O continúa con tu correo",
    name: "Nombre completo",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    signUpTitle: "Crea tu cuenta",
    createAccount: "Crear cuenta",
    signInSubmit: "Iniciar sesión",
    switchToSignUp: "¿No tienes cuenta? Crea una",
    switchToSignIn: "¿Ya tienes cuenta? Inicia sesión",
    emailExists: "Ya existe una cuenta con ese correo.",
    weakPassword: "La contraseña debe tener al menos 8 caracteres.",
    passwordMismatch: "Las contraseñas no coinciden.",
  },
  captcha: {
    label: "Escribe el código mostrado",
    refresh: "Nuevo código",
    error: "El código no coincide. Prueba con el nuevo.",
  },
  garage: {
    addVehicle: "Agregar vehículo",
    addFitment: "Agregar vehículo / medida de llanta",
    change: "Cambiar",
    remove: "Quitar",
    vehicleTab: "Vehículo",
    vehicleTabHint: "Para llantas y refacciones",
    sizeTab: "Medida de llanta",
    sizeTabHint: "Solo para llantas",
    vehicleTitle: "Cuéntanos sobre tu vehículo",
    sizeTitle: "Busquemos tu medida de llanta",
    make: "Marca",
    model: "Modelo",
    year: "Año",
    size: "Medida de fábrica",
    width: "Ancho",
    ratio: "Perfil",
    diameter: "Rin",
    orType: "O escribe la medida",
    typedPlaceholder: "225/45 R17",
    error: "Escribe la medida como ancho/perfil R rin, por ejemplo 225/45R17.",
    shopTires: "Ver llantas para este vehículo",
    useThisSize: "Ver esta medida",
    yourGarage: "Tu garage",
    signInToSave: "Inicia sesión para guardar esto en tu cuenta",
    savedHint: "Guardado en tu cuenta",
    active: "Activo",
    setActive: "Usar este",
    noVehicles: "Aún no tienes vehículos guardados.",
    addAnother: "Agregar otro vehículo",
    pageTitle: "Mi garage",
    pageLead: "Vehículos y medidas de llanta que has buscado. El activo aparece bajo el encabezado en todo el sitio.",
    inStock: "En existencia",
    listed: "Medida guardada — llantas disponibles pronto",
    makesCount: "{makes} marcas · {fitments} aplicaciones OEM",
    topMakes: "Principales marcas",
    allMakes: "Todas las marcas ({n})",
    popularSizes: "Medidas OEM populares",
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
    payment: "Pago con tarjeta confirmado mediante 3D Secure. Tu pedido ya está en preparación para despacho y te enviaremos el número de rastreo por correo en cuanto salga del almacén.",
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
    signoff: "El equipo de TiresShop",
  },
  memberDiscount: {
    topbarTag: "−7% de descuento al registrarte",
    badge: "PRIVILEGIO MIEMBRO · −7%",
    activeBadge: "DESCUENTO MIEMBRO ACTIVO · −7%",
    eyebrow: "Club de Conductores · Beneficio por Registro",
    headline: "Regístrate y obtén un 7% de descuento en cada pedido",
    activeHeadline: "Tu 7% de descuento de miembro está activo en toda la tienda",
    lead: "Crea tu cuenta gratuita de TiresShop en segundos. El 7% de descuento se aplica automáticamente al finalizar la compra en llantas, rines y frenos, además de guardar tu garage.",
    activeLead: "Sesión iniciada como {email}. Se descuenta automáticamente un 7% en tu carrito y al pagar.",
    perks: [
      "−7% inmediato en llantas, rines y frenos",
      "Garage guardado y ajuste OEM verificado",
      "Despacho prioritario y rastreo en vivo",
    ],
    ctaRegister: "Crear cuenta y obtener −7%",
    ctaShop: "Comprar con −7% activo",
    productCallout: "Precio miembro: {price} (ahorras {save} · −7%) al registrarte",
    productActive: "Descuento miembro −7% activo: {price} al pagar (ahorras {save})",
    cartDiscountRow: "Descuento de miembro (−7%)",
    cartGuestPrompt: "Regístrate o inicia sesión para ahorrar {amount} (−7%) en este pedido",
    cartGuestCta: "Activar −7%",
    cartActiveNotice: "−7% de descuento de miembro aplicado (−{amount})",
    accountBannerTitle: "Obtén 7% de descuento en cada pedido",
    accountBannerLead: "Crea tu cuenta o inicia sesión abajo — el 7% se aplica automáticamente en tu carrito y al pagar.",
    accountActiveTitle: "Privilegio de Miembro −7% Activo",
    accountActiveLead: "Tu descuento del 7% se aplica automáticamente en cada pedido que realices con tu cuenta.",
    instantCheckout: "Descuento automático",
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
    payment: "Pago con tarjeta confirmado mediante 3D Secure. Tu pedido ya está en preparación para el envío y te enviaremos el número de seguimiento por correo en cuanto salga del almacén.",
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
  garage: {
    ...es419.garage,
    addVehicle: "Añadir vehículo",
    addFitment: "Añadir vehículo / medida de neumático",
    remove: "Eliminar",
    sizeTab: "Medida de neumático",
    sizeTabHint: "Solo para neumáticos",
    sizeTitle: "Vamos a buscar tu medida de neumático",
    diameter: "Llanta",
    shopTires: "Ver neumáticos para este vehículo",
    yourGarage: "Tu garaje",
    pageTitle: "Mi garaje",
    pageLead: "Vehículos y medidas de neumático que has buscado. El activo aparece bajo la cabecera en todo el sitio.",
    listed: "Medida guardada — neumáticos disponibles próximamente",
  },
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
    orEmail: "Oder mit E-Mail fortfahren",
    name: "Vollständiger Name",
    email: "E-Mail",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    signUpTitle: "Konto erstellen",
    createAccount: "Konto erstellen",
    signInSubmit: "Anmelden",
    switchToSignUp: "Noch kein Konto? Jetzt erstellen",
    switchToSignIn: "Bereits ein Konto? Anmelden",
    emailExists: "Für diese E-Mail-Adresse besteht bereits ein Konto.",
    weakPassword: "Das Passwort muss mindestens 8 Zeichen lang sein.",
    passwordMismatch: "Die Passwörter stimmen nicht überein.",
  },
  captcha: {
    label: "Geben Sie den angezeigten Code ein",
    refresh: "Neuer Code",
    error: "Der Code war nicht korrekt. Versuchen Sie es mit dem neuen.",
  },
  garage: {
    addVehicle: "Fahrzeug hinzufügen",
    addFitment: "Fahrzeug / Reifengröße hinzufügen",
    change: "Ändern",
    remove: "Entfernen",
    vehicleTab: "Fahrzeug",
    vehicleTabHint: "Für Reifen & Teile",
    sizeTab: "Reifengröße",
    sizeTabHint: "Nur für Reifen",
    vehicleTitle: "Erzählen Sie uns von Ihrem Fahrzeug",
    sizeTitle: "Lassen Sie uns Ihre Reifengröße finden",
    make: "Marke",
    model: "Modell",
    year: "Baujahr",
    size: "Seriengröße",
    width: "Breite",
    ratio: "Querschnitt",
    diameter: "Durchmesser",
    orType: "Oder Größe eingeben",
    typedPlaceholder: "225/45 R17",
    error: "Geben Sie die Größe als Breite/Querschnitt R Durchmesser ein, z. B. 225/45R17.",
    shopTires: "Reifen für dieses Fahrzeug ansehen",
    useThisSize: "Diese Größe ansehen",
    yourGarage: "Ihre Garage",
    signInToSave: "Melden Sie sich an, um dies in Ihrem Konto zu speichern",
    savedHint: "In Ihrem Konto gespeichert",
    active: "Aktiv",
    setActive: "Dieses verwenden",
    noVehicles: "Noch keine gespeicherten Fahrzeuge.",
    addAnother: "Weiteres Fahrzeug hinzufügen",
    pageTitle: "Meine Garage",
    pageLead: "Fahrzeuge und Reifengrößen, die Sie gesucht haben. Das aktive erscheint überall unter der Kopfzeile.",
    inStock: "Auf Lager",
    listed: "Größe gespeichert — passende Reifen folgen in Kürze",
    makesCount: "{makes} Marken · {fitments} OEM-Fahrzeuge",
    topMakes: "Top-Marken",
    allMakes: "Alle Marken ({n})",
    popularSizes: "Beliebte Seriengrößen",
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
    payment: "Kartenzahlung über 3D Secure bestätigt. Ihre Bestellung wird jetzt im Lager für den Versand vorbereitet — Sie erhalten die Sendungsnummer per E-Mail, sobald das Paket übergeben wurde.",
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
    signoff: "Ihr TiresShop-Team",
  },
  memberDiscount: {
    topbarTag: "−7 % Kundenrabatt bei Registrierung",
    badge: "MITGLIEDERVORTEIL · −7 %",
    activeBadge: "MITGLIEDERRABATT AKTIV · −7 %",
    eyebrow: "Drivers Club · Sofortrabatt für registrierte Käufer",
    headline: "Konto erstellen & dauerhaft 7 % auf jede Bestellung sichern",
    activeHeadline: "Ihr 7 % Mitgliederrabatt ist im gesamten Shop aktiviert",
    lead: "Erstellen Sie in 30 Sekunden Ihr kostenloses TiresShop-Konto. Ihre 7 % Preisvorteil werden im Warenkorb und an der Kasse automatisch auf Reifen, Felgen und Bremsen abgezogen.",
    activeLead: "Angemeldet als {email}. 7 % Mitgliederrabatt werden automatisch im Warenkorb und beim Checkout abgezogen.",
    perks: [
      "Sofort −7 % auf alle Reifen, Felgen & Bremsen",
      "Gespeicherte Garage & geprüfte OEM-Passform",
      "Priorisierter Versand & Live-Sendungsverfolgung",
    ],
    ctaRegister: "Konto erstellen & −7 % sichern",
    ctaShop: "Mit −7 % Vorteil einkaufen",
    productCallout: "Mitgliederpreis: {price} ({save} sparen · −7 %) mit Kundenkonto",
    productActive: "Mitgliedervorteil −7 % aktiv: {price} an der Kasse ({save} gespart)",
    cartDiscountRow: "Mitgliederrabatt (−7 %)",
    cartGuestPrompt: "Registrieren oder anmelden und sofort {amount} (−7 %) bei dieser Bestellung sparen",
    cartGuestCta: "−7 % aktivieren",
    cartActiveNotice: "−7 % Mitgliederrabatt angewendet (−{amount})",
    accountBannerTitle: "7 % Rabatt auf jede Bestellung sichern",
    accountBannerLead: "Registrieren Sie sich oder melden Sie sich unten an — Ihr 7 %-Vorteil wird automatisch im Warenkorb abgezogen.",
    accountActiveTitle: "7 % Mitgliedervorteil Aktiv",
    accountActiveLead: "Ihr 7 %-Rabatt wird bei jeder Bestellung, die Sie angemeldet aufgeben, automatisch abgezogen.",
    instantCheckout: "Sofortabzug an der Kasse",
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
    orEmail: "Ou continuez avec votre e-mail",
    name: "Nom complet",
    email: "E-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    signUpTitle: "Créer votre compte",
    createAccount: "Créer un compte",
    signInSubmit: "Se connecter",
    switchToSignUp: "Pas de compte ? Créez-en un",
    switchToSignIn: "Déjà un compte ? Connectez-vous",
    emailExists: "Un compte existe déjà avec cet e-mail.",
    weakPassword: "Le mot de passe doit contenir au moins 8 caractères.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
  },
  captcha: {
    label: "Saisissez le code affiché",
    refresh: "Nouveau code",
    error: "Le code ne correspond pas. Essayez le nouveau.",
  },
  garage: {
    addVehicle: "Ajouter un véhicule",
    addFitment: "Ajouter véhicule / dimension de pneu",
    change: "Modifier",
    remove: "Retirer",
    vehicleTab: "Véhicule",
    vehicleTabHint: "Pour pneus et pièces",
    sizeTab: "Dimension de pneu",
    sizeTabHint: "Pneus uniquement",
    vehicleTitle: "Parlez-nous de votre véhicule",
    sizeTitle: "Trouvons votre dimension de pneu",
    make: "Marque",
    model: "Modèle",
    year: "Année",
    size: "Dimension d'origine",
    width: "Largeur",
    ratio: "Série",
    diameter: "Diamètre",
    orType: "Ou saisissez la dimension",
    typedPlaceholder: "225/45 R17",
    error: "Saisissez la dimension sous la forme largeur/série R diamètre, par ex. 225/45R17.",
    shopTires: "Voir les pneus pour ce véhicule",
    useThisSize: "Voir cette dimension",
    yourGarage: "Votre garage",
    signInToSave: "Connectez-vous pour enregistrer ceci dans votre compte",
    savedHint: "Enregistré dans votre compte",
    active: "Actif",
    setActive: "Utiliser celui-ci",
    noVehicles: "Aucun véhicule enregistré pour l'instant.",
    addAnother: "Ajouter un autre véhicule",
    pageTitle: "Mon garage",
    pageLead: "Véhicules et dimensions de pneus que vous avez recherchés. Le véhicule actif s'affiche sous l'en-tête sur tout le site.",
    inStock: "En stock",
    listed: "Dimension enregistrée — pneus correspondants bientôt disponibles",
    makesCount: "{makes} marques · {fitments} véhicules OEM",
    topMakes: "Marques principales",
    allMakes: "Toutes les marques ({n})",
    popularSizes: "Dimensions OEM populaires",
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
    payment: "Paiement par carte confirmé via 3D Secure. Votre commande est en cours de préparation pour l'expédition et vous recevrez le numéro de suivi par e-mail dès son départ.",
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
    signoff: "L'équipe TiresShop",
  },
  memberDiscount: {
    topbarTag: "−7 % de remise membre dès l'inscription",
    badge: "PRIVILÈGE MEMBRE · −7 %",
    activeBadge: "REMISE MEMBRE ACTIVE · −7 %",
    eyebrow: "Drivers Club · Avantage Inscription Immédiat",
    headline: "Créez votre compte et profitez de −7 % sur chaque commande",
    activeHeadline: "Votre remise membre de 7 % est active sur toute la boutique",
    lead: "Inscrivez-vous gratuitement en 30 secondes. Votre remise de 7 % s'applique automatiquement au panier et au paiement sur tous les pneus, jantes et freins.",
    activeLead: "Connecté en tant que {email}. Votre remise membre de 7 % est déduite automatiquement de chaque commande.",
    perks: [
      "−7 % immédiat sur pneus, jantes et freins",
      "Garage enregistré et compatibilité OEM vérifiée",
      "Expédition prioritaire et suivi de colis en direct",
    ],
    ctaRegister: "Créer un compte et obtenir −7 %",
    ctaShop: "Acheter avec −7 % appliqué",
    productCallout: "Prix membre : {price} (économisez {save} · −7 %) en vous inscrivant",
    productActive: "Avantage membre −7 % actif : {price} au paiement (économie {save})",
    cartDiscountRow: "Remise membre (−7 %)",
    cartGuestPrompt: "Inscrivez-vous ou connectez-vous pour économiser {amount} (−7 %) sur cette commande",
    cartGuestCta: "Activer −7 %",
    cartActiveNotice: "Remise membre −7 % appliquée (−{amount})",
    accountBannerTitle: "Débloquez 7 % de remise sur chaque commande",
    accountBannerLead: "Créez un compte ou connectez-vous ci-dessous — vos 7 % sont déduits automatiquement au panier.",
    accountActiveTitle: "Privilège Membre −7 % Actif",
    accountActiveLead: "Votre remise de 7 % est automatiquement appliquée à chaque commande passée avec votre compte.",
    instantCheckout: "Remise immédiate",
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
    orEmail: "Oppure continua con l'e-mail",
    name: "Nome completo",
    email: "E-mail",
    password: "Password",
    confirmPassword: "Conferma password",
    signUpTitle: "Crea il tuo account",
    createAccount: "Crea account",
    signInSubmit: "Accedi",
    switchToSignUp: "Non hai un account? Creane uno",
    switchToSignIn: "Hai già un account? Accedi",
    emailExists: "Esiste già un account con questa e-mail.",
    weakPassword: "La password deve contenere almeno 8 caratteri.",
    passwordMismatch: "Le password non coincidono.",
  },
  captcha: {
    label: "Inserisci il codice mostrato",
    refresh: "Nuovo codice",
    error: "Il codice non corrisponde. Prova con quello nuovo.",
  },
  garage: {
    addVehicle: "Aggiungi veicolo",
    addFitment: "Aggiungi veicolo / misura pneumatico",
    change: "Modifica",
    remove: "Rimuovi",
    vehicleTab: "Veicolo",
    vehicleTabHint: "Per pneumatici e ricambi",
    sizeTab: "Misura pneumatico",
    sizeTabHint: "Solo pneumatici",
    vehicleTitle: "Raccontaci del tuo veicolo",
    sizeTitle: "Troviamo la tua misura di pneumatico",
    make: "Marca",
    model: "Modello",
    year: "Anno",
    size: "Misura di serie",
    width: "Larghezza",
    ratio: "Serie",
    diameter: "Diametro",
    orType: "Oppure digita la misura",
    typedPlaceholder: "225/45 R17",
    error: "Inserisci la misura come larghezza/serie R diametro, ad es. 225/45R17.",
    shopTires: "Vedi pneumatici per questo veicolo",
    useThisSize: "Vedi questa misura",
    yourGarage: "Il tuo garage",
    signInToSave: "Accedi per salvarlo nel tuo account",
    savedHint: "Salvato nel tuo account",
    active: "Attivo",
    setActive: "Usa questo",
    noVehicles: "Nessun veicolo salvato.",
    addAnother: "Aggiungi un altro veicolo",
    pageTitle: "Il mio garage",
    pageLead: "Veicoli e misure di pneumatici che hai cercato. Quello attivo compare sotto l'intestazione in tutto il sito.",
    inStock: "Disponibile",
    listed: "Misura salvata — pneumatici corrispondenti in arrivo",
    makesCount: "{makes} marchi · {fitments} modelli OEM",
    topMakes: "Marchi principali",
    allMakes: "Tutti i marchi ({n})",
    popularSizes: "Misure OEM popolari",
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
    payment: "Pagamento con carta confermato tramite 3D Secure. Il tuo ordine è ora in preparazione per la spedizione e riceverai il numero di tracciamento via e-mail appena partirà.",
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
    signoff: "Il team TiresShop",
  },
  memberDiscount: {
    topbarTag: "−7% di sconto clienti con registrazione",
    badge: "PRIVILEGIO MEMBRI · −7%",
    activeBadge: "SCONTO MEMBRI ATTIVO · −7%",
    eyebrow: "Drivers Club · Vantaggio Immediato alla Registrazione",
    headline: "Registrati ora e ottieni il 7% di sconto su ogni ordine",
    activeHeadline: "Il tuo sconto membro del 7% è attivo in tutto il negozio",
    lead: "Crea un account gratuito TiresShop in 30 secondi. Il tuo sconto del 7% viene applicato automaticamente nel carrello e al checkout su pneumatici, cerchi e freni.",
    activeLead: "Accesso effettuato come {email}. Lo sconto membro del 7% viene detratto automaticamente da ogni ordine.",
    perks: [
      "−7% immediato su pneumatici, cerchi e freni",
      "Garage salvato e compatibilità OEM verificata",
      "Spedizione prioritaria e tracciamento in tempo reale",
    ],
    ctaRegister: "Crea account e ottieni −7%",
    ctaShop: "Acquista con −7% attivo",
    productCallout: "Prezzo membri: {price} (risparmi {save} · −7%) registrandoti",
    productActive: "Privilegio membri −7% attivo: {price} al checkout (risparmi {save})",
    cartDiscountRow: "Sconto membri (−7%)",
    cartGuestPrompt: "Registrati o accedi per risparmiare {amount} (−7%) su questo ordine",
    cartGuestCta: "Sblocca −7%",
    cartActiveNotice: "Sconto membri −7% applicato (−{amount})",
    accountBannerTitle: "Sblocca il 7% di sconto su ogni ordine",
    accountBannerLead: "Registrati o accedi qui sotto: il tuo sconto del 7% viene applicato automaticamente nel carrello.",
    accountActiveTitle: "Privilegio Membri −7% Attivo",
    accountActiveLead: "Il tuo sconto del 7% viene applicato automaticamente a ogni ordine effettuato da connesso.",
    instantCheckout: "Sconto immediato",
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
    orEmail: "Of ga verder met e-mail",
    name: "Volledige naam",
    email: "E-mail",
    password: "Wachtwoord",
    confirmPassword: "Wachtwoord bevestigen",
    signUpTitle: "Account aanmaken",
    createAccount: "Account aanmaken",
    signInSubmit: "Inloggen",
    switchToSignUp: "Nog geen account? Maak er een aan",
    switchToSignIn: "Al een account? Inloggen",
    emailExists: "Er bestaat al een account met dit e-mailadres.",
    weakPassword: "Het wachtwoord moet minstens 8 tekens lang zijn.",
    passwordMismatch: "Wachtwoorden komen niet overeen.",
  },
  captcha: {
    label: "Voer de getoonde code in",
    refresh: "Nieuwe code",
    error: "Die code klopte niet. Probeer de nieuwe.",
  },
  garage: {
    addVehicle: "Voertuig toevoegen",
    addFitment: "Voertuig / bandenmaat toevoegen",
    change: "Wijzigen",
    remove: "Verwijderen",
    vehicleTab: "Voertuig",
    vehicleTabHint: "Voor banden & onderdelen",
    sizeTab: "Bandenmaat",
    sizeTabHint: "Alleen banden",
    vehicleTitle: "Vertel ons over je voertuig",
    sizeTitle: "Laten we je bandenmaat vinden",
    make: "Merk",
    model: "Model",
    year: "Bouwjaar",
    size: "Fabrieksmaat",
    width: "Breedte",
    ratio: "Hoogte/breedteverhouding",
    diameter: "Diameter",
    orType: "Of typ de maat",
    typedPlaceholder: "225/45 R17",
    error: "Voer de maat in als breedte/verhouding R diameter, bijv. 225/45R17.",
    shopTires: "Bekijk banden voor dit voertuig",
    useThisSize: "Deze maat bekijken",
    yourGarage: "Jouw garage",
    signInToSave: "Log in om dit op te slaan in je account",
    savedHint: "Opgeslagen in je account",
    active: "Actief",
    setActive: "Dit gebruiken",
    noVehicles: "Nog geen opgeslagen voertuigen.",
    addAnother: "Nog een voertuig toevoegen",
    pageTitle: "Mijn garage",
    pageLead: "Voertuigen en bandenmaten die je hebt opgezocht. De actieve verschijnt overal onder de header.",
    inStock: "Op voorraad",
    listed: "Maat opgeslagen — passende banden volgen binnenkort",
    makesCount: "{makes} merken · {fitments} OEM-modellen",
    topMakes: "Topmerken",
    allMakes: "Alle merken ({n})",
    popularSizes: "Populaire OEM-maten",
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
    payment: "Kaartbetaling bevestigd via 3D Secure. Je bestelling wordt nu in het magazijn klaargemaakt voor verzending en je ontvangt het trackingnummer per e-mail zodra het pakket vertrekt.",
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
    signoff: "Het TiresShop-team",
  },
  memberDiscount: {
    topbarTag: "−7% ledenkorting bij registratie",
    badge: "LEDENVOORDEEL · −7%",
    activeBadge: "LEDENKORTING ACTIEF · −7%",
    eyebrow: "Drivers Club · Direct Voordeel bij Registratie",
    headline: "Maak een account aan en ontvang 7% korting op elke bestelling",
    activeHeadline: "Je 7% ledenkorting is actief in de hele winkel",
    lead: "Maak binnen 30 seconden een gratis TiresShop-account aan. Je 7% korting wordt automatisch verrekend in je winkelwagen en bij het afrekenen op alle banden, velgen en remmen.",
    activeLead: "Ingelogd als {email}. Er wordt automatisch 7% ledenkorting afgetrokken van elke bestelling.",
    perks: [
      "Direct −7% op alle banden, velgen & remmen",
      "Opgeslagen garage & gecontroleerde OEM-pasvorm",
      "Prioritaire verzending & live pakketvolging",
    ],
    ctaRegister: "Account aanmaken & −7% krijgen",
    ctaShop: "Winkelen met −7% korting",
    productCallout: "Ledenprijs: {price} (bespaar {save} · −7%) bij registratie",
    productActive: "Ledenvoordeel −7% actief: {price} bij afrekenen (bespaar {save})",
    cartDiscountRow: "Ledenkorting (−7%)",
    cartGuestPrompt: "Registreer of log in om {amount} (−7%) te besparen op deze bestelling",
    cartGuestCta: "Activeer −7%",
    cartActiveNotice: "−7% ledenkorting toegepast (−{amount})",
    accountBannerTitle: "Ontgrendel 7% korting op elke bestelling",
    accountBannerLead: "Registreer of log hieronder in — je 7% ledenkorting wordt automatisch verrekend in de winkelwagen.",
    accountActiveTitle: "7% Ledenvoordeel Actief",
    accountActiveLead: "Je 7% korting wordt automatisch toegepast op elke bestelling die je ingelogd plaatst.",
    instantCheckout: "Direct verrekend",
  },
}

const EXTRAS: Record<ContentLang, Extras> = { en, "es-419": es419, es, de, fr, it, nl }

export function getExtras(store: Store): Extras {
  return EXTRAS[localeMeta(store).content]
}

export function extrasFor(lang: ContentLang): Extras {
  return EXTRAS[lang]
}
