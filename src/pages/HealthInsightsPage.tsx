import React, { useState, useEffect } from 'react';
import { Sparkles, Info, ArrowUpRight, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { ExplainableInsight } from '../types';

export const HealthInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<ExplainableInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecordList, setSelectedRecordList] = useState<ExplainableInsight | null>(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      const res = await api.getInsights();
      setInsights(res.insights || []);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-cute">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E9E6DD]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B77D78] uppercase tracking-wider mb-1">
            <span>✨</span>
            <span>Transparent Health Intelligence</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#345344] tracking-tight">
            Explainable Health Patterns
          </h1>
          <p className="text-xs text-[#778078] mt-1 font-soft">
            Explore potential patterns observed across your real symptoms, sleep, cycle, and laboratory reports.
          </p>
        </div>

        <button
          onClick={loadInsights}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E9E6DD] text-[#345344] hover:bg-[#FAF8F2] text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync & Refresh Patterns</span>
        </button>
      </div>

      {/* Philosophy Callout Card */}
      <div className="p-4 rounded-card bg-[#F4F7F2] border border-botanical-green/40 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-deep-sage shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="text-deep-sage font-bold block mb-0.5">How Lunelle Calculates Patterns:</strong>
          Every insight shown here is derived algorithmically from records you have saved. We strictly distinguish correlation from causation, explain the exact supporting data points, and highlight what information might be missing.
        </div>
      </div>

      {/* Insights Cards Grid */}
      {insights.length === 0 ? (
        <div className="p-12 rounded-card bg-white border border-border-soft text-center shadow-soft">
          <HelpCircle className="w-10 h-10 text-botanical-green mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-base font-bold text-deep-sage mb-1">
            No Patterns Detected Yet
          </h3>
          <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
            Lunelle requires adequate historical data before presenting an insight (for example: multiple headaches logged with sleep context or repeated comparable lab tests). As you continue logging, real patterns will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights.map(ins => (
            <div
              key={ins.id}
              className="p-6 rounded-card-lg bg-white border border-border-soft shadow-soft flex flex-col justify-between"
            >
              <div>
                {/* Meta Header */}
                <div className="flex items-center justify-between text-[11px] text-text-secondary mb-2">
                  <span className="font-semibold text-deep-sage uppercase tracking-wider text-[10px] bg-pale-sage/60 px-2.5 py-0.5 rounded-full">
                    {ins.analysisPeriod}
                  </span>
                  <span className="font-mono text-text-secondary">
                    {ins.supportingRecordCount} supporting entries
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-deep-sage mb-2">
                  {ins.title}
                </h3>

                <p className="text-xs text-text-primary leading-relaxed mb-4">
                  {ins.plainLanguageExplanation}
                </p>

                {/* Practical Next Step */}
                {ins.practicalNextStep && (
                  <div className="p-3 rounded-xl bg-[#FAF8F2] border border-border-soft mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-deep-sage block mb-0.5">
                      Suggested Observational Step
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {ins.practicalNextStep}
                    </p>
                  </div>
                )}

                {/* Missing Info Notes */}
                {ins.missingInformationNotes?.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary block mb-1">
                      Important Missing Context
                    </span>
                    <ul className="space-y-1">
                      {ins.missingInformationNotes.map((note, idx) => (
                        <li key={idx} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div>
                {/* Uncertainty Disclaimer */}
                <div className="p-3 rounded-xl bg-white border border-border-soft text-[10px] text-text-secondary italic mb-4">
                  {ins.uncertaintyDisclaimer}
                </div>

                {/* Supporting Evidence Button */}
                <button
                  onClick={() => setSelectedRecordList(ins)}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-pill bg-[#FAF8F2] hover:bg-pale-sage/50 text-deep-sage text-xs font-semibold transition-colors border border-border-soft"
                >
                  <span>View {ins.supportingRecordCount} Supporting Records</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Supporting Records Modal */}
      {selectedRecordList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-text-primary/30 backdrop-blur-sm">
          <div className="bg-white rounded-card-lg shadow-soft-lg w-full max-w-lg p-6 border border-border-soft max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-border-soft mb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-deep-sage">
                  Supporting Evidence Records
                </h3>
                <p className="text-[11px] text-text-secondary">
                  {selectedRecordList.title}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecordList(null)}
                className="text-text-secondary hover:text-text-primary text-xs"
              >
                Close ✕
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedRecordList.supportingRecordIds.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#FAF8F2] border border-border-soft text-xs">
                  <div className="flex items-center justify-between font-mono text-[10px] text-text-secondary mb-1">
                    <span>{rec.type}</span>
                    <span>{rec.date}</span>
                  </div>
                  <p className="text-text-primary font-medium">{rec.summary}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-3 border-t border-border-soft text-right">
              <button
                onClick={() => setSelectedRecordList(null)}
                className="px-4 py-1.5 rounded-pill bg-deep-sage text-butter-cream text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
