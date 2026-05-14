import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { DealKeyword, DealEntryInput } from './types';
import { normalizeKeyword } from './helpers';

let _client: SupabaseClient | null = null;

function db(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set. Add it to .env.local');
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local');
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

function rowToDealKeyword(row: Record<string, unknown>): DealKeyword {
  return {
    id: row.id as string,
    keyword: row.keyword as string,
    dealSlug: row.deal_slug as string,
    dealTitle: row.deal_title as string,
    destination: row.destination as string,
    price: row.price as number,
    landingPath: row.landing_path as string,
    dmCopy: row.dm_copy as string,
    status: row.status as DealKeyword['status'],
    expiresAt: (row.expires_at as string) ?? null,
    createdAt: row.created_at as string,
  };
}

export async function findByKeyword(keyword: string): Promise<DealKeyword | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await db()
    .from('deal_keywords')
    .select('*')
    .eq('keyword', normalizeKeyword(keyword))
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gte.${today}`)
    .maybeSingle();
  if (error) throw new Error(`findByKeyword failed: ${error.message}`);
  return data ? rowToDealKeyword(data) : null;
}

/**
 * Returns true if a keyword already exists in any status (active, paused, or
 * expired). The `keyword` column has a UNIQUE constraint, so this is the
 * duplicate-prevention guard for inserts — it intentionally does NOT filter by status.
 */
export async function keywordExists(keyword: string): Promise<boolean> {
  const { data, error } = await db()
    .from('deal_keywords')
    .select('id')
    .eq('keyword', normalizeKeyword(keyword))
    .maybeSingle();
  if (error) throw new Error(`keywordExists failed: ${error.message}`);
  return !!data;
}

export async function listActive(): Promise<DealKeyword[]> {
  const { data, error } = await db()
    .from('deal_keywords')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`listActive failed: ${error.message}`);
  return (data ?? []).map(rowToDealKeyword);
}

export async function addKeyword(entry: DealEntryInput): Promise<DealKeyword> {
  const { data, error } = await db()
    .from('deal_keywords')
    .insert({
      keyword: normalizeKeyword(entry.keyword),
      deal_slug: entry.dealSlug,
      deal_title: entry.dealTitle,
      destination: entry.destination,
      price: entry.price,
      landing_path: entry.landingPath,
      dm_copy: entry.dmCopy,
      expires_at: entry.expiresAt ?? null,
    })
    .select('*')
    .single();
  if (error) throw new Error(`addKeyword failed: ${error.message}`);
  return rowToDealKeyword(data);
}

export type { DealKeyword, DealEntryInput };
