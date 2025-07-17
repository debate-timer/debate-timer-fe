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
  const mutation = useMutation(options);

  const preventDuplicateMutation = useCallback(
    (
      variables: TVariables,
      mutateOptions?: Parameters<typeof mutation.mutate>[1],
    ) => {
      if (isMutatingRef.current) {
        console.warn('mutation 호출 중');
        return;
      }

      isMutatingRef.current = true;

      mutation
        .mutateAsync(variables, mutateOptions)
        .catch(() => {
          // onError 콜백에서 오류를 처리해서 비워둠.
        })
        .finally(() => {
          isMutatingRef.current = false;
        });
    },
    [mutation],
  );

  return { ...mutation, mutate: preventDuplicateMutation };
}
