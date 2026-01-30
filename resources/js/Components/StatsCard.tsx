import { Icon } from '@phosphor-icons/react';

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: Icon;
    iconBgColor: string;
    iconColor: string;
}

export default function StatsCard({ 
    title, 
    value, 
    icon: IconComponent, 
    iconBgColor, 
    iconColor 
}: StatsCardProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: iconBgColor }}
                >
                    <IconComponent 
                        size={24} 
                        weight="fill" 
                        style={{ color: iconColor }}
                    />
                </div>
            </div>
        </div>
    );
}
