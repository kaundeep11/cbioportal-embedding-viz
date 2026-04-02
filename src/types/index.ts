export interface Study {
  studyId: string;
  name: string;
  description: string;
  cancerTypeId: string;
}

export interface Sample {
  sampleId: string;
  patientId: string;
  studyId: string;
}

export interface GeneticProfile {
  geneticProfileId: string;
  name: string;
  studyId: string;
}

export interface MolecularData {
  sampleId: string;
  entrezGeneId: number;
  value: number;
}
