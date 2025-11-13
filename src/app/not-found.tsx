// App Router Special File: not-found
// Displayed when users navigate to routes that don't exist

import { NotFoundPage } from "@/components/pages/NotFoundPage";

/**
 * Next.js App Router special file for 404 errors
 * Thin wrapper that delegates to NotFoundPage component
 */
export default function NotFound() {
	return <NotFoundPage />;
}
