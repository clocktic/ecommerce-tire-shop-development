"use client"

import { useState, useTransition } from "react"
import {
  CheckCircle2,
  ExternalLink,
  KeyRound,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ShieldAlert,
} from "lucide-react"
import type { GoogleAdsOverview, GoogleAdsSettings } from "@/lib/google-ads"
import {
  createGoogleAdsShoppingCampaignAction,
  saveGoogleAdsConfigAction,
  testGoogleAdsConnectionAction,
  toggleGoogleAdsCampaignStatusAction,
  updateGoogleAdsBudgetAction,
} from "@/lib/actions/google-ads"
import { Button } from "@/components/ui/button"

function formatCustomerId(raw?: string | null): string {
  const digits = (raw ?? "").replace(/[^0-9]/g, "")
  if (digits.length !== 10) return digits
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function GoogleAdsManager({
  settings,
  overview,
  apiError,
  oauthConnected,
  oauthError,
  callbackUrl,
}: {
  settings: GoogleAdsSettings
  overview: GoogleAdsOverview | null
  apiError: string | null
  oauthConnected: boolean
  oauthError: string | null
  callbackUrl: string
}) {
  const [isPending, startTransition] = useTransition()
  const [statusMsg, setStatusMsg] = useState<{ ok: boolean; text: string } | null>(
    oauthConnected
      ? { ok: true, text: "OAuth-авторизация Google Ads успешно сохранена в базу данных." }
      : oauthError
        ? { ok: false, text: `Ошибка OAuth: ${oauthError}` }
        : null,
  )
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null)
  const [budgetDraft, setBudgetDraft] = useState<string>("25")

  function handleSaveConfig(formData: FormData) {
    startTransition(async () => {
      try {
        await saveGoogleAdsConfigAction(formData)
        const test = await testGoogleAdsConnectionAction()
        setStatusMsg({ ok: test.ok, text: test.message })
      } catch (err) {
        setStatusMsg({
          ok: false,
          text: err instanceof Error ? err.message : "Не удалось сохранить настройки",
        })
      }
    })
  }

  function handleTestConnection() {
    startTransition(async () => {
      const res = await testGoogleAdsConnectionAction()
      setStatusMsg({ ok: res.ok, text: res.message })
    })
  }

  function handleToggleCampaign(resourceName: string, currentStatus: string) {
    const nextStatus = currentStatus === "ENABLED" ? "PAUSED" : "ENABLED"
    startTransition(async () => {
      try {
        await toggleGoogleAdsCampaignStatusAction(resourceName, nextStatus)
        setStatusMsg({
          ok: true,
          text: `Статус кампании переключён на ${nextStatus === "ENABLED" ? "Активна" : "На паузе"}`,
        })
      } catch (err) {
        setStatusMsg({
          ok: false,
          text: err instanceof Error ? err.message : "Ошибка изменения статуса кампании",
        })
      }
    })
  }

  function handleUpdateBudget(budgetResourceName: string) {
    const val = Number(budgetDraft)
    if (!Number.isFinite(val) || val <= 0) return
    startTransition(async () => {
      try {
        await updateGoogleAdsBudgetAction(budgetResourceName, val)
        setEditingBudgetId(null)
        setStatusMsg({
          ok: true,
          text: `Дневной бюджет обновлён до $${val.toFixed(2)}/день`,
        })
      } catch (err) {
        setStatusMsg({
          ok: false,
          text: err instanceof Error ? err.message : "Ошибка обновления бюджета",
        })
      }
    })
  }

  function handleCreateShopping(formData: FormData) {
    startTransition(async () => {
      try {
        await createGoogleAdsShoppingCampaignAction(formData)
        setStatusMsg({
          ok: true,
          text: "Торговая кампания Standard Shopping (США · GMC 5900416726) успешно создана!",
        })
      } catch (err) {
        setStatusMsg({
          ok: false,
          text: err instanceof Error ? err.message : "Не удалось создать кампанию",
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-expanded text-2xl font-extrabold uppercase">
            Google Ads · Управление рекламой
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Прямое подключение к Google Ads REST API и связка с Google Merchant Center (ID{" "}
            <span className="font-mono text-foreground">{settings.merchantId}</span>). Все ключи
            хранятся в базе данных, поэтому я (v0) могу напрямую управлять кампаниями.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleTestConnection}
          >
            <RefreshCw className={`size-4 ${isPending ? "animate-spin" : ""}`} aria-hidden="true" />
            Проверить связь
          </Button>
          <a
            href="/api/admin/google-ads/oauth/start"
            className="inline-flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <KeyRound className="size-3.5" aria-hidden="true" />
            {settings.refreshToken ? "Переподключить Google OAuth" : "Авторизовать через Google"}
          </a>
        </div>
      </div>

      {statusMsg && (
        <div
          className={`flex items-start gap-2.5 border p-3.5 text-sm ${
            statusMsg.ok
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          {statusMsg.ok ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Статусные плашки шагов подключения */}
      <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1 bg-card p-4">
          <span className="label-caps text-muted-foreground">1. Google OAuth Client</span>
          <span className="font-mono text-sm font-semibold">
            {settings.hasOAuthClient ? "Подключён (GOOGLE_CLIENT_ID)" : "Не задан"}
          </span>
          <span className="text-xs text-muted-foreground">{settings.clientIdPreview}</span>
        </div>
        <div className="flex flex-col gap-1 bg-card p-4">
          <span className="label-caps text-muted-foreground">2. OAuth Refresh Token</span>
          <span className="font-mono text-sm font-semibold">
            {settings.refreshToken ? "Активен" : "Ожидает авторизации"}
          </span>
          <span className="text-xs text-muted-foreground">
            {settings.connectedEmail || "Нажмите «Авторизовать через Google»"}
          </span>
        </div>
        <div className="flex flex-col gap-1 bg-card p-4">
          <span className="label-caps text-muted-foreground">3. Developer Token (MCC)</span>
          <span className="font-mono text-sm font-semibold">
            {settings.developerToken
              ? `${settings.developerToken.slice(0, 6)}••••••`
              : "Не указан"}
          </span>
          <span className="text-xs text-muted-foreground">Из MCC → Центр API</span>
        </div>
        <div className="flex flex-col gap-1 bg-card p-4">
          <span className="label-caps text-muted-foreground">4. Аккаунт Google Ads</span>
          <span className="font-mono text-sm font-semibold">
            {settings.customerId ? formatCustomerId(settings.customerId) : "Не указан"}
          </span>
          <span className="text-xs text-muted-foreground">
            GMC ID: {settings.merchantId}
          </span>
        </div>
      </div>

      {/* Форма параметров подключения */}
      <div className="grid gap-6 lg:grid-cols-12">
        <form
          action={handleSaveConfig}
          className="flex flex-col gap-4 border border-border bg-card p-5 lg:col-span-7"
        >
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="font-expanded text-base font-bold uppercase">
                Настройки подключения Google Ads API
              </h2>
              <p className="text-xs text-muted-foreground">
                Заполните поля один раз — они сохранятся в базе данных и будут доступны мне в v0.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs font-medium">
              <span>Customer ID рекламного аккаунта (10 цифр) *</span>
              <input
                name="customerId"
                defaultValue={formatCustomerId(settings.customerId)}
                placeholder="123-456-7890"
                className="h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium">
              <span>MCC Login Customer ID (10 цифр управляющего MCC)</span>
              <input
                name="loginCustomerId"
                defaultValue={formatCustomerId(settings.loginCustomerId)}
                placeholder="987-654-3210"
                className="h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium">
              <span>Developer Token (из MCC → API Center) *</span>
              <input
                name="developerToken"
                type="password"
                defaultValue={settings.developerToken}
                placeholder="22-символьный токен разработчика"
                className="h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-medium">
              <span>Google Merchant Center ID</span>
              <input
                name="merchantId"
                defaultValue={settings.merchantId}
                placeholder="5900416726"
                className="h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-medium">
            <span>
              OAuth Refresh Token{" "}
              <span className="font-normal text-muted-foreground">
                (заполняется автоматически кнопкой «Авторизовать через Google» или вручную из OAuth
                Playground)
              </span>
            </span>
            <input
              name="refreshToken"
              type="password"
              defaultValue={settings.refreshToken}
              placeholder="1//0..."
              className="h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs text-muted-foreground">
              Redirect URI для Google Cloud Console:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                {callbackUrl}
              </code>
            </span>
            <Button type="submit" size="sm" disabled={isPending}>
              Сохранить и проверить
            </Button>
          </div>
        </form>

        {/* Быстрое создание Standard Shopping кампании */}
        <form
          action={handleCreateShopping}
          className="flex flex-col justify-between gap-4 border border-border bg-card p-5 lg:col-span-5"
        >
          <div className="flex flex-col gap-3">
            <div className="border-b border-border pb-3">
              <h2 className="font-expanded text-base font-bold uppercase">
                Быстрый запуск Standard Shopping (США)
              </h2>
              <p className="text-xs text-muted-foreground">
                Создаёт готовую торговую кампанию для США, привязанную к вашему фиду GMC{" "}
                <span className="font-mono text-foreground">{settings.merchantId}</span>.
              </p>
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-medium">
              <span>Название кампании</span>
              <input
                name="name"
                defaultValue="TiresShop · US Standard Shopping"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5 text-xs font-medium">
                <span>Дневной бюджет ($/день)</span>
                <input
                  name="dailyBudgetDollars"
                  type="number"
                  step="1"
                  min="5"
                  defaultValue="25"
                  className="h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-medium">
                <span>Макс. ставка CPC ($)</span>
                <input
                  name="cpcBidDollars"
                  type="number"
                  step="0.05"
                  min="0.10"
                  defaultValue="0.85"
                  className="h-9 rounded-md border border-input bg-background px-3 font-mono text-sm"
                />
              </label>
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" name="startPaused" className="size-4 accent-primary" />
              Создать в статусе «На паузе» (включить вручную после проверки)
            </label>
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isPending || !settings.isReady}
            className="w-full"
          >
            <Plus className="size-4" aria-hidden="true" />
            Создать Shopping-кампанию в Google Ads
          </Button>
        </form>
      </div>

      {/* Инструкция на 3 шага */}
      <div className="border border-border bg-card p-5">
        <h2 className="font-expanded text-sm font-bold uppercase">
          Пошаговая памятка (если ещё не получили Developer Token или Refresh Token)
        </h2>
        <ol className="mt-3 grid gap-4 text-xs text-muted-foreground md:grid-cols-3">
          <li className="flex flex-col gap-1.5 border border-border/70 bg-background/50 p-3.5">
            <span className="font-semibold text-foreground">
              Шаг 1. Включите API и добавьте Redirect URI
            </span>
            <span>
              В Google Cloud Console включите <strong>Google Ads API</strong>, а в{" "}
              <em>Credentials → OAuth 2.0 Client ID</em> добавьте в Authorized redirect URIs:{" "}
              <code className="break-all font-mono text-foreground">{callbackUrl}</code> (либо{" "}
              <code className="font-mono text-foreground">
                https://developers.google.com/oauthplayground
              </code>
              ).
            </span>
            <a
              href="https://console.cloud.google.com/apis/library/googleads.googleapis.com"
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Открыть Google Ads API в Cloud Console <ExternalLink className="size-3" />
            </a>
          </li>

          <li className="flex flex-col gap-1.5 border border-border/70 bg-background/50 p-3.5">
            <span className="font-semibold text-foreground">
              Шаг 2. Скопируйте Developer Token из MCC
            </span>
            <span>
              Зайдите в ваш управляющий аккаунт <strong>Google Ads (MCC)</strong> →{" "}
              <strong>Администратор → Центр API (API Center)</strong>. Скопируйте 22-значный{" "}
              <em>Developer Token</em>, а также 10-значный ID управляющего аккаунта (MCC) и
              рекламного аккаунта.
            </span>
            <a
              href="https://ads.google.com/aw/apicenter"
              target="_blank"
              rel="noreferrer"
              className="mt-auto inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Открыть API Center в Google Ads <ExternalLink className="size-3" />
            </a>
          </li>

          <li className="flex flex-col gap-1.5 border border-border/70 bg-background/50 p-3.5">
            <span className="font-semibold text-foreground">
              Шаг 3. Сохраните поля и нажмите «Авторизовать»
            </span>
            <span>
              Вставьте <em>Customer ID</em> и <em>Developer Token</em> в форму выше → нажмите{" "}
              <strong>«Сохранить и проверить»</strong> → нажмите синюю кнопку{" "}
              <strong>«Авторизовать через Google»</strong> в правом верхнем углу.
            </span>
          </li>
        </ol>
      </div>

      {/* Таблица кампаний */}
      <div className="border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-expanded text-base font-bold uppercase">
              Кампании в аккаунте{" "}
              {overview ? `· ${overview.accountName} (${overview.customerId})` : ""}
            </h2>
            {overview && (
              <p className="text-xs text-muted-foreground">
                Валюта: {overview.currencyCode} · Часовой пояс: {overview.timeZone}
              </p>
            )}
          </div>
        </div>

        {apiError && (
          <div className="p-5 text-sm text-destructive">
            Ответ Google Ads API: <span className="font-mono">{apiError}</span>
          </div>
        )}

        {!overview && !apiError && (
          <div className="p-6 text-sm text-muted-foreground">
            Заполните <strong>Customer ID</strong>, <strong>Developer Token</strong> и авторизуйте{" "}
            <strong>Google OAuth</strong> выше, чтобы загрузить живой список кампаний.
          </div>
        )}

        {overview && overview.campaigns.length === 0 && (
          <div className="p-6 text-sm text-muted-foreground">
            Аккаунт успешно подключён, но в нём пока нет активных или приостановленных кампаний.
            Используйте блок <strong>«Быстрый запуск Standard Shopping (США)»</strong> справа, чтобы
            создать первую кампанию!
          </div>
        )}

        {overview && overview.campaigns.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Кампания</th>
                  <th className="px-4 py-3">Тип</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Бюджет / день</th>
                  <th className="px-4 py-3 text-right">Показы</th>
                  <th className="px-4 py-3 text-right">Клики</th>
                  <th className="px-4 py-3 text-right">Расход</th>
                  <th className="px-4 py-3 text-right">Конверсии</th>
                  <th className="px-4 py-3 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {overview.campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/20">
                    <td className="px-4 py-3 font-medium">
                      <div>{c.name}</div>
                      <div className="font-mono text-xs text-muted-foreground">ID: {c.id}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{c.channelType}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 font-mono text-xs font-semibold ${
                          c.status === "ENABLED"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {c.status === "ENABLED" ? "Активна" : "На паузе"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {editingBudgetId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            value={budgetDraft}
                            onChange={(e) => setBudgetDraft(e.target.value)}
                            className="h-7 w-20 rounded border border-input bg-background px-2 font-mono text-xs"
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            disabled={isPending}
                            onClick={() => handleUpdateBudget(c.budgetResourceName)}
                          >
                            ОК
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBudgetId(c.id)
                            setBudgetDraft((c.dailyBudgetCents / 100).toFixed(0))
                          }}
                          className="underline decoration-dotted underline-offset-4 hover:text-primary"
                        >
                          ${(c.dailyBudgetCents / 100).toFixed(2)}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {c.impressions.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {c.clicks.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      ${(c.costCents / 100).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      {c.conversions.toFixed(1)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleToggleCampaign(c.resourceName, c.status)}
                      >
                        {c.status === "ENABLED" ? (
                          <>
                            <Pause className="size-3.5" aria-hidden="true" /> Пауза
                          </>
                        ) : (
                          <>
                            <Play className="size-3.5" aria-hidden="true" /> Включить
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
