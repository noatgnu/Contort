export interface ConSurfMSAVar {
  pos: number
  A: number
  C: number
  D: number
  E: number
  F: number
  G: number
  H: number
  I: number
  K: number
  L: number
  M: number
  N: number
  P: number
  Q: number
  R: number
  S: number
  T: number
  V: number
  W: number
  Y: number
  OTHER: number
  MAX_AA: string
  ConSurf_Grade: string
}

export interface ConSurfGrade {
  POS: number
  SEQ: string
  SCORE: number
  COLOR: string
  CONFIDENCE_INTERVAL: number[]
  CONFIDENCE_INTERVAL_COLORS: string[]
  MSA_DATA: number[]
  RESIDUE_VARIETY: string[]
  BE: string
  FUNCTION: string
}

export interface ConSurfData {
  MSA: ConSurfMSAVar
  GRADE: ConSurfGrade
}
