interface BookingCardProps {
  id: string;
  service: string;
  date: string;
  status: string;
}

export function BookingCard({ id, service, date, status }: BookingCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-semibold">{service}</h3>
      <p className="text-sm text-gray-600">Date: {date}</p>
      <p className="text-sm text-gray-600">Status: {status}</p>
    </div>
  );
}
