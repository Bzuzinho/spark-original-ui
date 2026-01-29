/**
 * Ziggy Route Helper - Stub Version
 * Provides basic route() function for Inertia pages
 * TODO: Replace with tightenco/ziggy package in Phase 2
 */

declare global {
    interface Window {
        route: (name: string, params?: any, absolute?: boolean) => string;
        Ziggy?: {
            url: string;
            port: number | null;
            defaults: Record<string, any>;
            routes: Record<string, any>;
        };
    }
}

// Route map (Breeze + Dashboard defaults)
const routes: Record<string, string> = {
    'login': '/login',
    'register': '/register',
    'logout': '/logout',
    'password.request': '/forgot-password',
    'password.email': '/forgot-password',
    'password.reset': '/reset-password/{token}',
    'password.store': '/reset-password',
    'password.confirm': '/confirm-password',
    'password.update': '/password',
    'verification.notice': '/verify-email',
    'verification.verify': '/verify-email/{id}/{hash}',
    'verification.send': '/email/verification-notification',
    'dashboard': '/dashboard',
    'profile.edit': '/profile',
    'profile.update': '/profile',
    'profile.destroy': '/profile',
};

// Basic route() helper implementation
if (typeof window !== 'undefined') {
    window.route = (name: string, params?: any, absolute: boolean = false): string => {
        let url = routes[name];
        
        if (!url) {
            console.warn(`[Ziggy stub] Route "${name}" not found in route map`);
            return `/${name}`;
        }
        
        // Replace {param} placeholders with actual values
        if (params) {
            if (typeof params === 'object') {
                Object.keys(params).forEach(key => {
                    url = url.replace(`{${key}}`, encodeURIComponent(params[key]));
                });
            } else {
                // Single param: replace first placeholder
                url = url.replace(/\{[^}]+\}/, encodeURIComponent(params));
            }
        }
        
        // Remove remaining optional placeholders
        url = url.replace(/\/\{[^}]+\?\}/g, '');
        
        // Return absolute URL if requested and Ziggy config exists
        if (absolute && window.Ziggy) {
            return `${window.Ziggy.url}${url}`;
        }
        
        return url;
    };
}

export {};
