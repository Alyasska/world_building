"use client";

import { useSearchParams } from 'next/navigation';
import { useUiText } from '@/lib/i18n/use-ui-text';

export function GlobalSearchForm() {
  const ui = useUiText();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get('q') ?? '';

  return (
    <form action="/search" method="get" className="global-search">
      <label className="global-search__label" htmlFor="global-search-input">
        {ui.search.label}
      </label>
      <div className="global-search__row">
        <input
          id="global-search-input"
          className="input global-search__input"
          type="search"
          name="q"
          defaultValue={currentQuery}
          placeholder={ui.search.placeholder}
        />
        <button type="submit" className="button global-search__button">
          {ui.search.submit}
        </button>
      </div>
    </form>
  );
}
