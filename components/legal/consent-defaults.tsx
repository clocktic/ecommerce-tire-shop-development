import Script from "next/script"
import type { Market } from "@/lib/markets"
import { CONSENT_STORAGE_KEY } from "@/components/legal/consent"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

// Google Consent Mode v2 defaults, set before any Google tag loads.
// EU: everything denied until the visitor opts in (GDPR / ePrivacy).
// US: granted by default (opt-out model), but a Global Privacy Control signal
// or a saved opt-out denies ad storage and ad personalisation (CCPA/CPRA).
export function ConsentDefaults({ market }: { market: Market }) {
  const script = `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;
(function(){var eu=${market === "eu"};var gpc=navigator.globalPrivacyControl===true;var s=null;
try{s=JSON.parse(localStorage.getItem('${CONSENT_STORAGE_KEY}')||'null')}catch(e){}
if(s&&s.market!=='${market}')s=null;
var a=s?!!s.analytics:!eu;var ad=s?!!s.ads:(!eu&&!gpc);if(gpc)ad=false;
var g=function(v){return v?'granted':'denied'};
gtag('consent','default',{analytics_storage:g(a),ad_storage:g(ad),ad_user_data:g(ad),ad_personalization:g(ad),functionality_storage:'granted',security_storage:'granted',wait_for_update:500});
gtag('set','ads_data_redaction',!ad);gtag('set','url_passthrough',false);})();`

  return (
    <>
      <Script id="consent-defaults" strategy="beforeInteractive">
        {script}
      </Script>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="gtag-config" strategy="afterInteractive">
            {`gtag('js', new Date()); gtag('config', '${GA_ID}');`}
          </Script>
        </>
      )}
    </>
  )
}
