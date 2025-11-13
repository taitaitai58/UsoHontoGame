// Card Component
// Feature: 002-game-preparation
// Reusable card container component

export interface CardProps {
	/** Card content */
	children: React.ReactNode;
	/** Additional CSS classes */
	className?: string;
}

/**
 * Card Component
 * Container component for displaying content in a card layout
 * Used for game cards, presenter cards, etc.
 */
export function Card({ children, className = "" }: CardProps) {
	return (
		<div
			className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}
		>
			{children}
		</div>
	);
}
