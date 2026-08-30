'use client';

import React from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { BrandEditor } from '@/components/brands/BrandEditor';

export default function NewBrandPage() {
  return (
    <AdminLayout title="New Brand Funnel">
      <BrandEditor mode="create" />
    </AdminLayout>
  );
}
