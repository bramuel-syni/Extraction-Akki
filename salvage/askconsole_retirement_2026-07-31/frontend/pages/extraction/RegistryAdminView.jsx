// UI Spec v2.1 §3.5: view census state by estate region; trigger/schedule census
// passes; un-censused regions marked honestly as `unknown`.
import React, { useState } from 'react';

export default function RegistryAdminView() {
  const [regions] = useState([
    { region: 'archive://tenant-a', census_state: 'complete', last_pass_at: '2026-07-01T00:00Z' },
    { region: 'archive://tenant-b', census_state: 'unknown', last_pass_at: null },
    { region: 'cms://tenant-a', census_state: 'in_progress', last_pass_at: '2026-07-06T12:00Z' },
  ]);
  return (
    <div data-testid="registry-admin-view" className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold" data-testid="registry-admin-title">Registry Admin</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-1">Region</th>
            <th className="text-left py-1">Census state</th>
            <th className="text-left py-1">Last pass</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {regions.map((r) => (
            <tr key={r.region} data-testid={`registry-region-row-${r.region}`}>
              <td className="py-1">{r.region}</td>
              <td className="py-1" data-testid={`registry-census-state-${r.region}`}>{r.census_state}</td>
              <td className="py-1">{r.last_pass_at || '—'}</td>
              <td className="py-1">
                <button
                  data-testid={`registry-trigger-census-${r.region}`}
                  className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50"
                >
                  Trigger census
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
