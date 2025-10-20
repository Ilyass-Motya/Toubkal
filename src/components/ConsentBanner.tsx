import React from 'react'

interface ConsentBannerProps {
  actionType: 'AI_QUERY' | 'DATA_COLLECTION'
  onGrant: () => void
  onDeny: () => void
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  actionType,
  onGrant,
  onDeny,
}) => {
  const getMessage = () => {
    switch (actionType) {
      case 'AI_QUERY':
        return 'AI query requires consent'
      case 'DATA_COLLECTION':
        return 'Data collection requires consent'
      default:
        return 'Action requires consent'
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="text-lg font-medium">{getMessage()}</p>
          <p className="text-sm opacity-90 mt-1">
            This action requires your explicit consent. Your privacy and data control are important to us.
          </p>
        </div>
        <div className="flex space-x-3 ml-4">
          <button
            onClick={onDeny}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Deny
          </button>
          <button
            onClick={onGrant}
            className="px-4 py-2 bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            Grant Consent
          </button>
        </div>
      </div>
    </div>
  )
}
