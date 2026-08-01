import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useAuthLifecycle } from '../features/auth/hooks/useAuthLifecycle';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  // Initialize global auth state observer, token refresh interval, and idle timeout
  useAuthLifecycle();

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}