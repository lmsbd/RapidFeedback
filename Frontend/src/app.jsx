import React from 'react';
// import type { IRuntimeConfig } from 'umi';
import { StoreProvider } from '@/stores';
import AuthGuard from '@/components/AuthGuard';

export function rootContainer(container) {
  return (
    <StoreProvider>
      <AuthGuard>{container}</AuthGuard>
    </StoreProvider>
  );
}
