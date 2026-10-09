/* Shared search and date controls for the management sidebar list views. */
(() => {
  const views = ['view-purchase', 'view-inventory', 'view-crm', 'view-hr', 'view-halls', 'view-reports', 'view-admin'];
  const state = Object.fromEntries(views.map(id => [id, { query: '', from: '', to: '' }]));

  function extractDate(text) {
    const iso = text.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
    if (iso) return new Date(`${iso[1]}T12:00:00`);
    const local = text.match(/\b(\d{1,2})[/-](\d{1,2})[/-](20\d{2})\b/);
    if (local) return new Date(Number(local[3]), Number(local[1]) - 1, Number(local[2]), 12);
    return null;
  }

  function apply(view) {
    const filter = state[view.id];
    const from = filter.from ? new Date(`${filter.from}T00:00:00`) : null;
    const to = filter.to ? new Date(`${filter.to}T23:59:59.999`) : null;
    view.querySelectorAll('tbody tr').forEach(row => {
      const text = row.innerText.toLowerCase();
      const queryMatch = !filter.query || text.includes(filter.query);
      const date = extractDate(row.innerText);
      const dateMatch = (!from && !to) || Boolean(date && (!from || date >= from) && (!to || date <= to));
      row.style.display = queryMatch && dateMatch ? '' : 'none';
    });
  }

  function mount(viewId) {
    const view = document.getElementById(viewId);
    if (!view) return;
    if (view.querySelector(':scope > .sidebar-list-filters')) { apply(view); return; }
    const filter = state[viewId];
    const bar = document.createElement('form');
    bar.className = 'sidebar-list-filters flex flex-wrap items-end gap-3 mb-4 p-3 rounded-xl border border-slate-700 bg-slate-900 text-white';
    bar.innerHTML = `<label class="flex-1 min-w-[190px] text-[10px] font-bold uppercase tracking-wider text-slate-400">Search
      <input type="search" class="sidebar-filter-search mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white normal-case" placeholder="Search this list..." value="${filter.query}">
    </label>
    <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date From<input type="date" class="sidebar-filter-from mt-1 block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" value="${filter.from}"></label>
    <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date To<input type="date" class="sidebar-filter-to mt-1 block rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white" value="${filter.to}"></label>
    <button class="rounded-lg bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-bold text-white" type="submit"><i class="fa-solid fa-magnifying-glass mr-1"></i> Apply</button>`;
    view.prepend(bar);
    bar.addEventListener('submit', event => {
      event.preventDefault();
      filter.query = bar.querySelector('.sidebar-filter-search').value.trim().toLowerCase();
      filter.from = bar.querySelector('.sidebar-filter-from').value;
      filter.to = bar.querySelector('.sidebar-filter-to').value;
      apply(view);
    });
    apply(view);
  }

  function mountAll() { views.forEach(mount); }
  document.addEventListener('DOMContentLoaded', mountAll);
  document.addEventListener('click', event => {
    if (event.target.closest('.nav-tab')) setTimeout(mountAll, 0);
  });
  const observer = new MutationObserver(() => mountAll());
  observer.observe(document.body, { childList: true, subtree: true });
})();
