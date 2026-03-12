import { useReducer, useEffect, useRef } from 'react';
import type { ProviderType } from 'shared/domain/types';
import {
  TraktChartTypeValues,
  TraktMediaTypeValues,
  type TraktChartType,
  type TraktMediaType,
} from 'shared/domain/types';
import {
  getProviderDisplayName,
  isTraktChart,
  isStevenLu,
  isAnilist,
  getTraktChartDisplayName,
} from 'shared/domain/logic';
import {
  listNameSchema,
  maxItemsSchema,
  anilistUsernameSchema,
  anilistStatusDisplayNames,
  AnilistStatusValues,
  type AnilistStatus,
} from 'shared/presentation/schemas';
import { validateAndDetectProvider, getProviderName } from '../lib/url-validator';
import { useToast } from './use-toast';
import { useMinLoading } from './use-min-loading';
import { useProviderConfig } from './use-provider-config';
import { trpc } from '../lib/trpc';
import { showErrorToast, showValidationErrorToast } from '../lib/toast-helpers';

export interface AddListFormState {
  open: boolean;
  name: string;
  url: string;
  maxItems: string;
  provider: ProviderType;
  urlError: string | null;
  selectedMediaType: TraktMediaType;
  selectedChartType: TraktChartType;
  seerrUserIdOverride: string;
  anilistUsername: string;
  anilistUsernameError: string | null;
  anilistStatus: AnilistStatus;
  userEditedName: boolean;
  currentStep: 1 | 2;
  progressAnimated: boolean;
}

type AddListFormAction =
  | {
      type: 'SET_FIELD';
      field: keyof AddListFormState;
      value: AddListFormState[keyof AddListFormState];
    }
  | { type: 'SET_PROVIDER'; provider: ProviderType; url: string }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'GO_TO_STEP_2'; name: string }
  | { type: 'GO_TO_STEP_1' }
  | { type: 'RESET_ON_SUCCESS' }
  | { type: 'SET_PROGRESS_ANIMATED' };

const initialState: AddListFormState = {
  open: false,
  name: '',
  url: '',
  maxItems: '20',
  provider: 'trakt',
  urlError: null,
  selectedMediaType: TraktMediaTypeValues.MOVIES,
  selectedChartType: TraktChartTypeValues.TRENDING,
  seerrUserIdOverride: '',
  anilistUsername: '',
  anilistUsernameError: null,
  anilistStatus: AnilistStatusValues.PLANNING,
  userEditedName: false,
  currentStep: 1,
  progressAnimated: false,
};

function addListFormReducer(state: AddListFormState, action: AddListFormAction): AddListFormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_PROVIDER':
      return {
        ...state,
        provider: action.provider,
        userEditedName: false,
        urlError:
          action.url &&
          !isTraktChart(action.provider) &&
          !isStevenLu(action.provider) &&
          !isAnilist(action.provider)
            ? (() => {
                const result = validateAndDetectProvider(action.url);
                return !result.isValid || result.provider !== action.provider
                  ? `Please enter a valid ${getProviderDisplayName(action.provider)} URL`
                  : null;
              })()
            : null,
      };
    case 'OPEN':
      return {
        ...initialState,
        open: true,
        provider: state.provider, // Keep current provider selection
      };
    case 'CLOSE':
      return { ...state, open: false };
    case 'GO_TO_STEP_2':
      return { ...state, currentStep: 2, name: action.name };
    case 'GO_TO_STEP_1':
      return {
        ...state,
        currentStep: 1,
        name: '',
        url: '',
        maxItems: '20',
        seerrUserIdOverride: '',
        urlError: null,
        userEditedName: false,
        selectedMediaType: TraktMediaTypeValues.MOVIES,
        selectedChartType: TraktChartTypeValues.TRENDING,
        anilistUsername: '',
        anilistUsernameError: null,
        anilistStatus: AnilistStatusValues.PLANNING,
      };
    case 'RESET_ON_SUCCESS':
      return {
        ...state,
        name: '',
        url: '',
        maxItems: '20',
        seerrUserIdOverride: '',
        urlError: null,
        userEditedName: false,
        anilistUsername: '',
        anilistStatus: AnilistStatusValues.PLANNING,
        currentStep: 1,
        open: false,
      };
    case 'SET_PROGRESS_ANIMATED':
      return { ...state, progressAnimated: true };
  }
}

export function useAddListForm() {
  const [state, dispatch] = useReducer(addListFormReducer, initialState);
  const { toast } = useToast();

  // Refs for timeout cleanup
  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const utils = trpc.useUtils();
  const { isProviderConfigured } = useProviderConfig();

  const createMutation = trpc.lists.create.useMutation({
    onSuccess: (result) => {
      const newList = result.list;

      // Invalidate all related queries
      void utils.lists.getAll.invalidate();
      void utils.dashboard.getStats.invalidate();

      // Only show success toast if the list is enabled
      if (newList.enabled) {
        toast({
          title: 'List Added',
          description: `${newList.name} has been added successfully`,
        });
      }

      dispatch({ type: 'RESET_ON_SUCCESS' });
    },
    onError: (error) => {
      showErrorToast(toast, error);
    },
  });
  const isCreating = useMinLoading(createMutation.isPending);

  // Auto-generate name for traktChart, stevenlu, and anilist
  const autoGeneratedName = (() => {
    if (isTraktChart(state.provider)) {
      const chartLabel = getTraktChartDisplayName(state.selectedChartType);
      const mediaLabel =
        state.selectedMediaType === TraktMediaTypeValues.MOVIES ? 'Movies' : 'Shows';
      return `${chartLabel} ${mediaLabel} ${getProviderDisplayName(state.provider)}`;
    } else if (isStevenLu(state.provider)) {
      return `${getProviderDisplayName(state.provider)} Popular Movies`;
    } else if (isAnilist(state.provider) && state.anilistUsername) {
      const statusLabel = anilistStatusDisplayNames[state.anilistStatus];
      return `${state.anilistUsername}'s ${statusLabel}`;
    }
    return '';
  })();

  // Use auto-generated name unless user has manually edited
  const effectiveName = state.userEditedName ? state.name : autoGeneratedName || state.name;

  const handleUrlChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'url', value });
    if (value) {
      const result = validateAndDetectProvider(value);
      if (!result.isValid || result.provider !== state.provider) {
        dispatch({
          type: 'SET_FIELD',
          field: 'urlError',
          value: `Please enter a valid ${getProviderDisplayName(state.provider)} URL`,
        });
      } else {
        dispatch({ type: 'SET_FIELD', field: 'urlError', value: null });
      }
    } else {
      dispatch({ type: 'SET_FIELD', field: 'urlError', value: null });
    }
  };

  const handleNameChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'name', value });
    dispatch({ type: 'SET_FIELD', field: 'userEditedName', value: true });
  };

  const handleMaxItemsChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'maxItems', value });
  };

  const handleMediaTypeChange = (value: TraktMediaType) => {
    dispatch({ type: 'SET_FIELD', field: 'selectedMediaType', value });
  };

  const handleChartTypeChange = (value: TraktChartType) => {
    dispatch({ type: 'SET_FIELD', field: 'selectedChartType', value });
  };

  const handleAnilistStatusChange = (value: AnilistStatus) => {
    dispatch({ type: 'SET_FIELD', field: 'anilistStatus', value });
  };

  const handleSeerrUserIdOverrideChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'seerrUserIdOverride', value });
  };

  const handleAnilistUsernameChange = (value: string) => {
    dispatch({ type: 'SET_FIELD', field: 'anilistUsername', value });
    if (value) {
      const result = anilistUsernameSchema.safeParse(value);
      dispatch({
        type: 'SET_FIELD',
        field: 'anilistUsernameError',
        value: result.success ? null : (result.error.issues[0]?.message ?? 'Invalid username'),
      });
    } else {
      dispatch({ type: 'SET_FIELD', field: 'anilistUsernameError', value: null });
    }
  };

  const handleProviderChange = (newProvider: ProviderType) => {
    dispatch({ type: 'SET_PROVIDER', provider: newProvider, url: state.url });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      dispatch({ type: 'OPEN' });

      // Trigger progress bar animation from 0% to 50%
      if (progressTimeoutRef.current) clearTimeout(progressTimeoutRef.current);
      progressTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SET_PROGRESS_ANIMATED' });
      }, 50);
    } else {
      dispatch({ type: 'CLOSE' });
    }
  };

  const goToStep2 = () => {
    const stepName = (() => {
      if (isTraktChart(state.provider)) {
        const chartLabel = getTraktChartDisplayName(state.selectedChartType);
        const mediaLabel =
          state.selectedMediaType === TraktMediaTypeValues.MOVIES ? 'Movies' : 'Shows';
        return `${chartLabel} ${mediaLabel} ${getProviderDisplayName(state.provider)}`;
      }
      if (isStevenLu(state.provider) && !state.userEditedName) {
        return `${getProviderDisplayName(state.provider)} Popular Movies`;
      }
      if (!state.userEditedName) {
        return '';
      }
      return state.name;
    })();
    dispatch({ type: 'GO_TO_STEP_2', name: stepName });
  };

  const goToStep1 = () => {
    dispatch({ type: 'GO_TO_STEP_1' });
  };

  const handleAdd = () => {
    // Validate name using shared schema
    const nameResult = listNameSchema.safeParse(effectiveName);
    if (!nameResult.success) {
      const firstIssue = nameResult.error.issues[0];
      showValidationErrorToast(toast, firstIssue?.message ?? 'Invalid name');
      return;
    }

    let finalUrl = state.url;
    let displayUrl: string | null = null;

    // For traktChart, construct the URL from selections
    if (isTraktChart(state.provider)) {
      finalUrl = `https://trakt.tv/${state.selectedMediaType}/${state.selectedChartType}`;
    } else if (isStevenLu(state.provider)) {
      finalUrl = 'https://s3.amazonaws.com/popular-movies/movies.json';
      displayUrl = 'https://movies.stevenlu.com';
    } else if (isAnilist(state.provider)) {
      const usernameResult = anilistUsernameSchema.safeParse(state.anilistUsername);
      if (!usernameResult.success) {
        const firstIssue = usernameResult.error.issues[0];
        showValidationErrorToast(toast, firstIssue?.message ?? 'Invalid AniList username');
        return;
      }
      finalUrl = `anilist:${usernameResult.data}:${state.anilistStatus}`;
    } else {
      const result = validateAndDetectProvider(state.url);
      if (!result.isValid || result.provider !== state.provider) {
        showValidationErrorToast(
          toast,
          `Please enter a valid ${getProviderDisplayName(state.provider)} URL`
        );
        return;
      }
    }

    // Check if provider is configured
    const isConfigured = isProviderConfigured(state.provider);

    // Validate maxItems using shared schema
    const maxItemsNum = parseInt(state.maxItems);
    const maxItemsResult = maxItemsSchema.safeParse(maxItemsNum);
    if (!maxItemsResult.success) {
      const firstIssue = maxItemsResult.error.issues[0];
      showValidationErrorToast(toast, firstIssue?.message ?? 'Invalid max items');
      return;
    }

    createMutation.mutate({
      name: nameResult.data,
      url: finalUrl,
      ...(displayUrl ? { displayUrl } : {}),
      provider: state.provider,
      enabled: isConfigured,
      maxItems: maxItemsResult.data,
      ...(state.seerrUserIdOverride
        ? { seerrUserIdOverride: parseInt(state.seerrUserIdOverride) }
        : {}),
    });

    // Show info message if provider not configured
    if (!isConfigured) {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        toast({
          title: 'List Added as Disabled',
          description: `The list was added but is disabled because ${getProviderDisplayName(state.provider)} is not configured. Configure the provider in Settings → API Keys to enable processing.`,
        });
      }, 500);
    }
  };

  return {
    state,
    effectiveName,
    isCreating,
    isProviderConfigured,
    handleNameChange,
    handleMaxItemsChange,
    handleMediaTypeChange,
    handleChartTypeChange,
    handleAnilistStatusChange,
    handleSeerrUserIdOverrideChange,
    handleUrlChange,
    handleAnilistUsernameChange,
    handleProviderChange,
    handleOpenChange,
    goToStep2,
    goToStep1,
    handleAdd,
    getProviderName,
  };
}
