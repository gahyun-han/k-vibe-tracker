'use client';

import { useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/common/Toast';
import AppLayout from '@/components/layout/AppLayout';
import { KContentPersonaSelector } from '@/components/persona/KContentPersonaSelector';
import { PersonaRoutePreview } from '@/components/persona/PersonaRoutePreview';
import {
  CURRENT_ROUTE_STORAGE_KEY,
  buildKContentRoutePlan,
  getKContentPersonas,
  type RoutePlan,
} from '@/lib/domain';
import { getUiCopy, normalizeUiLocale } from '@/lib/i18n';

export default function PersonaPage() {
  const router = useRouter();
  const params = useParams();
  const locale = normalizeUiLocale(params['locale'] as string);
  const uiCopy = getUiCopy(locale);
  const copy = uiCopy.persona;
  const { toast } = useToast();
  const [error, setError] = useState('');
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [shareStatus, setShareStatus] = useState('');

  const kContentPersonas = useMemo(() => getKContentPersonas(), []);

  function generateKContentRoute(personaId: string) {
    setError('');
    setShareStatus('');
    const kPlan = buildKContentRoutePlan({ personaId, locale });
    if (!kPlan) {
      setError('ROUTE_GENERATION_FAILED');
      return;
    }
    setPlan(kPlan);
    setShareStatus(copy.routeGenerated);
    toast(copy.routeGenerated, 'success');
  }

  function reset() {
    setPlan(null);
    setError('');
    setShareStatus('');
  }

  function saveAndEditRoute() {
    if (!plan) return;
    try {
      window.localStorage.setItem(CURRENT_ROUTE_STORAGE_KEY, JSON.stringify(plan));
      toast(copy.routeSaved, 'success');
      router.push(`/${locale}/route`);
    } catch {
      setShareStatus(copy.routeSaveUnavailable);
      toast(copy.routeSaveUnavailable, 'error');
    }
  }

  async function shareRoute() {
    if (!plan) return;

    try {
      if (navigator.share) {
        await navigator.share({ title: plan.title, text: plan.shareText, url: window.location.href });
        setShareStatus(copy.shared);
        toast(copy.shared, 'success');
        return;
      }

      await navigator.clipboard.writeText(plan.shareText);
      setShareStatus(copy.copied);
      toast(copy.copied, 'success');
    } catch {
      setShareStatus(copy.shareUnavailable);
      toast(copy.shareUnavailable, 'error');
    }
  }

  if (plan) {
    return (
      <AppLayout activeTab="route">
        <PersonaRoutePreview
          plan={plan}
          copy={copy}
          routeCopy={uiCopy.route}
          shareStatus={shareStatus}
          onReset={reset}
          onSaveAndEditRoute={saveAndEditRoute}
          onShareRoute={shareRoute}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout activeTab="route">
      <div className="flex h-full flex-col bg-[#0D0D1A] pb-24">
        <div className="px-4 pt-4">
          <p className="text-xs font-semibold text-[#FF3A5C]">{copy.generatorEyebrow}</p>
          <h2 className="mt-1 text-lg font-bold text-white">{copy.title}</h2>
          <p className="mt-1 text-xs leading-5 text-white/45">
            {copy.subtitle}
          </p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pt-4">
          <KContentPersonaSelector
            personas={kContentPersonas}
            locale={locale}
            copy={copy}
            onSelectPersona={generateKContentRoute}
          />
        </div>

        {error && (
          <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-xs text-red-200">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
