import Head from "next/head";

const SITE_URL = "https://staticengine.com";
const SITE_NAME = "Static Engine";
const DEFAULT_DESCRIPTION = "Generate professional Facebook & Instagram ad images in seconds with AI. Upload your brand, pick a concept, get 6 scroll-stopping variations instantly.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/img/og/default.png`;

interface SEOProps {
    title?: string;
    description?: string;
    ogImage?: string;
    ogType?: "website" | "article";
    canonicalUrl?: string;
    noIndex?: boolean;
}

export default function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    canonicalUrl,
    noIndex = false,
}: SEOProps) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI Ad Image Generator for Facebook & Instagram`;
    const canonical = canonicalUrl ?? SITE_URL;

    return (
        <Head>
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {noIndex ? (
                <meta name="robots" content="noindex, nofollow" />
            ) : (
                <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
            )}
            <link rel="canonical" href={canonical} />

            {/* Open Graph */}
            <meta property="og:type" content={ogType} />
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:url" content={canonical} />
            <meta property="og:locale" content="en_US" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />
        </Head>
    );
}
