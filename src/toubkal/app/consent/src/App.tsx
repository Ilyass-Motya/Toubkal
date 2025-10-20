import React, { useState, useEffect } from 'react';

interface ConsentDecision {
  decisionId: string;
  consentType: string;
  action: string;
  timestamp: string;
  userId: string;
  reason: string;
  signature: string;
  snapshot: string;
}

const ConsentPage: React.FC = () => {
  const [consentHistory, setConsentHistory] = useState<ConsentDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Connect to Mojo interface to get consent history
    // For now, show mock data
    const mockHistory: ConsentDecision[] = [
      {
        decisionId: 'consent_001',
        consentType: 'analytics',
        action: 'granted',
        timestamp: new Date().toISOString(),
        userId: 'user_123',
        reason: 'User explicitly granted consent for analytics',
        signature: 'mock_signature_123',
        snapshot: 'mock_snapshot_123'
      }
    ];
    
    setConsentHistory(mockHistory);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading consent history...</p>
        </div>
      </div>
    );
  }

  if (error !== null && error !== undefined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400">Error loading consent history: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Consent History
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track and manage your privacy consent decisions with cryptographic verification
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Consent Decisions
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {consentHistory.map((decision) => (
              <div key={decision.decisionId} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {decision.consentType}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {decision.reason}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(decision.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      decision.action === 'granted' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      {decision.action}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {decision.consentType}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentPage;
