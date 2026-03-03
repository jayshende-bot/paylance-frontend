import { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import { getConnectStatus, getOnboardingLink } from '../api/paymentApi';
import toast from 'react-hot-toast';
import { useAuth } from './useAuth';

export const useStripeConnect = () => {
  const { isFreelancer } = useAuth();

  const { data: statusData, refetch: refetchStatus } = useQuery(
    'connect-status',
    () => getConnectStatus().then((r) => r.data.data),
    { enabled: isFreelancer }
  );

  const onboardMutation = useMutation(() => getOnboardingLink().then((r) => r.data.data), {
    onSuccess: ({ url }) => {
      window.location.href = url;
    },
    onError: () => toast.error('Failed to generate onboarding link'),
  });

  return {
    isVerified: statusData?.verified || false,
    chargesEnabled: statusData?.chargesEnabled,
    payoutsEnabled: statusData?.payoutsEnabled,
    requirements: statusData?.requirements,
    startOnboarding: onboardMutation.mutate,
    isOnboarding: onboardMutation.isLoading,
    refetchStatus,
  };
};
