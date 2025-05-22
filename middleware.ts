// middleware.ts
import { withAuth } from "next-auth/middleware";

export default withAuth();

export const config = {
  matcher: ["/dashboard", "/profile", "/upload"],
};
