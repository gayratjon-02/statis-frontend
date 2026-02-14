import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Member } from "@/libs/types/member.type";

interface NavbarProps {
    isDark: boolean;
    toggleTheme: () => void;
    credits: number;
    maxCredits: number;
    member?: Member | null;
    onLogout: () => void;
}

export default function Navbar({ isDark, toggleTheme, credits, maxCredits, member, onLogout }: NavbarProps) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const creditPercent = (credits / maxCredits) * 100;
    const userInitial = member?.full_name ? member.full_name.charAt(0).toUpperCase() : "U";

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="navbar">
            <div className="navbar__left">
                <span className="navbar__logo">Static Engine</span>
            </div>
            <div className="navbar__right">
                <div className="navbar__credits">
                    <span className="navbar__credits-label">Credits</span>
                    <div className="navbar__credits-bar">
                        <div
                            className="navbar__credits-bar-fill"
                            style={{ width: `${creditPercent}%` }}
                        />
                    </div>
                    <span className="navbar__credits-count">
                        {credits} <span>/ {maxCredits}</span>
                    </span>
                </div>
                <button
                    className="navbar__theme-toggle"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                >
                    {isDark ? (
                        <svg className="navbar__theme-icon navbar__theme-icon--sun" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="5" fill="#FBBF24" />
                            <line x1="12" y1="1" x2="12" y2="4" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                            <line x1="12" y1="20" x2="12" y2="23" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                            <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                            <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                            <line x1="1" y1="12" x2="4" y2="12" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                            <line x1="20" y1="12" x2="23" y2="12" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                            <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                            <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg className="navbar__theme-icon navbar__theme-icon--moon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" fill="#F59E0B" />
                        </svg>
                    )}
                </button>

                {/* User Avatar & Dropdown */}
                <div className="navbar__user" ref={dropdownRef}>
                    <button
                        className="navbar__avatar"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        {userInitial}
                    </button>

                    {isDropdownOpen && (
                        <div className="navbar__dropdown">
                            <div className="navbar__dropdown-header">
                                <div className="navbar__dropdown-name">{member?.full_name || "User"}</div>
                                <div className="navbar__dropdown-email">{member?.email || "email@example.com"}</div>
                            </div>

                            <div className="navbar__dropdown-items">
                                <Link href="/profile" className="navbar__dropdown-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                        <circle cx="12" cy="7" r="4" />
                                    </svg>
                                    Profile & Settings
                                </Link>
                                <Link href="/billing" className="navbar__dropdown-item">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                                        <line x1="1" y1="10" x2="23" y2="10" />
                                    </svg>
                                    Billing & Plan
                                </Link>
                                <div className="navbar__dropdown-divider" />
                                <button onClick={onLogout} className="navbar__dropdown-item navbar__dropdown-item--danger">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
