import { Spot } from "@/lib/store/reportStore";

interface DataTableProps {
  spots: Spot[];
}

export default function DataTable({ spots }: DataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Device ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {spots.map((spot) => (
            <tr key={spot.id}>
              <td className="px-6 py-4 whitespace-nowrap">{spot.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    spot.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {spot.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {spot.metadata.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {spot.metadata.deviceId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(spot.lastUpdated).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
