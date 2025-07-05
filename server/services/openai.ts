import { GoogleGenAI } from "@google/genai";
import type { Transaction } from "@shared/schema";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface AIInsight {
  type: 'budget_alert' | 'saving_tip' | 'investment_suggestion' | 'spending_pattern' | 'smart_decision';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export async function analyzeSpendingPatterns(transactions: Transaction[]): Promise<AIInsight[]> {
  if (!process.env.GEMINI_API_KEY) {
    return [];
  }

  try {
    if (transactions.length === 0) {
      return [];
    }

    const totalSpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const categories = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = t.categoryId?.toString() || 'unknown';
        acc[category] = (acc[category] || 0) + parseFloat(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // Analyze spending patterns by time
    const recentTransactions = transactions
      .filter(t => new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      .length;

    const systemPrompt = `Anda adalah ahli keuangan Indonesia yang memberikan analisis mendalam tentang pola pengeluaran. 
Analisis data transaksi dan berikan insight yang actionable dalam bahasa Indonesia.
Fokus pada konteks ekonomi Indonesia dan kebiasaan keuangan lokal.
Berikan response dalam format JSON dengan array insights.`;

    const prompt = `Analisis pola pengeluaran berikut dan berikan 4-5 insight keuangan yang spesifik:

Total pengeluaran: Rp ${totalSpending.toLocaleString('id-ID')}
Total pendapatan: Rp ${totalIncome.toLocaleString('id-ID')}
Rasio pengeluaran: ${totalIncome > 0 ? ((totalSpending/totalIncome)*100).toFixed(1) : 0}%
Kategori pengeluaran: ${JSON.stringify(categories)}
Transaksi bulan ini: ${recentTransactions}

Berikan insight sebagai array JSON dengan format:
{
  "insights": [
    {
      "type": "budget_alert" | "saving_tip" | "investment_suggestion" | "spending_pattern" | "smart_decision",
      "title": "judul singkat",
      "message": "pesan detail yang actionable",
      "priority": "high" | "medium" | "low",
      "actionable": true/false
    }
  ]
}

Fokus pada:
- Identifikasi pola pengeluaran yang tidak efisien
- Saran penghematan yang praktis
- Rekomendasi alokasi anggaran
- Peringatan jika ada red flags
- Tips optimasi keuangan`;

    const fullPrompt = `${systemPrompt}\n\n${prompt}\n\nResponse format: JSON only, no extra text`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt
    });

    const rawJson = response.text;
    if (rawJson) {
      // Clean up JSON response - remove markdown code blocks if present
      let cleanJson = rawJson.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const data = JSON.parse(cleanJson);
      return data.insights || [];
    }

    return [];
  } catch (error) {
    console.error('Error analyzing spending patterns:', error);
    return [];
  }
}

export async function generateFinancialAdvice(
  income: number,
  expenses: number,
  goals: any[]
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Fitur AI advisor keuangan tidak tersedia. Silakan konfigurasikan Gemini API key Anda.";
  }

  try {
    const savingsRate = ((income - expenses) / income) * 100;
    const monthlyBalance = income - expenses;

    const systemPrompt = `Anda adalah financial advisor berpengalaman di Indonesia yang memberikan saran keuangan personal. 
Berikan advice yang praktis, realistis, dan sesuai dengan kondisi ekonomi Indonesia.
Gunakan bahasa yang mudah dipahami dan berikan langkah konkret yang bisa ditindaklanjuti.`;

    const prompt = `Berikan saran keuangan komprehensif untuk profil berikut:

📊 PROFIL KEUANGAN:
- Pendapatan bulanan: Rp ${income.toLocaleString('id-ID')}
- Pengeluaran bulanan: Rp ${expenses.toLocaleString('id-ID')}
- Sisa uang bulanan: Rp ${monthlyBalance.toLocaleString('id-ID')}
- Tingkat tabungan: ${savingsRate.toFixed(1)}%
- Jumlah target keuangan: ${goals.length}

Berikan saran yang mencakup:
1. Evaluasi kondisi keuangan saat ini
2. Rekomendasi alokasi anggaran (50/30/20 rule atau sesuai kondisi)
3. Strategi optimasi pengeluaran
4. Saran peningkatan pendapatan
5. Rencana darurat fund
6. Tips mencapai target keuangan

Berikan dalam format yang terstruktur dan mudah diimplementasikan.`;

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt
    });

    return response.text || "Tidak dapat menghasilkan saran keuangan saat ini.";
  } catch (error) {
    console.error('Error generating financial advice:', error);
    return "Terjadi kesalahan saat menghasilkan saran keuangan.";
  }
}

export async function analyzeInvestmentOpportunity(
  amount: number,
  riskProfile: 'conservative' | 'moderate' | 'aggressive'
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return "Analisis investasi tidak tersedia. Silakan konfigurasikan Gemini API key Anda.";
  }

  try {
    const riskMapping = {
      conservative: 'Konservatif (minim risiko)',
      moderate: 'Moderat (risiko menengah)',
      aggressive: 'Agresif (risiko tinggi)'
    };

    const systemPrompt = `Anda adalah investment advisor yang ahli di pasar modal Indonesia. 
Berikan rekomendasi investasi yang sesuai dengan regulasi OJK, kondisi pasar Indonesia, dan profil risiko investor.
Gunakan pengetahuan terkini tentang produk investasi yang tersedia di Indonesia.`;

    const prompt = `Analisis peluang investasi untuk dana sebesar Rp ${amount.toLocaleString('id-ID')} dengan profil risiko ${riskMapping[riskProfile]}:

Berikan analisis yang mencakup:

🎯 REKOMENDASI INSTRUMEN INVESTASI:
- Produk investasi yang sesuai (reksadana, saham, obligasi, emas, dll)
- Alokasi portofolio yang optimal
- Platform investasi terpercaya di Indonesia
- Minimal investasi dan fee yang perlu diperhatikan

📈 STRATEGI INVESTASI:
- Timeline investasi yang disarankan
- Target return yang realistis
- Strategi diversifikasi
- Kapan timing yang tepat untuk entry

⚠️ MANAJEMEN RISIKO:
- Risiko yang perlu diwaspadai
- Cara mitigasi risiko
- Exit strategy
- Tips monitoring portfolio

💡 TIPS PRAKTIS:
- Langkah konkret untuk memulai
- Kesalahan umum yang harus dihindari
- Sumber edukasi investasi yang recommended

Berikan rekomendasi yang detail, praktis, dan mudah diimplementasikan untuk investor Indonesia.`;

    const fullPrompt = `${systemPrompt}\n\n${prompt}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt
    });

    return response.text || "Tidak dapat menghasilkan analisis investasi saat ini.";
  } catch (error) {
    console.error('Error analyzing investment opportunity:', error);
    return "Terjadi kesalahan saat menganalisis peluang investasi.";
  }
}

export async function analyzeSmartPurchaseDecision(
  item: string,
  price: number,
  userProfile: {
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsGoals: number;
    currentSavings: number;
  }
): Promise<{
  recommendation: 'buy' | 'wait' | 'skip';
  reasoning: string;
  alternatives?: string;
}> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      recommendation: 'wait',
      reasoning: 'Fitur analisis pembelian tidak tersedia. Silakan konfigurasikan Gemini API key Anda.'
    };
  }

  try {
    const disposableIncome = userProfile.monthlyIncome - userProfile.monthlyExpenses;
    const priceToIncomeRatio = (price / userProfile.monthlyIncome) * 100;

    const systemPrompt = `Anda adalah financial advisor yang membantu orang membuat keputusan pembelian yang bijak. 
Analisis apakah pembelian ini masuk akal secara finansial berdasarkan kondisi keuangan user.
Berikan reasoning yang jelas dan saran alternatif jika diperlukan.`;

    const prompt = `Analisis keputusan pembelian berikut:

🛍️ ITEM YANG INGIN DIBELI: ${item}
💰 HARGA: Rp ${price.toLocaleString('id-ID')}

👤 PROFIL KEUANGAN USER:
- Pendapatan bulanan: Rp ${userProfile.monthlyIncome.toLocaleString('id-ID')}
- Pengeluaran bulanan: Rp ${userProfile.monthlyExpenses.toLocaleString('id-ID')}
- Uang disposable: Rp ${disposableIncome.toLocaleString('id-ID')}
- Target tabungan: ${userProfile.savingsGoals}
- Tabungan saat ini: Rp ${userProfile.currentSavings.toLocaleString('id-ID')}
- Rasio harga vs pendapatan: ${priceToIncomeRatio.toFixed(1)}%

Berikan analisis dalam format JSON:
{
  "recommendation": "buy" | "wait" | "skip",
  "reasoning": "penjelasan detail mengapa memberikan rekomendasi ini",
  "alternatives": "saran alternatif jika ada (opsional)"
}

Pertimbangan:
- Apakah ini kebutuhan atau keinginan?
- Dampak terhadap cash flow bulanan
- Pengaruh terhadap target tabungan
- Timing pembelian
- Value for money
- Alternatif yang lebih bijak`;

    const fullPrompt = `${systemPrompt}\n\n${prompt}\n\nResponse format: JSON only with the exact schema specified`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt
    });

    const rawJson = response.text;
    if (rawJson) {
      // Clean up JSON response - remove markdown code blocks if present
      let cleanJson = rawJson.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      return JSON.parse(cleanJson);
    }

    return {
      recommendation: 'wait',
      reasoning: 'Tidak dapat menganalisis keputusan pembelian saat ini.'
    };
  } catch (error) {
    console.error('Error analyzing purchase decision:', error);
    return {
      recommendation: 'wait',
      reasoning: 'Terjadi kesalahan saat menganalisis keputusan pembelian.'
    };
  }
}
