import { Api } from '@/api/api'

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

  }

  withAuth() {
    this.setSecurityData(localStorage.getItem("jwt"))
    return this;
  }

}
