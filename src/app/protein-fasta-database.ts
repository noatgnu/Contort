export interface ProteinFastaDatabase {
  name: string;
  fasta_file: string;
  uploaded_at: Date;
  user: number;
  id: number;
  is_public: boolean;
  shared_with: number[];
  shared_with_usernames: string[];
  blast_index_status: 'none' | 'building' | 'ready' | 'failed';
  mmseqs_index_status: 'none' | 'building' | 'ready' | 'failed';
}

export interface ProteinFastaDatabaseQuery {
  results: ProteinFastaDatabase[];
  count: number;
  previous: string|null;
  next: string|null;
}
