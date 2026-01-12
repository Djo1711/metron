export default function Learning() {
  const tutorials = [
    {
      title: 'Reverse Convertible',
      description: 'Learn about reverse convertible structured products',
      topics: ['What is a Reverse Convertible?', 'Risk & Return', 'Barrier Mechanism', 'Coupon Payment'],
    },
    {
      title: 'Black-Scholes Model',
      description: 'Understanding option pricing theory',
      topics: ['Key Assumptions', 'Formula Breakdown', 'Greeks Explained', 'Practical Applications'],
    },
    {
      title: 'Greeks',
      description: 'Master the option Greeks for risk management',
      topics: ['Delta', 'Gamma', 'Vega', 'Theta', 'Rho'],
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Learning Center
      </h1>
      <p className="text-gray-600 mb-8">
        Interactive tutorials and educational content on structured products
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorials.map((tutorial, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-lg p-6 border hover:shadow-xl transition"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">📚</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">
                {tutorial.title}
              </h2>
            </div>
            
            <p className="text-gray-600 mb-4">{tutorial.description}</p>
            
            <div className="space-y-2">
              {tutorial.topics.map((topic, i) => (
                <div key={i} className="flex items-center text-sm text-gray-700">
                  <span className="text-blue-500 mr-2">✓</span>
                  {topic}
                </div>
              ))}
            </div>

            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold">
              Start Learning
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8 border border-purple-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Glossary
        </h2>
        <p className="text-gray-600 mb-4">
          Key terms and definitions in structured products
        </p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg text-blue-800">Barrier</h3>
            <p className="text-sm text-gray-600">
              A predetermined price level that triggers specific product outcomes
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg text-blue-800">Coupon</h3>
            <p className="text-sm text-gray-600">
              Periodic interest payment to the investor
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg text-blue-800">Underlying</h3>
            <p className="text-sm text-gray-600">
              The asset (stock, index) on which the product is based
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold text-lg text-blue-800">Maturity</h3>
            <p className="text-sm text-gray-600">
              The end date of the structured product
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}