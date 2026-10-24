'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PurchaseDashboard } from '@/components/procurement/PurchaseDashboard';
import { ProjectRFQ } from '@/types/crm';
import { INITIAL_PROJECTS } from '@/data/mockCrmData';
import { PRESET_USERS } from '@/types/auth';

export default function PurchasePage() {
  const router = useRouter();
  const [projects] = useState<ProjectRFQ[]>(INITIAL_PROJECTS);

  return (
    <PurchaseDashboard
      projects={projects}
      currentUser={PRESET_USERS.purchase}
      onNavigateToInventory={() => router.push('/inventory')}
      onNavigateToMaterialRequests={() => router.push('/material-requests')}
      onBackToMainMenu={() => router.push('/')}
    />
  );
}
