/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { LocationProvider, Router, Route } from 'preact-iso';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { DesignElements } from './pages/DesignElements';
import { HeaderProvider } from './HeaderContext';

export function App() {
  return (
    <HeaderProvider>
      <LocationProvider>
        <main>
          <Router>
            <Route path="/" component={ProjectDashboard} />
            <Route path="/design-elements" component={DesignElements} />
            <Route default component={ProjectDashboard} />
          </Router>
        </main>
      </LocationProvider>
    </HeaderProvider>
  );
}
