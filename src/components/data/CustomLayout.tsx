import { Spot } from "@/lib/store/reportStore";

interface CustomLayoutProps {
  spots: Spot[];
}

export default function CustomLayout({ spots }: CustomLayoutProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {spots.map((spot) => (
        <div
          key={spot.id}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-medium text-gray-900">{spot.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                  spot.status
                )}`}
              >
                {spot.status}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Defect Type
                </label>
                <p className="text-gray-900">{spot.status}</p>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  <label className="block font-medium">Created By</label>
                  <span>{spot.metadata.deviceId}</span>
                </div>
                <div>
                  <label className="block font-medium">Date</label>
                  <span>
                    {new Date(
                      spot.metadata.installationDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2">
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => {
                // TODO: Implement edit functionality
                console.log("Edit spot:", spot.id);
              }}
            >
              Edit
            </button>
            <button
              className="text-sm text-gray-600 hover:text-gray-800"
              onClick={() => {
                // TODO: Implement details view
                console.log("View details:", spot.id);
              }}
            >
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
