import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../../components/Icon.jsx';
import { ErrorState, LoadingState } from '../../../components/Feedback.jsx';
import { formPayload, initialValues, optionIdentity, resources } from '../domain/resources.js';

const teacherConfigs = Object.fromEntries(['exams', 'scores'].map((name) => [name, {
  ...resources[name],
  fields: resources[name].fields.filter((field) => !['teacher', 'admin'].includes(field.name)).map((field) =>
    ['group', 'exam'].includes(field.name) ? { ...field, required: true } : field),
}]));

export default function RecordForm({ resource, gateway, onSessionExpired, basePath = '', teacherMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const config = teacherMode ? teacherConfigs[resource] : resources[resource];
  const [state, setState] = useState({ loading: true, error: null, options: {}, record: null });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: null, options: {}, record: null });
    const sources = [...new Set(config.fields.filter((field) => field.source).map((field) => field.source))];
    Promise.all([
      id ? gateway.get(resource, id, controller.signal) : Promise.resolve(null),
      Promise.all(sources.map(async (source) => [source, await gateway.list(source, controller.signal)])),
    ]).then(([record, entries]) => {
      if (!controller.signal.aborted) setState({ loading: false, error: null, record, options: Object.fromEntries(entries) });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      if (error.status === 401) onSessionExpired();
      setState({ loading: false, error, options: {}, record: null });
    });
    return () => controller.abort();
  }, [resource, id, gateway, config, onSessionExpired, revision]);

  const back = id ? `${basePath}/${resource}/${id}` : `${basePath}/${resource}`;
  return <>
    <Link className="breadcrumb" to={back}><Icon name="arrow-left" />Back to {id ? config.singular : config.title.toLowerCase()}</Link>
    <header className="page-heading"><div><p className="eyebrow">MANAGE RECORDS</p><h1 className="page-title">{id ? 'Edit' : 'Add'} {config.singular}</h1><p className="page-description">Enter the details below, then save your changes.</p></div></header>
    {state.loading ? <LoadingState /> : state.error ? <ErrorState error={state.error} onRetry={() => setRevision(revision + 1)} />
      : <Editor teacherMode={teacherMode} config={config} resource={resource} record={state.record} options={state.options} gateway={gateway} basePath={basePath} onSessionExpired={onSessionExpired}
        onSaved={(record) => navigate(`${basePath}/${resource}/${record[config.id]}`, { replace: true, state: { notice: `${config.title.slice(0, -1)} saved successfully.` } })} back={back} />}
  </>;
}

export function Editor({ config, resource, record, options, gateway, onSessionExpired, onSaved, back, basePath = '', teacherMode = false }) {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  const [values, setValues] = useState(() => initialValues(config.fields, record || {}));
  const [failure, setFailure] = useState(null);
  const [pending, setPending] = useState(false);
  const missingSources = config.fields.filter((field) => field.required && field.source && !options[field.source]?.length);

  async function submit(event) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setFailure(null);
    try {
      const saved = await gateway.save(resource, record?.[config.id], formPayload(config.fields, values));
      if (mounted.current) onSaved(saved);
    } catch (error) {
      if (mounted.current) {
        if (error.status === 401) onSessionExpired();
        setFailure(error);
      }
    } finally { if (mounted.current) setPending(false); }
  }

  return <form className="panel record-form" onSubmit={submit} aria-busy={pending}>
    <div className="form-section-heading"><Icon name={config.icon} /><div><h2>{config.singular[0].toUpperCase() + config.singular.slice(1)} details</h2><p>Fields marked with * are required.</p></div></div>
    {missingSources.map((field) => <div className="error-banner" role="status" key={field.name}><p>{teacherMode ? `No ${field.label.toLowerCase()} is available. ${field.source === 'exams' ? 'Create an exam for your class first.' : 'Ask your administrator to assign your class and students.'}` : field.source === 'admins' ? 'An administrator record is required. Create one in Django admin first.' : `Add a ${field.label.toLowerCase()} before creating this record.`}
      {!teacherMode && field.source !== 'admins' && <> <Link to={`${basePath}/${field.source}/new`}>Add {field.label.toLowerCase()}</Link></>}</p></div>)}
    {failure && <div className="error-banner" role="alert"><div><strong>{failure.message}</strong>{Object.entries(failure.fields || {}).filter(([key]) => !config.fields.some((field) => field.name === key)).map(([key, errors]) => <p key={key}>{errors.join(' ')}</p>)}</div></div>}
    <div className="form-grid">{config.fields.map((field) => {
      const fieldError = failure?.fields?.[field.name];
      const description = [field.hint && `${field.name}-hint`, fieldError && `${field.name}-error`].filter(Boolean).join(' ') || undefined;
      const shared = { id: field.name, name: field.name, value: values[field.name], required: field.required,
        'aria-invalid': fieldError ? true : undefined, 'aria-describedby': description,
        onChange: (event) => setValues({ ...values, [field.name]: event.target.value }) };
      return <div className="field" key={field.name}><label htmlFor={field.name}>{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>
        {field.source ? <select {...shared}><option value="">{field.required ? `Select ${field.label.toLowerCase()}` : 'Not assigned'}</option>
          {(options[field.source] || []).map((option) => { const item = optionIdentity(field.source, option); return <option key={item.value} value={item.value}>{item.label}</option>; })}</select>
          : <input {...shared} type={field.type || 'text'} maxLength={field.maxLength} min={field.min} step={field.step} />}
        {field.hint && <p className="field-hint" id={`${field.name}-hint`}>{field.hint}</p>}
        {fieldError && <p className="field-error" id={`${field.name}-error`}>{fieldError.join(' ')}</p>}
      </div>;
    })}</div>
    <div className="form-actions"><Link className="button button-secondary" to={back}>Cancel</Link><button className="button button-primary" disabled={pending || missingSources.length > 0}>{pending ? 'Saving…' : `Save ${config.singular}`}{!pending && <Icon name="check" />}</button></div>
  </form>;
}
