import { supabase } from '@/lib/supabase';

type QueryMap = Record<string, string>;

type SupabaseRequestInit = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: QueryMap;
  headers?: Record<string, string>;
  useServiceRole?: boolean;
};

const getTableName = (path: string) => {
  const normalized = path.replace(/^\/+/, '');
  const parts = normalized.split('/');
  const idx = parts.indexOf('v1');
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return parts[parts.length - 1];
};

const getEqValue = (value: string | undefined) => {
  if (!value) return undefined;
  if (value.startsWith('eq.')) return value.slice(3);
  return value;
};

export async function supabaseRequest<T>(path: string, init: SupabaseRequestInit = {}): Promise<T> {
  const table = getTableName(path);

  if (!table) {
    throw new Error(`Invalid Supabase path: ${path}`);
  }

  const method = init.method ?? 'GET';

  if (method === 'GET') {
    let query = supabase.from(table).select(init.query?.select ?? '*');

    const queryEntries = Object.entries(init.query ?? {});
    for (const [key, value] of queryEntries) {
      if (key === 'select' || key === 'limit' || key === 'order' || key === 'or') continue;
      const eqValue = getEqValue(value);
      if (eqValue !== undefined) query = query.eq(key, eqValue);
    }

    if (init.query?.or) {
      const orValue = init.query.or.replace(/^\(|\)$/g, '');
      query = query.or(orValue);
    }

    if (init.query?.order) {
      const [column, direction] = init.query.order.split('.');
      query = query.order(column, { ascending: direction !== 'desc' });
    }

    if (init.query?.limit) {
      query = query.limit(Number(init.query.limit));
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data ?? []) as T;
  }

  if (method === 'POST') {
    const body = init.body;
    const query = supabase.from(table).insert(body as object | object[]);
    const shouldReturnRows = init.headers?.Prefer === 'return=representation';

    if (shouldReturnRows) {
      const { data, error } = await query.select();
      if (error) throw new Error(error.message);
      return (data ?? []) as T;
    }

    const { error } = await query;
    if (error) throw new Error(error.message);
    return ([] as unknown) as T;
  }

  throw new Error(`Unsupported method ${method}`);
}
