// Temporary route helper until Ziggy is installed
declare global {
    interface Window {
        route: (name: string, params?: any) => { current: (name?: string) => boolean } & string;
    }
}

window.route = (name: string, params?: any) => {
    const routes: Record<string, string> = {
        'login': '/login',
        'register': '/register',
        'dashboard': '/dashboard',
        'logout': '/logout',
        'password.request': '/forgot-password',
        'password.email': '/forgot-password',
        'password.reset': '/reset-password',
        'password.store': '/reset-password',
        'password.confirm': '/confirm-password',
        'password.update': '/password',
        'verification.notice': '/verify-email',
        'verification.verify': '/verify-email',
        'verification.send': '/email/verification-notification',
        'profile.edit': '/profile',
        'profile.update': '/profile',
        'profile.destroy': '/profile',
    };
    
    const url = routes[name] || '/';
    const result = url as any;
    result.current = (checkName?: string) => {
        if (!checkName) return window.location.pathname === url;
        return checkName === name;
    };
    return result;
};

export {};
