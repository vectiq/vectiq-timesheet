import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  getSystemConfig,
  updateSystemConfig,
  getAdminStats,
  recalculateProjectTotals,
  cleanupOrphanedData,
  validateTimeEntries
} from '@/lib/services/admin';
import type { SystemConfig } from '@/types';

const QUERY_KEYS = {
  config: 'system-config',
  stats: 'admin-stats'
} as const;

export function useAdmin() {
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: [QUERY_KEYS.config],
    queryFn: getSystemConfig
  });

  const statsQuery = useQuery({
    queryKey: [QUERY_KEYS.stats],
    queryFn: getAdminStats
  });

  const updateConfigMutation = useMutation({
    mutationFn: updateSystemConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.config] });
    }
  });

  const recalculateMutation = useMutation({
    mutationFn: recalculateProjectTotals
  });

  const cleanupMutation = useMutation({
    mutationFn: cleanupOrphanedData
  });

  const validateMutation = useMutation({
    mutationFn: validateTimeEntries
  });

  const handleUpdateConfig = useCallback(async (config: SystemConfig) => {
    await updateConfigMutation.mutateAsync(config);
  }, [updateConfigMutation]);

  return {
    config: configQuery.data,
    stats: statsQuery.data,
    isLoading: configQuery.isLoading || statsQuery.isLoading,
    updateConfig: handleUpdateConfig,
    recalculateProjectTotals: recalculateMutation.mutateAsync,
    cleanupOrphanedData: cleanupMutation.mutateAsync,
    validateTimeEntries: validateMutation.mutateAsync,
    isUpdating: updateConfigMutation.isPending,
    isRecalculating: recalculateMutation.isPending,
    isCleaning: cleanupMutation.isPending,
    isValidating: validateMutation.isPending
  };
}