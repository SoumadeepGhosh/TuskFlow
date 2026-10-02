'use client';

import React from 'react';
import { WorkspaceDetails } from '@/containers/workspaces/WorkspaceDetails';

interface WorkspaceRouteProps {
  params: Promise<{ id: string }>;
}

export default function WorkspaceDetailRoute({ params }: WorkspaceRouteProps) {
  const { id } = React.use(params);
  return <WorkspaceDetails workspaceId={Number(id)} />;
}
