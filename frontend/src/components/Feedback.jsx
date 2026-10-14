import Icon from './Icon.jsx';

export function LoadingState({ label = 'Loading records…' }) {
  return <div className="loading-state" role="status"><span className="loading-spinner" />{label}</div>;
}

export function ErrorState({ error, onRetry }) {
  return <div className="error-banner" role="alert"><Icon name="alert" /><div><strong>Something needs attention</strong><p>{error.message}</p></div>
    {onRetry && <button className="button button-secondary" onClick={onRetry}>Try again</button>}</div>;
}
