import { BrowserRouter } from 'react-router-dom';
import StaffApp from './app/StaffApp.jsx';
import { createHttpClient } from './services/httpClient.js';
import { createStaffGateway } from './features/staff/infrastructure/staffGateway.js';
import { createAuthGateway } from './features/auth/infrastructure/authGateway.js';
import { createSessionStore } from './features/auth/application/sessionStore.js';
import { AuthProvider } from './features/auth/application/AuthContext.jsx';

let storage;
try { storage = window.sessionStorage; } catch { /* Storage may be disabled. */ }
const store = createSessionStore(storage);
const http = createHttpClient(store);
const gateway = createStaffGateway(http);
const accountGateway = createAuthGateway(http);

export default function App() {
  return <BrowserRouter><AuthProvider gateway={accountGateway} store={store}>
    <StaffApp gateway={gateway} accountGateway={accountGateway} />
  </AuthProvider></BrowserRouter>;
}
