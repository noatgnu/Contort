export interface MultipleSequenceAlignment {
  name: string;
  msa_file: string;
  uploaded_at: Date;
  user: number;
  id: number;
  is_public: boolean;
  shared_with: number[];
  shared_with_usernames: string[];
}

export interface MultipleSequenceAlignmentQuery {
  results: MultipleSequenceAlignment[];
  count: number;
  previous: string|null;
  next: string|null;
}
