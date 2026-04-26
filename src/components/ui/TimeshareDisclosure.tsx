export default function TimeshareDisclosure() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex gap-3">
        <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <div>
          <h4 className="font-semibold text-amber-800 text-sm">Timeshare Preview Offer</h4>
          <p className="text-sm text-amber-700 mt-1">
            This is a promotional vacation package. A timeshare or resort presentation (approximately 90 minutes)
            is required during your stay. Eligibility restrictions apply, including age, income, and marital
            status requirements. There is no obligation to purchase. Please review all terms and conditions
            before booking.
          </p>
        </div>
      </div>
    </div>
  );
}
