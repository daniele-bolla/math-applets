import React from "react";

interface MathBlockProps {
    type?: "theorem" | "lemma" | "definition" | "proposition" | "corollary" | "example" | "remark";
    title?: string;
    children: React.ReactNode;
}

const COLORS: Record<string, string> = {
    theorem: "blue",
    lemma: "indigo",
    definition: "emerald",
    proposition: "violet",
    corollary: "cyan",
    example: "amber",
    remark: "gray",
};

export default function MathBlock({ type = "theorem", title, children }: MathBlockProps) {
    const color = COLORS[type] || "blue";
    const borderClass = `border-l-4 border-${color}-500 bg-${color}-50`;
    const textClass = `text-${color}-700`;

    return (
        <div className={`px-2 py-1 ${borderClass} rounded`}>
            <strong className={`${textClass} block mb-1`}>
                {title || type.charAt(0).toUpperCase() + type.slice(1)}:
            </strong>
            <div className="text-slate-800">{children}</div>
        </div>
    );
}
