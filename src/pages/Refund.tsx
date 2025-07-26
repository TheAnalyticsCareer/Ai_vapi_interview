

import { Link } from 'react-router-dom';

const Refund = () => (
  <>
  
    <main className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
      <div className="overflow-y-auto max-h-[70vh] p-4 border rounded bg-white text-gray-800 text-sm space-y-4">
        <p>
          Thank you for shopping at <strong>theanalyticscareer.graphy.com</strong>
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Non-tangible irrevocable goods ("Digital products")</h2>
        <p>
          We do not issue refunds for non-tangible irrevocable goods ("digital products") once the order is confirmed and the product is sent.
        </p>
        <p>
          We recommend contacting us for assistance if you experience any issues receiving or downloading our products.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-2">Contact us for any issues:</h2>
        <p>
          If you have any questions about our Returns and Refunds Policy, please contact us at:{" "}
          <a href="mailto:theanalyticscareer@gmail.com" className="text-blue-600 underline">
            theanalyticscareer@gmail.com
          </a>
        </p>
      </div>
    </main>
   
  </>
);

export default Refund;