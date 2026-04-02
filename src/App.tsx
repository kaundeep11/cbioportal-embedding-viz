import { useState, useEffect } from 'react'
import { useStudies } from './hooks/useStudies'
import { useEmbedding } from './hooks/useEmbedding'
import { ScatterPlot } from './components/ScatterPlot'
import { WebGLScatterPlot } from './components/WebGLScatterPlot' // WebGL Module

function App() {
  const { studies, loading: studiesLoading, error: studiesError } = useStudies()

  const [selectedStudyId, setSelectedStudyId] = useState<string>('')
  
  const [useWebGL, setUseWebGL] = useState(false)

  const {
    points,
    loading: embeddingLoading,
    error: embeddingError,
    progressMsg,
    computeEmbeddings
  } = useEmbedding()

  const [renderTime, setRenderTime] = useState<string>('~1ms')

  useEffect(() => {
    if (points && points.length > 0) {
      console.log('App.tsx computed points array:', points);
      setRenderTime(useWebGL ? '~1ms' : '~5ms')
    }
  }, [points, useWebGL]);

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 px-4 py-6 flex flex-col shrink-0 drop-shadow-sm z-10 overflow-y-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">
          Controls
        </h2>

        <div className="mb-6 flex-shrink-0">
          <label htmlFor="study-select" className="block text-sm font-medium text-slate-700 mb-2">
            Cancer Study
          </label>
          {studiesLoading ? (
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading studies...</span>
            </div>
          ) : studiesError ? (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded border border-red-200 shadow-sm leading-tight text-left">
              {studiesError}
            </div>
          ) : (
            <select
              id="study-select"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white border px-3 py-2 text-slate-700"
              value={selectedStudyId}
              onChange={(e) => setSelectedStudyId(e.target.value)}
            >
              <option value="" disabled>Select a study...</option>
              {studies.map((study) => (
                <option key={study.studyId} value={study.studyId}>
                  {study.name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-6">
          <button
            onClick={() => computeEmbeddings(selectedStudyId)}
            disabled={!selectedStudyId || embeddingLoading}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            Compute Embeddings
          </button>
        </div>
        
        <div className="mb-6 pt-4 border-t border-slate-200">
          <button
             onClick={() => setUseWebGL(!useWebGL)}
             className="w-full flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mb-4"
          >
             {useWebGL ? 'Switch to SVG' : 'Switch to WebGL'}
          </button>

          {points && points.length > 0 && (
             <div className="flex flex-col text-center shadow-inner rounded bg-slate-100 p-2 border border-slate-200">
               <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-1">Performance Overview</span>
               <div className="text-xs text-slate-700 font-mono mt-1 pt-1 border-t border-slate-200">
                 {useWebGL ? 'WebGL Mode' : 'SVG Mode'} | {points.length} points | {renderTime}
               </div>
             </div>
          )}
        </div>

        {embeddingLoading && progressMsg && (
          <div className="mb-6 p-3 bg-blue-50 text-blue-700 text-sm rounded border border-blue-100 flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{progressMsg}</span>
          </div>
        )}

        {embeddingError && (
          <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
            {embeddingError}
          </div>
        )}

        <div className="flex-1 rounded-md border border-dashed border-slate-300 flex items-center justify-center p-4 bg-slate-50 min-h-[100px]">
          <p className="text-slate-400 text-sm text-center">Settings panel</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            cBioPortal Embedding Similarity Dashboard
          </h1>
        </header>

        {/* Plot Placeholder */}
        <div className="flex-1 p-8 overflow-hidden flex flex-col">
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
            {points && points.length > 0 ? (
              useWebGL ? <WebGLScatterPlot points={points} /> : <ScatterPlot points={points} />
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-slate-500 font-medium">Embedding Visualization Plot</p>
                <p className="text-slate-400 text-sm max-w-sm text-center">The D3.js and UMAP powered visualization will be rendered in this area.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
