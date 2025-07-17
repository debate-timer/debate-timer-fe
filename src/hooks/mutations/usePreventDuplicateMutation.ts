import { useRef, useCallback } from 'react';
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

export function usePreventDuplicateMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  const isMutatingRef = useRef(false);

  const onSettled: UseMutationOptions<
    TData,
    TError,
    TVariables,
    TContext
  >['onSettled'] = (data, error, variables, context) => {
    isMutatingRef.current = false;
    options.onSettled?.(data, error, variables, context);
  };

  const mutation = useMutation({ ...options, onSettled });

  const preventDuplicateMutate = useCallback(
    (
      variables: TVariables,
      mutateOptions?: Parameters<typeof mutation.mutate>[1],
    ) => {
      if (isMutatingRef.current) {
        console.warn('이미 요청이 처리 중 입니다.');
        return;
      }
      isMutatingRef.current = true;
      mutation.mutate(variables, mutateOptions);
    },

    [mutation],
  );

  return { ...mutation, mutate: preventDuplicateMutate };
}
