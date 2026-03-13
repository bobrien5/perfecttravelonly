// ─── GoHighLevel API v2 Type Definitions ─────────────────────

// ─── Contacts ────────────────────────────────────────────────

export interface GHLCustomField {
  id: string;
  field_value: string | number | boolean | string[];
}

export interface GHLContact {
  id: string;
  locationId: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  timezone?: string;
  dnd?: boolean;
  tags?: string[];
  source?: string;
  gender?: string;
  customFields?: GHLCustomField[];
  dateAdded?: string;
  dateUpdated?: string;
}

export interface CreateContactInput {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  timezone?: string;
  dnd?: boolean;
  tags?: string[];
  source?: string;
  gender?: string;
  customFields?: GHLCustomField[];
}

export interface UpsertContactInput extends CreateContactInput {}

export interface SearchContactsParams {
  query?: string;
  email?: string;
  phone?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface ContactResponse {
  contact: GHLContact;
}

export interface ContactsListResponse {
  contacts: GHLContact[];
  total: number;
}

// ─── Opportunities ───────────────────────────────────────────

export interface GHLOpportunity {
  id: string;
  name: string;
  monetaryValue?: number;
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  status: 'open' | 'won' | 'lost' | 'abandoned';
  source?: string;
  assignedTo?: string;
  locationId?: string;
  dateAdded?: string;
  dateUpdated?: string;
  customFields?: GHLCustomField[];
}

export interface CreateOpportunityInput {
  pipelineId: string;
  pipelineStageId: string;
  contactId: string;
  name: string;
  monetaryValue?: number;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
  source?: string;
  assignedTo?: string;
  customFields?: GHLCustomField[];
}

export interface UpdateOpportunityInput {
  name?: string;
  monetaryValue?: number;
  pipelineStageId?: string;
  status?: 'open' | 'won' | 'lost' | 'abandoned';
  source?: string;
  assignedTo?: string;
  customFields?: GHLCustomField[];
}

export interface OpportunityResponse {
  opportunity: GHLOpportunity;
}

export interface OpportunitiesSearchResponse {
  opportunities: GHLOpportunity[];
  meta: {
    total: number;
    currentPage: number;
    nextPage: number | null;
    previousPage: number | null;
  };
}

export interface SearchOpportunitiesParams {
  pipelineId?: string;
  pipelineStageId?: string;
  contactId?: string;
  status?: string;
  q?: string;
  limit?: number;
  page?: number;
}

// ─── Pipelines ───────────────────────────────────────────────

export interface GHLPipelineStage {
  id: string;
  name: string;
  position: number;
}

export interface GHLPipeline {
  id: string;
  name: string;
  stages: GHLPipelineStage[];
  locationId: string;
}

export interface PipelinesResponse {
  pipelines: GHLPipeline[];
}

// ─── API Error ───────────────────────────────────────────────

export interface GHLApiError {
  statusCode: number;
  message: string;
  error?: string;
}
