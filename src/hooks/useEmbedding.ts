import { useState } from 'react';
import { fetchMolecularData, fetchMolecularProfiles, fetchSamples } from '../utils/api';
import { computeUMAP } from '../utils/umap';
import { normalizeData, extractEntityLists, prepareEmbeddingData } from '../utils/dataProcessor';

export interface Point {
  x: number;
  y: number;
  sampleId: string;
  label: string;
}

export const useEmbedding = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMsg, setProgressMsg] = useState<string>('');

  const computeEmbeddings = async (_selectedStudyId: string) => {
    try {
      setLoading(true);
      setError(null);
      setPoints([]);
      
      // Step 1: Hardcode studyId
      const studyId = "acc_tcga"; 
      console.log(`1. Using hardcoded studyId: ${studyId}`);

      // Step 2: Fetch molecular profiles
      setProgressMsg('Fetching molecular profiles...');
      const profiles = await fetchMolecularProfiles(studyId);
      profiles.forEach(p => console.log(p.molecularProfileId, p.molecularAlterationType));
      console.log("All profiles:", profiles);
      
      // Step 3: Find specific profile
      const targetProfileIds = [
        "acc_tcga_rna_seq_v2_mrna",
        "acc_tcga_mrna",
        "acc_tcga_linear_CNA"
      ];
      const rnaProfile = profiles.find(p => targetProfileIds.includes(p.molecularProfileId));
      console.log("Selected profile:", rnaProfile);
      
      if (!rnaProfile) {
        throw new Error('No matching MRNA_EXPRESSION / CONTINUOUS profile found.');
      }

      // Step 4: Fetch samples
      setProgressMsg('Fetching samples...');
      const samples = await fetchSamples(studyId, 20); // Gets first 20 limits via API
      const sampleIds = samples.map(s => s.sampleId);
      console.log("sampleIds array:", sampleIds);
      
      if (!sampleIds.length) {
        throw new Error('No samples found.');
      }

      // Step 5: Fetch genes
      setProgressMsg('Setting genes...');
      const entrezGeneIds = [672, 675, 7157, 1956, 4893, 5728, 207, 4609, 3265, 1029, 595, 898, 999, 4292, 5925, 2064, 2260, 4914, 7422, 7516];
      console.log("entrezGeneIds array:", entrezGeneIds);
      
      if (!entrezGeneIds.length) {
        throw new Error('No genes found.');
      }

      // Step 6: POST molecular data
      setProgressMsg('Fetching molecular data...');
      const molecularData = await fetchMolecularData(rnaProfile.molecularProfileId, sampleIds, entrezGeneIds);
      console.log("FINAL DATA:", molecularData);
      
      // Step 7: Check data length and compute
      if (!molecularData || molecularData.length === 0) {
        console.log("EMPTY");
        throw new Error('No molecular data found for the selected profile and genes.');
      }
      
      setProgressMsg('Processing data...');
      const { sampleIds: extractedSamples, genes } = extractEntityLists(molecularData);
      const matrix = prepareEmbeddingData(molecularData, extractedSamples, genes);
      
      setProgressMsg('Normalizing data...');
      const normalizedMatrix = normalizeData(matrix);
      
      if (matrix.length < 2) {
        throw new Error('Not enough samples to compute UMAP. Minimum 2 required.');
      }

      setProgressMsg('Computing UMAP...');
      const embedding = await computeUMAP(normalizedMatrix);
      
      const computedPoints: Point[] = embedding.map((coords, i) => ({
        x: coords[0] || 0,
        y: coords[1] || 0,
        sampleId: extractedSamples[i],
        label: extractedSamples[i]
      }));
      
      setPoints(computedPoints);
      console.log("Embedded points:", computedPoints);
    } catch (err: any) {
      console.error("Embedding computation failed:", err);
      if (err.response) {
         console.error("API error response block:", err.response.data);
      }
      console.log("EMPTY");
      setError(err.message || 'Failed to compute embeddings');
    } finally {
      setLoading(false);
      setProgressMsg('');
    }
  };

  return { points, loading, error, progressMsg, computeEmbeddings };
};
