import { useState } from 'react';
import { useBeforeUnload } from 'react-router-dom';

type StorageType = 'localStorage' | 'sessionStorage';

interface UseBrowserStorageParams<StateType> {
  key: string;
  initialState: StateType | (() => StateType);
  storage?: StorageType;
}

export default function useBrowserStorage<StateType>({
  key,
  initialState,
  storage = 'sessionStorage',
}: UseBrowserStorageParams<StateType>): [
  StateType,
  React.Dispatch<React.SetStateAction<StateType>>,
  () => void,
] {
  const storageObject =
    storage === 'localStorage' ? window.localStorage : window.sessionStorage;

  const getStoredValue = (): StateType => {
    try {
      const item = storageObject.getItem(key);
      if (item !== null) {
        return JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error reading from ${storage}`, error);
    }

    return typeof initialState === 'function'
      ? (initialState as () => StateType)()
      : initialState;
  };

  const setStoredValue = (value: StateType) => {
    try {
      storageObject.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to ${storage}`, error);
    }
  };

  const removeValue = () => {
    try {
      storageObject.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${storage} key=${key}`, error);
    }
  };

  const [state, setState] = useState<StateType>(getStoredValue);

  useBeforeUnload(() => {
    setStoredValue(state);
  });

  return [state, setState, removeValue] as const;
}
