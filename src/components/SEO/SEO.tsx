import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  path: string;
}

const SEO = ({ title, description, path }: SEOProps) => {
  const canonicalUrl = `https://vfourtechnologies.com${path}`;

  return (
    <Helmet>
      <title>{title}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="robots"
        content="index, follow, max-image-preview:large"
      />

      <link
        rel="canonical"
        href={canonicalUrl}
      />

      {/* Open Graph */}
      <meta
        property="og:type"
        content="website"
      />

      <meta
        property="og:site_name"
        content="VFOUR Technologies"
      />

      <meta
        property="og:title"
        content={title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      <meta
        property="og:locale"
        content="en_IN"
      />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content="summary"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={description}
      />
    </Helmet>
  );
};

export default SEO;