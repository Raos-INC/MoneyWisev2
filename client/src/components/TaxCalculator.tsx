import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Calculator, TrendingUp, TrendingDown, DollarSign, Info } from "lucide-react";

interface TaxResult {
  annualIncome: number;
  taxableIncome: number;
  tax: number;
  taxRate: number;
  afterTaxIncome: number;
  monthlyTax: number;
  monthlyAfterTax: number;
  ptkp: number;
  taxBrackets: Array<{
    min: number;
    max: number;
    rate: number;
    amount: number;
  }>;
}

export default function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('single');
  const [dependents, setDependents] = useState('0');
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null);

  const calculatePTKP = (status: string, deps: string) => {
    const basePTKP = 54000000; // PTKP dasar
    const marriedBonus = status === 'married' ? 4500000 : 0;
    const dependentBonus = parseInt(deps) * 4500000;
    return basePTKP + marriedBonus + dependentBonus;
  };

  const calculateTax = () => {
    const annualIncome = parseFloat(income);
    if (isNaN(annualIncome) || annualIncome <= 0) return;

    const ptkp = calculatePTKP(maritalStatus, dependents);
    const taxableIncome = Math.max(0, annualIncome - ptkp);

    let tax = 0;
    let currentRate = 0;
    const taxBrackets: Array<{min: number; max: number; rate: number; amount: number}> = [];

    // Tax brackets for 2024
    const brackets = [
      { min: 0, max: 60000000, rate: 0.05 },
      { min: 60000000, max: 250000000, rate: 0.15 },
      { min: 250000000, max: 500000000, rate: 0.25 },
      { min: 500000000, max: 5000000000, rate: 0.30 },
      { min: 5000000000, max: Infinity, rate: 0.35 }
    ];

    let remainingIncome = taxableIncome;

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;

      const bracketBase = bracket.min;
      const bracketTop = bracket.max === Infinity ? remainingIncome + bracketBase : Math.min(bracket.max, remainingIncome + bracketBase);
      const bracketIncome = Math.max(0, bracketTop - bracketBase);

      if (bracketIncome > 0) {
        const bracketTax = bracketIncome * bracket.rate;
        tax += bracketTax;
        currentRate = bracket.rate * 100;

        taxBrackets.push({
          min: bracketBase,
          max: bracket.max === Infinity ? bracketBase + bracketIncome : bracketTop,
          rate: bracket.rate * 100,
          amount: bracketTax
        });

        remainingIncome -= bracketIncome;
      }
    }

    const afterTaxIncome = annualIncome - tax;
    const monthlyTax = tax / 12;
    const monthlyAfterTax = afterTaxIncome / 12;

    setTaxResult({
      annualIncome,
      taxableIncome,
      tax,
      taxRate: currentRate,
      afterTaxIncome,
      monthlyTax,
      monthlyAfterTax,
      ptkp,
      taxBrackets
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Calculator Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Kalkulator Pajak PPh 21
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Hitung pajak penghasilan berdasarkan tarif PPh 21 terbaru
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="income">Penghasilan Bruto Tahunan</Label>
              <Input
                id="income"
                type="number"
                placeholder="Contoh: 120000000"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Status Perkawinan</Label>
              <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Belum Menikah</SelectItem>
                  <SelectItem value="married">Menikah</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Jumlah Tanggungan</Label>
              <Select value={dependents} onValueChange={setDependents}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0 Tanggungan</SelectItem>
                  <SelectItem value="1">1 Tanggungan</SelectItem>
                  <SelectItem value="2">2 Tanggungan</SelectItem>
                  <SelectItem value="3">3 Tanggungan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculateTax} className="w-full" disabled={!income}>
            <Calculator className="h-4 w-4 mr-2" />
            Hitung Pajak
          </Button>
        </CardContent>
      </Card>

      {/* Tax Result */}
      {taxResult && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Penghasilan Bruto</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(taxResult.annualIncome)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">Pajak Terutang</p>
                    <p className="text-2xl font-bold text-red-900">
                      {formatCurrency(taxResult.tax)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Take Home Pay</p>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(taxResult.afterTaxIncome)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Tarif Efektif</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {((taxResult.tax / taxResult.annualIncome) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-lg">
                    {taxResult.taxRate}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Rincian Perhitungan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Perhitungan Tahunan</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Penghasilan Bruto:</span>
                      <span className="font-medium">{formatCurrency(taxResult.annualIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>PTKP ({maritalStatus === 'married' ? 'Menikah' : 'Belum Menikah'}, {dependents} tanggungan):</span>
                      <span className="font-medium">-{formatCurrency(taxResult.ptkp)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Penghasilan Kena Pajak:</span>
                      <span className="font-medium">{formatCurrency(taxResult.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Pajak Terutang:</span>
                      <span className="font-bold">{formatCurrency(taxResult.tax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-green-600">
                      <span>Penghasilan Setelah Pajak:</span>
                      <span className="font-bold">{formatCurrency(taxResult.afterTaxIncome)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Perhitungan Bulanan</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Penghasilan Bruto per Bulan:</span>
                      <span className="font-medium">{formatCurrency(taxResult.annualIncome / 12)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Pajak per Bulan:</span>
                      <span className="font-medium">-{formatCurrency(taxResult.monthlyTax)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-green-600">
                      <span>Take Home per Bulan:</span>
                      <span className="font-bold">{formatCurrency(taxResult.monthlyAfterTax)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tax Brackets */}
              {taxResult.taxBrackets.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Rincian per Bracket Pajak</h4>
                  <div className="space-y-2">
                    {taxResult.taxBrackets.map((bracket, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <span className="font-medium">
                            {formatCurrency(bracket.min)} - {bracket.max === Infinity ? '∞' : formatCurrency(bracket.max)}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {bracket.rate}%
                          </Badge>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(bracket.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Catatan Penting:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Perhitungan ini berdasarkan tarif PPh 21 terbaru</li>
                    <li>PTKP (Penghasilan Tidak Kena Pajak) disesuaikan dengan status dan tanggungan</li>
                    <li>Hasil perhitungan bersifat estimasi dan dapat berbeda dengan perhitungan resmi</li>
                    <li>Konsultasikan dengan konsultan pajak untuk perhitungan yang lebih akurat</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}