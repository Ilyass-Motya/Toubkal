/**
 * Audit Page Component (Transparency Dashboard)
 *
 * Main audit page accessible via toubkal://audit
 * Provides real-time audit log viewer with filtering and search capabilities.
 */

import React from 'react'
import { TransparencyDashboard } from '../../toubkal/app/features/transparency-dashboard'

interface AuditPageProps {
  initialFilter?: string
}

export const AuditPage: React.FC<AuditPageProps> = ({ initialFilter = 'all' }) => {
  return <TransparencyDashboard />
}

export default AuditPage
