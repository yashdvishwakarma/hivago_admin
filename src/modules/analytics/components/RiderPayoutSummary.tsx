
const summaryData = [
  { label: 'Total Delivery Fees', value: '₹52,983', sublabel: 'Own fleet', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', valText: 'text-blue-800' },
  { label: 'Own Fleet Deliveries', value: '432', bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-600', valText: 'text-green-800' },
  { label: '3PL Deliveries', value: '68', bg: 'bg-purple-50', border: 'border-purple-100', text: 'text-purple-600', valText: 'text-purple-800' },
  { label: 'Pending Rider Payouts', value: '₹28,450', bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-orange-600', valText: 'text-[#8b1515]' },
];

export function RiderPayoutSummary() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-6">Rider Payout Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryData.map((item, idx) => (
          <div key={idx} className={`rounded-lg p-4 border ${item.bg} ${item.border} flex flex-col justify-center`}>
            <p className={`text-sm font-medium mb-1 ${item.text}`}>{item.label}</p>
            <h4 className={`text-2xl font-bold ${item.valText}`}>{item.value}</h4>
            {item.sublabel && (
              <p className={`text-xs mt-1 ${item.text} opacity-80`}>{item.sublabel}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
