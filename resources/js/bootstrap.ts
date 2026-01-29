import axios from 'axios';

// Configure Axios
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// CSRF Token
const token = document.head.querySelector('meta[name="csrf-token"]');
if (token instanceof HTMLMetaElement) {
    axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
}

// Handle 401 errors (redirect to login)
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Make axios available globally
window.axios = axios;

export default axios;
