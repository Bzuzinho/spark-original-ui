import axios from 'axios';
import { UserTypeAccessPermission, UserTypeAccessSettings } from '@/types/access-control';

export async function fetchUserTypeAccessSettings(userTypeId: string): Promise<UserTypeAccessSettings> {
  const response = await axios.get<UserTypeAccessSettings>(`/api/access-control/user-types/${userTypeId}`);
  return response.data;
}

export async function saveUserTypeMenuModules(userTypeId: string, moduleKeys: string[]): Promise<UserTypeAccessSettings> {
  const response = await axios.put<UserTypeAccessSettings>(
    `/api/access-control/user-types/${userTypeId}/menu-modules`,
    { module_keys: moduleKeys },
  );

  return response.data;
}

export async function saveUserTypeLandingPage(
  userTypeId: string,
  landingModuleKey: string,
  basePageKey: string,
): Promise<UserTypeAccessSettings> {
  const response = await axios.put<UserTypeAccessSettings>(
    `/api/access-control/user-types/${userTypeId}/landing-page`,
    {
      landing_module_key: landingModuleKey,
      base_page_key: basePageKey,
    },
  );

  return response.data;
}

export async function saveUserTypePermissions(
  userTypeId: string,
  permissions: UserTypeAccessPermission[],
): Promise<UserTypeAccessSettings> {
  const response = await axios.put<UserTypeAccessSettings>(
    `/api/access-control/user-types/${userTypeId}/permissions`,
    { permissions },
  );

  return response.data;
}