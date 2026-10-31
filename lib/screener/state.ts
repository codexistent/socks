export type ScreenerState = {
    view: string;
    sort?: string;
    page: number;
    q?: string;
};

export const DEFAULT_VIEW = 'overview';
export const PAGE_SIZE = 20;

export const toSearch = ({ view, sort, page, q }: ScreenerState) => {
    const params = new URLSearchParams();
    if(view !== DEFAULT_VIEW) params.set('v', view);
    if(sort) params.set('o', sort);
    if(page > 1) params.set('p', String(page));
    if(q) params.set('q', q);
    return params.toString();
};

export const hrefWith = (state: ScreenerState, patch: Partial<ScreenerState>) => {
    const keepsPage = Object.keys(patch).every((k) => k === 'view' || k === 'page');
    const next = { ...state, ...(keepsPage ? {} : { page: 1}), ...patch };
    const search = toSearch(next);
    return search ? `/screener?${search}` : '/screener';
};