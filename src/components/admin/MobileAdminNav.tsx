'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import AdminSidebarLinks from './AdminSidebarLinks';

interface MobileAdminNavProps {
    locale: string;
}

export default function MobileAdminNav({ locale }: MobileAdminNavProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <div className="md:hidden">
            {/* Sticky Mobile Header for Admin */}
            <div className="fixed top-15 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                <span className="font-bold text-slate-800">Admin Portal</span>
                <button
                    onClick={toggleMenu}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Toggle Menu"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity"
                    onClick={closeMenu}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div
                className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-800">Admin Portal</h2>
                        <button
                            onClick={closeMenu}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <AdminSidebarLinks locale={locale} onLinkClick={closeMenu} />
                    </div>
                </div>
            </div>
        </div>
    );
}
