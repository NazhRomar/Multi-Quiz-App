import { RouterProvider } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider } from './state/AppContext.jsx';
import { router } from './routes/router.jsx';
import UpdateToast from './components/common/UpdateToast.jsx';
import { LivePresence } from './components/common/LiveCount.jsx';

export default function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
      <UpdateToast />
      <LivePresence />
      {/* Vercel Web Analytics. The script it injects is served from
          /_vercel/insights/ — only a Vercel deployment has that path, so
          this is inert on Netlify (and in dev). */}
      <Analytics />
    </AppProvider>
  );
}
