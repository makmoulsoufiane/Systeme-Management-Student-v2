import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../../components/Feedback.jsx';
import ConfirmDialog from '../../../components/ConfirmDialog.jsx';
import { useAuth } from '../../auth/application/AuthContext.jsx';

export default function AccountList({ role, gateway }) {
  const { clearSession } = useAuth();
  const [state, setState] = useState({ loading: true, rows: [], error: null });
  const [revision, setRevision] = useState(0);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, rows: [], error: null });
    gateway.accounts(role, controller.signal).then((rows) => {
      if (!controller.signal.aborted) setState({ loading: false, rows, error: null });
    }).catch((error) => {
      if (!controller.signal.aborted) {
        if (error.status === 401) clearSession();
        setState({ loading: false, rows: [], error });
      }
    });
    return () => controller.abort();
  }, [gateway, role, revision, clearSession]);
  async function deactivate() {
    if (pending) return;
    setPending(true); setFailure(null);
    try {
      await gateway.saveAccount(role, selected.id, { is_active: false });
      setSelected(null); setRevision((value) => value + 1);
    } catch (error) { setFailure(error); }
    finally { setPending(false); }
  }
  const rows = state.rows.filter((row) => `${row.username} ${row.record?.name || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <header className="page-heading"><div><p className="eyebrow">ACCOUNT ACCESS</p><h1 className="page-title">{role === 'teacher' ? 'Teacher' : 'Student'} accounts</h1>
      <p className="page-description">Create logins, update account details, and deactivate access.</p></div>
      <Link className="button button-primary" to="new">Create {role} account</Link></header>
    <section className="panel"><div className="toolbar"><h2 className="toolbar-title">School accounts</h2>
      <label className="search-field"><span className="sr-only">Search accounts</span><input type="search" placeholder="Search accounts…" value={query} onChange={(event) => setQuery(event.target.value)} /></label></div>
      {state.loading ? <LoadingState /> : state.error ? <ErrorState error={state.error} onRetry={() => setRevision((value) => value + 1)} /> : rows.length ?
        <div className="table-wrap"><table className="data-table"><thead><tr><th scope="col">Username</th><th scope="col">School record</th><th scope="col">Status</th><th scope="col">Actions</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row.id}><td><strong className="table-primary">{row.username}</strong><span className="table-secondary">{row.email}</span></td>
            <td>{row.record?.name || 'No linked record'}</td><td><span className="badge">{row.is_active ? 'Active' : 'Inactive'}</span>{row.must_change_password && <span className="table-secondary">Password change required</span>}</td>
            <td><div className="row-actions"><Link className="button button-secondary" to={`${row.id}/edit`}>Edit <span className="sr-only">{row.username}</span></Link>
              {row.is_active && <button className="button button-secondary danger-text" onClick={() => { setSelected(row); setFailure(null); }}>Deactivate <span className="sr-only">{row.username}</span></button>}</div></td></tr>)}</tbody>
        </table></div> : <div className="empty-state"><h2>{query ? 'No matching accounts' : 'No accounts yet'}</h2><p>{query ? 'Try a different username or name.' : `Create a ${role} account to give them access to their workspace.`}</p></div>}
    </section>
    {selected && <ConfirmDialog title={`Deactivate ${selected.username}?`} confirmLabel="Deactivate account" pendingLabel="Deactivating…" cancelLabel="Keep active" pending={pending} error={failure} onClose={() => setSelected(null)} onConfirm={deactivate}>
      <p>This user will lose access to the portal. Their school records will be kept.</p>
    </ConfirmDialog>}
  </>;
}
