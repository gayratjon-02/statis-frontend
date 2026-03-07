import React, { useState, useEffect } from "react";
import { useAuth } from "../libs/hooks/useAuth";
import { acceptTosRequest } from "../server/user/login";
import toast from "react-hot-toast";

export const TosGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, member, login, logout } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isAuthenticated && member?.needs_tos_update) {
            setShowModal(true);
        } else {
            setShowModal(false);
        }
    }, [isAuthenticated, member]);

    const handleAccept = async () => {
        if (!accepted) return;

        setIsSubmitting(true);
        try {
            const tosVersion = process.env.NEXT_PUBLIC_TOS_VERSION || "2026-03-05";
            await acceptTosRequest({
                tos_accepted: true,
                tos_version: tosVersion
            });

            // Update local member state
            if (member) {
                const updatedMember = { ...member, needs_tos_update: false };
                login(localStorage.getItem("se_access_token") || "", updatedMember);
            }

            setShowModal(false);
            toast.success("Terms of Service accepted");
        } catch (error: any) {
            toast.error(error.message || "Failed to accept Terms of Service");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showModal) {
        return (
            <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(8px)' }}>
                <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: 32, maxWidth: 440, width: '90%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(62, 207, 207, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3ECFCF' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#f8fafc' }}>Updated Terms of Service</h2>
                    </div>

                    <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24, marginTop: 0 }}>
                        We&apos;ve updated our Terms of Service and Privacy Policy to provide more clarity on our AI features and data usage. You must review and agree to these updated terms to continue using the platform.
                    </p>

                    <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid #334155', borderRadius: 12, padding: 16, marginBottom: 24 }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                            <input
                                type="checkbox"
                                id="tos_reaccept"
                                checked={accepted}
                                onChange={(e) => setAccepted(e.target.checked)}
                                style={{
                                    marginTop: 3,
                                    width: 18,
                                    height: 18,
                                    cursor: "pointer",
                                    accentColor: "#3ECFCF",
                                    flexShrink: 0
                                }}
                            />
                            <label htmlFor="tos_reaccept" style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5, cursor: "pointer", userSelect: 'none' }}>
                                I agree to the updated <a href="/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#3ECFCF", textDecoration: "none", fontWeight: 600 }}>Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#3ECFCF", textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>.
                            </label>
                        </div>
                    </div>

                    <button
                        onClick={handleAccept}
                        disabled={!accepted || isSubmitting}
                        style={{
                            width: '100%',
                            padding: '12px 0',
                            borderRadius: 10,
                            border: 'none',
                            backgroundColor: '#3ECFCF',
                            color: '#0f172a',
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: (!accepted || isSubmitting) ? 'not-allowed' : 'pointer',
                            opacity: (!accepted || isSubmitting) ? 0.6 : 1,
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8
                        }}
                    >
                        {isSubmitting ? 'Accepting...' : 'Accept & Continue'}
                    </button>

                    <button
                        onClick={() => logout()}
                        style={{
                            width: '100%',
                            padding: '12px 0',
                            marginTop: 12,
                            borderRadius: 10,
                            border: '1px solid #334155',
                            backgroundColor: 'transparent',
                            color: '#cbd5e1',
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};
