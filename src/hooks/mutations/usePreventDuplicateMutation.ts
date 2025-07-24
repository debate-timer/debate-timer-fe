import { useRef, useCallback } from 'react';
import {
  type DefaultError,
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from '@tanstack/react-query';

export function usePreventDuplicateMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>,
): UseMutationResult<TData, TError, TVariables, TContext> {
  // useRef를 통해 요청 여부를 저장
  const isMutatingRef = useRef(false);

  // 요청이 끝난 후 실행
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

  // 중복 요청을 방지하는 mutation wrapper
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

  // 중복 요청을 방지하는 커스텀 mutate를 반환
  return { ...mutation, mutate: preventDuplicateMutate };
}
