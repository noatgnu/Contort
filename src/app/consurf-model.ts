export interface ConsurfModel {
  uniprot_accession: string;
  created_at: Date;
  updated_at: Date;
  consurf_grade: string;
  consurf_msa_variation: string;
  msa: string;
  consurf_job: number;
  user: number;
  id: number;
}

export interface ConsurfModelQuery {
  results: ConsurfModel[];
  count: number;
  previous: string|null;
  next: string|null;
}
