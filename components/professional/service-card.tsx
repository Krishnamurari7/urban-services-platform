interface ServiceCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
}

export function ServiceCard({
  id,
  title,
  description,
  price,
}: ServiceCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
      <p className="text-lg font-bold mt-2">${price}</p>
    </div>
  );
}
