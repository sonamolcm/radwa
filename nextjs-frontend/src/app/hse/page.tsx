'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HseDashboard } from '@/components/hse/HseDashboard';
import { ProjectRFQ } from '@/types/crm';
import { INITIAL_PROJECTS } from '@/data/mockCrmData';
import { PRESET_USERS } from '@/types/auth';

export default function HsePage() {
  const router = useRouter();
  const [projects] = useState<ProjectRFQ[]>(INITIAL_PROJECTS);

  return (
    <HseDashboard
      projects={projects}
      currentUser={PRESET_USERS.hse}
      onBackToMainMenu={() => router.push('/')}
    />
  );
}
