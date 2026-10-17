import React, { useState, useRef, useEffect } from 'react';
import { Lock, ShieldCheck, X, Sparkles, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';

interface DesignerPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PORTAL_PASSCODE = '2580';
export const PASSCODE_STORAGE_KEY = 'sigma_designer_portal_unlocked';

export function isDesignerGateUnlocked(): boolean {
  try {
    return sessionStorage.getItem(PASSCODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setDesignerGateUnlocked(): void {
  try {
    sessionStorage.setItem(PASSCODE_STORAGE_KEY, 'true');
  } catch (e) {
    console.error('Failed to set session storage', e);
  }
}

export default function DesignerPasscodeModal({ isOpen, onClose, onSuccess }: DesignerPasscodeModalProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError(false);
      setShake(false);
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (index: number, val: string) => {
    // Only accept numeric digit
    const cleaned = val.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = cleaned;
    setPin(newPin);
    setError(false);

    if (cleaned && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }

    // If all 4 digits entered, verify automatically
    if (cleaned && index === 3 && newPin.every(d => d !== '')) {
      verifyPin(newPin.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'Enter') {
      verifyPin(pin.join(''));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasteData) return;
    const newPin = ['', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      newPin[i] = pasteData[i];
    }
    setPin(newPin);
    if (pasteData.length === 4) {
      verifyPin(pasteData);
    } else {
      inputsRef.current[pasteData.length]?.focus();
    }
  };

  const verifyPin = (entered: string) => {
    if (entered === PORTAL_PASSCODE) {
      setDesignerGateUnlocked();
      toast.success('Passcode verified! Welcome to Designer Portal', {
        icon: '🎨',
        style: {
          borderRadius: '12px',
          background: '#1E1B4B',
          color: '#FCD34D',
          border: '1px solid rgba(251, 191, 36, 0.3)'
        }
      });
      onSuccess();
      onClose();
    } else {
      setError(true);
      setShake(true);
      toast.error('Incorrect passcode. Please try again.');
      setTimeout(() => {
        setShake(false);
        setPin(['', '', '', '']);
        inputsRef.current[0]?.focus();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div 
        className={`relative w-full max-w-md bg-gradient-to-b from-[#1F1728] via-[#161224] to-[#0D0A14] text-white rounded-3xl p-7 border border-rose-500/20 shadow-2xl shadow-rose-950/50 ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Glow effects */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 text-white shadow-xl shadow-rose-600/30 mb-4 ring-4 ring-rose-500/20">
            <Lock className="w-8 h-8" />
            <Sparkles className="w-4 h-4 text-amber-200 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="inline-block px-3 py-1 mb-2 text-xs font-semibold tracking-wider uppercase rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Authorized Personnel Only
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight text-white mb-2">
            Designer Portal Gate
          </h3>
          <p className="text-sm text-gray-300/80 max-w-xs mx-auto">
            Please enter the 4-digit security code to access the Sigma Photography designer workspace.
          </p>
        </div>

        {/* PIN Inputs */}
        <div className="flex justify-center gap-3.5 mb-6" onPaste={handlePaste}>
          {[0, 1, 2, 3].map((idx) => (
            <input
              key={idx}
              ref={(el) => { inputsRef.current[idx] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={pin[idx]}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border transition-all focus:outline-none ${
                error
                  ? 'border-red-500 bg-red-950/30 text-red-200 ring-2 ring-red-500/30'
                  : pin[idx]
                  ? 'border-amber-400 bg-amber-400/10 text-amber-300 ring-2 ring-amber-400/30'
                  : 'border-white/10 bg-white/5 text-white focus:border-rose-400 focus:bg-rose-500/10 focus:ring-2 focus:ring-rose-500/20'
              }`}
            />
          ))}
        </div>

        {/* Hint / Helper */}
        <div className="text-center mb-6">
          {error ? (
            <p className="text-xs text-red-400 font-medium">
              Access denied. Incorrect security code.
            </p>
          ) : (
            <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Contact Sigma administration if you require access code.</span>
            </p>
          )}
        </div>

        {/* Number buttons for mobile comfort */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === 'C') {
                  setPin(['', '', '', '']);
                  inputsRef.current[0]?.focus();
                } else if (key === '✓') {
                  verifyPin(pin.join(''));
                } else {
                  const emptyIdx = pin.findIndex(d => d === '');
                  if (emptyIdx !== -1) {
                    handleChange(emptyIdx, key);
                  }
                }
              }}
              className="py-3 text-lg font-bold rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-gray-200 hover:text-white border border-white/5 transition-all"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Submit Button */}
        <button
          onClick={() => verifyPin(pin.join(''))}
          disabled={pin.some(d => d === '')}
          className="w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 active:scale-[0.99] text-white shadow-lg shadow-rose-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          Unlock Designer Portal
        </button>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Individual designer authentication is required following passcode entry.
        </p>
      </div>
    </div>
  );
}
