import { useEffect, useRef, useState } from 'react';
import {
  saveUserTypeLandingPage,
  saveUserTypeMenuModules,
  saveUserTypePermissions,
  fetchUserTypeAccessSettings,
} from '@/services/accessControl/accessControlApi';
import { UserTypeAccessPermission, UserTypeAccessSettings } from '@/types/access-control';

type SavingSection = 'menu' | 'landing' | 'permissions' | null;

export function useUserTypeAccessControl(
  selectedUserTypeId: string | null,
  initialSettingsByUserType: Record<string, UserTypeAccessSettings>,
) {
  const cacheRef = useRef<Record<string, UserTypeAccessSettings>>(initialSettingsByUserType);
  const [settings, setSettings] = useState<UserTypeAccessSettings | null>(
    selectedUserTypeId ? initialSettingsByUserType[selectedUserTypeId] ?? null : null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [savingSection, setSavingSection] = useState<SavingSection>(null);

  useEffect(() => {
    let isMounted = true;

    if (!selectedUserTypeId) {
      setSettings(null);
      return () => undefined;
    }

    const cachedSettings = cacheRef.current[selectedUserTypeId];

    if (cachedSettings) {
      setSettings(cachedSettings);
      return () => undefined;
    }

    setIsLoading(true);

    void fetchUserTypeAccessSettings(selectedUserTypeId)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        cacheRef.current[selectedUserTypeId] = response;
        setSettings(response);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUserTypeId]);

  const storeSettings = (nextSettings: UserTypeAccessSettings) => {
    cacheRef.current[nextSettings.userType.id] = nextSettings;
    setSettings(nextSettings);
    return nextSettings;
  };

  const saveMenuModules = async (moduleKeys: string[]) => {
    if (!selectedUserTypeId) {
      return null;
    }

    setSavingSection('menu');
    try {
      const response = await saveUserTypeMenuModules(selectedUserTypeId, moduleKeys);
      return storeSettings(response);
    } finally {
      setSavingSection(null);
    }
  };

  const saveLandingPage = async (landingModuleKey: string, basePageKey: string) => {
    if (!selectedUserTypeId) {
      return null;
    }

    setSavingSection('landing');
    try {
      const response = await saveUserTypeLandingPage(selectedUserTypeId, landingModuleKey, basePageKey);
      return storeSettings(response);
    } finally {
      setSavingSection(null);
    }
  };

  const savePermissions = async (permissions: UserTypeAccessPermission[]) => {
    if (!selectedUserTypeId) {
      return null;
    }

    setSavingSection('permissions');
    try {
      const response = await saveUserTypePermissions(selectedUserTypeId, permissions);
      return storeSettings(response);
    } finally {
      setSavingSection(null);
    }
  };

  return {
    settings,
    isLoading,
    savingSection,
    saveLandingPage,
    saveMenuModules,
    savePermissions,
  };
}