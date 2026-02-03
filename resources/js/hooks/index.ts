// Key-Value Store Hook
export { useKV } from './useKV';

// Current User Hooks
export {
  useCurrentUser,
  useIsAuthenticated,
  useIsAdmin,
  useHasRole,
  useUserId,
} from './useCurrentUser';

// Users Hooks
export {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from './useUsers';

// Events Hooks
export {
  useEvents,
  useEvent,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
} from './useEvents';

// Generic API Hooks
export {
  useApi,
  useApiMutation,
  useResource,
  useUserTypes,
  useAgeGroups,
  useEventTypes,
  useCostCenters,
  useClubSettings,
} from './useApi';
