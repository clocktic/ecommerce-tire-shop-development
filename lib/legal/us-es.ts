import { COMPANY, US_PRESENCE, companyAddressLine } from "@/lib/company"
import { POLICIES } from "@/lib/policies"
import { usEs } from "@/lib/i18n/dictionaries/es-419"
import type { PolicyDoc } from "@/lib/legal/types"

// Latin American Spanish version of lib/legal/us.ts. Same facts and numbers;
// update both files together.
const p = POLICIES.us
const s = p.shipping
const r = p.returns
const t = usEs.policy
const cutoff = "2:00 p. m. PT"
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${usEs.company.hours})`

export const US_POLICIES_ES: Record<string, PolicyDoc> = {
  shipping: {
    title: "Política de envíos",
    description: `Envío estándar gratis a ${t.area}. Entrega en ${t.days}.`,
    intro: `Esta Política de envíos aplica a todos los pedidos realizados en la tienda EE. UU. de ${COMPANY.tradingName} (operada por ${COMPANY.legalName}, precios en USD).`,
    sections: [
      {
        heading: "A dónde enviamos",
        blocks: [
          `Enviamos a ${t.area}. No enviamos a ${t.exclusions}: las llantas, los rines y los kits de frenos son paquetes pesados o de gran tamaño y requieren una dirección física en calle para la entrega por paquetería.`,
          "Puedes pedir que tu compra se envíe directamente a un taller de llantas, agencia o instalador local. Escribe el nombre del taller en el campo de empresa o dirección al pagar y avísales que llegará el envío.",
        ],
      },
      {
        heading: "Costo de envío",
        blocks: [
          s.freeShipping
            ? "El envío terrestre estándar es gratis (US$0.00) en todos los pedidos dentro de los 48 estados contiguos de EE. UU., sin monto mínimo de compra y sin cargos ocultos de manejo."
            : "El envío se calcula al pagar antes de confirmar el pago.",
        ],
      },
      {
        heading: "Tiempos de preparación y entrega",
        blocks: [
          {
            rows: [
              ["Hora límite de pedido", `${cutoff}, de lunes a viernes`],
              ["Tiempo de preparación en almacén", `${s.handlingDays[0]}–${s.handlingDays[1]} días hábiles`],
              ["Tiempo de tránsito", `${s.transitDays[0]}–${s.transitDays[1]} días hábiles`],
              ["Tiempo total estimado de entrega", t.days],
              ["Paqueterías", `Servicio de entrega y mensajero propios (TiresShop Courier) cuando esté disponible; en caso contrario, ${s.carriers.join(", ")}`],
              ["Enviado desde", "Estados Unidos (California y centros de distribución en EE. UU. contiguo)"],
            ],
          },
          `Siempre que sea posible enviar tu pedido con nuestro propio servicio de entrega y nuestro propio mensajero, lo enviaremos así. Si no es posible enviarlo mediante nuestra propia entrega en tu zona o ruta, utilizamos otras paqueterías (${s.carriers.join(", ")}).`,
          "Los días hábiles son de lunes a viernes, excluyendo los días festivos federales de EE. UU. Los pedidos realizados antes de la hora límite en día hábil comienzan a procesarse ese mismo día; los realizados después de la hora límite, en fin de semana o en día festivo se procesan el siguiente día hábil.",
          t.duties,
        ],
      },
      {
        heading: "Retrasos en el envío (Regla de Ventas por Correo de la FTC)",
        blocks: [
          "De conformidad con la Regla de Pedidos por Correo, Internet o Teléfono de la FTC (16 CFR Parte 435), si no podemos enviar tu pedido dentro del plazo de preparación indicado, te notificaremos por correo electrónico con una nueva fecha estimada de envío y te daremos la opción de aceptar la nueva fecha o cancelar tu pedido para recibir un reembolso completo e inmediato en tu método de pago original.",
        ],
      },
      {
        heading: "Rastreo y envíos en varios paquetes",
        blocks: [
          "En cuanto tu pedido sale de nuestro almacén, recibes un correo de confirmación de envío con el número de rastreo de cada paquete. También puedes consultar el estado en tiempo real en nuestra página Rastrear pedido.",
          "Las llantas y los rines suelen enviarse en paquetes individuales. Un juego de cuatro llantas o rines normalmente viaja con cuatro números de rastreo independientes y puede entregarse en días hábiles consecutivos según la ruta local de la paquetería.",
        ],
      },
      {
        heading: "Paquetes dañados, defectuosos o extraviados",
        blocks: [
          "Revisa todos los paquetes al recibirlos. Si un paquete llega visiblemente dañado, indícalo al repartidor si es posible y envíanos fotos del artículo y del empaque dentro de los 7 días naturales posteriores a la entrega. Si el rastreo marca entregado pero no encuentras el paquete, contáctanos dentro de 7 días naturales para abrir una investigación con la paquetería.",
          "Los artículos dañados en tránsito, defectuosos al llegar o extraviados por la paquetería se reponen o se reembolsan en su totalidad sin costo alguno para ti (US$0.00, incluyendo envío de devolución gratuito cuando se requiera devolver el producto).",
        ],
      },
      {
        heading: "Impuesto sobre las ventas (Sales Tax)",
        blocks: [
          "El impuesto estatal y local sobre las ventas aplicable se calcula y muestra al pagar según la dirección de entrega, cuando la ley estatal lo exige.",
        ],
      },
      { heading: "Contacto", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  returns: {
    title: "Política de devoluciones y reembolsos",
    description: `Devoluciones en ${r.windowDays} días de artículos nuevos, sin usar y sin montar. Sin cargo por reposición (US$0).`,
    intro: `Puedes devolver los artículos elegibles comprados en la tienda EE. UU. de ${COMPANY.tradingName} dentro de los ${r.windowDays} días naturales posteriores a la entrega para obtener el reembolso completo del precio del artículo.`,
    sections: [
      {
        heading: "Resumen de condiciones de devolución",
        blocks: [
          {
            rows: [
              ["Plazo de devolución", `${r.windowDays} días naturales a partir de la fecha de entrega`],
              ["Condición requerida", "Nuevo, sin usar, sin montar, en su empaque original con etiquetas y accesorios"],
              ["Método de devolución", "Por paquetería tras solicitar un número de autorización de devolución (RMA)"],
              ["Cargo por reposición (restocking fee)", "US$0.00 (0% — nunca cobramos cargo por reposición)"],
              ["Envío de devolución (artículo defectuoso o incorrecto)", "Gratis (US$0.00 — proporcionamos guía prepagada)"],
              ["Envío de devolución (cambio de opinión / talla equivocada)", "Aprox. US$25 por llanta o rin y US$15 por paquete de frenos con nuestra guía prepagada (se descuenta del reembolso)"],
              ["Plazo de reembolso", `Dentro de ${r.refundDays} días hábiles tras revisar la devolución (revisión en 2 días hábiles desde su recepción)`],
              ["Dirección física de devoluciones", US_PRESENCE.returnsAddress],
            ],
          },
        ],
      },
      {
        heading: "Plazo de devolución",
        blocks: [
          `Tienes ${r.windowDays} días naturales a partir de la fecha en que se entregue tu pedido (o el último paquete de un pedido de varios bultos) para solicitar una devolución.`,
        ],
      },
      {
        heading: "Estado de los artículos devueltos",
        blocks: [
          "Para ser aceptados para reembolso, los artículos deben estar nuevos, sin usar y sin modificaciones:",
          {
            list: [
              "Llantas: sin haberse montado en un rin, sin inflar, sin balancear ni haber rodado, sin marcas de desmontadora ni residuos de lubricante de ceja, y con sus etiquetas originales de fábrica intactas.",
              "Rines: sin haberse montado con llanta, sin haberse atornillado a un vehículo con birlos o tuercas apretados, y en sus cajas originales con tapas centrales y protecciones.",
              "Piezas de freno: sin instalar, sin fijar al cáliper o maza, sin asentar y en su empaque original sellado de fábrica.",
              "Todos los artículos: con su empaque, etiquetas, manuales y accesorios originales completos.",
            ],
          },
          "Consejo antes de montar rines: puedes presentar cuidadosamente el rin sin llanta sobre la maza del vehículo (sin apretar los birlos y protegiendo la cara con un paño suave) para verificar el espacio con el cáliper y la salpicadera.",
        ],
      },
      {
        heading: "Cómo iniciar una devolución y dirección de envío",
        blocks: [
          {
            list: [
              `Envía un correo a ${COMPANY.email} (o llama al ${COMPANY.phoneDisplay}) indicando tu número de pedido, los artículos que deseas devolver y el motivo.`,
              "Te respondemos en un plazo de 1 día hábil con tu número de autorización de devolución (RMA), las instrucciones y, si lo solicitas, una guía de devolución prepagada.",
              `Envía los artículos autorizados a nuestro centro de devoluciones: ${US_PRESENCE.returnsAddress} (o al almacén regional de EE. UU. impreso en tu guía prepagada RMA). Anota claramente el número RMA en el exterior de cada paquete; no escribas directamente sobre las cajas originales del fabricante.`,
            ],
          },
        ],
      },
      {
        heading: "Costos de envío de devolución y cargos por reposición",
        blocks: [
          "Artículos dañados, defectuosos o incorrectos: Si un artículo llegó dañado en tránsito, presenta un defecto de fábrica al recibirlo o no corresponde al número de parte que pediste, cubrimos la totalidad del costo de envío de devolución y te enviamos una guía prepagada sin costo (US$0.00).",
          r.returnShippingPaidBy === "merchant"
            ? "Artículos no deseados: El envío de devolución es gratis."
            : "Cambio de opinión o medida solicitada por error: Tú cubres el envío de devolución. Si utilizas nuestra guía prepagada con tarifa preferencial, el costo es de aprox. US$25 por llanta o rin y US$15 por paquete de frenos, que se descuenta de tu reembolso. También puedes enviarlo por tu cuenta mediante paquetería terrestre asegurada con número de rastreo tras recibir tu RMA.",
          r.restockingFeePercent > 0
            ? `Aplica un cargo por reposición del ${r.restockingFeePercent}%.`
            : "No cobramos ningún cargo por reposición (US$0.00 / 0%) en devoluciones elegibles.",
        ],
      },
      {
        heading: "Plazo y forma de reembolso",
        blocks: [
          `Una vez recibido el paquete en nuestras instalaciones, lo revisamos dentro de 2 días hábiles y emitimos el reembolso a tu método de pago original dentro de los ${r.refundDays} días hábiles siguientes. Según tu banco o emisor de tarjeta, el abono puede tardar de 2 a 5 días hábiles adicionales en reflejarse en tu estado de cuenta.`,
          "Se te reembolsa el precio completo pagado por los artículos devueltos más el impuesto sobre las ventas correspondiente (menos el costo de la guía prepagada únicamente si devuelves un artículo por cambio de opinión usando nuestra guía). El envío original fue gratuito, por lo que no se descuenta ningún cargo de envío inicial.",
        ],
      },
      {
        heading: "Artículos que no se pueden devolver",
        blocks: [
          {
            list: [
              "Llantas que ya fueron montadas en un rin, balanceadas o rodadas (salvo bajo un reclamo válido de garantía del fabricante).",
              "Rines en los que ya se montó una llanta o que fueron atornillados/rodados en un vehículo.",
              "Balatas, discos, cálipers o líneas de freno que hayan sido instalados o expuestos a líquido de frenos.",
              "Artículos dañados por instalación incorrecta, golpes contra banquetas, baches, uso en pista o peligros del camino.",
            ],
          },
        ],
      },
      {
        heading: "Cancelaciones y cambios",
        blocks: [
          "Cancelación antes del envío: Puedes cancelar tu pedido sin costo alguno en cualquier momento antes de que se despache escribiéndonos o llamándonos; liberaremos la autorización de pago o reembolsaremos el importe total de inmediato.",
          "Cambios de medida o modelo: Para cambiar un artículo por otra medida o modelo, inicia la devolución del artículo original y realiza un pedido nuevo para que la pieza correcta salga de inmediato sin esperar el tránsito de devolución.",
        ],
      },
      { heading: "Contacto", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  warranty: {
    title: "Política de garantía",
    description: "Garantías del fabricante para llantas, rines y frenos, registro DOT ante la NHTSA y cómo presentar un reclamo.",
    intro: `Todas las llantas, rines y componentes de freno vendidos en la tienda EE. UU. de ${COMPANY.tradingName} son productos nuevos de primera calidad cubiertos por la garantía limitada de su fabricante. Gestionamos directamente contigo cualquier reclamo de garantía ante el fabricante.`,
    sections: [
      {
        heading: "Qué cubre la garantía",
        blocks: [
          "Las garantías limitadas del fabricante cubren defectos de materiales y mano de obra desde la fecha de compra o durante la vida útil del dibujo de la llanta. Muchas llantas de pasajero y camioneta también cuentan con garantía de desgaste (millaje) y de uniformidad. Las condiciones específicas, plazos y reglas de ajuste proporcional los establece cada marca y se enlazan en la página del producto cuando están disponibles.",
        ],
      },
      {
        heading: "Qué no cubre la garantía",
        blocks: [
          {
            list: [
              "Daños por peligros del camino (ponchaduras por clavos, cortes, impactos en baches o golpes contra banquetas).",
              "Desgaste irregular o prematuro causado por presión de inflado incorrecta, falta de alineación o balanceo, componentes de suspensión desgastados, sobrecarga o falta de rotación de llantas.",
              "Desgaste normal por uso, incluido el desgaste normal de balatas y discos de freno.",
              "Daños derivados de montaje o instalación incorrectos, alteración estructural o uso en carreras, competencias o pista.",
            ],
          },
        ],
      },
      {
        heading: "Registro de llantas DOT y llamados a revisión de la NHTSA (49 CFR Parte 574)",
        blocks: [
          "Conforme a las normas federales de la Administración Nacional de Seguridad del Tráfico en las Carreteras de EE. UU. (NHTSA, 49 CFR Parte 574), todas las llantas vendidas en Estados Unidos llevan un Número de Identificación de Llanta (TIN / código DOT) grabado en el costado. Registrar tus llantas permite que el fabricante te notifique directamente en caso de un llamado a revisión por seguridad (recall).",
          `Al comprar llantas en ${COMPANY.tradingName}, registramos los datos de identificación asociados a tu pedido y te facilitamos la información necesaria para el registro NHTSA. También puedes registrar tus llantas directamente en el sitio web del fabricante usando el código DOT del costado y los datos de nuestro comercio (${COMPANY.legalName}, ${companyAddressLine}).`,
        ],
      },
      {
        heading: "Cómo presentar un reclamo de garantía",
        blocks: [
          `Escribe a ${COMPANY.email} con tu número de pedido, fotos claras del artículo (en llantas, incluye el código DOT completo del costado y foto de la profundidad del dibujo; para reclamos de millaje, adjunta los comprobantes de rotación/mantenimiento) y una breve descripción. Respondemos en 1–2 días hábiles con los pasos a seguir.`,
        ],
      },
      {
        heading: "Tus derechos legales (Ley Magnuson-Moss)",
        blocks: [
          "Nada de lo dispuesto en esta página limita ni excluye las garantías implícitas de comerciabilidad o idoneidad para un fin determinado, ni ningún otro derecho que te corresponda conforme a la Ley Federal de Garantías Magnuson-Moss (15 U.S.C. § 2301 y ss.) o las leyes de protección al consumidor de tu estado.",
        ],
      },
      { heading: "Contacto", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  payments: {
    title: "Métodos de pago",
    description: `Pago seguro en USD con ${p.paymentMethods.join(", ")}.`,
    intro: `Todos los precios de la tienda EE. UU. de ${COMPANY.tradingName} se muestran y cobran en dólares estadounidenses (USD).`,
    sections: [
      {
        heading: "Métodos de pago aceptados",
        blocks: [
          "Aceptamos las siguientes tarjetas de crédito y débito al finalizar la compra:",
          { list: p.paymentMethods },
        ],
      },
      {
        heading: "Cómo se procesa el pago",
        blocks: [
          "Al hacer clic en «Hacer pedido» en la página de pago, eres redirigido a nuestra pasarela segura con autenticación 3D Secure 2.0 para completar el pago con tarjeta. El pago se autoriza al confirmar la operación y se procesa para el despacho del pedido. Si un pedido se cancela antes del envío o no puede surtirse, la autorización se libera o se reembolsa el importe total de inmediato.",
        ],
      },
      {
        heading: "Precios, impuesto sobre las ventas y transparencia",
        blocks: [
          "El precio mostrado en cada ficha de producto es por unidad en USD. El envío terrestre estándar es gratis (US$0.00). El impuesto estatal y local sobre las ventas aplicable se calcula al pagar según tu código postal (ZIP) de entrega antes de confirmar el pago. Nunca agregamos cargos ocultos ni comisiones por pago.",
        ],
      },
      {
        heading: "Seguridad en los pagos",
        blocks: [
          "Todas las transacciones con tarjeta se procesan mediante conexiones cifradas TLS a través de un proveedor certificado PCI-DSS Nivel 1 con verificación 3D Secure 2.0 y validación de dirección de facturación (AVS). Nunca almacenamos números completos de tarjeta ni códigos CVV en nuestros servidores.",
        ],
      },
      { heading: "Sin recargos", blocks: ["No cobramos comisión ni recargo adicional por ningún método de pago aceptado."] },
      { heading: "Contacto", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  terms: {
    title: "Términos del servicio",
    description: `Términos del servicio para compras en la tienda EE. UU. de ${COMPANY.tradingName}.`,
    intro: `Estos Términos del servicio rigen el uso de la tienda EE. UU. de ${COMPANY.tradingName} y las compras que realices en ella. La tienda es operada por ${COMPANY.legalName}, ${companyAddressLine} («nosotros»). Esta versión en español ofrece los mismos derechos y condiciones que la versión en inglés.`,
    sections: [
      {
        heading: "Identificación del vendedor y registro legal",
        blocks: [
          {
            rows: [
              ["Nombre comercial", COMPANY.tradingName],
              ["Razón social", `${COMPANY.legalName}, sociedad de responsabilidad limitada (LLC) registrada en ${COMPANY.stateOfFormation}, EE. UU.`],
              ["N.º de registro estatal (California SOS)", COMPANY.registrationNumber],
              ["Permiso de vendedor de California (CDTFA)", `${COMPANY.sellerPermit} (${COMPANY.sellerPermitAuthority})`],
              ["Representante legal", `${COMPANY.representative}, ${COMPANY.representativeRole}`],
              ["Domicilio comercial", companyAddressLine],
              ["Domicilio para notificaciones legales", COMPANY.mailingAddress],
              ["Atención al cliente", `${COMPANY.email} · ${COMPANY.phoneDisplay} (${usEs.company.hours})`],
            ],
          },
        ],
      },
      {
        heading: "Requisitos para comprar",
        blocks: ["Para hacer un pedido debes tener al menos 18 años, capacidad legal para contratar y una dirección física de entrega dentro de los 48 estados contiguos de EE. UU."],
      },
      {
        heading: "Pedidos y formación del contrato",
        blocks: [
          "Enviar un pedido al finalizar la compra constituye una oferta de compra sujeta a estos Términos. Enviamos un correo automático confirmando la recepción de los datos de tu pedido; la aceptación de tu oferta y el perfeccionamiento del contrato se producen cuando despachamos los productos y enviamos el correo de confirmación de envío. Podemos rechazar o cancelar un pedido antes del envío —por ejemplo, por falta de existencias, imposibilidad de verificar los datos de facturación/envío, sospecha de fraude o error evidente de precio— en cuyo caso te avisaremos de inmediato y reembolsaremos el importe total cobrado.",
        ],
      },
      {
        heading: "Precios, impuestos y descuento Member Club (7%)",
        blocks: [
          "Todos los precios en la tienda EE. UU. están expresados en dólares estadounidenses (USD) por unidad individual y no incluyen el impuesto sobre las ventas (sales tax), que se calcula al pagar según tu dirección de entrega.",
          "Member Club (7% de descuento para miembros registrados): Los clientes que crean una cuenta gratuita e inician sesión antes de pagar reciben automáticamente un 7% de descuento sobre el subtotal de mercancía en el carrito y en la caja. El descuento no es retroactivo para pedidos de invitado ya completados, no es canjeable por efectivo y, en caso de devolución, el reembolso corresponde al precio neto efectivamente pagado.",
        ],
      },
      {
        heading: "Compatibilidad vehicular, normativa DOT e instalación",
        blocks: [
          "Todas las llantas vendidas en nuestra tienda EE. UU. cuentan con marcado USDOT y calificaciones UTQG cuando corresponde. Antes de comprar y antes del montaje, tú (y tu instalador) son responsables de verificar que la medida de llanta, índice de carga, rango de velocidad, diámetro y ancho de rin, barrenación, offset (ET), centro (CB) y compatibilidad de frenos coincidan con la etiqueta de tu vehículo, el manual del propietario y el espacio físico del cáliper y la salpicadera.",
          "Las llantas, los rines y los componentes de freno son piezas críticas de seguridad y deben ser instalados por un técnico automotriz calificado con equipo calibrado y apretados al torque especificado por el fabricante del vehículo.",
        ],
      },
      {
        heading: "Envío, transmisión del riesgo y propiedad",
        blocks: ["Los plazos y condiciones de entrega se detallan en nuestra Política de envíos. El riesgo de pérdida y la titularidad pasan a ti en el momento en que la paquetería entrega los artículos en tu dirección de envío. Los paquetes extraviados o dañados en tránsito antes de la entrega son repuestos o reembolsados por nosotros sin costo para ti."],
      },
      {
        heading: "Devoluciones, cancelaciones y garantía",
        blocks: ["Las devoluciones y reembolsos se rigen por nuestra Política de devoluciones y reembolsos; los reclamos de garantía, por nuestra Política de garantía."] },
      {
        heading: "Limitación de responsabilidad",
        blocks: [
          "En la máxima medida permitida por la ley, no seremos responsables de daños indirectos, incidentales o consecuentes (incluidos costos de montaje, grúa, alineación o falta de uso del vehículo) derivados del uso de los productos adquiridos, y nuestra responsabilidad total por cualquier reclamo relacionado con un pedido no excederá el monto total pagado por dicho pedido. Nada en estos Términos limita la responsabilidad que no pueda limitarse por ley federal o estatal, incluida la derivada de negligencia grave, dolo o lesiones personales.",
        ],
      },
      {
        heading: "Ley aplicable y jurisdicción",
        blocks: [
          `Estos Términos se rigen por las leyes del Estado de ${COMPANY.stateOfFormation}, sin considerar sus normas sobre conflicto de leyes. Si tienes algún inconveniente, contáctanos primero en ${COMPANY.email} o al ${COMPANY.phoneDisplay}; resolvemos la mayoría de los casos en 1–2 días hábiles. Cualquiera de las partes puede acudir a un tribunal de reclamos menores cuando proceda; en los demás casos, las controversias se someterán a los tribunales estatales o federales ubicados en el Condado de Los Ángeles, ${COMPANY.stateOfFormation}.`,
        ],
      },
      { heading: "Modificaciones", blocks: ["Podemos actualizar estos Términos periódicamente. La versión publicada en el momento en que realizas tu pedido es la que rige para esa compra."] },
      { heading: "Contacto", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${contactLine}`] },
    ],
  },

  privacy: {
    title: "Aviso de privacidad",
    description: "Cómo recopilamos, usamos y protegemos la información personal en la tienda EE. UU., y tus derechos bajo CCPA/CPRA y leyes estatales.",
    intro: `${COMPANY.legalName} («nosotros») opera la tienda EE. UU. de ${COMPANY.tradingName}. Este Aviso de privacidad explica qué información personal recopilamos, cómo la usamos y compartimos, y los derechos que tienes conforme a las leyes estatales de privacidad de EE. UU., incluida la Ley de Privacidad del Consumidor de California (CCPA/CPRA).`,
    sections: [
      {
        heading: "Aviso de recopilación: categorías de información personal",
        blocks: [
          {
            rows: [
              ["Identificadores y datos de contacto", "Nombre completo, correo electrónico, teléfono, dirección física de entrega y facturación, ID de cuenta, dirección IP"],
              ["Información comercial y de pedidos", "Productos comprados, números de pedido, devoluciones/RMA, reclamos de garantía y vehículos/medidas guardados en tu garaje"],
              ["Información de pago", "Tokens de autorización y últimos 4 dígitos procesados por nuestra pasarela PCI-DSS Nivel 1 (nunca almacenamos números completos de tarjeta ni códigos CVV)"],
              ["Actividad en internet y dispositivo", "Páginas y productos vistos, contenido del carrito, tipo de navegador/dispositivo y datos de interacción (sujeto a tus preferencias de privacidad)"],
              ["Comunicaciones de soporte", "Correos, mensajes del formulario de contacto, chat en vivo y fotografías enviadas para soporte de compatibilidad, devoluciones o garantía"],
            ],
          },
          "No recopilamos datos biométricos, geolocalización precisa ni información personal sensible, ni la utilizamos para inferir características sobre los consumidores.",
        ],
      },
      {
        heading: "Finalidades del uso de la información",
        blocks: [
          {
            list: [
              "Procesamiento de pedidos y atención al cliente: procesar pagos, enviar pedidos con UPS/FedEx/USPS, enviar números de rastreo, gestionar devoluciones/RMA y tramitar registros DOT ante la NHTSA y garantías.",
              "Cuenta y funciones de garaje: mantener tu cuenta opcional, aplicar el descuento del 7% de Member Club y recordar tus medidas o vehículos.",
              "Seguridad y prevención de fraude: verificar datos de facturación y envío, prevenir transacciones fraudulentas y proteger la seguridad de la tienda.",
              "Cumplimiento legal y fiscal: conservar registros de impuestos sobre las ventas, contabilidad y seguridad vehicular exigidos por la ley.",
              "Análisis y publicidad (Google Ads / Shopping): medir el rendimiento del sitio y de los anuncios de Google Shopping, sujeto siempre a tu derecho de exclusión y a la señal Global Privacy Control (GPC).",
            ],
          },
        ],
      },
      {
        heading: "Con quién compartimos datos y Google Consent Mode v2",
        blocks: [
          "Proveedores de servicios (encargados): Compartimos únicamente los datos necesarios con proveedores que actúan en nuestro nombre bajo contrato: pasarela de pagos (CGPayTech), paqueterías (UPS, FedEx, USPS) y almacenes en EE. UU., alojamiento en la nube (Vercel / Neon) y servicio de correo transaccional.",
          "Socios de publicidad y análisis (Google): Cuando las cookies publicitarias están activas, utilizamos Google Analytics y etiquetas de conversión de Google Ads / Google Merchant Center. Según la CCPA/CPRA y ciertas leyes estatales, el uso de cookies publicitarias puede considerarse «compartir» o «vender» información personal para publicidad conductual entre contextos. No vendemos datos personales a cambio de dinero.",
          "Implementamos Google Consent Mode v2. Si ejerces tu exclusión en Tus opciones de privacidad o si tu navegador envía la señal Global Privacy Control (GPC), ad_storage, ad_user_data y ad_personalization pasan automáticamente a estado «denied».",
          "Autoridades: Cuando sea requerido por ley, orden judicial o normativa de seguridad vehicular de la NHTSA.",
        ],
      },
      {
        heading: "Tus derechos de privacidad en EE. UU. (CCPA/CPRA y leyes estatales)",
        blocks: [
          "Según tu estado de residencia (incluidos California, Virginia, Colorado, Connecticut, Texas, Oregón y otros estados), tienes derecho a:",
          {
            list: [
              "Conocer y acceder a las categorías y datos específicos de información personal que tenemos sobre ti.",
              "Corregir información personal inexacta.",
              "Solicitar la eliminación de tu información personal, salvo las excepciones legales (como pedidos en curso, registros fiscales o registros DOT).",
              "Excluirte (Opt-Out) en cualquier momento de la venta o el intercambio de información personal y de la publicidad dirigida.",
              "No recibir trato discriminatorio por ejercer tus derechos de privacidad.",
            ],
          },
          `Envía tus solicitudes a ${COMPANY.privacyEmail} o llama al ${COMPANY.phoneDisplay}. Verificamos las solicitudes de acceso, corrección y eliminación cotejando al menos dos datos (como tu correo y número de pedido). Para excluirte de la venta/intercambio no se requiere verificación. Puedes designar a un agente autorizado con permiso por escrito. Si rechazamos una solicitud, puedes apelar respondiendo a nuestra decisión en ${COMPANY.privacyEmail}.`,
        ],
      },
      {
        heading: "Global Privacy Control (GPC)",
        blocks: [
          "Reconocemos y aplicamos de forma automática la señal Global Privacy Control (GPC) enviada por tu navegador como una solicitud válida para desactivar la venta o el intercambio de datos personales y la publicidad dirigida en ese navegador.",
        ],
      },
      {
        heading: "Conservación de datos",
        blocks: [
          "Conservamos los registros de pedidos, facturas e impuestos durante 7 años conforme a las leyes fiscales federales y de California, los registros DOT conforme a la normativa de la NHTSA, los mensajes de soporte durante 3 años y las preferencias de cookies durante 13 meses.",
        ],
      },
      { heading: "Menores de edad", blocks: ["La tienda está dirigida a mayores de 18 años y no recopilamos a sabiendas información personal de menores de 16 años."] },
      { heading: "Cambios", blocks: ["Publicaremos cualquier cambio en esta página actualizando la fecha de entrada en vigor."] },
      { heading: "Contacto", blocks: [`${COMPANY.legalName}, ${companyAddressLine} · ${COMPANY.privacyEmail} · ${COMPANY.phoneDisplay}`] },
    ],
  },

  "privacy-choices": {
    title: "Tus opciones de privacidad",
    description: "Exclúyete de la venta o el intercambio de información personal y de la publicidad dirigida (CCPA/CPRA).",
    intro: "Conforme a la Ley de Privacidad del Consumidor de California (CCPA/CPRA) y otras leyes estatales de EE. UU., puedes excluirte en cualquier momento de la «venta» o el «intercambio» de tu información personal para publicidad dirigida.",
    sections: [
      {
        heading: "Exclusión inmediata en este navegador",
        blocks: [
          "Haz clic en el botón «Abrir configuración de privacidad» de abajo (o en el enlace «No vender ni compartir mi información personal» del pie de página), desactiva Publicidad y guarda tu elección. Esto actualiza de inmediato Google Consent Mode v2 en tu navegador para bloquear ad_storage, ad_user_data y ad_personalization.",
          "Si tu navegador envía una señal de Global Privacy Control (GPC), aplicamos la exclusión automáticamente sin que tengas que hacer nada más.",
        ],
      },
      {
        heading: "Exclusión por correo electrónico",
        blocks: [
          `También puedes escribir a ${COMPANY.privacyEmail} con el asunto «No vender ni compartir» indicando el correo electrónico que utilizas con nosotros. Aplicaremos la exclusión a tu registro de cliente en un plazo máximo de 15 días hábiles.`,
        ],
      },
      {
        heading: "Más información",
        blocks: [
          "Consulta nuestro Aviso de privacidad para ver el detalle completo de las categorías de datos recopilados y todos tus derechos.",
          { link: { href: "/policies/privacy", label: "Ver el Aviso de privacidad" } },
        ],
      },
    ],
  },
}
