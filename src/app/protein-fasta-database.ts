export interface ProteinFastaDatabase {
  name: string;
  fasta_file: string;
  uploaded_at: Date;
  user: number;
  id: number;
}

export interface ProteinFastaDatabaseQuery {
  results: ProteinFastaDatabase[];
  count: number;
  previous: string|null;
  next: string|null;
}
