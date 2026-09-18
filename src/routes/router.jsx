import { createHashRouter, Navigate } from 'react-router-dom';
import RootLayout from './RootLayout.jsx';
import BrowseLayout from './BrowseLayout.jsx';
import HomeScreen from './HomeScreen.jsx';
import QuizSessionRoute from './QuizSessionRoute.jsx';
import MultiSessionRoute from './MultiSessionRoute.jsx';
import DevShowcaseRoute from './DevShowcaseRoute.jsx';

// Hash-based (createHashRouter, not createBrowserRouter): GitHub Pages (the
// primary deploy target, see .github/workflows/deploy.yml) has no server
// rewrite and no public/404.html, so a browser-router deep link or reload
// would 404 at the CDN before React ever loads, and the PWA service worker
// can't rescue that (a 404 is a resolved response, not a rejected fetch —
// see pwa/service-worker.js). A hash URL is never sent to the server at
// all, so every host just ever sees requests for "/". Trade-off: URLs carry
// a "#". Revisit only alongside a public/404.html GH-Pages redirect.
export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <BrowseLayout />,
        children: [{ path: '/', element: <HomeScreen /> }],
      },
      { path: '/quiz/:termSlug/:courseSlug/:quizSlug', element: <QuizSessionRoute mode="quiz" /> },
      { path: '/review/:termSlug/:courseSlug/:quizSlug', element: <QuizSessionRoute mode="review" /> },
      { path: '/multi/quiz', element: <MultiSessionRoute mode="quiz" /> },
      { path: '/multi/review', element: <MultiSessionRoute mode="review" /> },
      { path: '/dev/showcase', element: <DevShowcaseRoute /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
