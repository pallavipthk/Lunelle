import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert, X } from 'lucide-react';
import { EmergencyCheckResult } from '../types';

interface EmergencyBannerProps {
  emergency: EmergencyCheckResult;
  onDismiss?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ emergency, onDismiss }) => {
  if (!emergency.isEmergency) return null;

  return (
    <div className="mb-6 p-5 rounded-card bg-[#FFF3F0] border-2 border-[#E57373] shadow-soft-md animate-fade-in text-left">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-full bg-[#E57373]/20 text-[#C62828] shrink-0 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#C62828] text-white text-[11px] font-bold uppercase tracking-wider mb-1.5">
              Urgent Medical Alert
            </span>
            <h3 className="font-serif text-lg font-bold text-[#8E0000]">
              {emergency.alertTitle}
            </h3>
            <p className="text-xs text-text-primary mt-1 leading-relaxed">
              {emergency.guidanceText}
            </p>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-text-secondary hover:text-text-primary p-1 rounded-lg"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Immediate Recommended Actions */}
      {emergency.emergencyActions?.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[#E57373]/30">
          <h4 className="text-xs font-bold uppercase text-[#8E0000] tracking-wider mb-2">
            Recommended Immediate Actions:
          </h4>
          <ul className="space-y-1.5">
            {emergency.emergencyActions.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-text-primary">
                <span className="text-[#C62828] font-bold">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Verified Helplines Directory */}
      <div className="mt-4 pt-3 border-t border-[#E57373]/30 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {emergency.helplines?.map((hl, i) => (
          <a
            key={i}
            href={`tel:${hl.number.replace(/[^0-9]/g, '')}`}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E57373]/40 hover:bg-[#FFEAE6] transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-text-primary">{hl.name}</p>
              <p className="text-[10px] text-text-secondary">{hl.description}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#C62828] bg-[#FFF0ED] px-2 py-1 rounded-lg">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{hl.number}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
