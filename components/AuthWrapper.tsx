import React from 'react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react';
import { Loader2, Image } from 'lucide-react';
import { useUserLimit } from '../hooks/useUserLimit';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const clerkAppearance = {
  elements: {
    // Modal and container styling
    modalContent: 'bg-base-200 border-base-300 shadow-2xl',
    modalCloseButton: 'text-base-content hover:bg-base-300',
    modalBackdrop: 'bg-black/50',
    
    // Header styling
    headerTitle: 'text-base-content font-bold',
    headerSubtitle: 'text-gray-400',
    
    // Form styling
    formFieldInput: 'bg-base-300 border-base-300 text-base-content placeholder-gray-500 focus:border-brand-primary focus:ring-brand-primary',
    formFieldLabel: 'text-base-content',
    formFieldErrorText: 'text-red-400',
    formFieldSuccessText: 'text-green-400',
    
    // Button styling
    formButtonPrimary: 'bg-brand-primary hover:bg-brand-primary/90 text-white font-medium transition-colors',
    formButtonSecondary: 'bg-base-300 hover:bg-base-400 text-base-content border-base-300',
    
    // Social buttons
    socialButtonsBlockButton: 'bg-base-300 hover:bg-base-400 text-base-content border-base-300 transition-colors',
    socialButtonsBlockButtonText: 'text-base-content',
    
    // Links and text
    footerActionLink: 'text-brand-primary hover:text-brand-primary/80 transition-colors',
    identityPreviewText: 'text-base-content',
    identityPreviewEditButton: 'text-brand-primary hover:text-brand-primary/80',
    
    // Divider
    dividerLine: 'bg-base-300',
    dividerText: 'text-gray-400',
    
    // Card styling
    card: 'bg-base-200 border-base-300',
    
    // User button styling
    userButtonPopoverCard: 'bg-base-200 border-base-300 shadow-xl',
    userButtonPopoverActionButton: 'text-base-content hover:bg-base-300 transition-colors',
    userButtonPopoverActionButtonText: 'text-base-content',
    userButtonPopoverFooter: 'bg-base-200',
    userButtonPopoverHeader: 'bg-base-200',
    userButtonPopoverMain: 'bg-base-200',
    
    // Avatar styling
    avatarBox: 'w-8 h-8',
    
    // Alert styling
    alert: 'bg-base-300 border-base-300 text-base-content',
    alertText: 'text-base-content',
    
    // Code styling
    codeBlock: 'bg-base-300 text-base-content',
    
    // Loading states
    spinner: 'text-brand-primary',
  },
  variables: {
    colorPrimary: '#4f46e5',
    colorBackground: '#1f2937',
    colorInputBackground: '#374151',
    colorInputText: '#f9fafb',
    colorText: '#f9fafb',
    colorTextSecondary: '#9ca3af',
    borderRadius: '0.5rem',
  }
};

const UserLimitDisplay: React.FC = () => {
  const { remaining, limit, isLoading, error } = useUserLimit();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-400">
        <span>Limit unavailable</span>
      </div>
    );
  }

  const percentage = (remaining / limit) * 100;
  const isLow = remaining <= 2;

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Image className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-400">
          {remaining}/{limit} free
        </span>
      </div>
      
      <div className="w-20 h-2 bg-base-300 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${
            isLow ? 'bg-red-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isLow && (
        <span className="text-xs text-red-400 font-medium">
          Low!
        </span>
      )}
    </div>
  );
};

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Header with authentication controls */}
      <header className="bg-base-200 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-base-content">
                Pose Generator
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <SignedIn>
                <UserLimitDisplay />
                <UserButton 
                  appearance={clerkAppearance}
                />
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
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-base-content mb-2">
                  Pose Generator
                </h2>
                <p className="text-gray-400">
                  Sign in to start generating amazing poses with AI
                </p>
              </div>
              
              <div className="bg-base-200 rounded-lg p-6 border border-base-300">
                <div className="flex justify-center">
                  <SignInButton 
                    mode="modal"
                    appearance={{
                      ...clerkAppearance,
                      elements: {
                        ...clerkAppearance.elements,
                        formButtonPrimary: 'bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors',
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{' '}
                  <SignUpButton 
                    mode="modal"
                    appearance={clerkAppearance}
                  />
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
