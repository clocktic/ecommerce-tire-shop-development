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
const cutoff = "2:00 p. m. ET"
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${usEs.company.hours})`

export const US_POLICIES_ES: Record<string, PolicyDoc> = {
  shipping: {
    title: "Política de envíos",
    description: `Envío gratis a ${t.area}. Entrega en ${t.days}.`,
    intro: `Esta política aplica a los pedidos hechos en la tienda EE. UU. de ${COMPANY.tradingName} (precios en USD).`,
    sections: [
      {
        heading: "A dónde enviamos",
        blocks: [
          `Enviamos a ${t.area}. No enviamos a ${t.exclusions} ni a apartados postales (PO Box): las llantas y los rines son paquetes de gran tamaño y requieren una dirección física.`,
          "Puedes enviar directo a un taller o instalador. Escribe el nombre del taller en el campo de empresa y avísales que va a llegar un envío.",
        ],
      },
      {
        heading: "Costo",
        blocks: [s.freeShipping ? "El envío es gratis en todos los pedidos, sin monto mínimo." : "El envío se calcula al pagar."],
      },
      {
        heading: "Tiempos de preparación y entrega",
        blocks: [
          {
            rows: [
              ["Hora límite de pedido", `${cutoff}, de lunes a viernes`],
              ["Tiempo de preparación", `${s.handlingDays[0]}–${s.handlingDays[1]} días hábiles`],
              ["Tiempo de tránsito", `${s.transitDays[0]}–${s.transitDays[1]} días hábiles`],
              ["Tiempo total de entrega", t.days],
              ["Paqueterías", s.carriers.join(", ")],
            ],
          },
          "Los días hábiles son de lunes a viernes, excepto los días festivos federales de EE. UU. Los pedidos hechos después de la hora límite o en fin de semana se procesan el siguiente día hábil.",
          t.duties,
        ],
      },
      {
        heading: "Rastreo",
        blocks: ["Recibirás un correo de confirmación de envío con un número de rastreo por cada paquete. Un juego de cuatro llantas suele enviarse en cuatro paquetes separados que pueden llegar en días distintos."],
      },
      {
        heading: "Paquetes dañados o extraviados",
        blocks: [
          "Revisa los paquetes al recibirlos. Si un paquete llega dañado, indícalo al repartidor si es posible y envíanos fotos por correo dentro de los 7 días posteriores a la entrega. Si un paquete aparece como entregado pero no llegó, contáctanos dentro de 7 días y abriremos un reclamo con la paquetería.",
          "Los artículos dañados en tránsito o extraviados por la paquetería se reponen o se reembolsan sin costo para ti.",
        ],
      },
      { heading: "Impuesto sobre las ventas", blocks: ["El impuesto sobre las ventas se calcula al pagar según la dirección de entrega, cuando la ley estatal lo exige."] },
      { heading: "Contacto", blocks: [contactLine] },
    ],
  },

  returns: {
    title: "Política de devoluciones y reembolsos",
    description: `Devoluciones en ${r.windowDays} días de artículos sin usar y sin montar. Sin cargo por reposición.`,
    intro: `Puedes devolver los artículos comprados en la tienda EE. UU. de ${COMPANY.tradingName} dentro de los ${r.windowDays} días posteriores a la entrega.`,
    sections: [
      {
        heading: "Plazo de devolución",
        blocks: [`Tienes ${r.windowDays} días naturales a partir de la fecha de entrega para iniciar una devolución.`],
      },
      {
        heading: "Estado de los artículos devueltos",
        blocks: [
          "Para recibir el reembolso, los artículos deben estar nuevos y sin usar:",
          {
            list: [
              "Llantas: sin montar en un rin, sin haber rodado, sin marcas de desmontadora ni de lubricante de ceja.",
              "Rines: sin montar con llanta, sin haberse atornillado a un vehículo, sin marcas en los asientos de birlos ni en el centro.",
              "Piezas de freno: sin instalar, sin asentar, en su empaque original sellado.",
              "Todos los artículos: con etiquetas y empaque originales y con todas sus piezas.",
            ],
          },
          "Probar un rin contra la maza sin apretar los birlos está bien; protege la cara del rin con un paño.",
        ],
      },
      {
        heading: "Cómo devolver",
        blocks: [
          {
            list: [
              `Escribe a ${COMPANY.email} con tu número de pedido y los artículos que quieres devolver.`,
              "Te respondemos en 1 día hábil con un número de autorización de devolución (RMA) y la dirección de devolución.",
              "Te enviamos por correo una guía prepagada tras la aprobación, o puedes dejar el paquete en la paquetería.",
              `Envía los artículos a: ${US_PRESENCE.returnsAddress}. Anota el número RMA en cada paquete.`,
            ],
          },
        ],
      },
      {
        heading: "Costo del envío de devolución",
        blocks: [
          r.returnShippingPaidBy === "merchant"
            ? "El envío de devolución es gratis."
            : `Si devuelves artículos que ya no quieres, tú pagas el envío de devolución: aprox. US$25 por llanta o rin y US$15 por paquete de frenos si usas nuestra guía prepagada (se descuenta del reembolso). Si un artículo llegó dañado, defectuoso o no es el que pediste, nosotros pagamos el envío de devolución.`,
          r.restockingFeePercent > 0 ? `Aplica un cargo por reposición del ${r.restockingFeePercent}%.` : "No hay cargo por reposición.",
        ],
      },
      {
        heading: "Reembolsos",
        blocks: [
          `Revisamos las devoluciones dentro de los 2 días hábiles posteriores a su llegada y emitimos el reembolso a tu método de pago original en un plazo de ${r.refundDays} días hábiles después de eso. Tu banco puede tardar unos días más en reflejarlo.`,
          "Se te reembolsa el precio completo del artículo. El envío original fue gratis, por lo que no hay cargo de envío.",
        ],
      },
      {
        heading: "Artículos que no se pueden devolver",
        blocks: [
          {
            list: [
              "Llantas que ya se montaron o rodaron, salvo en un reclamo de garantía del fabricante.",
              "Rines que ya se montaron con llanta o se instalaron en un vehículo.",
              "Piezas de freno que ya se instalaron.",
            ],
          },
        ],
      },
      {
        heading: "Cancelaciones y cambios",
        blocks: [
          "Puedes cancelar sin costo hasta que el pedido se envíe; escríbenos lo antes posible. Una vez enviado, usa el proceso de devolución.",
          "Si necesitas otra medida, devuelve el artículo original y haz un pedido nuevo. Es la forma más rápida de recibir la pieza correcta.",
        ],
      },
      { heading: "Contacto", blocks: [contactLine] },
    ],
  },

  warranty: {
    title: "Garantía",
    description: "Garantías del fabricante para llantas, rines y frenos, y cómo hacer un reclamo.",
    intro: "Todos los productos que vendemos son nuevos y cuentan con la garantía de su fabricante. Nosotros gestionamos el reclamo con el fabricante por ti.",
    sections: [
      {
        heading: "Qué cubre",
        blocks: [
          "Las garantías del fabricante suelen cubrir defectos de materiales y de fabricación. Muchas llantas también tienen garantía de desgaste (kilometraje). Los términos, la duración y las exclusiones exactas los fija cada fabricante y se enlazan en la página del producto cuando están disponibles.",
        ],
      },
      {
        heading: "Qué no suele cubrir",
        blocks: [
          {
            list: [
              "Daños por peligros del camino (ponchaduras, impactos, golpes con banquetas), salvo que se haya contratado un plan de protección.",
              "Daños por presión incorrecta, sobrecarga, mala alineación o instalación incorrecta.",
              "Desgaste normal, incluido el de balatas y discos.",
              "Uso en carreras o competencias.",
            ],
          },
        ],
      },
      {
        heading: "Cómo hacer un reclamo",
        blocks: [
          `Escribe a ${COMPANY.email} con tu número de pedido, fotos del artículo (en llantas, incluye el código DOT) y una breve descripción. Enviamos el reclamo al fabricante y te mantenemos informado. Algunos fabricantes exigen una inspección en un distribuidor autorizado.`,
        ],
      },
      {
        heading: "Tus derechos",
        blocks: [
          "Esta página no limita ninguna garantía implícita ni otros derechos que tengas conforme a la ley federal (incluida la Ley Magnuson-Moss de Garantías) o a la ley de tu estado.",
        ],
      },
      { heading: "Contacto", blocks: [contactLine] },
    ],
  },

  payments: {
    title: "Métodos de pago",
    description: `Paga con ${p.paymentMethods.join(", ")}.`,
    intro: "Todos los precios de la tienda EE. UU. están en dólares estadounidenses (USD).",
    sections: [
      { heading: "Métodos aceptados", blocks: [{ list: p.paymentMethods }] },
      {
        heading: "Cuándo se hace el cargo",
        blocks: ["Tu pago se autoriza al hacer el pedido y se cobra cuando el pedido se envía. Si un artículo no se puede enviar, la autorización se libera."],
      },
      { heading: "Impuesto sobre las ventas", blocks: ["El impuesto sobre las ventas se calcula al pagar según la dirección de entrega, cuando la ley estatal lo exige."] },
      {
        heading: "Seguridad",
        blocks: ["Los datos de tarjeta los procesa nuestro proveedor de pagos mediante una conexión cifrada. No guardamos números de tarjeta completos."],
      },
      { heading: "Sin recargos", blocks: ["No cobramos comisión por ningún método de pago."] },
    ],
  },

  terms: {
    title: "Términos del servicio",
    description: `Términos para compras en la tienda EE. UU. de ${COMPANY.tradingName}.`,
    intro: `Estos Términos del servicio rigen el uso de la tienda EE. UU. de ${COMPANY.tradingName} y las compras que hagas en ella. La tienda es operada por ${COMPANY.legalName}, ${companyAddressLine} («nosotros»). Esta traducción se ofrece para tu comodidad; en caso de discrepancia, prevalece la versión en inglés.`,
    sections: [
      {
        heading: "Requisitos",
        blocks: ["Para hacer un pedido debes tener al menos 18 años y una dirección de entrega dentro de la zona que atendemos."],
      },
      {
        heading: "Pedidos",
        blocks: [
          "Hacer un pedido es una oferta de compra. La aceptamos cuando enviamos la confirmación de envío. Podemos rechazar o cancelar un pedido —por ejemplo, si un artículo está agotado, si hubo un error de precio o si sospechamos fraude— y reembolsaremos cualquier monto cobrado.",
        ],
      },
      {
        heading: "Precios e información de productos",
        blocks: [
          "Los precios están en USD y no incluyen el impuesto sobre las ventas, que se agrega al pagar cuando corresponde. Procuramos que la información de los productos sea exacta; si después de tu pedido se detecta un error importante, te contactaremos antes del envío y podrás cancelar sin costo.",
        ],
      },
      {
        heading: "Compatibilidad e instalación",
        blocks: [
          "Eres responsable de confirmar que la medida, el índice de carga, el índice de velocidad, la barrenación, el offset y la compatibilidad de los frenos coincidan con tu vehículo y con su etiqueta o manual del propietario. Las llantas, los rines y los componentes de freno deben instalarlos técnicos calificados, con el par de apriete indicado por el fabricante del vehículo. Contáctanos antes de comprar si tienes dudas.",
        ],
      },
      {
        heading: "Envío, riesgo y propiedad",
        blocks: ["El riesgo de pérdida y la propiedad pasan a ti cuando el artículo se entrega en tu dirección de envío. Consulta la Política de envíos para más detalles."],
      },
      { heading: "Devoluciones y garantía", blocks: ["Las devoluciones se rigen por nuestra Política de devoluciones y reembolsos; los reclamos de garantía, por nuestra página de Garantía."] },
      {
        heading: "Limitación de responsabilidad",
        blocks: [
          "En la medida en que la ley lo permita, no somos responsables de daños indirectos o consecuentes derivados del uso de productos comprados con nosotros, y nuestra responsabilidad total por cualquier pedido se limita al monto que pagaste por él. Nada en estos términos limita la responsabilidad que no puede limitarse por ley, incluida la de lesiones personales causadas por negligencia.",
        ],
      },
      {
        heading: "Ley aplicable y controversias",
        blocks: [
          `Estos términos se rigen por las leyes del estado de ${COMPANY.stateOfFormation}, sin considerar sus normas de conflicto de leyes. Contáctanos primero: la mayoría de los problemas se resuelven rápido. Cualquiera de las partes puede presentar un reclamo ante un tribunal de reclamos menores cuando proceda; en los demás casos, las controversias se resuelven en los tribunales estatales o federales ubicados en ${COMPANY.stateOfFormation}.`,
        ],
      },
      { heading: "Cambios", blocks: ["Podemos actualizar estos términos. La versión vigente cuando hagas un pedido es la que aplica a ese pedido."] },
      { heading: "Contacto", blocks: [contactLine] },
    ],
  },

  privacy: {
    title: "Aviso de privacidad",
    description: "Cómo recopilamos, usamos y compartimos información personal en la tienda EE. UU., y tus derechos de privacidad según las leyes estatales.",
    intro: `${COMPANY.legalName} («nosotros») opera la tienda EE. UU. de ${COMPANY.tradingName}. Este aviso explica qué información personal recopilamos, cómo la usamos y qué derechos tienes conforme a las leyes estatales de privacidad de EE. UU., incluida la Ley de Privacidad del Consumidor de California (CCPA/CPRA).`,
    sections: [
      {
        heading: "Información que recopilamos",
        blocks: [
          {
            rows: [
              ["Identificadores y datos de contacto", "Nombre, correo electrónico, teléfono, dirección de entrega y de facturación"],
              ["Información comercial", "Pedidos, devoluciones, datos del vehículo o de medidas que nos proporciones"],
              ["Información de pago", "La procesa nuestro proveedor de pagos; solo recibimos un token y los últimos dígitos"],
              ["Actividad en internet", "Páginas vistas, datos del dispositivo y del navegador, ubicación aproximada por IP"],
              ["Comunicaciones", "Mensajes que envías a servicio al cliente"],
            ],
          },
          "No recopilamos a sabiendas información personal sensible ni la usamos para inferir características sobre ti.",
        ],
      },
      {
        heading: "Cómo la usamos",
        blocks: [
          {
            list: [
              "Para procesar, enviar y dar seguimiento a tus pedidos, devoluciones y reclamos de garantía.",
              "Para prevenir fraudes y proteger la tienda.",
              "Para cumplir obligaciones fiscales, contables y legales.",
              "Para medir y mejorar la tienda (análisis).",
              "Para mostrar y medir publicidad, sujeto a tus opciones de exclusión.",
            ],
          },
        ],
      },
      {
        heading: "Con quién la compartimos",
        blocks: [
          "Proveedores de servicios que actúan en nuestro nombre: procesamiento de pagos, paqueterías y nuestro almacén, alojamiento web, envío de correos y herramientas de atención al cliente.",
          "Socios de publicidad y análisis (por ejemplo Google), mediante cookies. Según algunas leyes estatales, esto puede considerarse «vender» o «compartir» información personal para publicidad conductual entre contextos. Puedes excluirte en cualquier momento en la página Tus opciones de privacidad.",
          "Autoridades, cuando la ley lo exija.",
        ],
      },
      {
        heading: "Tus derechos",
        blocks: [
          "Según tu estado de residencia, puedes tener derecho a:",
          {
            list: [
              "Conocer y acceder a la información personal que tenemos sobre ti.",
              "Corregir información inexacta.",
              "Eliminar tu información personal, salvo excepciones legales.",
              "Excluirte de la venta o el intercambio de información personal y de la publicidad dirigida.",
              "No ser discriminado por ejercer estos derechos.",
            ],
          },
          `Envía tus solicitudes a ${COMPANY.privacyEmail} o por teléfono al ${COMPANY.phoneDisplay}. Verificamos las solicitudes comparando los datos con tu pedido. Un agente autorizado puede presentar una solicitud con tu permiso por escrito. Si rechazamos una solicitud, puedes apelar respondiendo a nuestra decisión.`,
        ],
      },
      {
        heading: "Global Privacy Control",
        blocks: ["Tratamos una señal de Global Privacy Control (GPC) del navegador como una solicitud válida para excluirte de la venta y el intercambio de datos en ese navegador."],
      },
      {
        heading: "Conservación",
        blocks: ["Conservamos los registros de pedidos durante el tiempo que exigen las leyes fiscales y contables (normalmente 7 años) y los demás datos solo mientras sean necesarios para los fines anteriores."],
      },
      { heading: "Menores", blocks: ["La tienda no está dirigida a menores de 13 años y no recopilamos su información a sabiendas."] },
      { heading: "Cambios", blocks: ["Publicaremos cualquier cambio en esta página con una nueva fecha de entrada en vigor."] },
      { heading: "Contacto", blocks: [`${COMPANY.legalName}, ${companyAddressLine}. ${COMPANY.privacyEmail}`] },
    ],
  },

  "privacy-choices": {
    title: "Tus opciones de privacidad",
    description: "Exclúyete de la venta o el intercambio de información personal y de la publicidad dirigida.",
    intro: "Puedes excluirte en cualquier momento de la venta o el intercambio de tu información personal y de la publicidad dirigida.",
    sections: [
      {
        heading: "Exclusión en este navegador",
        blocks: [
          "Usa el enlace «No vender ni compartir mi información personal» del pie de página y desactiva la publicidad. Tu elección se guarda en este navegador, así que repítela en cada dispositivo que uses.",
          "Si tu navegador envía una señal de Global Privacy Control (GPC), aplicamos la exclusión automáticamente.",
        ],
      },
      {
        heading: "Exclusión por correo",
        blocks: [`Escribe a ${COMPANY.privacyEmail} con el asunto «No vender ni compartir» y el correo electrónico que usas con nosotros. La aplicamos a tu registro de cliente en un plazo de 15 días hábiles.`],
      },
      { heading: "Más información", blocks: ["Consulta el Aviso de privacidad para ver la lista completa de tus derechos."] },
    ],
  },
}
