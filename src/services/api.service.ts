import { Api } from '@/api/api'
import router from '@/router'

export class ApiService extends Api<string> {
  constructor() {
    super({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      securityWorker: (token) =>
        token
          ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
          : {},
      secure: true,
    })

    // Add response interceptor to handle authentication errors globally
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 403 || error.response?.status === 401) {
          localStorage.removeItem('jwt')
          await router.push('/login')
        }
        return Promise.reject(error)
      }
    )
  }

  withAuth() {
    this.setSecurityData(localStorage.getItem("jwt"))
    return this;
  }

}
