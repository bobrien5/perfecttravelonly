/**
 * GoHighLevel API v2 Client
 *
 * Base URL:  https://services.leadconnectorhq.com
 * Auth:      Private Integration Token (pit-*)
 * Version:   2021-07-28
 *
 * Docs: https://marketplace.gohighlevel.com/docs/
 */

import type {
  CreateContactInput,
  UpsertContactInput,
  SearchContactsParams,
  ContactResponse,
  ContactsListResponse,
  CreateOpportunityInput,
  UpdateOpportunityInput,
  OpportunityResponse,
  OpportunitiesSearchResponse,
  SearchOpportunitiesParams,
  PipelinesResponse,
  GHLApiError,
} from './types';

// ─── Configuration ───────────────────────────────────────────

const GHL_BASE_URL = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

function getToken(): string {
  const token = process.env.GHL_API_TOKEN;
  if (!token) {
    throw new Error('GHL_API_TOKEN is not set. Add it to .env.local');
  }
  return token;
}

function getLocationId(): string {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) {
    throw new Error('GHL_LOCATION_ID is not set. Add it to .env.local');
  }
  return locationId;
}

// ─── Base Fetch Helper ───────────────────────────────────────

export class GHLError extends Error {
  statusCode: number;
  error?: string;

  constructor(statusCode: number, message: string, error?: string) {
    super(message);
    this.name = 'GHLError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

/**
 * Core fetch wrapper for GHL API.
 * Automatically injects auth headers, API version, and locationId.
 *
 * - GET requests:  locationId is added as a query parameter
 * - POST/PUT requests: locationId is merged into the JSON body
 */
async function ghlFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const locationId = getLocationId();
  const method = (options.method || 'GET').toUpperCase();

  // For GET/DELETE — inject locationId as query param
  // Note: Most endpoints use "locationId" but opportunities/search uses "location_id"
  let url = `${GHL_BASE_URL}${path}`;
  if (method === 'GET' || method === 'DELETE') {
    const separator = url.includes('?') ? '&' : '?';
    const paramName = path.includes('/opportunities/search') ? 'location_id' : 'locationId';
    url = `${url}${separator}${paramName}=${locationId}`;
  }

  // For POST/PUT — inject locationId into the body
  let body = options.body;
  if ((method === 'POST' || method === 'PUT') && body) {
    try {
      const parsed = JSON.parse(body as string);
      parsed.locationId = locationId;
      body = JSON.stringify(parsed);
    } catch {
      // If body isn't JSON, pass through as-is
    }
  } else if ((method === 'POST' || method === 'PUT') && !body) {
    body = JSON.stringify({ locationId });
  }

  const res = await fetch(url, {
    ...options,
    method,
    body,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Version: GHL_API_VERSION,
      ...options.headers,
    },
  });

  if (!res.ok) {
    let errorBody: GHLApiError;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = {
        statusCode: res.status,
        message: res.statusText,
      };
    }
    throw new GHLError(errorBody.statusCode, errorBody.message, errorBody.error);
  }

  return res.json();
}

// ─── Contacts ────────────────────────────────────────────────

export const contacts = {
  /**
   * Get a single contact by ID
   */
  async get(contactId: string): Promise<ContactResponse> {
    return ghlFetch<ContactResponse>(`/contacts/${contactId}`);
  },

  /**
   * Create a new contact
   */
  async create(data: CreateContactInput): Promise<ContactResponse> {
    return ghlFetch<ContactResponse>('/contacts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing contact
   */
  async update(
    contactId: string,
    data: Partial<CreateContactInput>
  ): Promise<ContactResponse> {
    return ghlFetch<ContactResponse>(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Upsert a contact — creates or updates based on email/phone match.
   * Respects the "Allow Duplicate Contact" setting in your GHL location.
   */
  async upsert(data: UpsertContactInput): Promise<ContactResponse> {
    return ghlFetch<ContactResponse>('/contacts/upsert', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a contact
   */
  async delete(contactId: string): Promise<{ succeeded: boolean }> {
    return ghlFetch<{ succeeded: boolean }>(`/contacts/${contactId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Search / list contacts
   */
  async search(params: SearchContactsParams = {}): Promise<ContactsListResponse> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.email) searchParams.set('email', params.email);
    if (params.phone) searchParams.set('phone', params.phone);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.offset) searchParams.set('startAfterId', String(params.offset));

    const qs = searchParams.toString();
    return ghlFetch<ContactsListResponse>(`/contacts/?${qs}`);
  },
};

// ─── Opportunities ───────────────────────────────────────────

export const opportunities = {
  /**
   * Get a single opportunity by ID
   */
  async get(opportunityId: string): Promise<OpportunityResponse> {
    return ghlFetch<OpportunityResponse>(`/opportunities/${opportunityId}`);
  },

  /**
   * Create a new opportunity in a pipeline
   */
  async create(data: CreateOpportunityInput): Promise<OpportunityResponse> {
    return ghlFetch<OpportunityResponse>('/opportunities/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an existing opportunity
   */
  async update(
    opportunityId: string,
    data: UpdateOpportunityInput
  ): Promise<OpportunityResponse> {
    return ghlFetch<OpportunityResponse>(`/opportunities/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update opportunity status (open, won, lost, abandoned)
   */
  async updateStatus(
    opportunityId: string,
    status: 'open' | 'won' | 'lost' | 'abandoned'
  ): Promise<OpportunityResponse> {
    return ghlFetch<OpportunityResponse>(
      `/opportunities/${opportunityId}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );
  },

  /**
   * Delete an opportunity
   */
  async delete(opportunityId: string): Promise<{ succeeded: boolean }> {
    return ghlFetch<{ succeeded: boolean }>(`/opportunities/${opportunityId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Search opportunities
   */
  async search(
    params: SearchOpportunitiesParams = {}
  ): Promise<OpportunitiesSearchResponse> {
    const searchParams = new URLSearchParams();
    if (params.pipelineId) searchParams.set('pipeline_id', params.pipelineId);
    if (params.pipelineStageId) searchParams.set('pipeline_stage_id', params.pipelineStageId);
    if (params.contactId) searchParams.set('contact_id', params.contactId);
    if (params.status) searchParams.set('status', params.status);
    if (params.q) searchParams.set('q', params.q);
    if (params.limit) searchParams.set('limit', String(params.limit));
    if (params.page) searchParams.set('page', String(params.page));

    const qs = searchParams.toString();
    return ghlFetch<OpportunitiesSearchResponse>(`/opportunities/search?${qs}`);
  },
};

// ─── Pipelines ───────────────────────────────────────────────

export const pipelines = {
  /**
   * Get all pipelines for the location
   */
  async getAll(): Promise<PipelinesResponse> {
    return ghlFetch<PipelinesResponse>('/opportunities/pipelines');
  },

  /**
   * Get a single pipeline by ID
   */
  async get(pipelineId: string): Promise<{ pipeline: import('./types').GHLPipeline }> {
    return ghlFetch<{ pipeline: import('./types').GHLPipeline }>(
      `/opportunities/pipelines/${pipelineId}`
    );
  },
};

// ─── Default Export ──────────────────────────────────────────

const ghl = { contacts, opportunities, pipelines };
export default ghl;
