export interface AccessControlMenuModule {
  key: string;
  label: string;
  route: string;
}

export interface AccessControlBasePage {
  key: string;
  label: string;
  route: string;
}

export interface AccessControlLandingModule {
  module_key: string;
  module_label: string;
  base_pages: AccessControlBasePage[];
}

export interface PermissionTreeNodeData {
  id: string;
  key: string;
  label: string;
  module_key: string;
  node_type: 'module' | 'submodule' | 'tab' | 'field' | string;
  children: PermissionTreeNodeData[];
}

export interface UserTypeAccessPermission {
  permission_node_id: string;
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface UserTypeAccessSettings {
  userType: {
    id: string;
    nome: string;
    codigo?: string | null;
    descricao?: string | null;
  };
  menuModuleKeys: string[];
  landingPage: {
    landing_module_key: string;
    landing_module_label: string;
    base_page_key: string;
    base_page_label: string;
    route: string;
  };
  permissions: UserTypeAccessPermission[];
}

export interface AccessControlBootstrap {
  menuModules: AccessControlMenuModule[];
  landingPages: AccessControlLandingModule[];
  permissionTree: PermissionTreeNodeData[];
  defaultSelectedUserTypeId?: string | null;
  initialSettingsByUserType: Record<string, UserTypeAccessSettings>;
}

export type PermissionCapability = 'view' | 'edit' | 'delete';
export type TreeCheckState = 'checked' | 'indeterminate' | 'unchecked';

export interface PermissionSelectionState {
  view: Set<string>;
  edit: Set<string>;
  delete: Set<string>;
}