import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../../../components/Feedback.jsx';
import { useAuth } from '../../auth/application/AuthContext.jsx';

export default function AccountForm({ role, gateway, records }) {
  const { id } = useParams();
  const { clearSession } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, options: [], account: null, error: null });
  const [revision, setRevision] = useState(0);
  const [failure, setFailure] = useState(null);
  const [pending, setPending] = useState(false);
  const back = `/admin/${role}s`;
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, options: [], account: null, error: null });
    const load = id ? gateway.account(role, id, controller.signal).then((account) => ({ account, options: [] }))
      : Promise.all([records.list(`${role}s`, controller.signal), gateway.accounts(role, controller.signal)]).then(([rows, accounts]) => {
        const linked = new Set(accounts.map((account) => account.record?.id));
        return { account: null, options: rows.filter((row) => !linked.has(row[`id_${role}`])) };
      });
    load.then((result) => { if (!controller.signal.aborted) setState({ ...result, loading: false, error: null }); })
      .catch((error) => { if (!controller.signal.aborted) {
        if (error.status === 401) clearSession();
        setState({ loading: false, options: [], account: null, error });
      } });
    return () => controller.abort();
  }, [gateway, records, role, id, revision, clearSession]);
  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    const data = Object.fromEntries(new FormData(event.currentTarget));
    if (id) data.is_active = data.is_active === 'on';
    else data.record_id = Number(data.record_id);
    setPending(true); setFailure(null);
    try { await gateway.saveAccount(role, id, data); navigate(back, { replace: true }); }
    catch (error) { setFailure(error); }
    finally { setPending(false); }
  }
  return <>
    <Link className="breadcrumb" to={back}>← Back to {role} accounts</Link>
    <header className="page-heading"><div><h1 className="page-title">{id ? 'Edit' : 'Create'} {role} account</h1>
      <p className="page-description">{id ? 'Update login details and account access.' : 'Link an existing school record to a new login. The user must change their temporary password on first sign-in.'}</p></div></header>
    {state.loading ? <LoadingState /> : state.error ? <ErrorState error={state.error} onRetry={() => setRevision((value) => value + 1)} /> :
      <form className="panel record-form" onSubmit={submit}>
        {!id && !state.options.length && <div className="error-banner" role="status"><div>No unlinked {role} records are available. <Link to={`/admin/records/${role}s/new`}>Add a {role} school record</Link> first, then return here.</div></div>}
        {failure && <div className="error-banner" role="alert"><div>{failure.message}{failure.fields?.non_field_errors?.map((message) => <p key={message}>{message}</p>)}</div></div>}
        <div className="form-grid">
          {!id && <div className="field field-full"><label htmlFor="record_id">{role === 'teacher' ? 'Teacher' : 'Student'} school record *</label><select id="record_id" name="record_id" required defaultValue="" aria-describedby={failure?.fields?.record_id ? 'record_id-error' : undefined}>
            <option value="">Select a school record</option>{state.options.map((record) => <option key={record[`id_${role}`]} value={record[`id_${role}`]}>{record.fullname}</option>)}
          </select>{failure?.fields?.record_id && <p id="record_id-error" className="field-error">{failure.fields.record_id.join(' ')}</p>}</div>}
          {['username', 'first_name', 'last_name', 'email', ...(!id ? ['password'] : [])].map((name) => <div className="field" key={name}>
            <label htmlFor={name}>{{ username: 'Username *', first_name: 'First name', last_name: 'Last name', email: 'Email', password: 'Temporary password *' }[name]}</label>
            <input id={name} name={name} defaultValue={state.account?.[name] || ''} required={['username', 'password'].includes(name)} type={name === 'password' ? 'password' : name === 'email' ? 'email' : 'text'} autoComplete={name === 'password' ? 'new-password' : 'off'} aria-invalid={Boolean(failure?.fields?.[name])} aria-describedby={failure?.fields?.[name] ? `${name}-error` : undefined} />
            {failure?.fields?.[name] && <p id={`${name}-error`} className="field-error">{failure.fields[name].join(' ')}</p>}
          </div>)}
          {id && <label className="account-active field-full"><input name="is_active" type="checkbox" defaultChecked={state.account.is_active} /> Account active</label>}
        </div>
        {!id && <p className="page-description">Share the username and temporary password privately with the account owner. Use at least 8 characters and avoid common passwords.</p>}
        <div className="form-actions"><Link className="button button-secondary" to={back}>Cancel</Link><button className="button button-primary" disabled={pending || (!id && !state.options.length)}>{pending ? 'Saving…' : id ? 'Save account' : 'Create account'}</button></div>
      </form>}
  </>;
}
