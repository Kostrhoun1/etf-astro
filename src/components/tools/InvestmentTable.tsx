import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import type { CalculationData } from '../../utils/investmentCalculations';

interface InvestmentTableProps {
  data: CalculationData[];
}

const InvestmentTable: React.FC<InvestmentTableProps> = ({ data }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailní přehled po letech</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rok</TableHead>
                <TableHead className="text-right">Celkem investováno (Kč)</TableHead>
                <TableHead className="text-right">Čistý výnos (Kč)</TableHead>
                <TableHead className="text-right">Celková hodnota portfolia (Kč)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.year}>
                  <TableCell className="font-medium">{row.year}</TableCell>
                  <TableCell className="text-right text-blue-600 font-medium">
                    {formatNumber(row.totalInvested)}
                  </TableCell>
                  <TableCell className="text-right text-green-600 font-medium">
                    {formatNumber(row.netGain)}
                  </TableCell>
                  <TableCell className="text-right text-purple-600 font-medium">
                    {formatNumber(row.netValue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentTable;