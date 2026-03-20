/**
 * app/page.tsx
 * Root route — redirects authenticated users to the dashboard.
 * In production, add an auth check here and redirect to /login if not authenticated.
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/dashboard");
}