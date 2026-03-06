import { LocationProvider, Router, Route } from 'preact-iso';
import { DesignElements } from './pages/DesignElements';

export function App() {
  return (
    <LocationProvider>
      <main>
        <Router>
          <Route path="/design-elements" component={DesignElements} />
          <Route default component={DesignElements} />
        </Router>
      </main>
    </LocationProvider>
  );
}
