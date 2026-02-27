export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Customer {params.id}</h1>
      <p className="text-text-secondary text-sm">Customer detail coming soon.</p>
    </div>
  );
}
