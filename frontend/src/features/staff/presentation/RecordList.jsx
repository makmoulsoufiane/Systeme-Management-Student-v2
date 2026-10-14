import { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/Icon.jsx';
import { ErrorState, LoadingState } from '../../../components/Feedback.jsx';
import { formatValue, resources } from '../domain/resources.js';
import { useResource } from './useResource.js';

export default function RecordList({ resource, gateway, onSessionExpired }) {
  const config = resources[resource];
  const [query, setQuery] = useState('');
  const [revision, setRevision] = useState(0);
  const { data, loading, error } = useResource(gateway, resource, null, onSessionExpired, revision);
  const records = (data || []).filter((record) => config.columns.some((column) =>
    String(record[column.name] ?? '').toLocaleLowerCase().includes(query.toLocaleLowerCase().trim())));

  return <>
    <header className="page-heading"><div className="page-heading-copy"><p className="eyebrow">PEOPLE & LEARNING</p>
      <h1 className="page-title">{config.title}<span className="title-dot">.</span></h1><p className="page-description">{config.description}</p></div>
      <Link className="button button-primary" to={`/${resource}/new`}><Icon name="plus" />Add {config.singular}</Link>
    </header>
    <section className="panel" aria-label={`${config.title} directory`}>
      <div className="toolbar"><div className="toolbar-title"><h2>All {config.title.toLowerCase()}</h2><span className="badge">{loading ? '…' : data?.length ?? '—'}</span></div>
        <label className="search-field"><Icon name="search" /><span className="sr-only">Search {config.title.toLowerCase()}</span>
          <input type="search" placeholder={`Search ${config.title.toLowerCase()}…`} value={query} onChange={(event) => setQuery(event.target.value)} /></label>
      </div>
      {loading ? <LoadingState /> : error ? <ErrorState error={error} onRetry={() => setRevision(revision + 1)} />
        : records.length ? <div className="table-wrap"><table className="data-table"><thead><tr>{config.columns.map((column) => <th key={column.name} scope="col">{column.label}</th>)}<th scope="col"><span className="sr-only">View record</span></th></tr></thead>
          <tbody>{records.map((record) => <tr key={record[config.id]}>{config.columns.map((column, index) => <td key={column.name}>
            {index === 0 ? <Link className="record-link" to={`/${resource}/${record[config.id]}`}><span className={`avatar avatar-${resource}`} aria-hidden="true">{String(record[column.name] || '?').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><span><span className="table-primary">{record[column.name] || `Record ${record[config.id]}`}</span><span className="table-secondary">{config.singular} · #{record[config.id]}</span></span></Link>
              : <span className={column.name === 'group_name' || column.name === 'note' ? 'badge' : ''}>{formatValue(record[column.name], column.type)}</span>}
          </td>)}<td><Link className="button button-icon" to={`/${resource}/${record[config.id]}`} aria-label={`View ${record[config.name] || config.singular}`}><Icon name="chevron" /></Link></td></tr>)}</tbody></table></div>
          : <div className="empty-state"><span className="empty-icon"><Icon name={config.icon} size={30} /></span><h2>{query ? 'No matches found' : `A fresh start for ${config.title.toLowerCase()}`}</h2>
            <p>{query ? 'Try another name or clear your search.' : `Add your first ${config.singular} to start organizing your workspace.`}</p>
            {query ? <button className="button button-secondary" onClick={() => setQuery('')}>Clear search</button> : <Link className="button button-secondary" to={`/${resource}/new`}>Add {config.singular}</Link>}</div>}
      {data && <footer className="table-footer"><span>{records.length} of {data.length} {config.title.toLowerCase()}</span><span>Connected to your school records</span></footer>}
    </section>
    <div className="workspace-note"><Icon name="shield" size={16} /><span>Your workspace, kept in sync. Changes are saved to your school’s records.</span></div>
  </>;
}
