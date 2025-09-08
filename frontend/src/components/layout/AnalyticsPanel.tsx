"use client";

import { useState, useEffect } from 'react';
import useCanvasStore from "@/store/canvasStore";
import MetricsDisplay from "../command-center/MetricsDisplay";
import ProfileCard from "../command-center/ProfileCard";
import { api, ProfileData } from '@/services/api';

const AnalyticsPanel = () => {
    const { currentTransaction } = useCanvasStore();
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentTransaction) {
            setIsLoading(true);
            api.getCustomerProfile(currentTransaction.id)
                .then(data => {
                    setProfileData(data);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error("Failed to fetch profile:", error);
                    setIsLoading(false);
                });
        } else {
            setProfileData(null);
        }
    }, [currentTransaction]);

    return (
        <aside className="h-full border-r border-gray-200 bg-white p-6 space-y-6 overflow-y-auto">
            <div>
                <h2 className="text-base font-semibold text-gray-700 mb-4">ANALYTICS</h2>
                <MetricsDisplay />
            </div>

            {currentTransaction && (
                <div>
                    <h2 className="text-base font-semibold text-gray-700 mb-4">LIVE DISPATCH</h2>
                    {isLoading || !profileData ? (
                        <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ) : (
                        <ProfileCard 
                            profile={profileData}
                        />
                    )}
                </div>
            )}
        </aside>
    );
};

export default AnalyticsPanel;