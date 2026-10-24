'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OdooMainMenu, AppId } from '@/components/menu/OdooMainMenu';
import { AuthUser, PRESET_USERS, UserRole } from '@/types/auth';
import { ProjectRFQ } from '@/types/crm';

interface HomeLauncherContainerProps {
  initialProjects?: ProjectRFQ[];
}

export default function HomeLauncherContainer({ initialProjects = [] }: HomeLauncherContainerProps) {
  const router = useRouter();

  // Default to null so the user always lands on the role-gated launcher shown in their screenshot
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role') as UserRole;
      if (urlRole && PRESET_USERS[urlRole]) {
        return PRESET_USERS[urlRole];
      }
    }
    return null;
  });

  const [inEstimationCount, setInEstimationCount] = useState(4);
  const [pendingMdCount, setPendingMdCount] = useState(2);
  const [approvedForEstimatorCount, setApprovedForEstimatorCount] = useState(4);
  const [pendingSurveysCount, setPendingSurveysCount] = useState(2);

  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      const inEst = initialProjects.filter(p => ['Approved for Bidding', 'Under BOQ Estimation', 'Survey In Progress'].includes(p.status)).length;
      const mdPending = initialProjects.filter(p => p.status === 'Pending MD Approval' || p.mdStatus === 'Pending Review').length;
      const appForEst = initialProjects.filter(p => p.status === 'Approved for Bidding').length;
      setInEstimationCount(inEst || 4);
      setPendingMdCount(mdPending || 2);
      setApprovedForEstimatorCount(appForEst || 4);
    }
  }, [initialProjects]);

  const handleLaunchApp = (appId: AppId) => {
    switch (appId) {
      case 'estimator':
        router.push('/estimator');
        break;
      case 'material-requests':
        router.push('/material-requests');
        break;
      case 'crm':
        router.push('/crm');
        break;
      case 'md':
        router.push('/md');
        break;
      case 'operations':
        router.push('/operations');
        break;
      case 'surveyor':
        router.push('/surveyor');
        break;
      case 'qaqc':
        router.push('/qaqc');
        break;
      case 'hse':
        router.push('/hse');
        break;
      case 'hr':
        router.push('/hr');
        break;
      case 'inventory':
        router.push('/inventory');
        break;
      case 'purchase':
        router.push('/purchase');
        break;
      default:
        router.push('/');
        break;
    }
  };

  const handleLoginAsRole = async (role: UserRole) => {
    const user = PRESET_USERS[role] || PRESET_USERS.estimator;
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('radwa_active_role', role);
    }
  };

  const handleManualLogin = async (email: string) => {
    const matched = Object.values(PRESET_USERS).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setCurrentUser(matched);
      if (typeof window !== 'undefined') {
        localStorage.setItem('radwa_active_role', matched.role);
      }
    } else {
      throw new Error(`No enterprise user registered for email: ${email}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('radwa_active_role');
      localStorage.removeItem('radwa_auth_user');
    }
  };

  return (
    <OdooMainMenu
      currentUser={currentUser}
      onLaunchApp={handleLaunchApp}
      onLoginAsRole={handleLoginAsRole}
      onManualLogin={handleManualLogin}
      onLogout={handleLogout}
      pendingMdCount={pendingMdCount}
      inEstimationCount={inEstimationCount}
      approvedForEstimatorCount={approvedForEstimatorCount}
      pendingSurveysCount={pendingSurveysCount}
    />
  );
}
