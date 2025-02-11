interface SpotListProps {
  spots: Array<{
    id: string;
    severity: string;
    location: string;
    createdBy: string;
    createdDate: Date;
    defectType: string;
  }>;
}

export default function SpotList({ spots }: SpotListProps) {
  return (
    <div className="mt-4">
      <h2 className="text-lg font-medium">Inspection Spots</h2>
      <div className="mt-2 space-y-2">
        {spots.map((spot) => (
          <div key={spot.id} className="rounded-lg border p-3">
            <p className="font-medium">{spot.location}</p>
            <p className="text-sm text-gray-500">{spot.defectType}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
