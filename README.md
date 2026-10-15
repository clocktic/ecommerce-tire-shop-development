# Contact Patch — магазин шин, дисков и тормозов (US + EU)

> «Contact Patch» — рабочее название. Меняется в одном месте: `lib/company.ts` → `tradingName`.

Интернет-магазин американской компании для двух рынков: **США** (`/us`, USD) и **Европа** (`/eu`, EUR с НДС). У каждого рынка свои цены, свой ассортимент, свои политики и свой товарный фид для Google Merchant Center.

Архитектура повторяет проект 3DJools, который прошёл проверки Google Merchant Center, Google Ads и Google Business Profile.

Журнал всех изменений и примечаний — [`docs/ARCHIVE.md`](docs/ARCHIVE.md).

---

## Стек

- Next.js 16 (App Router, `proxy.ts`), React 19, TypeScript
- Tailwind CSS v4, shadcn/ui
- Шрифты: Archivo (заголовки, ширина 125% через `font-expanded`) + JetBrains Mono (маркировки, цифры)
- Каталог пока лежит в коде (`lib/catalog/data.ts`); база данных (Neon) — следующий шаг

## Как посетитель попадает в свой магазин

`proxy.ts` перенаправляет **только адреса без префикса** (`/`, `/tires` и т.п.):

1. Cookie `cp_market` — если посетитель сам выбрал магазин переключателем US/EU, это главнее всего.
2. Страна из заголовка `x-vercel-ip-country`: США и территории → `/us`; ЕС-27 и остальная Европа (UK, CH, NO и др.) → `/eu`.
3. Всё остальное → `/us`.

Адреса с `/us/...` и `/eu/...` **никогда не перенаправляются** — Googlebot ходит из США и должен видеть оба магазина.

Если посетитель из США открыл EU-магазин (или наоборот), сверху показывается плашка с предложением перейти (`components/layout/geo-banner.tsx`). Корзины раздельные: `cp-cart-us-v1` и `cp-cart-eu-v1`.

SEO: hreflang `en-US` для `/us`, `en-<страна ЕС>` для `/eu`, `x-default` — корень.

## Где что лежит

| Что | Файл |
| --- | --- |
| Реквизиты компании (единственный источник) | `lib/company.ts` |
| Цифры доставки, возврата, сроков (единственный источник) | `lib/policies.ts` |
| Настройки рынков (валюта, страны, hreflang) | `lib/markets.ts` |
| Гео-редирект | `proxy.ts` |
| Тексты политик США | `lib/legal/us.ts` |
| Тексты политик ЕС | `lib/legal/eu.ts` |
| Список политик для меню и футера | `lib/legal/pages.ts` |
| FAQ по рынкам | `lib/legal/faq.ts` |
| Типы товаров | `lib/catalog/types.ts` |
| Товары (сейчас демо) | `lib/catalog/data.ts` |
| Google-фиды | `lib/feeds/google.ts`, `app/feeds/[file]/route.ts` |
| Разметка schema.org Product | `lib/structured-data.ts` |
| Согласие на cookies (Consent Mode v2) | `components/legal/*` |
| Поиск по размеру шины (главный элемент дизайна) | `components/home/size-finder.tsx` |

## Страницы

- `/[market]` — главная
- `/[market]/tires`, `/wheels`, `/brakes` — каталог с фильтрами
- `/[market]/product/[slug]` — карточка товара
- `/[market]/cart`, `/[market]/checkout` — корзина и оформление
- `/[market]/policies/[slug]` — политики
- `/[market]/faq`, `/contact`, `/about`
- `/feeds/google-us.xml`, `/feeds/google-eu.xml` — фиды
- `/sitemap.xml`, `/robots.txt`

## Политики — отдельно для каждого рынка

**США:** shipping, returns (30 дней), warranty (гарантия производителя, Magnuson-Moss), payments, terms, privacy (CCPA/CPRA, сигнал Global Privacy Control), privacy-choices («Do Not Sell or Share»).

**ЕС:** shipping (с НДС, без пошлин, DDP), returns (14 дней, модельный текст Annex I(A) директивы 2011/83/EU, оценка стоимости возврата крупногабарита), withdrawal-form (Annex I(B)), warranty (2 года, директива 2019/771), payments, terms (кнопка «Order with obligation to pay»), privacy (GDPR, представитель по ст. 27), cookies, legal-notice.

Ссылку на платформу ODR ЕС не ставить — она закрыта 20.07.2025.

Все цифры (стоимость доставки, сроки, окно возврата) берутся **только** из `lib/policies.ts`. Их же читают страницы, JSON-LD и фиды — поэтому они всегда совпадают.

## Товарные фиды

- `/feeds/google-us.xml` — USD, страна США
- `/feeds/google-eu.xml` — EUR с НДС, страны ЕС

В Merchant Center каждый подключается **отдельным источником данных**.

Правила:
- Категории Google: шины `6093`, диски `6090`, тормоза `2977`.
- GTIN и MPN **не выдумывать**. Нет кода → `identifier_exists=no`.
- Шины в EU: EU-этикетка (регламент 2020/740, EPREL). Шины в US: UTQG.
- Товар продаётся на рынке, только если у него есть offer для этого рынка.
- Товар исключается из фида, если: демо (`sample: true`), нет фото, предзаказ без даты, EU-шина без этикетки, неверный GTIN. Логика — `feedExclusion()` в `lib/feeds/google.ts`.

## Согласие на cookies

`components/legal/consent-defaults.tsx` выставляет Google Consent Mode v2 (по умолчанию всё `denied`, для EU плюс `ads_data_redaction`) и **только после этого** подгружает тег Google Analytics — если задан `NEXT_PUBLIC_GA_ID`.

Любые будущие теги (GTM, пиксели) подключать через этот же компонент, а не отдельным `<script>`.

## Переменные окружения

| Переменная | Назначение |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Основной домен (для канонических ссылок, фидов, sitemap) |
| `NEXT_PUBLIC_GA_ID` | ID Google Analytics 4 (необязательно) |

## Что нужно заполнить до подачи в GMC

- [ ] Все значения в `[квадратных скобках]` в `lib/company.ts`: US LLC, штат, номер регистрации, EIN, адрес, телефон, email-домен
- [ ] Представитель в ЕС по GDPR, номер OSS/VAT, адрес возвратов в ЕС, страна склада
- [ ] Подтвердить цифры в `lib/policies.ts` со складом и перевозчиком (сейчас: бесплатная доставка, 4–8 рабочих дней, обратная пересылка ~25 €/$ за шину или диск, 15 €/$ за посылку с тормозами)
- [ ] Окончательное название магазина
- [ ] Реальный каталог вместо 7 демо-товаров
- [ ] Подключить оплату (сейчас кнопка заказа ничего не оформляет)
- [ ] Языки EU-магазина (пока только английский)
