'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HrDashboard } from '@/components/hr/HrDashboard';
import { ProjectRFQ } from '@/types/crm';
import { INITIAL_PROJECTS } from '@/data/mockCrmData';
import { PRESET_USERS } from '@/types/auth';

export default function HrPage() {
  const router = useRouter();
  const [projects] = useState<ProjectRFQ[]>(INITIAL_PROJECTS);

  return (
    <HrDashboard
      projects={projects}
      currentUser={PRESET_USERS.hr}
      onBackToMainMenu={() => router.push('/')}
    />
  );
}
