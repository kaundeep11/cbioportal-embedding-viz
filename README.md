# cBioPortal Embedding Similarity Dashboard

## Overview
An interactive dashboard for visualizing high-dimensional cancer 
genomic data embeddings using UMAP/t-SNE dimensionality reduction.
Built as part of GSoC 2026 proposal for cBioPortal.

## Features
- Real-time data fetching from cBioPortal public API
- UMAP dimensionality reduction of genomic expression data
- Interactive D3.js scatter plot with zoom, pan, and hover
- WebGL rendering mode for high-performance visualization
- Cancer study selector with 200+ studies
- sample-level tooltips with genomic details

## Tech Stack
- React + TypeScript + Vite
- D3.js for SVG visualization
- umap-js for dimensionality reduction
- WebGL / regl for GPU-accelerated rendering
- Axios for cBioPortal REST API integration

## Getting Started
```bash
npm install
npm run dev
```

## How It Works
1. Select a cancer study from the dropdown
2. Click "Compute Embeddings"
3. UMAP reduces gene expression matrix to 2D
4. Each dot represents one cancer sample
5. Similar samples cluster together

## Related
- GSoC 2026 Issue #141: Enhance Similarity Maps
- cBioPortal: https://www.cbioportal.org
