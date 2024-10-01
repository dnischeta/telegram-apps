import {
  off,
  on,
  getStorageValue,
  setStorageValue,
  type EventListener,
} from '@telegram-apps/bridge';
import { isPageReload } from '@telegram-apps/navigation';

import { postEvent } from '@/scopes/globals.js';

import { internalState, isMounted, state } from './signals.js';
import type { State } from './types.js';

type StorageValue = State;

const MINI_APPS_METHOD = 'web_app_setup_main_button';
const CLICK_EVENT = 'main_button_pressed';
const STORAGE_KEY = 'mainButton';

/**
 * Mounts the component.
 *
 * This function restores the component state and is automatically saving it in the local storage
 * if it changed.
 */
export function mount(): void {
  if (!isMounted()) {
    const prev = isPageReload() && getStorageValue<StorageValue>(STORAGE_KEY);
    prev && internalState.set(prev);

    internalState.sub(onInternalStateChanged);
    state.sub(onStateChanged);
    isMounted.set(true);
  }
}

/**
 * Adds a new main button click listener.
 * @param fn - event listener.
 * @returns A function to remove bound listener.
 */
export function onClick(fn: EventListener<'main_button_pressed'>): VoidFunction {
  return on(CLICK_EVENT, fn);
}

/**
 * Removes the main button click listener.
 * @param fn - an event listener.
 */
export function offClick(fn: EventListener<'main_button_pressed'>): void {
  off(CLICK_EVENT, fn);
}

function onInternalStateChanged(state: State): void {
  setStorageValue<StorageValue>(STORAGE_KEY, state);
}

function onStateChanged(s: Required<State>) {
  // We should not commit changes until the payload is correct.
  // Some version of Telegram will crash due to the empty value of the text.
  s.text && postEvent(MINI_APPS_METHOD, {
    has_shine_effect: s.hasShineEffect,
    is_visible: s.isVisible,
    is_active: s.isEnabled,
    is_progress_visible: s.isLoaderVisible,
    text: s.text,
    color: s.backgroundColor,
    text_color: s.textColor,
  });
}

/**
 * Updates the main button state.
 * @param updates - state changes to perform.
 */
export function setParams(updates: Partial<State>): void {
  internalState.set({
    ...internalState(),
    ...Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined),
    ),
  });
}

/**
 * Unmounts the component, removing the listener, saving the component state in the local storage.
 *
 * Note that this function does not remove listeners, added via the `onClick` function.
 * @see onClick
 */
export function unmount(): void {
  internalState.unsub(onInternalStateChanged);
  state.unsub(onStateChanged);
  isMounted.set(false);
}
