import {SYNC_KINDS, syncBatch, type SyncKind} from "@/lib/screener/sync";
import {inngest} from "@/lib/inngest/client";
import {UNIVERSE_SYMBOLS} from "@/lib/screener/universe";

const BATCH_SIZE = 10;
const BATCHES_PER_MINUTE = 4;

const SCHEDULES: Record<SyncKind, string> = {
    profiles: 'TZ=America/New_York 0 5 * * 0',
    metrics: 'TZ=America/New_York 0 6 * * 2-6',
    quotes: 'TZ=America/New_York */30 9-16 * * 1-5',
};

const chunk = <T>(list: readonly T[], size: number) =>
    Array.from({ length: Math.ceil(list.length/size)}, (_, i) => list.slice(i*size, (i+1)*size));

const scheduler = (kind: SyncKind) =>
    inngest.createFunction(
        {
            id: `screener-schedule-${kind}`,
            triggers: [
                { cron: SCHEDULES[kind] },
                { event: 'screener/sync.requested', if: `event.data.kind == '${kind}' || event.data.kind == 'all'` },
            ],
        },
        async ({ step }) => {
            const batches = chunk(UNIVERSE_SYMBOLS, BATCH_SIZE);
            await step.sendEvent('fan-out', batches.map((symbols) => ({ name: 'screener/batch.sync', data: { kind, symbols }})));
            return { kind, batches: batches.length };
        }
    );

export const screenerSyncBatch = inngest.createFunction(
    {
        id: 'screener-sync-batch',
        throttle: { limit: BATCHES_PER_MINUTE, period: '1m' },
        retries: 4,
        triggers: [{ event: 'screener/batch.sync' }],
    },
    async ({ event, step }) => {
        const { kind, symbols } = event.data as {kind: SyncKind; symbols: string[] };
        if(!SYNC_KINDS.includes(kind) || !Array.isArray(symbols)) throw new Error('Invalid screener/batch.sync event');

        return step.run('sync', () => syncBatch(kind, symbols));
    }
);

export const screenerFunctions = [...SYNC_KINDS.map(scheduler), screenerSyncBatch];