'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QaqcDashboard } from '@/components/qaqc/QaqcDashboard';
import { ProjectRFQ } from '@/types/crm';
import { INITIAL_PROJECTS } from '@/data/mockCrmData';
import { PRESET_USERS } from '@/types/auth';

export default function QaqcPage() {
  const router = useRouter();
  const [projects] = useState<ProjectRFQ[]>(INITIAL_PROJECTS);

  return (
    <QaqcDashboard
      projects={projects}
      currentUser={PRESET_USERS.qaqc}
      onBackToMainMenu={() => router.push('/')}
    />
  );
}
