"use client";

import { useState, useEffect } from 'react';
import useCanvasStore from "@/store/canvasStore";
import MetricsDisplay from "../command-center/MetricsDisplay";
import ProfileCard from "../command-center/ProfileCard";
import { api, ProfileData } from '@/services/api';

const AnalyticsPanel = () => {
    const { currentTransaction, lastDecision } = useCanvasStore();
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
                        <p>Loading Profile...</p>
                    ) : (
                        <ProfileCard 
                            transaction={currentTransaction} 
                            profile={profileData}
                            decision={lastDecision}
                        />
                    )}
                </div>
            )}
        </aside>
    );
};

export default AnalyticsPanel;