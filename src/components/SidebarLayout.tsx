import React, { useState } from "react";

interface SidebarLayoutProps {
    examples: { slug: string; data: { title: string } }[];
    title?: string;
    children: React.ReactNode;
}

export default function SidebarLayout({ examples, title, children }: SidebarLayoutProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="font-sans antialiased h-screen overflow-hidden flex flex-col sm:flex-row bg-white">
            {/* Header (mobile) */}
            <header className="sm:hidden flex items-center justify-between p-4 border-b border-slate-200">
                <h1 className="text-lg font-semibold">
                    <a
                        href={`${import.meta.env.BASE_URL}`}
                        className="block py-1 text-slate-900 hover:text-blue-600"
                    >
                        {title || "Math Applets"}
                    </a>
                </h1>
                <button
                    className="p-2 rounded hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 5.25h16.5m-16.5 6h16.5m-16.5 6h16.5"
                        />
                    </svg>
                </button>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed sm:static bg-white top-0 left-0 h-full w-64  border-r border-r-2 border-slate-200 p-6 transform transition-transform duration-200 ease-in-out overflow-y-auto z-40 ${isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
                    }`}
            >
                <h2 className="text-xl font-semibold mb-4 hidden sm:block">                    <a
                    href={`${import.meta.env.BASE_URL}`}
                    className="block py-1 text-slate-900 hover:text-blue-600"
                >
                    {title || "Math Applets"}
                </a></h2>
                <nav className="space-y-2">
                    {examples.map((ex) => (
                        <a
                            key={ex.slug}
                            href={`${import.meta.env.BASE_URL}/examples/${ex.slug}`}
                            className="block py-1 text-slate-900 hover:text-blue-600"
                        >
                            {ex.data.title}
                        </a>
                    ))}
                </nav>
            </aside>

            {/* Overlay on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 sm:hidden z-30"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            {/* Main content */}
            <main className="flex-1 h-full overflow-y-auto p-6 prose prose-slate max-w-none">
                {children}
            </main>
        </div>
    );
}
