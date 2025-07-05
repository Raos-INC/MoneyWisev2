import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { makeAuthenticatedRequest } from "../hooks/useAuth";

interface AIInsight {
  id: number;
  type: 'budget_alert' | 'saving_tip' | 'investment_suggestion' | 'spending_pattern' | 'smart_decision';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  isRead: boolean;
  createdAt: string;
}

export default function FinancialInsights() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: insights, isLoading } = useQuery<AIInsight[]>({
    queryKey: ['/api/ai-insights'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest('/api/ai-insights');
      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }
      return response.json();
    },
  });

  const { data: financialAdvice } = useQuery<{ advice: string }>({
    queryKey: ['/api/financial-advice'],
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const response = await makeAuthenticatedRequest('/api/ai-insights/generate', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
      toast({
        title: "✨ Insight Baru Tersedia",
        description: "AI telah menganalisis pola keuangan Anda dan memberikan rekomendasi baru",
      });
      setIsGenerating(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Gagal menghasilkan insight finansial",
        variant: "destructive",
      });
      setIsGenerating(false);
    },
  });

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'saving_tip':
        return <Lightbulb className="h-5 w-5 text-yellow-600" />;
      case 'investment_suggestion':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'spending_pattern':
        return <TrendingDown className="h-5 w-5 text-blue-600" />;
      case 'smart_decision':
        return <Target className="h-5 w-5 text-purple-600" />;
      default:
        return <Brain className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'budget_alert':
        return 'Peringatan Anggaran';
      case 'saving_tip':
        return 'Tips Menabung';
      case 'investment_suggestion':
        return 'Saran Investasi';
      case 'spending_pattern':
        return 'Pola Pengeluaran';
      case 'smart_decision':
        return 'Keputusan Cerdas';
      default:
        return 'Insight';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Financial Insights</h2>
            <p className="text-muted-foreground">Analisis cerdas dan rekomendasi untuk keuangan Anda</p>
          </div>
        </div>

        <Button 
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generateInsightsMutation.isPending || isGenerating}
          className="gap-2"
        >
          {generateInsightsMutation.isPending || isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Menganalisis...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analisis Ulang
            </>
          )}
        </Button>
      </div>

      {/* Financial Advice Card */}
      {financialAdvice?.advice && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Saran Keuangan Personal
            </CardTitle>
            <CardDescription>
              Rekomendasi yang dipersonalisasi berdasarkan profil keuangan Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {financialAdvice.advice}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights Grid */}
      {insights && insights.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <Card key={insight.id} className={`${!insight.isRead ? 'border-primary/50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                      {insight.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {getTypeLabel(insight.type)}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  {insight.message}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {insight.actionable && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        ✓ Actionable
                      </Badge>
                    )}
                    {!insight.isRead && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Baru
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(insight.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum Ada Insight</h3>
            <p className="text-muted-foreground mb-4">
              Klik "Analisis Ulang" untuk mendapatkan rekomendasi finansial berdasarkan transaksi Anda
            </p>
            <Button 
              onClick={() => generateInsightsMutation.mutate()}
              disabled={generateInsightsMutation.isPending}
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Mulai Analisis
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Cara Mengoptimalkan AI Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                <strong>Konsisten Input Transaksi</strong><br />
                Semakin lengkap data transaksi, semakin akurat analisis AI
              </AlertDescription>
            </Alert>
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Atur Target Keuangan</strong><br />
                Buat target menabung untuk rekomendasi yang lebih personal
              </AlertDescription>
            </Alert>
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Review Berkala</strong><br />
                Lakukan analisis ulang setiap minggu untuk insight terbaru
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}