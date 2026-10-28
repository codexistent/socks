'use client';
import { useEffect, useRef } from "react";

const useTradingViewWidget = (scriptUrl: string, config: Record<string, unknown>, height = 600) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const configJson = JSON.stringify(config);

    useEffect(() => {
        const container = containerRef.current;
        if(!container) return;

        const mount = () => {
            if(container.dataset.loaded) return;
            container.innerHTML = `<div class="tradingview-widget-container__widget" style="width: 100%; height: ${height}px;"></div>`;

            const script = document.createElement('script');
            script.src = scriptUrl;
            script.async = true;
            script.innerHTML = configJson;

            container.appendChild(script);
            container.dataset.loaded = 'true';
        };

        if(!('IntersectionObserver' in window)){
            mount();
        }else{
            const observer = new IntersectionObserver((entries) => {
                if(entries.some((e) => e.isIntersecting)) {
                    observer.disconnect();
                    mount();
                }
            }, { rootMargin: '200px' });
            observer.observe(container);

            return () => {
                observer.disconnect();
                container.innerHTML = '';
                delete container.dataset.loaded;
            };
        }

        return () => {
            container.innerHTML = '';
            delete container.dataset.loaded;
        };
    }, [scriptUrl, configJson, height]);

    return containerRef;
}
export default useTradingViewWidget
