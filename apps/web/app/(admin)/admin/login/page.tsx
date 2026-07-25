// This page is no longer used.
// /admin/login is redirected → /login by middleware.
// Kept as a safety net redirect.
import { redirect } from "next/navigation";

export default function AdminLoginPage() {
  redirect("/login");
}
