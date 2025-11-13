// Badge Component
// Feature: 002-game-preparation
// Reusable badge component for displaying status and labels

export interface BadgeProps {
	/** Badge text content */
	children: React.ReactNode;
	/** Badge variant for different styles */
	variant?: "default" | "primary" | "success" | "warning" | "danger";
	/** Additional CSS classes */
	className?: string;
}

/**
 * Badge Component
 * Displays small labeled badges with different color variants
 * Used for game status, completion indicators, etc.
 */
export function Badge({
	children,
	variant = "default",
	className = "",
}: BadgeProps) {
	const variantStyles = {
		default: "bg-gray-100 text-gray-800",
		primary: "bg-blue-100 text-blue-800",
		success: "bg-green-100 text-green-800",
		warning: "bg-yellow-100 text-yellow-800",
		danger: "bg-red-100 text-red-800",
	};

	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
		>
			{children}
		</span>
	);
}
