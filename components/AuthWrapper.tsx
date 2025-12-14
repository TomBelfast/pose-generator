import React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react';
import { Loader2, Image, Zap } from 'lucide-react';

interface AuthWrapperProps {
  children: React.ReactNode;
  refreshLimit?: () => void;
}

const clerkAppearance = {
  elements: {
    modalContent: 'bg-[#e0e5ec] border-[#d1d5db] shadow-2xl',
    modalCloseButton: 'text-[#1e293b] hover:bg-[#d1d5db]',
    modalBackdrop: 'bg-[#e0e5ec]/80',
    card: 'bg-[#e0e5ec] border-[#d1d5db]',
    headerTitle: 'text-[#1e293b] font-bold',
    headerSubtitle: 'text-[#475569]',
    formFieldInput: 'bg-[#e0e5ec] border-[#d1d5db] text-[#1e293b] placeholder-[#64748b] focus:border-[#6366f1] focus:ring-[#6366f1] shadow-[inset_2px_2px_4px_#a3b1c6,inset_-2px_-2px_4px_#ffffff]',
    formFieldLabel: 'text-[#1e293b]',
    formFieldErrorText: 'text-[#ef4444]',
    formFieldSuccessText: 'text-[#10b981]',
    formButtonPrimary: '!bg-[#10b981] hover:!bg-[#059669] !text-white font-medium transition-colors shadow-[4px_4px_8px_#a3b1c6,-4px_-4px_8px_#ffffff]',
    formButtonPrimaryHover: '!bg-[#059669]',
    formButtonSecondary: 'bg-[#e0e5ec] hover:bg-[#d1d5db] text-[#1e293b] border-[#d1d5db]',
    socialButtonsBlockButton: 'bg-[#e0e5ec] hover:bg-[#d1d5db] text-[#1e293b] border-[#d1d5db] transition-colors shadow-[4px_4px_8px_#a3b1c6,-4px_-4px_8px_#ffffff]',
    socialButtonsBlockButtonText: 'text-[#1e293b]',
    footerActionLink: 'text-[#6366f1] hover:text-[#4f46e5] transition-colors',
    identityPreviewText: 'text-[#1e293b]',
    identityPreviewEditButton: 'text-[#6366f1] hover:text-[#4f46e5]',
    dividerLine: 'bg-[#d1d5db]',
    dividerText: 'text-[#64748b]',
    userButtonPopoverCard: 'bg-[#e0e5ec] border-[#d1d5db] shadow-xl',
    userButtonPopoverActionButton: 'text-[#1e293b] hover:bg-[#d1d5db] transition-colors',
    userButtonPopoverActionButtonText: 'text-[#1e293b]',
    userButtonPopoverFooter: 'bg-[#e0e5ec]',
    userButtonPopoverHeader: 'bg-[#e0e5ec]',
    userButtonPopoverMain: 'bg-[#e0e5ec]',
    avatarBox: 'w-8 h-8',
    alert: 'bg-[#d1d5db] border-[#d1d5db] text-[#1e293b]',
    alertText: 'text-[#1e293b]',
    codeBlock: 'bg-[#d1d5db] text-[#1e293b]',
    spinner: 'text-[#00dd2f]',
  },
  variables: {
    colorPrimary: '#6366f1',
    colorBackground: '#e0e5ec',
    colorInputBackground: '#e0e5ec',
    colorInputText: '#1e293b',
    colorText: '#1e293b',
    colorTextSecondary: '#475569',
    borderRadius: '12px',
  }
};

interface UserLimitDisplayProps {
  remaining: number;
  limit: number;
  isLoading: boolean;
  error: string | null;
}

const UserLimitDisplay: React.FC<UserLimitDisplayProps> = ({ remaining, limit, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-neu-accent" />
        <span className="text-neu-text-light">Ładowanie...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-neu-danger">
        <span>Limit niedostępny</span>
      </div>
    );
  }

  const percentage = (remaining / limit) * 100;
  const isLow = remaining <= 2;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Image className="w-4 h-4 text-neu-text-muted" />
        <span className="text-xs sm:text-sm text-neu-text-muted">
          {remaining}/{limit}
        </span>
      </div>

      <div className="w-12 sm:w-20 neu-progress h-1.5 sm:h-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isLow ? 'bg-neu-danger' : 'bg-neu-success'
            }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isLow && (
        <span className="text-xs text-neu-danger font-medium hidden sm:inline">
          Mało!
        </span>
      )}
    </div>
  );
};

const AuthWrapper: React.FC<AuthWrapperProps & { limitData?: any }> = ({ children, refreshLimit, limitData }) => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--neu-base)', color: 'var(--neu-text)' }}>
      {/* Header */}
      <header className="neu-raised border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="neu-raised-sm p-1.5 sm:p-2 rounded-full">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-neu-accent" />
              </div>
              <h1 className="text-base sm:text-xl font-bold text-neu-text">
                Pose Generator
              </h1>
            </div>

            {/* User controls */}
            <div className="flex items-center gap-2 sm:gap-4">
              <SignedIn>
                {limitData && <UserLimitDisplay {...limitData} />}
                <UserButton appearance={clerkAppearance} />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>
        <SignedIn>
          {children}
        </SignedIn>
        <SignedOut>
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
            <div className="w-full max-w-md">
              {/* Welcome card */}
              <div className="neu-card text-center">
                {/* Icon */}
                <div className="neu-raised-sm inline-flex p-4 rounded-full mb-6">
                  <Zap className="w-10 h-10 sm:w-12 sm:h-12 text-neu-accent" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-neu-text mb-2">
                  Pose Generator
                </h2>
                <p className="text-neu-text-muted mb-8">
                  Zaloguj się, aby zacząć generować pozy z AI
                </p>

                {/* Sign in button */}
                <div className="neu-raised-sm p-4 rounded-[var(--radius-sm)]">
                  <SignInButton
                    mode="modal"
                    appearance={clerkAppearance}
                  />
                </div>

                {/* Sign up link */}
                <p className="text-neu-text-muted text-sm mt-6">
                  Nie masz konta?{' '}
                  <SignUpButton
                    mode="modal"
                    appearance={clerkAppearance}
                  />
                </p>
              </div>

              {/* Features hint */}
              <div className="mt-6 text-center">
                <p className="text-xs text-neu-text-light">
                  20 darmowych generacji dziennie
                </p>
              </div>
            </div>
          </div>
        </SignedOut>
      </main>
    </div>
  );
};

export default AuthWrapper;
