import React from "react";
import clsx from "clsx";

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active?: boolean;
}

export default function AppButton({ active, className, children, ...props }: AppButtonProps) {
    return (
        <button
            {...props}
            className={clsx(
                "px-3 py-1.5 cursor-pointer text-sm font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 transition-colors duration-150",
                active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200 active:bg-blue-300",
                className
            )}
        >
            {children}
        </button>
    );
}
