export interface StructureFile {
  name: string;
  structure_file: string;
  uploaded_at: Date;
  user: number;
  id: number;
  chains: string;
}

export interface StructureFileQuery {
  results: StructureFile[];
  count: number;
  previous: string|null;
  next: string|null;
}
