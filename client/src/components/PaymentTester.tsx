import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, XCircle, AlertTriangle, Shield, Globe } from 'lucide-react';

interface TestCard {
  name: string;
  number: string;
  type: 'success' | 'declined' | 'insufficient' | 'secure3d' | 'international';
  description: string;
  icon: React.ReactElement;
  color: string;
}

interface TestResult {
  cardType: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  timestamp: Date;
}

const PaymentTester: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestingMode, setIsTestingMode] = useState(false);

  const testCards: TestCard[] = [
    {
      name: 'Success Card',
      number: '4242 4242 4242 4242',
      type: 'success',
      description: 'Always succeeds',
      icon: <CheckCircle className="w-5 h-5" />,
      color: 'bg-green-500'
    },
    {
      name: 'Declined Card',
      number: '4000 0000 0000 0002',
      type: 'declined',
      description: 'Generic decline',
      icon: <XCircle className="w-5 h-5" />,
      color: 'bg-red-500'
    },
    {
      name: 'Insufficient Funds',
      number: '4000 0000 0000 9995',
      type: 'insufficient',
      description: 'Insufficient funds error',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'bg-orange-500'
    },
    {
      name: '3D Secure Required',
      number: '4000 0025 0000 3155',
      type: 'secure3d',
      description: 'Triggers 3D Secure',
      icon: <Shield className="w-5 h-5" />,
      color: 'bg-blue-500'
    },
    {
      name: 'International Card',
      number: '4000 0082 6000 0000',
      type: 'international',
      description: 'UK Visa card',
      icon: <Globe className="w-5 h-5" />,
      color: 'bg-purple-500'
    }
  ];

  const addTestResult = (cardType: string, status: 'success' | 'error', message: string) => {
    const newResult: TestResult = {
      cardType,
      status,
      message,
      timestamp: new Date()
    };
    setTestResults(prev => [newResult, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const copyCardNumber = (cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    // Show toast or notification
  };

  const useTestCard = (card: TestCard) => {
    // Auto-fill the payment form with test card data
    const cardNumberInput = document.querySelector('#card-number') as HTMLInputElement;
    const expiryInput = document.querySelector('#card-expiry') as HTMLInputElement;
    const cvcInput = document.querySelector('#card-cvc') as HTMLInputElement;

    if (cardNumberInput) {
      cardNumberInput.value = card.number;
      cardNumberInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (expiryInput) {
      expiryInput.value = '12/25';
      expiryInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (cvcInput) {
      cvcInput.value = '123';
      cvcInput.dispatchEvent(new Event('input', { bubbles: true }));
    }

    addTestResult(card.name, 'success', `Test card ${card.name} applied to form`);
  };

  const toggleTestingMode = () => {
    setIsTestingMode(!isTestingMode);
  };

  if (!isTestingMode) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleTestingMode}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium transition-all"
        >
          <CreditCard className="w-4 h-4" />
          Payment Tester
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-6 w-96 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Payment Tester</h3>
        <button
          onClick={toggleTestingMode}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Test Cards</h4>
        <div className="space-y-2">
          {testCards.map((card, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`${card.color} text-white p-1 rounded`}>
                  {card.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{card.name}</div>
                  <div className="text-xs text-gray-500">{card.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono flex-1">
                  {card.number}
                </code>
                <button
                  onClick={() => copyCardNumber(card.number)}
                  className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
                >
                  Copy
                </button>
                <button
                  onClick={() => useTestCard(card)}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Test Data</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>Expiry:</strong> Any future date (e.g., 12/25)</div>
          <div><strong>CVC:</strong> Any 3 digits (e.g., 123)</div>
          <div><strong>ZIP:</strong> Any valid ZIP (e.g., 12345)</div>
        </div>
      </div>

      {testResults.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Tests</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded border-l-4 ${
                  result.status === 'success'
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : 'bg-red-50 border-red-400 text-red-800'
                }`}
              >
                <div className="font-medium">{result.cardType}</div>
                <div className="text-xs opacity-75">{result.message}</div>
                <div className="text-xs opacity-50">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 border-t pt-3">
        <div className="mb-2">
          <strong>Monitor payments:</strong>
        </div>
        <a
          href="https://dashboard.stripe.com/test/payments"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Stripe Dashboard →
        </a>
      </div>
    </div>
  );
};

export default PaymentTester; 