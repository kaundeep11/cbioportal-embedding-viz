import axios from 'axios';
import type { Study, Sample, MolecularData } from '../types';

const API_BASE_URL = 'https://www.cbioportal.org/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchStudies = async (): Promise<Study[]> => {
  const response = await api.get<Study[]>('/studies');
  return response.data;
};

export const fetchSamples = async (studyId: string): Promise<Sample[]> => {
  const response = await api.get<Sample[]>(`/studies/${studyId}/samples`);
  return response.data;
};

export const fetchMolecularData = async (_studyId: string, profileId: string): Promise<MolecularData[]> => {
  const response = await api.get<MolecularData[]>(`/molecular-profiles/${profileId}/molecular-data`);
  return response.data;
};
