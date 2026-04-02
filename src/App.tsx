import React from 'react'

function App() {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white border-r border-slate-200 px-4 py-6 flex flex-col shrink-0 drop-shadow-sm z-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">
          Controls
        </h2>
        <div className="flex-1 rounded-md border border-dashed border-slate-300 flex items-center justify-center p-4 bg-slate-50">
          <p className="text-slate-400 text-sm text-center">Settings & Filters will go here</p>
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
             <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-slate-500 font-medium">Embedding Visualization Plot</p>
                <p className="text-slate-400 text-sm max-w-sm text-center">The D3.js and UMAP powered visualization will be rendered in this area.</p>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
