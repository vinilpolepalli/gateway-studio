import Studio from '@/components/Studio';
import { loadTraffic, loadOwnerTraffic, getAssumptions, getCandidateStates, seedNote } from '@/lib/repo';
import { ownerId } from '@/lib/http';
import { DEFAULT_ASSUMPTIONS } from '@/lib/validate';
import { clusterTraffic, evaluateCluster, monthlyCost, ROLLOUT } from '@/lib/engine';
import { money } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const owner = await ownerId();
  const seeded = await loadTraffic();
  const mine = await loadOwnerTraffic(owner);
  const assumptions = (await getAssumptions(owner)) ?? DEFAULT_ASSUMPTIONS;
  const states = await getCandidateStates(owner);
  const note = await seedNote();
  const clusters = [...clusterTraffic([...seeded, ...mine])].map(([task, entries]) => evaluateCluster(task, entries, assumptions))
    .sort((a, b) => b.savingsMonthlyUsd - a.savingsMonthlyUsd);
  const totalMonthly = [...seeded, ...mine].reduce((s, e) => s + monthlyCost(e), 0);
  return (
    <main>
      <div className="mt-6 max-w-3xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">Your gateway traffic is a training set. This desk prices the model you could own.</h1>
        <p className="mt-2 text-sm text-mute">
          Current spend across the sample workload is {money(totalMonthly)}/month at frontier pricing. The desk clusters traffic by task,
          scores repeatability, and estimates what an owned small model would cost to train and run, under assumptions you control.
          All figures are estimates. {note}
        </p>
      </div>
      <Studio seeded={seeded} mine={mine} clusters={clusters} initialAssumptions={assumptions} states={states} rollout={ROLLOUT} />
    </main>
  );
}
