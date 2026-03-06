/**
 * Copyright 2026 Jimmy Ma
 * SPDX-License-Identifier: MIT
 */

import { LocationProvider, Router, Route } from 'preact-iso';
import { ProjectDashboard } from './pages/ProjectDashboard';
import { DesignElements } from './pages/DesignElements';

export function App() {
  return (
    <LocationProvider>
      <main>
        <Router>
          <Route path="/" component={ProjectDashboard} />
          <Route path="/design-elements" component={DesignElements} />
          <Route default component={ProjectDashboard} />
        </Router>
      </main>
    </LocationProvider>
  );
}
