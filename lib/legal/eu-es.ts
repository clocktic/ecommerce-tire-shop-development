import { COMPANY, EU_PRESENCE, companyAddressLine } from "@/lib/company"
import { CONSENT_MAX_AGE_DAYS } from "@/components/legal/consent"
import { POLICIES } from "@/lib/policies"
import { euEs } from "@/lib/i18n/dictionaries/es"
import type { PolicyDoc } from "@/lib/legal/types"

// Spanish (Spain) version of lib/legal/eu.ts. Same facts and numbers; update all
// EU language files together. Withdrawal wording follows the official model
// (Directiva 2011/83/UE, anexo I).
const p = POLICIES.eu
const s = p.shipping
const r = p.returns
const t = euEs.policy
const contactLine = `${COMPANY.email} · ${COMPANY.phoneDisplay} (${euEs.company.hours})`
const seller = `${COMPANY.legalName}, ${companyAddressLine}, correo electrónico ${COMPANY.email}, teléfono ${COMPANY.phoneDisplay}`
const bulky = "como máximo unos 25 € por neumático o llanta y 15 € por bulto de frenos"
const payments = p.paymentMethods.map((m) => (m === "SEPA bank transfer" ? "Transferencia SEPA" : m))

export const EU_POLICIES_ES: Record<string, PolicyDoc> = {
  shipping: {
    title: "Condiciones de entrega",
    description: `Entrega gratuita en ${t.area}. IVA incluido, sin aranceles. ${t.days}.`,
    intro: `Estas condiciones se aplican a los pedidos realizados en la tienda UE de ${COMPANY.tradingName} (precios en EUR, IVA incluido).`,
    sections: [
      {
        heading: "Zona de entrega",
        blocks: [
          `Entregamos en ${t.area}. No entregamos en ${t.exclusions}.`,
          "Puedes recibir neumáticos y llantas directamente en un taller de montaje. Indica el nombre del taller en el campo Empresa.",
        ],
      },
      {
        heading: "Gastos, IVA y aduanas",
        blocks: [
          s.freeShipping ? "La entrega es gratuita en todos los pedidos, sin importe mínimo." : "Los gastos de entrega se muestran antes de confirmar el pedido.",
          `${t.duties} Los precios incluyen el IVA de tu país, recaudado a través de la ventanilla única de la UE (OSS).`,
        ],
      },
      {
        heading: "Plazos de entrega",
        blocks: [
          {
            rows: [
              ["Hora límite de pedido", `${s.cutoff}, de lunes a viernes`],
              ["Tiempo de preparación", `${s.handlingDays[0]}–${s.handlingDays[1]} días laborables`],
              ["Tiempo de tránsito", `${s.transitDays[0]}–${s.transitDays[1]} días laborables`],
              ["Plazo total de entrega", t.days],
              ["Transportistas", s.carriers.join(", ")],
              ["Enviado desde", EU_PRESENCE.warehouseCountry],
            ],
          },
          "Si no podemos entregar en un plazo de 30 días desde tu pedido y no acordamos contigo una fecha posterior, puedes cancelar el pedido y recibir el reembolso íntegro.",
        ],
      },
      {
        heading: "Seguimiento",
        blocks: ["Recibirás un correo de envío con un enlace de seguimiento. Un juego de cuatro neumáticos suele enviarse en cuatro bultos, que pueden llegar en días distintos."],
      },
      {
        heading: "Paquetes dañados",
        blocks: [
          "Revisa los paquetes en la entrega y, si es posible, deja constancia de cualquier daño visible ante el repartidor. Envíanos fotos por correo lo antes posible. Tus derechos legales no se ven afectados si no lo haces: simplemente nos ayuda a reclamar al transportista.",
          "El riesgo de pérdida o daño solo se te transmite cuando tú, o la persona que hayas designado, adquieres la posesión material de los bienes.",
        ],
      },
      { heading: "Contacto", blocks: [contactLine] },
    ],
  },

  returns: {
    title: "Derecho de desistimiento y devoluciones",
    description: `Derecho de desistimiento de ${r.windowDays} días para consumidores en la UE.`,
    intro: "Si eres consumidor, tienes un derecho legal de desistimiento. La información siguiente sigue el modelo de la UE (Directiva 2011/83/UE, anexo I).",
    sections: [
      {
        heading: "Derecho de desistimiento",
        blocks: [
          `Tienes derecho a desistir del presente contrato en un plazo de ${r.windowDays} días naturales sin necesidad de justificación.`,
          `El plazo de desistimiento expirará a los ${r.windowDays} días naturales del día en que tú o un tercero indicado por ti, distinto del transportista, adquiráis la posesión material de los bienes. Si has pedido varios bienes que se entregan por separado, el plazo expirará a los ${r.windowDays} días naturales del día en que tú o el tercero indicado adquiráis la posesión material del último bien.`,
          `Para ejercer el derecho de desistimiento, deberás notificarnos (${seller}) tu decisión de desistir del contrato a través de una declaración inequívoca (por ejemplo, un correo electrónico). Puedes utilizar el modelo de formulario de desistimiento, aunque su uso no es obligatorio.`,
          { link: { href: "/policies/withdrawal-form", label: "Modelo de formulario de desistimiento" } },
          "Para cumplir el plazo de desistimiento, basta con que la comunicación relativa al ejercicio de este derecho sea enviada antes de que venza el plazo correspondiente.",
        ],
      },
      {
        heading: "Consecuencias del desistimiento",
        blocks: [
          `En caso de desistimiento, te devolveremos todos los pagos recibidos de ti, incluidos los gastos de entrega (con la excepción de los gastos adicionales resultantes de la elección por tu parte de una modalidad de entrega diferente a la modalidad menos costosa de entrega ordinaria que ofrezcamos) sin ninguna demora indebida y, en todo caso, a más tardar ${r.refundDays} días naturales a partir de la fecha en la que se nos informe de tu decisión de desistir del presente contrato. Procederemos a efectuar dicho reembolso utilizando el mismo medio de pago empleado por ti para la transacción inicial, a no ser que hayas dispuesto expresamente lo contrario; en todo caso, no incurrirás en ningún gasto como consecuencia del reembolso.`,
          "Podremos retener el reembolso hasta haber recibido los bienes, o hasta que hayas presentado una prueba de la devolución de los mismos, según qué condición se cumpla primero.",
          `Deberás devolver los bienes a ${EU_PRESENCE.returnsAddress} sin ninguna demora indebida y, en cualquier caso, a más tardar en el plazo de ${r.windowDays} días naturales a partir de la fecha en que nos comuniques tu decisión de desistimiento del contrato. Se considerará cumplido el plazo si efectúas la devolución de los bienes antes de que haya concluido dicho plazo.`,
          r.returnShippingPaidBy === "merchant"
            ? "Asumiremos el coste de la devolución de los bienes."
            : `Deberás asumir el coste directo de devolución de los bienes. Por su naturaleza, los neumáticos, las llantas y los kits de frenos no pueden devolverse normalmente por correo; se calcula que dicho coste asciende a ${bulky}. Si lo solicitas, podemos enviarte una etiqueta prepagada por ese importe.`,
          "Solo serás responsable de la disminución de valor de los bienes resultante de una manipulación distinta a la necesaria para establecer la naturaleza, las características y el funcionamiento de los bienes.",
        ],
      },
      {
        heading: "Qué va más allá de la simple comprobación",
        blocks: [
          "Puedes desembalar y examinar los artículos como lo harías en una tienda. Lo siguiente va más allá y puede reducir el reembolso en la medida de la pérdida de valor:",
          {
            list: [
              "Montar un neumático en una llanta, inflarlo o circular con él.",
              "Montar una llanta en un vehículo con los tornillos o tuercas apretados.",
              "Instalar o asentar pastillas, discos o pinzas de freno.",
            ],
          },
        ],
      },
      {
        heading: "Exclusiones",
        blocks: [
          "El derecho de desistimiento no se aplica a los bienes confeccionados conforme a tus especificaciones o claramente personalizados (por ejemplo, una llanta fabricada por encargo con un acabado o taladrado específico). Estos artículos se indican en su ficha de producto antes del pedido.",
        ],
      },
      {
        heading: "Pasos prácticos",
        blocks: [
          {
            list: [
              `Escribe a ${COMPANY.email} con tu número de pedido o envía el modelo de formulario de desistimiento.`,
              "Confirmamos por correo la recepción de tu desistimiento y te enviamos la dirección de devolución y, si lo pides, una etiqueta prepagada.",
              "Embala los artículos de forma segura, si es posible en su embalaje original.",
            ],
          },
        ],
      },
      {
        heading: "Cancelación antes del envío",
        blocks: ["Puedes cancelar sin coste hasta que el pedido se envíe: escríbenos y te reembolsamos el importe íntegro."],
      },
      {
        heading: "Artículos defectuosos o erróneos",
        blocks: ["Si un artículo es defectuoso o no es el que pediste, se aplican tus derechos de garantía legal y cubrimos todos los gastos de devolución. Consulta Garantía legal y garantía comercial."],
      },
    ],
  },

  "withdrawal-form": {
    title: "Modelo de formulario de desistimiento",
    description: "Modelo de formulario de desistimiento de la UE (Directiva 2011/83/UE, anexo I, parte B).",
    intro: "Cumplimenta y envía el presente formulario solo si deseas desistir del contrato. Puedes copiar el texto en un correo electrónico.",
    sections: [
      {
        heading: "Formulario",
        blocks: [
          `A la atención de: ${seller}`,
          "Por la presente le comunico/comunicamos (*) que desisto de mi/desistimos de nuestro (*) contrato de venta del siguiente bien (*)/de prestación del siguiente servicio (*):",
          {
            rows: [
              ["Pedido el (*) / recibido el (*)", "________________"],
              ["Número de pedido", "________________"],
              ["Nombre del consumidor o de los consumidores", "________________"],
              ["Domicilio del consumidor o de los consumidores", "________________"],
              ["Firma del consumidor o de los consumidores (solo si el presente formulario se presenta en papel)", "________________"],
              ["Fecha", "________________"],
            ],
          },
          { note: "(*) Táchese lo que no proceda." },
        ],
      },
    ],
  },

  warranty: {
    title: "Garantía legal y garantía comercial",
    description: "Garantía legal de conformidad de 2 años para consumidores en la UE, además de las garantías del fabricante.",
    intro: "Como consumidor en la UE, te beneficias de la garantía legal de conformidad de los bienes (Directiva (UE) 2019/771), transpuesta en la legislación de tu país.",
    sections: [
      {
        heading: "Garantía legal de conformidad",
        blocks: [
          `Respondemos de cualquier falta de conformidad que exista en el momento de la entrega y se manifieste en un plazo de ${p.warranty.months! / 12} años desde la entrega. Esta garantía es gratuita.`,
          "Si un defecto aparece durante el primer año tras la entrega (dos años en algunos Estados miembros), se presume que ya existía en el momento de la entrega, salvo que demostremos lo contrario.",
        ],
      },
      {
        heading: "Tus opciones",
        blocks: [
          {
            list: [
              "Reparación o sustitución, a tu elección, salvo que la opción elegida sea imposible o desproporcionada.",
              "Reducción del precio o resolución del contrato con reembolso, si la reparación o sustitución no es posible, fracasa o se demora un tiempo irrazonable.",
            ],
          },
          "Asumimos todos los gastos para subsanar el defecto, incluido el envío de devolución.",
        ],
      },
      {
        heading: "Qué no es un defecto",
        blocks: [
          "El desgaste normal (de la banda de rodadura, las pastillas y los discos) y los daños por pinchazos, golpes contra bordillos, presión incorrecta, sobrecarga, montaje incorrecto o uso en competición no constituyen falta de conformidad.",
        ],
      },
      {
        heading: "Garantía del fabricante",
        blocks: [
          "Muchos fabricantes ofrecen además una garantía comercial. Sus condiciones las fija el fabricante y se enlazan en la ficha de producto cuando están disponibles. La garantía del fabricante se suma a tus derechos de garantía legal y no los limita.",
        ],
      },
      {
        heading: "Cómo presentar una reclamación",
        blocks: [`Escribe a ${COMPANY.email} con tu número de pedido, fotos y una breve descripción (en neumáticos, incluye el código DOT del flanco). Respondemos en 2 días laborables.`],
      },
    ],
  },

  payments: {
    title: "Métodos de pago",
    description: `Paga con ${payments.join(", ")}. Precios en EUR, IVA incluido.`,
    intro: "Todos los precios de la tienda UE están en euros (EUR) e incluyen el IVA.",
    sections: [
      { heading: "Métodos aceptados", blocks: [{ list: payments }] },
      {
        heading: "Cuándo se realiza el cargo",
        blocks: [
          "Los pagos con tarjeta y PayPal se autorizan al realizar el pedido y se cobran en el momento del envío. Con transferencia SEPA, el pedido se envía una vez recibido el pago; los datos bancarios figuran en la confirmación del pedido.",
        ],
      },
      {
        heading: "Seguridad",
        blocks: ["Los pagos con tarjeta utilizan la autenticación reforzada de cliente (3-D Secure) exigida por la Directiva de servicios de pago de la UE. No guardamos números de tarjeta completos."],
      },
      { heading: "Sin recargos", blocks: ["No cobramos ninguna comisión por ningún método de pago."] },
      { heading: "IVA", blocks: [`El IVA está incluido en todos los precios y se recauda a través de la ventanilla única de la UE (OSS), número de identificación ${EU_PRESENCE.vatNumber}. Recibirás una factura con IVA por correo electrónico.`] },
    ],
  },

  terms: {
    title: "Condiciones generales",
    description: `Condiciones generales de compra en la tienda UE de ${COMPANY.tradingName}.`,
    intro: `Estas condiciones se aplican a los contratos celebrados a través de la tienda UE de ${COMPANY.tradingName} entre tú y ${COMPANY.legalName}, ${companyAddressLine} («nosotros»).`,
    sections: [
      { heading: "Vendedor", blocks: [seller, `IVA UE (OSS): ${EU_PRESENCE.vatNumber}`] },
      {
        heading: "Celebración del contrato",
        blocks: [
          "Las fichas de producto constituyen una invitación a realizar un pedido. Al hacer clic en «Pedido con obligación de pago» realizas una oferta vinculante. Confirmamos la recepción de inmediato por correo; esta confirmación aún no supone aceptación. El contrato se celebra cuando enviamos la confirmación de envío o, a más tardar, con la entrega de los bienes.",
          "El idioma del contrato es el de la versión de la tienda en la que realizas el pedido (español, inglés, alemán, francés, italiano o neerlandés). Conservamos el texto del contrato y te enviamos por correo los datos del pedido y estas condiciones.",
        ],
      },
      {
        heading: "Precios",
        blocks: ["Todos los precios están en EUR e incluyen el IVA. Los posibles gastos de entrega se muestran antes del pedido."],
      },
      { heading: "Entrega", blocks: ["Las condiciones de entrega se describen en Condiciones de entrega."] },
      { heading: "Derecho de desistimiento", blocks: [`Los consumidores tienen un derecho de desistimiento de ${r.windowDays} días, descrito en Derecho de desistimiento y devoluciones.`] },
      { heading: "Garantía legal", blocks: ["Se aplica la garantía legal de conformidad, descrita en Garantía legal y garantía comercial."] },
      {
        heading: "Compatibilidad y montaje",
        blocks: [
          "Comprueba que la medida, el índice de carga, el código de velocidad, la distancia entre tornillos, el bombeo y la compatibilidad de los frenos coinciden con la documentación de tu vehículo o con su certificado de conformidad. Según el país, algunas llantas y componentes de freno requieren homologación o una anotación en la documentación. Recomendamos el montaje por un profesional cualificado.",
        ],
      },
      {
        heading: "Responsabilidad",
        blocks: [
          "Respondemos sin limitación en caso de dolo y culpa grave, así como por daños a la vida, la integridad física o la salud. La responsabilidad por productos defectuosos y la garantía legal no se ven afectadas. En lo demás, nuestra responsabilidad por culpa leve se limita al daño previsible y típico del contrato.",
        ],
      },
      {
        heading: "Ley aplicable",
        blocks: [
          `Estas condiciones se rigen por la legislación del Estado de ${COMPANY.stateOfFormation}, Estados Unidos. Si eres consumidor, esta elección de ley no te priva de la protección de las disposiciones imperativas de la ley del país en el que tengas tu residencia habitual. También puedes acudir a los tribunales de tu país de residencia.`,
        ],
      },
      {
        heading: "Resolución de litigios",
        blocks: ["Contacta primero con nosotros: la mayoría de las incidencias se resuelven en pocos días. No estamos obligados a participar, ni participamos, en procedimientos de resolución de litigios ante una entidad de arbitraje de consumo."],
      },
    ],
  },

  privacy: {
    title: "Política de privacidad",
    description: "Cómo tratamos los datos personales de visitantes y clientes en la UE (RGPD).",
    intro: "Esta política explica cómo tratamos tus datos personales conforme al Reglamento General de Protección de Datos (UE) 2016/679 (RGPD) cuando utilizas la tienda UE.",
    sections: [
      {
        heading: "Responsable del tratamiento y representante en la UE",
        blocks: [
          {
            rows: [
              ["Responsable del tratamiento", `${COMPANY.legalName}, ${companyAddressLine}`],
              ["Contacto", COMPANY.privacyEmail],
              ["Representante en la UE (art. 27 RGPD)", `${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}, ${EU_PRESENCE.gdprRepresentative.email}`],
            ],
          },
        ],
      },
      {
        heading: "Datos tratados, finalidades y bases jurídicas",
        blocks: [
          {
            rows: [
              ["Datos de pedido y entrega (nombre, dirección, correo, teléfono, contenido del pedido)", "Ejecución del contrato — art. 6.1.b)"],
              ["Facturas y registros contables", "Obligación legal (normativa fiscal) — art. 6.1.c)"],
              ["Prevención del fraude y seguridad informática, registros del servidor", "Interés legítimo — art. 6.1.f)"],
              ["Mensajes al servicio de atención al cliente", "Contrato o interés legítimo — art. 6.1.b)/f)"],
              ["Cookies de análisis y publicidad", "Consentimiento — art. 6.1.a)"],
            ],
          },
        ],
      },
      {
        heading: "Destinatarios",
        blocks: [
          "Proveedores de pago, transportistas y nuestro almacén en la UE, proveedores de alojamiento y correo electrónico y — solo con tu consentimiento — Google para análisis y publicidad. Los encargados del tratamiento actúan según nuestras instrucciones en virtud de contratos de encargo del tratamiento.",
        ],
      },
      {
        heading: "Transferencias internacionales",
        blocks: [
          "Somos una empresa estadounidense, por lo que tus datos se transfieren a Estados Unidos. Las transferencias se basan en el Marco de Privacidad de Datos UE-EE. UU. cuando el destinatario está certificado y, en otro caso, en las cláusulas contractuales tipo de la Comisión Europea (art. 46.2.c) RGPD). Puedes solicitarnos una copia de las garantías.",
        ],
      },
      {
        heading: "Conservación",
        blocks: [
          "Los datos de pedidos y facturas se conservan durante el plazo exigido por la normativa fiscal y mercantil aplicable (hasta 10 años). Los mensajes al servicio de atención al cliente se eliminan 3 años después del último contacto. Los registros de consentimiento se conservan mientras el consentimiento sea válido más el plazo de prescripción.",
        ],
      },
      {
        heading: "Tus derechos",
        blocks: [
          {
            list: [
              "Acceso (art. 15) y rectificación (art. 16)",
              "Supresión (art. 17) y limitación del tratamiento (art. 18)",
              "Portabilidad de los datos (art. 20)",
              "Oposición al tratamiento basado en el interés legítimo (art. 21)",
              "Retirada del consentimiento en cualquier momento, con efectos para el futuro (art. 7.3) — en Configuración de cookies, al pie de la página",
            ],
          },
          `Contacta con ${COMPANY.privacyEmail} o con nuestro representante en la UE. También tienes derecho a presentar una reclamación ante una autoridad de control de protección de datos, en particular en el Estado miembro de tu residencia.`,
        ],
      },
      { heading: "Decisiones automatizadas", blocks: ["No tomamos decisiones basadas únicamente en el tratamiento automatizado que produzcan efectos jurídicos sobre ti o te afecten significativamente de modo similar."] },
      { heading: "Cambios", blocks: ["Publicaremos cualquier cambio en esta página con una nueva fecha de entrada en vigor."] },
    ],
  },

  cookies: {
    title: "Política de cookies",
    description: "Qué cookies y tecnologías similares utiliza la tienda UE y cómo gestionar el consentimiento.",
    intro: "Hasta que des tu consentimiento solo instalamos cookies estrictamente necesarias. Puedes cambiar tu elección en cualquier momento en Configuración de cookies, al pie de la página.",
    sections: [
      {
        heading: "Estrictamente necesarias (sin consentimiento)",
        blocks: [
          {
            rows: [
              ["cp_market", "Recuerda la región de tienda elegida — 12 meses"],
              ["cp_geo", "Región de tienda sugerida según tu país — 12 meses"],
              ["cp_lang", "Recuerda el idioma elegido — 12 meses"],
              ["cp-cart-eu-v1 (almacenamiento local)", "Conserva el contenido de tu cesta — hasta que se borre"],
              ["cp-consent-v1 (almacenamiento local)", `Guarda tu elección sobre cookies — ${Math.round(CONSENT_MAX_AGE_DAYS / 30.4)} meses`],
            ],
          },
        ],
      },
      {
        heading: "Análisis (requiere consentimiento)",
        blocks: [{ rows: [["_ga, _ga_<id> (Google Analytics)", "Distingue visitas para elaborar estadísticas agregadas — 14 meses"]] }],
      },
      {
        heading: "Publicidad (requiere consentimiento)",
        blocks: [{ rows: [["_gcl_au, _gcl_aw (Google Ads)", "Mide las conversiones de anuncios — 90 días"]] }],
      },
      {
        heading: "Google Consent Mode",
        blocks: [
          "Utilizamos Google Consent Mode v2. Hasta que des tu consentimiento, el almacenamiento para análisis y publicidad está denegado y no se instalan cookies de análisis ni de publicidad. Tu consentimiento se vuelve a solicitar cuando caduca.",
        ],
      },
    ],
  },

  "legal-notice": {
    title: "Aviso legal",
    description: "Información sobre el titular de la tienda.",
    intro: `La tienda UE de ${COMPANY.tradingName} está gestionada por:`,
    sections: [
      {
        heading: "Titular",
        blocks: [
          {
            rows: [
              ["Empresa", COMPANY.legalName],
              ["Forma jurídica", `Limited liability company constituida conforme a la legislación de ${COMPANY.stateOfFormation}, EE. UU.`],
              ["Registro", `${COMPANY.stateOfFormation} Secretary of State, n.º ${COMPANY.registrationNumber}`],
              ["Domicilio", companyAddressLine],
              ["Representada por", "[Nombre del managing member / manager]"],
              ["Correo electrónico", COMPANY.email],
              ["Teléfono", COMPANY.phoneDisplay],
              ["IVA UE (OSS)", EU_PRESENCE.vatNumber],
              ["EIN (EE. UU.)", COMPANY.ein],
            ],
          },
        ],
      },
      {
        heading: "Representante en la UE",
        blocks: [`${EU_PRESENCE.gdprRepresentative.name}, ${EU_PRESENCE.gdprRepresentative.address}`],
      },
      {
        heading: "Responsable de los contenidos",
        blocks: ["[Nombre], domicilio indicado arriba."],
      },
    ],
  },
}
