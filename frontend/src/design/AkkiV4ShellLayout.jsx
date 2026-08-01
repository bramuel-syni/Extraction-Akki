import React from 'react';
import { Outlet } from 'react-router-dom';
import AkkiV4Shell from '../design/AkkiV4Shell';

/* AkkiV4ShellLayout — layout route that wraps every in-app child route
 * with the AkkiV4Shell (persistent sidebar + rich header).
 *
 * Used as a parent Route element in App.js:
 *
 *   <Route element={<AkkiV4ShellLayout />}>
 *     <Route path="registry" element={<RegistryV4Page />} />
 *     ...
 *   </Route>
 */
export default function AkkiV4ShellLayout() {
  return (
    <AkkiV4Shell>
      <Outlet />
    </AkkiV4Shell>
  );
}
