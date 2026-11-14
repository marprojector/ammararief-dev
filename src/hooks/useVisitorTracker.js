import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const useVisitorTracker = (pageName) => {
    const location = useLocation();
    const hasTracked = useRef(false);

    useEffect(() => {
        // Prevent double tracking in Strict Mode or re-renders
        if (hasTracked.current) return;

        const track = async () => {
            // Loaded on demand so Firebase stays out of the first download.
            const { trackVisitor } = await import('../services/visitorsService');
            await trackVisitor({
                path: location.pathname,
                page: pageName
            });
            hasTracked.current = true;
        };

        track();
    }, [location.pathname, pageName]);
};

export default useVisitorTracker;
