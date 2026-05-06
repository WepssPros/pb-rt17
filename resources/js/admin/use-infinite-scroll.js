import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_BATCH_SIZE = 20;

export function useInfiniteScroll(
    items,
    {
        enabled = true,
        initialCount = DEFAULT_BATCH_SIZE,
        increment = DEFAULT_BATCH_SIZE,
        threshold = 120,
    } = {}
) {
    const containerRef = useRef(null);
    const [visibleCount, setVisibleCount] = useState(initialCount);

    useEffect(() => {
        setVisibleCount(enabled ? initialCount : items.length);
    }, [enabled, initialCount, items]);

    const totalCount = items.length;
    const hasMore = enabled && visibleCount < totalCount;

    const loadMore = useCallback(() => {
        if (!enabled) {
            return;
        }

        setVisibleCount((current) => Math.min(totalCount, current + increment));
    }, [enabled, increment, totalCount]);

    useEffect(() => {
        if (!enabled || !hasMore) {
            return;
        }

        const container = containerRef.current;
        if (!container) {
            return;
        }

        if (container.scrollHeight <= container.clientHeight + threshold) {
            loadMore();
        }
    }, [enabled, hasMore, items, loadMore, threshold, visibleCount]);

    const onScroll = useCallback(
        (event) => {
            if (!enabled || !hasMore) {
                return;
            }

            const target = event.currentTarget;
            if (target.scrollTop + target.clientHeight >= target.scrollHeight - threshold) {
                loadMore();
            }
        },
        [enabled, hasMore, loadMore, threshold]
    );

    const visibleItems = useMemo(
        () => (enabled ? items.slice(0, visibleCount) : items),
        [enabled, items, visibleCount]
    );

    return {
        containerRef,
        hasMore,
        onScroll,
        totalCount,
        visibleCount: enabled ? Math.min(visibleCount, totalCount) : totalCount,
        visibleItems,
    };
}
