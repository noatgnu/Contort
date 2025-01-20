export interface User {
}

export interface UserSession {
  status: number,
  data: {
    user: {
      id: number,
      display: string,
      has_usable_password: boolean,
      email: string,
      username: string
    },
    methods: {
      method: string,
      at: number,
      email: string
      username: string
    }[]
  },
  meta: {
    session_token: string,
    access_token: string,
    is_authenticated: boolean
  }
}
