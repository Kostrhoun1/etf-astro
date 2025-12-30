import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { comparisonData } from '../../data/brokerData';

const BrokerComparison: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Srovnávací tabulka klíčových parametrů</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Funkce / Broker</TableHead>
                <TableHead className="text-center">DEGIRO</TableHead>
                <TableHead className="text-center">XTB</TableHead>
                <TableHead className="text-center">Fio e-Broker</TableHead>
                <TableHead className="text-center">Trading 212</TableHead>
                <TableHead className="text-center">Interactive Brokers</TableHead>
                <TableHead className="text-center">Portu</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell className="text-center text-sm">{row.degiro}</TableCell>
                  <TableCell className="text-center text-sm">{row.xtb}</TableCell>
                  <TableCell className="text-center text-sm">{row.fio}</TableCell>
                  <TableCell className="text-center text-sm">{row.trading212}</TableCell>
                  <TableCell className="text-center text-sm">{row.ibkr}</TableCell>
                  <TableCell className="text-center text-sm">{row.portu}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrokerComparison;