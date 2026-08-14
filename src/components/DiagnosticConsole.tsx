'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Play, ChevronDown, ChevronUp, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { mockInventoryStore } from '@/lib/medusa';


export default function DiagnosticConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<{
    environmentCheck?: string;
    inventorySimulation?: string;
    checkoutLinkBridge?: string;
  } | null>(null);

  // Read current overrides
  const [brushQty, setBrushQty] = useState(() => mockInventoryStore.get('pomabrush-hero'));
  const [flossQty, setFlossQty] = useState(() => mockInventoryStore.get('pomafloss-floating'));

  const toggleBrushStock = () => {
    const newQty = brushQty > 0 ? 0 : 15;
    setBrushQty(newQty);
    mockInventoryStore.set('pomabrush-hero', newQty);
  };

  const toggleFlossStock = () => {
    const newQty = flossQty > 0 ? 0 : 8;
    setFlossQty(newQty);
    mockInventoryStore.set('pomafloss-floating', newQty);
  };

  const runDiagnostics = async () => {
    try {
      setIsRunning(true);
      setLogs(['Initializing Diagnostic Runner...']);
      const res = await fetch('/api/diagnostics');
      const data = await res.json();
      setLogs(data.logs || []);
      setTestResults(data.results || null);
    } catch (e: any) {
      setLogs((prev) => [...prev, `[ERROR] Failed to run test suite: ${e.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {/* Mini toggle floating badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-colors cursor-pointer"
      >
        <Terminal className="h-4 w-4" />
        DIAGNOSTIC TEST CENTER
        {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
      </button>

      {/* Expanded Console Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/95 p-4 text-white shadow-2xl backdrop-blur-xl sm:w-[420px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="flex items-center gap-2 text-xs font-bold text-indigo-400">
                <Shield className="h-4 w-4" />
                SYSTEM TEST RUNNER
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">v1.0.0-E2E</span>
            </div>

            {/* Simulated Controls */}
            <div className="mt-4 space-y-3">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase">Interactive Stock Mocking</h4>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={toggleBrushStock}
                  className={`flex flex-col items-start gap-1 rounded-xl p-2.5 border transition-all duration-300 cursor-pointer ${
                    brushQty === 0
                      ? 'border-red-500/20 bg-red-950/10 text-red-300'
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] text-neutral-400">PomaBrush Inventory</span>
                  <span className="font-semibold flex items-center gap-1">
                    {brushQty === 0 ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {brushQty === 0 ? '0 (Out of Stock)' : '15 (Active)'}
                  </span>
                </button>

                <button
                  onClick={toggleFlossStock}
                  className={`flex flex-col items-start gap-1 rounded-xl p-2.5 border transition-all duration-300 cursor-pointer ${
                    flossQty === 0
                      ? 'border-red-500/20 bg-red-950/10 text-red-300'
                      : 'border-white/5 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] text-neutral-400">PomaFloss Inventory</span>
                  <span className="font-semibold flex items-center gap-1">
                    {flossQty === 0 ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {flossQty === 0 ? '0 (Out of Stock)' : '8 (Active)'}
                  </span>
                </button>
              </div>
            </div>

            {/* Test Results Dashboard */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold text-neutral-400 uppercase">Diagnostic Dashboard</h4>
                <button
                  onClick={runDiagnostics}
                  disabled={isRunning}
                  className="flex items-center gap-1 rounded bg-indigo-600 px-2 py-1 text-[10px] font-bold uppercase hover:bg-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isRunning ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                  RUN SUITE
                </button>
              </div>

              {testResults && (
                <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-center mt-1">
                  <div className={`rounded p-1 border ${testResults.environmentCheck === 'PASS' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'}`}>
                    ENV: {testResults.environmentCheck}
                  </div>
                  <div className={`rounded p-1 border ${testResults.inventorySimulation === 'PASS' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'}`}>
                    MOCK: {testResults.inventorySimulation}
                  </div>
                  <div className={`rounded p-1 border ${testResults.checkoutLinkBridge === 'PASS' ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' : 'bg-red-950/20 border-red-500/20 text-red-400'}`}>
                    BRIDGE: {testResults.checkoutLinkBridge}
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Window Logs */}
            <div className="mt-4">
              <h4 className="text-[11px] font-bold text-neutral-400 uppercase mb-1">Execution Terminal</h4>
              <div className="h-32 overflow-y-auto rounded-lg bg-neutral-900/50 p-2 font-mono text-[9px] text-neutral-300 leading-relaxed border border-white/5 space-y-1">
                {logs.length === 0 ? (
                  <p className="text-neutral-500 font-light">Idle. Click &quot;RUN SUITE&quot; above to initiate live E2E diagnostics validation.</p>
                ) : (
                  logs.map((log, idx) => {
                    let color = 'text-neutral-300';
                    if (log.includes('[SUCCESS]')) color = 'text-emerald-400';
                    if (log.includes('[ERROR]')) color = 'text-red-400';
                    if (log.includes('[WARN]')) color = 'text-amber-400';
                    return (
                      <div key={idx} className={color}>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
