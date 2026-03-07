import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { ScenarioRunner } from "@/components/scenario-runner";
import { requireSession } from "@/lib/auth";
import { getOptionsByScenarioId, getScenarioById, getUserByIdResolved } from "@/lib/data/store";

export const dynamic = "force-dynamic";

export default async function SimulationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(["EMPLOYEE"]);
  const { id } = await params;
  const user = await getUserByIdResolved(session.userId);
  const scenario = getScenarioById(id);
  if (!user || !scenario) {
    notFound();
  }

  return (
    <AppShell role={session.role} name={user.name}>
      <section className="sa-card mb-4 p-5">
        <h1 className="text-3xl font-bold">Р’СЂРµРјРµРІР° СЃРёРјСѓР»Р°С†РёСЏ</h1>
        <p className="mt-2 text-zinc-700">
          РўРѕРІР° Рµ РґРѕРїСЉР»РЅРёС‚РµР»РЅР° СЃРёРјСѓР»Р°С†РёСЏ РїРѕРґ РЅР°С‚РёСЃРє Рё Рµ РѕС‚РґРµР»РЅР° РѕС‚ РѕСЃРЅРѕРІРЅРёСЏ СѓС‡РµР±РµРЅ С‚РµСЃС‚.
        </p>
      </section>
      <ScenarioRunner scenario={scenario} options={getOptionsByScenarioId(scenario.id)} timed />
    </AppShell>
  );
}

