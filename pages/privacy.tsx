import Head from "next/head";
import { useRouter } from "next/router";
import SEO from "../components/SEO";

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <>
        <SEO title="Privacy Policy" description="Learn how Static Engine collects, uses, and protects your personal data. Read our full privacy policy." canonicalUrl="https://staticengine.com/privacy" />
        <div style={{ backgroundColor: "#0f172a", minHeight: "100vh", color: "#f8fafc", padding: "40px 20px" }}>
            <Head>
                <title>Privacy Policy | Static Engine</title>
            </Head>
            <div style={{ maxWidth: 800, margin: "0 auto", backgroundColor: "#1e293b", padding: "40px", borderRadius: "16px", border: "1px solid #334155" }}>
                <h1 style={{ fontSize: "2.5rem", marginBottom: "8px", fontWeight: "bold" }}>Static Engine<br />Privacy Policy</h1>
                <p style={{ color: "#94a3b8", marginBottom: "4px", fontSize: "1rem" }}><strong>Effective Date:</strong> March 6, 2026</p>
                <p style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "1rem" }}><strong>Operated by:</strong> Korsica Brands LLC, Los Angeles, California</p>

                <div style={{ lineHeight: "1.6", color: "#cbd5e1" }}>
                    <p style={{ marginBottom: "24px" }}>
                        Korsica Brands LLC ("Company," "we," "us," or "our") operates Static Engine ("Service"). This Privacy Policy explains how we collect, use, store, and share information when you use the Service. By using the Service, you agree to the practices described in this Privacy Policy.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>1. Information We Collect</h2>

                    <h3 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>1.1 Information You Provide</h3>
                    <p style={{ marginBottom: "16px" }}>When you create an account or use the Service, we collect:</p>
                    <ul style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                        <li style={{ marginBottom: "8px" }}>Name and email address</li>
                        <li style={{ marginBottom: "8px" }}>Billing information (processed by our payment provider — we do not store full card numbers)</li>
                        <li style={{ marginBottom: "8px" }}>Business name and any other information you provide in your account profile</li>
                        <li style={{ marginBottom: "8px" }}>Product information, descriptions, and images you input into the Service to generate content</li>
                        <li style={{ marginBottom: "8px" }}>Optional context you provide when generating landing pages or ad creative</li>
                    </ul>

                    <h3 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>1.2 Information from Third-Party Integrations</h3>
                    <p style={{ marginBottom: "16px" }}>If you connect a third-party platform such as Shopify, we collect information from that platform as authorized by you during the connection process. This may include:</p>
                    <ul style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                        <li style={{ marginBottom: "8px" }}>Shopify store name, domain, and theme information</li>
                        <li style={{ marginBottom: "8px" }}>Product titles, descriptions, prices, variants, and product images</li>
                        <li style={{ marginBottom: "8px" }}>Store settings including fonts and brand colors</li>
                    </ul>
                    <p style={{ marginBottom: "16px" }}>
                        We collect this information solely to deliver the Service features you have requested. We do not access or collect Shopify customer data, order data, financial data, or any information beyond what is described above.
                    </p>

                    <h3 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>1.3 Automatically Collected Information</h3>
                    <p style={{ marginBottom: "16px" }}>When you use the Service, we automatically collect certain technical information, including:</p>
                    <ul style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                        <li style={{ marginBottom: "8px" }}>IP address and general location information</li>
                        <li style={{ marginBottom: "8px" }}>Browser type and version</li>
                        <li style={{ marginBottom: "8px" }}>Device type and operating system</li>
                        <li style={{ marginBottom: "8px" }}>Pages visited within the Service and features used</li>
                        <li style={{ marginBottom: "8px" }}>Timestamps and session duration</li>
                        <li style={{ marginBottom: "8px" }}>Referring URLs</li>
                    </ul>
                    <p style={{ marginBottom: "16px" }}>
                        This information is collected using standard web technologies including cookies, server logs, and analytics tools. See Section 6 for information on cookies.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>2. How We Use Your Information</h2>
                    <p style={{ marginBottom: "16px" }}>We use the information we collect to:</p>
                    <ul style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                        <li style={{ marginBottom: "8px" }}>Provide, operate, and improve the Service</li>
                        <li style={{ marginBottom: "8px" }}>Process your account registration and manage your subscription</li>
                        <li style={{ marginBottom: "8px" }}>Generate AI-powered output based on the product and context information you provide</li>
                        <li style={{ marginBottom: "8px" }}>Process payments and send billing-related communications</li>
                        <li style={{ marginBottom: "8px" }}>Send you service-related notifications, including updates, security alerts, and support messages</li>
                        <li style={{ marginBottom: "8px" }}>Respond to your support requests and communications</li>
                        <li style={{ marginBottom: "8px" }}>Monitor usage to enforce our Terms of Service and prevent abuse</li>
                        <li style={{ marginBottom: "8px" }}>Analyze usage patterns to improve product features and user experience</li>
                        <li style={{ marginBottom: "8px" }}>Comply with applicable legal obligations</li>
                    </ul>
                    <p style={{ marginBottom: "16px" }}>
                        We do not sell your personal information to third parties. We do not use your personal information to train AI models.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>3. How We Share Your Information</h2>
                    <p style={{ marginBottom: "16px" }}>We share your information only in the following circumstances:</p>

                    <h3 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>3.1 Service Providers</h3>
                    <p style={{ marginBottom: "16px" }}>
                        We work with trusted third-party vendors who help us operate the Service. These providers have access to your information only as necessary to perform their functions and are contractually obligated to protect it. Our current categories of service providers include:
                    </p>
                    <ul style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                        <li style={{ marginBottom: "8px" }}>Payment processing</li>
                        <li style={{ marginBottom: "8px" }}>Cloud hosting and infrastructure</li>
                        <li style={{ marginBottom: "8px" }}>Email delivery</li>
                        <li style={{ marginBottom: "8px" }}>Analytics and error monitoring</li>
                        <li style={{ marginBottom: "8px" }}>AI model providers (your product input data is processed by these providers to generate output)</li>
                        <li style={{ marginBottom: "8px" }}>Image generation APIs (your product context and AI-generated prompts are sent to these providers)</li>
                    </ul>

                    <h3 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>3.2 Shopify</h3>
                    <p style={{ marginBottom: "16px" }}>
                        When you use the Shopify integration, we send content to your Shopify store via the Shopify API as directed by you. Shopify's own privacy practices govern how Shopify handles data on their platform.
                    </p>

                    <h3 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>3.3 Legal Requirements</h3>
                    <p style={{ marginBottom: "16px" }}>
                        We may disclose your information if required to do so by law or in response to a valid legal process, including a subpoena, court order, or government request. We may also disclose information if we believe disclosure is necessary to protect the rights, property, or safety of the Company, our users, or the public.
                    </p>

                    <h3 style={{ color: "#f8fafc", marginTop: "24px", marginBottom: "12px", fontSize: "1.25rem" }}>3.4 Business Transfers</h3>
                    <p style={{ marginBottom: "16px" }}>
                        If the Company is involved in a merger, acquisition, or sale of all or a portion of its assets, your information may be transferred as part of that transaction. We will notify you via email or a prominent notice within the Service before your information becomes subject to a different privacy policy.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>4. Data Retention</h2>
                    <p style={{ marginBottom: "16px" }}>
                        We retain your personal information for as long as your account is active or as needed to provide the Service. We also retain information as necessary to comply with legal obligations, resolve disputes, and enforce our agreements.
                    </p>
                    <p style={{ marginBottom: "16px" }}>
                        If you close your account, we will delete or anonymize your personal information within a reasonable period, except where we are required to retain it by law. Product input data and generated output stored in connection with your account will be deleted upon account closure.
                    </p>
                    <p style={{ marginBottom: "16px" }}>
                        Shopify access tokens are deleted from our systems when you disconnect your Shopify store or close your account.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>5. Data Security</h2>
                    <p style={{ marginBottom: "16px" }}>
                        We implement industry-standard security measures to protect your information, including encryption of data in transit (TLS) and at rest, encrypted storage of third-party access tokens, access controls limiting who within our organization can access user data, and regular security reviews.
                    </p>
                    <p style={{ marginBottom: "16px" }}>
                        No method of electronic storage or transmission is 100% secure. While we take reasonable precautions, we cannot guarantee absolute security. In the event of a data breach that affects your personal information, we will notify you as required by applicable law.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>6. Cookies</h2>
                    <p style={{ marginBottom: "16px" }}>
                        We use cookies and similar tracking technologies to operate the Service. Cookies are small text files stored on your device that help us recognize you, maintain your session, and understand how you use the Service.
                    </p>
                    <p style={{ marginBottom: "16px" }}>We use the following categories of cookies:</p>
                    <ul style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                        <li style={{ marginBottom: "8px" }}>Strictly necessary cookies: required for the Service to function. You cannot opt out of these.</li>
                        <li style={{ marginBottom: "8px" }}>Analytics cookies: help us understand how users interact with the Service so we can improve it.</li>
                        <li style={{ marginBottom: "8px" }}>Preference cookies: remember your settings and preferences within the Service.</li>
                    </ul>
                    <p style={{ marginBottom: "16px" }}>
                        You can control non-essential cookies through your browser settings. Disabling cookies may affect the functionality of the Service.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>7. California Privacy Rights (CCPA)</h2>
                    <p style={{ marginBottom: "16px" }}>
                        If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA):
                    </p>
                    <ul style={{ marginBottom: "16px", paddingLeft: "24px" }}>
                        <li style={{ marginBottom: "8px" }}>Right to know: You may request information about the categories and specific pieces of personal information we have collected about you, how we use it, and with whom we share it.</li>
                        <li style={{ marginBottom: "8px" }}>Right to delete: You may request that we delete personal information we have collected from you, subject to certain exceptions.</li>
                        <li style={{ marginBottom: "8px" }}>Right to opt out of sale: We do not sell your personal information. This right is not applicable to our current practices.</li>
                        <li style={{ marginBottom: "8px" }}>Right to non-discrimination: We will not discriminate against you for exercising any of your CCPA rights.</li>
                    </ul>
                    <p style={{ marginBottom: "16px" }}>
                        To exercise your California privacy rights, contact us using the information in Section 10. We will respond to verified requests within 45 days.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>8. Children's Privacy</h2>
                    <p style={{ marginBottom: "16px" }}>
                        The Service is not directed to individuals under the age of 18. We do not knowingly collect personal information from minors. If you believe we have inadvertently collected information from a minor, please contact us immediately and we will take steps to delete it.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>9. Changes to This Privacy Policy</h2>
                    <p style={{ marginBottom: "16px" }}>
                        We may update this Privacy Policy from time to time. We will notify you of material changes by email or by posting a notice within the Service. The updated policy will indicate the new effective date. Your continued use of the Service after the effective date of any changes constitutes your acceptance of the updated Privacy Policy.
                    </p>

                    <h2 style={{ color: "#f8fafc", marginTop: "32px", marginBottom: "12px", fontSize: "1.5rem" }}>10. Contact Us</h2>
                    <p style={{ marginBottom: "16px" }}>If you have questions, concerns, or requests related to this Privacy Policy or our data practices, please contact us at:</p>
                    <p style={{ marginBottom: "16px" }}>
                        <strong>Korsica Brands LLC</strong><br />
                        Los Angeles, California<br />
                        Email: <a href="mailto:contact@staticengine.com" style={{ color: "#3ECFCF", textDecoration: "none" }}>contact@staticengine.com</a>
                    </p>

                    <div style={{ marginTop: "32px", padding: "16px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px" }}>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#fca5a5" }}>
                            <strong>Note:</strong> This Privacy Policy has been prepared as a starting-point template. You should have a qualified attorney review and finalize this document before publishing it on your website, particularly to ensure compliance with all applicable state and federal privacy laws.
                        </p>
                    </div>
                </div>

                <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "1px solid #334155", textAlign: "center" }}>
                    <button
                        onClick={() => { router.back(); }}
                        style={{ background: "none", border: "none", color: "#3ECFCF", fontWeight: "bold", fontSize: "1rem", cursor: "pointer" }}
                    >
                        &larr; Back to App
                    </button>
                </div>
            </div>
        </div>
        </>
    );
}
