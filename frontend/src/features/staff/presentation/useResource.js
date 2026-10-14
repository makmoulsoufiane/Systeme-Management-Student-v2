import { useEffect, useState } from 'react';

export function useResource(gateway, resource, id, onSessionExpired, revision = 0) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    const controller = new AbortController();
    setState({ data: null, error: null, loading: true });
    const request = id ? gateway.get(resource, id, controller.signal) : gateway.list(resource, controller.signal);
    request.then((data) => {
      if (!controller.signal.aborted) setState({ data, error: null, loading: false });
    }).catch((error) => {
      if (controller.signal.aborted) return;
      if (error.status === 401) onSessionExpired();
      setState({ data: null, error, loading: false });
    });
    return () => controller.abort();
  }, [gateway, resource, id, onSessionExpired, revision]);
  return state;
}
