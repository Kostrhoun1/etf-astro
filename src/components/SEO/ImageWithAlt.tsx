import React from 'react';

interface ImageWithAltProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

const ImageWithAlt: React.FC<ImageWithAltProps> = ({ 
  src, 
  alt, 
  fallback = "/placeholder.svg",
  className = "",
  loading = "lazy",
  ...props 
}) => {
  const [imgSrc, setImgSrc] = React.useState(src);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError && imgSrc !== fallback) {
      setImgSrc(fallback);
      setHasError(true);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading={loading}
      className={`${className} ${hasError ? 'opacity-75' : ''}`}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithAlt;