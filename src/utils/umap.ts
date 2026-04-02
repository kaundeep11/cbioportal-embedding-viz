import { UMAP } from 'umap-js';

export const computeUMAP = async (data: number[][]): Promise<number[][]> => {
  // To avoid completely blocking the UI, we wrap the UMAP computation in a small timeout/promise
  return new Promise((resolve) => {
    setTimeout(() => {
      const umap = new UMAP({
        nComponents: 2,
        nNeighbors: 15,
        minDist: 0.1,
      });
      const embedding = umap.fit(data);
      resolve(embedding);
    }, 10);
  });
};
