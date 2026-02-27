export default function DealDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Deal {params.id}</h1>
      <p className="text-text-secondary text-sm">Deal detail coming soon.</p>
    </div>
  );
}
