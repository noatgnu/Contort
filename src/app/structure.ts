export interface StructureFile {
  name: string;
  structure_file: string;
  uploaded_at: Date;
  user: number;
  id: number;
  chains: string;
  is_public: boolean;
  shared_with: number[];
  shared_with_usernames: string[];
}

export interface StructureFileQuery {
  results: StructureFile[];
  count: number;
  previous: string|null;
  next: string|null;
}
