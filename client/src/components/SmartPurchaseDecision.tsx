
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Heart, Target, Lightbulb, Timer, ShoppingBag } from "lucide-react";

const purchaseDecisionSchema = z.object({
  item: z.string().min(1, "Nama item harus diisi"),
  price: z.string().min(1, "Harga harus diisi"),
  description: z.string().min(10, "Jelaskan alasan Anda ingin membeli item ini (minimal 10 karakter)"),
});

type PurchaseDecisionForm = z.infer<typeof purchaseDecisionSchema>;

interface PurchaseAnalysis {
  recommendation: 'buy' | 'wait' | 'skip';
  reasoning: string;
  alternatives?: string;
  psychologicalFactors?: string;
  longTermImpact?: string;
  necessityLevel?: 'need' | 'want' | 'luxury';
}

interface UserSummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  netBalance: number;
  savingsGoals: number;
  totalSavingsTarget: number;
  totalCurrentSavings: number;
}

export default function SmartPurchaseDecision() {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<PurchaseAnalysis | null>(null);

  const form = useForm<PurchaseDecisionForm>({
    resolver: zodResolver(purchaseDecisionSchema),
    defaultValues: {
      item: "",
      price: "",
      description: "",
    },
  });

  // Get user financial summary for analysis
  const { data: userSummary } = useQuery<UserSummary>({
    queryKey: ['/api/user/financial-summary'],
  });

  const analyzeDecisionMutation = useMutation({
    mutationFn: async (data: PurchaseDecisionForm) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/smart-purchase-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          item: data.item,
          price: parseFloat(data.price),
          description: data.description,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to analyze purchase decision');
      }
      
      return await response.json() as PurchaseAnalysis;
    },
    onSuccess: (data: PurchaseAnalysis) => {
      setAnalysis(data);
      toast({
        title: "Analisis Selesai",
        description: "Analisis komprehensif telah dihasilkan oleh AI",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: "Gagal menganalisis keputusan pembelian",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PurchaseDecisionForm) => {
    analyzeDecisionMutation.mutate(data);
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'wait':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'skip':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'wait':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'skip':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'buy':
        return 'BELI SEKARANG';
      case 'wait':
        return 'TUNGGU DULU';
      case 'skip':
        return 'SKIP PEMBELIAN';
      default:
        return 'BELUM DIANALISIS';
    }
  };

  const getNecessityBadge = (level?: string) => {
    switch (level) {
      case 'need':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">🔴 KEBUTUHAN</Badge>;
      case 'want':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">🔵 KEINGINAN</Badge>;
      case 'luxury':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">🟣 KEMEWAHAN</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Smart Purchase Decision</h2>
          <p className="text-muted-foreground">AI akan menganalisis keputusan pembelian Anda secara komprehensif</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Detail Pembelian
            </CardTitle>
            <CardDescription>
              Berikan informasi lengkap tentang item yang ingin Anda beli
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="item"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Item</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. iPhone 15 Pro, Laptop Gaming, Sepatu Nike"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga (Rp)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="e.g. 15000000"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alasan Pembelian</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Jelaskan secara detail mengapa Anda ingin membeli item ini. Apa yang mendorong Anda? Apakah untuk kebutuhan, pekerjaan, hobi, atau alasan lain?"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={analyzeDecisionMutation.isPending}
                >
                  {analyzeDecisionMutation.isPending ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-spin" />
                      Menganalisis...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Analisis Komprehensif
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Analysis Result */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Hasil Analisis AI
            </CardTitle>
            <CardDescription>
              Analisis holistik berdasarkan aspek keuangan, psikologis, dan utilitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <div className="space-y-6">
                {/* Recommendation Badge */}
                <div className="flex items-center justify-center p-4 border rounded-lg">
                  <div className="text-center space-y-3">
                    <div className="flex items-center justify-center gap-2">
                      {getRecommendationIcon(analysis.recommendation)}
                      <Badge 
                        variant="outline" 
                        className={`text-sm font-medium ${getRecommendationColor(analysis.recommendation)}`}
                      >
                        {getRecommendationText(analysis.recommendation)}
                      </Badge>
                    </div>
                    {analysis.necessityLevel && (
                      <div className="flex justify-center">
                        {getNecessityBadge(analysis.necessityLevel)}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Main Reasoning */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    Analisis Komprehensif
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {analysis.reasoning}
                  </p>
                </div>

                {/* Psychological Factors */}
                {analysis.psychologicalFactors && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-600" />
                        Aspek Psikologis
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysis.psychologicalFactors}
                      </p>
                    </div>
                  </>
                )}

                {/* Long Term Impact */}
                {analysis.longTermImpact && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Timer className="h-4 w-4 text-blue-600" />
                        Dampak Jangka Panjang
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysis.longTermImpact}
                      </p>
                    </div>
                  </>
                )}

                {/* Alternatives */}
                {analysis.alternatives && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="h-4 w-4 text-green-600" />
                        Alternatif Lain
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {analysis.alternatives}
                      </p>
                    </div>
                  </>
                )}

                {/* Financial Context */}
                {userSummary && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-3">📊 Konteks Keuangan</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Pendapatan:</span>
                          <p className="font-medium">
                            Rp {(userSummary as any)?.monthlyIncome?.toLocaleString('id-ID') || '0'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Pengeluaran:</span>
                          <p className="font-medium">
                            Rp {(userSummary as any)?.monthlyExpenses?.toLocaleString('id-ID') || '0'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Masukkan detail pembelian dan alasan Anda untuk mendapatkan analisis yang mendalam
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Tips Smart Shopping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-green-700 mb-2">✅ Kebutuhan vs Keinginan</h4>
              <p className="text-sm text-muted-foreground">
                Tanyakan: "Apa yang terjadi jika saya tidak membelinya sekarang?"
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">⏰ Tunggu 24-48 Jam</h4>
              <p className="text-sm text-muted-foreground">
                Beri waktu untuk emosi mereda dan berpikir lebih jernih.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-2">🔍 Riset Mendalam</h4>
              <p className="text-sm text-muted-foreground">
                Bandingkan harga, baca review, dan cari alternatif yang lebih baik.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-orange-700 mb-2">💭 Motivasi Diri</h4>
              <p className="text-sm text-muted-foreground">
                Pahami mengapa Anda menginginkan item ini - apakah rasional atau emosional?
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
