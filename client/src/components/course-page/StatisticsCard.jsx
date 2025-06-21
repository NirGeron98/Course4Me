import React from 'react';
import { BarChart3, Heart, Brain, Clock, Zap, Award } from 'lucide-react';

const StatisticsCard = ({ stats }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                סטטיסטיקות
            </h3>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-500" />
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">עניין</span>
                            <span className="font-bold">{stats.avgInterest}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{ width: `${(stats.avgInterest / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-orange-500" />
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">קושי</span>
                            <span className="font-bold">{stats.avgDifficulty}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: `${(stats.avgDifficulty / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">עומס</span>
                            <span className="font-bold">{stats.avgWorkload}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(stats.avgWorkload / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-purple-500" />
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">השקעה</span>
                            <span className="font-bold">{stats.avgInvestment}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${(stats.avgInvestment / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-emerald-500" />
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <span className="text-gray-600">איכות הוראה</span>
                            <span className="font-bold">{stats.avgTeachingQuality}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${(stats.avgTeachingQuality / 5) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatisticsCard;
