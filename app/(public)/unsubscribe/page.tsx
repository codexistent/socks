import {updateNewsSubscription} from "@/lib/actions/unsubscribe.actions";
import {Button} from "@base-ui/react";
import {getNewsUnsubscribed, verifyUnsubscribeToken} from "@/lib/unsubscribe";

const UnsubscribePage = async ({ searchParams }: { searchParams: Promise<{ u?: string; t?: string }> } ) => {
    const { u = '', t = '' } = await searchParams;

    const valid = verifyUnsubscribeToken(u, t);
    const unsubscribed = valid ? await getNewsUnsubscribed(u) : null;

    if(unsubscribed === null){
        return (
            <>
                <h1 className="form-title">Link not valid</h1>
                <p className="text-gray-400">
                    This unsubscribe link is invalid or its account no longer exists.
                    Use the link from your most recent Socks email.
                </p>
            </>
        );
    }

    const unsubscribe = updateNewsSubscription.bind(null, u, t, true);
    const resubscribe = updateNewsSubscription.bind(null, u, t, false);

    return unsubscribed ? (
        <>
            <h1 className="form-title">You&apos;re unsubscribed</h1>
            <p className="text-gray-400 mb-8">
                You won&apos;t receive the daily market news email anymore.
            </p>
            <form action={resubscribe}>
                <Button type="submit" className="yellow-btn w-full">Resubscribe</Button>
            </form>
        </>
    ) : (
        <>
            <h1 className="form-title">Unsubscribe from daily news?</h1>
            <p className="text-gray-400 mb-8">
                You&apos;ll stop receiving the daily market news summary. Your account and watchlist stay as they are.
            </p>
            <form action={unsubscribe}>
                <Button type="submit" className="yellow-btn w-full">Unsubscribe</Button>
            </form>
        </>
    );
};

export default UnsubscribePage;