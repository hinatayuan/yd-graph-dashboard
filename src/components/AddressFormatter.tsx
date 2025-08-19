import React, { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { formatAddress } from '../utils/formatting';
import { ETHERSCAN_ADDRESS_URL } from '../utils/constants';

interface AddressFormatterProps {
  address: string;
  length?: number;
  showCopyButton?: boolean;
  showExternalLink?: boolean;
  className?: string;
}

const AddressFormatter: React.FC<AddressFormatterProps> = ({
  address,
  length = 6,
  showCopyButton = true,
  showExternalLink = true,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleExternalLink = () => {
    window.open(`${ETHERSCAN_ADDRESS_URL}${address}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="font-mono text-sm text-gray-700">
        {formatAddress(address, length)}
      </span>
      
      {showCopyButton && (
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-gray-100 transition-colors duration-150"
          title="Copy address"
        >
          {copied ? (
            <Check size={14} className="text-green-500" />
          ) : (
            <Copy size={14} className="text-gray-400 hover:text-gray-600" />
          )}
        </button>
      )}
      
      {showExternalLink && (
        <button
          onClick={handleExternalLink}
          className="p-1 rounded hover:bg-gray-100 transition-colors duration-150"
          title="View on Etherscan"
        >
          <ExternalLink size={14} className="text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
};

export default AddressFormatter;