import axios from 'axios';
import type { Study, Sample, MolecularData, MolecularProfile } from '../types';

const API_BASE_URL = 'https://www.cbioportal.org/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchStudies = async (): Promise<Study[]> => {
  const response = await api.get<Study[]>('/studies');
  return response.data;
};

export const fetchSamples = async (studyId: string, limit?: number): Promise<Sample[]> => {
  const url = limit ? `/studies/${studyId}/samples?pageSize=${limit}&pageNumber=0` : `/studies/${studyId}/samples`;
  const response = await api.get<Sample[]>(url);
  return response.data;
};

export const fetchMolecularData = async (profileId: string, sampleIds: string[], entrezGeneIds: number[]): Promise<MolecularData[]> => {
  const response = await api.post<MolecularData[]>(`/molecular-profiles/${profileId}/molecular-data/fetch`, {
    sampleIds,
    entrezGeneIds
  });
  return response.data;
};

export const fetchGenes = async (): Promise<number[]> => {
  const response = await api.get('/genes?pageSize=20&pageNumber=0');
  return response.data.map((g: any) => g.entrezGeneId);
};

export const fetchMolecularProfiles = async (studyId: string): Promise<MolecularProfile[]> => {
  const response = await api.get<MolecularProfile[]>(`/studies/${studyId}/molecular-profiles`);
  return response.data;
};

