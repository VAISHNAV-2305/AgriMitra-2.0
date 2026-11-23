import { useEffect, useState } from "react";

const FALLBACK_IMAGE = "/plant-svg.svg";

export default function MarketplaceImage({ src, alt, ...imageProps }) {
  const [imageSource, setImageSource] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImageSource(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <img
      {...imageProps}
      src={imageSource}
      alt={alt}
      onError={() => setImageSource(FALLBACK_IMAGE)}
    />
  );
}