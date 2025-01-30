import React from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';

const MetaData = ({ title, description, keywords, image, url }) => {
  return (
    <HelmetProvider>
      <Helmet>
        {/* Page Title */}
        {title && <title>{title}</title>}

        {/* Meta Tags */}
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
        {image && <meta property="og:image" content={image} />}
        {url && <meta property="og:url" content={url} />}
        {title && <meta property="og:title" content={title} />}
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
    </HelmetProvider>
  );
};

export default MetaData;
