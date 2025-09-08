// src/components/command-center/ProfileCard.tsx

import { ProfileData } from "@/services/api";

interface ProfileCardProps {
  profile: ProfileData;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Card Header - Now only shows the ID */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase">Customer ID</p>
        <p className="font-mono text-2xl font-bold text-gray-800">{profile.customerId}</p>
      </div>

      <hr className="my-3 border-gray-200" />

      {/* Simplified Behavioral Summary */}
      <div>
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Historical Behavior</h4>
        <div className="flex items-baseline justify-between">
          <p className="text-sm text-gray-600">Avg. Transaction</p>
          <p className="font-mono text-lg font-medium text-gray-900">${profile.avgTransaction.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;