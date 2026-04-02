import type { MolecularData } from '../types';

export const normalizeData = (data: number[][]): number[][] => {
  if (!data.length || !data[0].length) return data;
  const numCols = data[0].length;
  
  const minVals = new Array(numCols).fill(Infinity);
  const maxVals = new Array(numCols).fill(-Infinity);
  
  for (const row of data) {
    for (let c = 0; c < numCols; c++) {
      if (row[c] < minVals[c]) minVals[c] = row[c];
      if (row[c] > maxVals[c]) maxVals[c] = row[c];
    }
  }
  
  return data.map(row => 
    row.map((val, colIdx) => {
      const min = minVals[colIdx];
      const max = maxVals[colIdx];
      if (max === min) return 0;
      return (val - min) / (max - min);
    })
  );
};

export const extractEntityLists = (molecularData: MolecularData[]) => {
  const sampleIds = Array.from(new Set(molecularData.map(d => d.sampleId)));
  const genes = Array.from(new Set(molecularData.map(d => d.entrezGeneId))).sort((a, b) => a - b);
  return { sampleIds, genes };
};

export const prepareEmbeddingData = (molecularData: MolecularData[], sampleIds: string[], genes: number[]): number[][] => {
  const sampleMap = new Map<string, Record<number, number>>();
  
  for (const d of molecularData) {
    if (!sampleMap.has(d.sampleId)) {
      sampleMap.set(d.sampleId, {});
    }
    sampleMap.get(d.sampleId)![d.entrezGeneId] = d.value;
  }
  
  return sampleIds.map(sampleId => {
    const values = sampleMap.get(sampleId) || {};
    return genes.map(g => values[g] || 0);
  });
};
