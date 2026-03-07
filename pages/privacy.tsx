import Head from "next/head";

export default function PrivacyPolicy() {
    return (
        <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc", padding: "40px 20px" }}>
            <Head>
                <title>Privacy Policy | Static Engine</title>
            </Head>
            <div style={{ maxWidth: 800, margin: "0 auto", backgroundColor: "#1e293b", padding: "40px", borderRadius: "16px", border: "1px solid #334155" }}>
                <h1 style={{ fontSize: "2rem", marginBottom: "8px", fontWeight: "bold" }}>Privacy Policy</h1>
                <p style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "0.9rem" }}>Last Updated: March 2026</p>

                <div style={{ lineHeight: "1.6", color: "#cbd5e1" }}>
                    <h2 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>1. Information We Collect</h2>
                    <p style={{ marginBottom: "16px" }}>We collect information you provide directly to us, such as your name, email address, payment details, and any assets (e.g., images, text) you upload for AI processing.</p>

                    <h2 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>2. How We Use Information</h2>
                    <p style={{ marginBottom: "16px" }}>The information we collect is used to operate and maintain our services, process transactions, generate AI outputs, and communicate with you regarding service updates.</p>

                    <h2 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>3. Data Sharing and Processing</h2>
                    <p style={{ marginBottom: "16px" }}>We process certain data, like uploaded images and brand descriptions, via third-party AI provider APIs. We do not sell your personal data to advertisers.</p>

                    <h2 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>4. Security</h2>
                    <p style={{ marginBottom: "16px" }}>We take reasonable measures to protect your information, including encrypting access tokens and using secure connection protocols when communicating with third parties.</p>

                    <h2 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>5. Contact Us</h2>
                    <p style={{ marginBottom: "16px" }}>If you have questions regarding this Privacy Policy or your personal information, please contact our support team.</p>
                </div>

                <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #334155", textAlign: "center" }}>
                    <a href="/login" style={{ color: "#3ECFCF", textDecoration: "none", fontWeight: "bold" }}>&larr; Back to App</a>
                </div>
            </div>
        </div>
    );
}
