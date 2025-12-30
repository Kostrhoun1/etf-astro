import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import BrokerOverview from '../broker/BrokerOverview';
import BrokerComparison from '../broker/BrokerComparison';
import BrokerRecommendations from '../broker/BrokerRecommendations';

const DetailedBrokerComparison: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
            Detailní srovnání brokerů pro ETF investory
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Komplexní analýza šesti předních brokerských platforem z pohledu českého investora do ETF fondů. 
            Porovnání zahrnuje XTB, DEGIRO, Fio e-Broker, Trading 212, Interactive Brokers a Portu.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="overview">Přehled</TabsTrigger>
            <TabsTrigger value="comparison">Srovnání</TabsTrigger>
            <TabsTrigger value="recommendations">Doporučení</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <BrokerOverview />
          </TabsContent>

          <TabsContent value="comparison">
            <BrokerComparison />
          </TabsContent>

          <TabsContent value="recommendations">
            <BrokerRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default DetailedBrokerComparison;