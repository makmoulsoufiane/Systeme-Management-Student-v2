import { BrowserRouter } from 'react-router-dom';
import StaffApp from './app/StaffApp.jsx';
import { createHttpClient } from './services/httpClient.js';
import { createStaffGateway } from './features/staff/infrastructure/staffGateway.js';

const gateway = createStaffGateway(createHttpClient());

export default function App() {
  return <BrowserRouter><StaffApp gateway={gateway} /></BrowserRouter>;
}
