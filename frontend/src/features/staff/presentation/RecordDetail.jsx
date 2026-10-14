import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../../components/Icon.jsx';
import ConfirmDialog from '../../../components/ConfirmDialog.jsx';
import { ErrorState, LoadingState } from '../../../components/Feedback.jsx';
import { formatValue, resources } from '../domain/resources.js';
import { useResource } from './useResource.js';

export default function RecordDetail({ resource, gateway, onSessionExpired }) {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const config = resources[resource];
  const [revision, setRevision] = useState(0);
  const { data: record, loading, error } = useResource(gateway, resource, id, onSessionExpired, revision);
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  async function remove() {
    if (pending) return;
    setPending(true);
    setDeleteError(null);
    try { await gateway.remove(resource, id); navigate(`/${resource}`, { replace: true }); }
    catch (failure) { if (failure.status === 401) onSessionExpired(); setDeleteError(failure); }
    finally { setPending(false); }
  }

  return <>
    <Link className="breadcrumb" to={`/${resource}`}><Icon name="arrow-left" />All {config.title.toLowerCase()}</Link>
    {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={() => setRevision(revision + 1)} /> : <>
      <header className="page-heading"><div><p className="eyebrow">{config.singular.toUpperCase()} RECORD · #{id}</p><h1 className="page-title">{record[config.name] || `${config.singular} #${id}`}</h1><p className="page-description">Review this record and its related information.</p></div>
        <Link className="button button-primary" to={`/${resource}/${id}/edit`}><Icon name="edit" />Edit {config.singular}</Link></header>
      {location.state?.notice && <p className="status-message" role="status"><Icon name="check" />{location.state.notice}</p>}
      <section className="panel detail-panel"><div className="form-section-heading"><Icon name={config.icon} /><h2>Record details</h2></div><dl className="detail-grid">
        {config.fields.map((field) => <div className="detail-item" key={field.name}><dt>{field.label}</dt><dd>{field.source && record[field.name]
          ? field.source === 'admins' ? record.admin_name || `#${record.admin}`
            : <Link to={`/${field.source}/${record[field.name]}`}>{record[`${field.name}_name`] || `#${record[field.name]}`}</Link>
          : formatValue(record[field.name], field.type)}</dd></div>)}
        {resource === 'scores' && <div className="detail-item"><dt>Recorded on</dt><dd>{formatValue(record.created_at, 'datetime-local')}</dd></div>}
      </dl></section>
      <section className="danger-zone"><div><h2>Delete this {config.singular}</h2><p>This permanently removes the record. Related records may prevent deletion.</p></div><button className="button button-secondary danger-text" onClick={() => { setDeleteError(null); setConfirming(true); }}><Icon name="trash" />Delete {config.singular}</button></section>
    </>}
    {confirming && <ConfirmDialog title={`Delete this ${config.singular}?`} pending={pending} error={deleteError} onClose={() => setConfirming(false)} onConfirm={remove}><p>You’re about to permanently delete <strong>{record?.[config.name] || `record #${id}`}</strong>. This action cannot be undone.</p></ConfirmDialog>}
  </>;
}
