import { Transaction } from "@/lib/mockData";
import { Decision } from "@/store/canvasStore";
import { ProfileData } from "@/services/api";


interface ProfileCardProps {
  transaction: Transaction;
  profile: ProfileData;
  decision: Decision | null;
}

const ProfileCard = ({ transaction, profile, decision }: ProfileCardProps) => {
  const avatarUrl = `https://ui-avatars.com/api/?name=${profile.name.replace(" ", "+")}&background=EBF4FF&color=022C54`;

  const getBorderStyle = () => {
    if (!decision) return 'border-gray-200';
    switch (decision) {
      case 'BLOCK': return 'border-red-500 ring-2 ring-red-300';
      case 'APPROVE': return 'border-green-500 ring-2 ring-green-300';
      case 'REVIEW': return 'border-orange-400 ring-2 ring-orange-200';
      default: return 'border-gray-200';
    }
  };

  return (
    <div className={`flex w-full max-w-sm flex-col space-y-4 rounded-md border bg-white p-6 text-gray-800 shadow-sm transition-all duration-300 ${getBorderStyle()}`}>
      {/* Card Header */}
      <div className="flex items-center space-x-4">
        <img className="h-12 w-12 rounded-full" src={avatarUrl} alt="Profile Avatar" />
        <div>
          
          <h3 className="text-lg font-semibold text-gray-900">{profile.name}</h3>
          <p className="font-mono text-sm text-gray-500">ID: {profile.customerId}</p>
        </div>
      </div>

      <hr className="my-2 border-gray-200" />

      {/* Behavioral Summary */}
      <div>
        <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Historical Behavior</h4>
        <div className="grid grid-cols-2 gap-y-2">
          <p className="text-sm text-gray-600">Avg. Transaction</p>
          <p className="text-right font-mono text-sm font-medium text-gray-900">${profile.avgTransaction.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Activity Level</p>
          <p className="text-right font-mono text-sm font-medium text-gray-900">{profile.activityLevel} / month</p>
        </div>
      </div>

      {/* Typical Categories */}
      <div>
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">Typical Categories</h4>
        <div className="flex flex-wrap gap-2">
          {profile.typicalCategories.map((category) => (
            <span key={category} className="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">{category}</span>
          ))}
        </div>
      </div>

      {/* Live Event Alert */}
      <div className={`rounded-md p-4 border ${transaction.isFraud ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h4 className={`mb-1 font-mono text-sm font-bold uppercase ${transaction.isFraud ? 'text-red-800' : 'text-yellow-800'}`}>Live Event Flagged</h4>
        <p className="text-base text-gray-700">
          Purchase of <strong className="font-semibold text-gray-900">€{transaction.amount.toFixed(2)}</strong> at <strong className="font-semibold">DynamicMerchant.com</strong> <span className="text-gray-600">from a new device</span>.
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;