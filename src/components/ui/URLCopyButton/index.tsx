import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../Button';

export const URLCopyButton = () => {
  const [isCopied, setIsCopied] = useState(false);
  const searchParams = useSearchParams();

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`
    );
    console.log(`${window.location.origin}${window.location.pathname}?${searchParams.toString()}`);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return <Button onClick={handleCopy}>{isCopied ? 'Copied' : 'Copy URL'}</Button>;
};
