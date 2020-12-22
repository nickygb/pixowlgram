export {};

interface CurrentUser {
  id: number;
}

declare global {
  namespace Express {
    interface Request {
      currentUser: CurrentUser;
    }
  }
}
