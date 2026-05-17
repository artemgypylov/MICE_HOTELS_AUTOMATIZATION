import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DoorOpen,
  UtensilsCrossed,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, Badge } from '@/components/ui';
import { cn } from '@/lib/utils';
import AdminLayout from '../components/admin/AdminLayout';
import AdminHallsTab from '../components/admin/AdminHallsTab';
import AdminCateringTab from '../components/admin/AdminCateringTab';
import AdminServicesTab from '../components/admin/AdminServicesTab';

type TabId = 'halls' | 'catering' | 'services';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

const tabs: Tab[] = [
  {
    id: 'halls',
    label: 'Conference Halls',
    icon: DoorOpen,
    description: 'Manage conference halls and meeting spaces',
    color: 'primary',
  },
  {
    id: 'catering',
    label: 'Catering Options',
    icon: UtensilsCrossed,
    description: 'Manage food and beverage offerings',
    color: 'accent',
  },
  {
    id: 'services',
    label: 'Additional Services',
    icon: Sparkles,
    description: 'Manage extra services and equipment',
    color: 'success',
  },
];

const AdminInventoryPageNew: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabId>('halls');

  const renderTabContent = () => {
    switch (currentTab) {
      case 'halls':
        return <AdminHallsTab />;
      case 'catering':
        return <AdminCateringTab />;
      case 'services':
        return <AdminServicesTab />;
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Inventory Management</h1>
            <p className="mt-2 text-neutral-600">
              Manage your venue's offerings: halls, catering, and services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
              <BarChart3 className="w-3 h-3 mr-1" />
              Live Inventory
            </Badge>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-left"
              >
                <Card
                  className={cn(
                    'border-2 transition-all duration-300 hover:shadow-lg',
                    isActive
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  )}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors',
                          isActive
                            ? 'bg-primary-600'
                            : 'bg-neutral-100'
                        )}
                      >
                        <Icon
                          className={cn(
                            'w-6 h-6 transition-colors',
                            isActive ? 'text-white' : 'text-neutral-600'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className={cn(
                            'font-semibold text-lg mb-1 transition-colors',
                            isActive ? 'text-primary-700' : 'text-neutral-900'
                          )}
                        >
                          {tab.label}
                        </h3>
                        <p className="text-sm text-neutral-600 leading-relaxed">
                          {tab.description}
                        </p>
                      </div>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 rounded-full bg-primary-600 mt-2"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                {renderTabContent()}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminInventoryPageNew;
