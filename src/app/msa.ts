export interface MultipleSequenceAlignment {
  name: string;
  msa_file: string;
  uploaded_at: Date;
  user: number;
  id: number;
}

export interface MultipleSequenceAlignmentQuery {
  results: MultipleSequenceAlignment[];
  count: number;
  previous: string|null;
  next: string|null;
}
