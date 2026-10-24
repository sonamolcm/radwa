'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';
import { ProjectRFQ } from '@/types/crm';
import { INITIAL_PROJECTS } from '@/data/mockCrmData';
import { PRESET_USERS } from '@/types/auth';

export default function InventoryPage() {
  const router = useRouter();
  const [projects] = useState<ProjectRFQ[]>(INITIAL_PROJECTS);

  return (
    <InventoryDashboard
      projects={projects}
      currentUser={PRESET_USERS.inventory}
      onNavigateToPurchase={() => router.push('/purchase')}
      onNavigateToMaterialRequests={() => router.push('/material-requests')}
      onBackToMainMenu={() => router.push('/')}
    />
  );
}
