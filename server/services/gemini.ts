import * as fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { Transaction } from "@shared/schema";

// Gemini API integration for financial insights
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY tidak ditemukan. Fitur AI insights tidak akan berfungsi.");
}
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

interface AIInsight {
  type: 'budget_alert' | 'saving_tip' | 'investment_suggestion' | 'spending_pattern' | 'smart_decision';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export async function analyzeSpendingPatterns(transactions: Transaction[]): Promise<AIInsight[]> {
  try {
    console.log(`Starting analysis with ${transactions.length} transactions`);
    
    if (!ai || !apiKey) {
      console.log("AI service not available - generating fallback insights");
      return generateFallbackInsights(transactions);
    }

    if (transactions.length === 0) {
      console.log("No transactions to analyze");
      return [];
    }

    const transactionData = transactions.slice(0, 20).map(t => ({
      amount: parseFloat(t.amount),
      description: t.description,
      type: t.type,
      date: t.date
    }));

    const totalIncome = transactionData.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactionData.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    const systemPrompt = `Anda adalah ahli keuangan personal Indonesia yang memberikan saran praktis dan spesifik. Analisis transaksi dan berikan 3-4 insight yang actionable dalam bahasa Indonesia.

WAJIB berikan saran berdasarkan data nyata pengguna, jangan generik. Fokus pada:
- Pola pengeluaran spesifik berdasarkan kategori terbesar
- Rekomendasi hemat berdasarkan transaksi yang sering
- Peringatan jika pengeluaran melebihi pemasukan
- Tips investasi sesuai kondisi keuangan

Format respons JSON array:
[
  {
    "type": "budget_alert" | "saving_tip" | "investment_suggestion" | "spending_pattern" | "smart_decision",
    "title": "judul singkat (max 60 karakter)",
    "message": "pesan actionable spesifik (max 200 karakter)",
    "priority": "high" | "medium" | "low",
    "actionable": true
  }
]`;

    // Analyze categories and patterns
    const categorySpending = transactionData
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        const category = t.description.toLowerCase();
        acc[category] = (acc[category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    const topCategories = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : '0';

    const prompt = `Data keuangan pengguna:
- Total pemasukan: Rp ${totalIncome.toLocaleString('id-ID')}
- Total pengeluaran: Rp ${totalExpenses.toLocaleString('id-ID')}
- Saldo bersih: Rp ${(totalIncome - totalExpenses).toLocaleString('id-ID')}
- Tingkat tabungan: ${savingsRate}%
- Jumlah transaksi: ${transactionData.length}

Kategori pengeluaran terbesar:
${topCategories.map(([cat, amount]) => `- ${cat}: Rp ${amount.toLocaleString('id-ID')}`).join('\n')}

Transaksi terakhir:
${JSON.stringify(transactionData.slice(0, 8), null, 2)}

Berikan insight finansial yang SPESIFIK berdasarkan data ini. Fokus pada kategori pengeluaran terbesar dan pola transaksi nyata.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\n${prompt}`,
    });

    let rawJson = response.text?.trim() || '';
    
    // Clean JSON response
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    if (rawJson) {
      try {
        const insights: AIInsight[] = JSON.parse(rawJson);
        console.log(`Successfully generated ${insights.length} AI insights`);
        return insights.slice(0, 3);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        console.log('Raw response:', rawJson);
        return generateFallbackInsights(transactions);
      }
    }

    console.log("No valid response from AI, using fallback");
    return generateFallbackInsights(transactions);
  } catch (error) {
    console.error('Error analyzing spending patterns:', error);
    return generateFallbackInsights(transactions);
  }
}

function generateFallbackInsights(transactions: Transaction[]): AIInsight[] {
  if (transactions.length === 0) return [];
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const balance = totalIncome - totalExpenses;
  
  const insights: AIInsight[] = [];
  
  if (balance < 0) {
    insights.push({
      type: 'budget_alert',
      title: 'Pengeluaran Melebihi Pemasukan',
      message: `Pengeluaran Anda Rp ${Math.abs(balance).toLocaleString('id-ID')} lebih besar dari pemasukan. Tinjau pengeluaran tidak penting.`,
      priority: 'high',
      actionable: true
    });
  } else if (balance > 0) {
    insights.push({
      type: 'saving_tip',
      title: 'Potensi Tabungan Tersedia',
      message: `Anda memiliki sisa Rp ${balance.toLocaleString('id-ID')}. Pertimbangkan untuk menabung 20% dari sisa ini.`,
      priority: 'medium',
      actionable: true
    });
  }
  
  if (transactions.length >= 5) {
    const recentExpenses = transactions.filter(t => t.type === 'expense').slice(0, 5);
    const avgExpense = recentExpenses.reduce((sum, t) => sum + parseFloat(t.amount), 0) / recentExpenses.length;
    
    insights.push({
      type: 'spending_pattern',
      title: 'Analisis Pola Pengeluaran',
      message: `Rata-rata pengeluaran Anda Rp ${avgExpense.toLocaleString('id-ID')} per transaksi. Monitor pengeluaran besar.`,
      priority: 'low',
      actionable: true
    });
  }
  
  return insights;
}

export async function generateFinancialAdvice(
  income: number,
  expenses: number,
  savingsGoals: any[]
): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "Maaf, layanan AI insight tidak tersedia saat ini.";
    }

    const prompt = `Berikan saran keuangan personal dalam bahasa Indonesia berdasarkan data berikut:
- Pendapatan bulanan: Rp ${income.toLocaleString('id-ID')}
- Pengeluaran bulanan: Rp ${expenses.toLocaleString('id-ID')}
- Target tabungan: ${savingsGoals.length} tujuan

Berikan saran praktis untuk meningkatkan kondisi keuangan dalam 2-3 paragraf.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Tidak dapat memberikan saran keuangan saat ini.";
  } catch (error) {
    console.error('Error generating financial advice:', error);
    return "Terjadi kesalahan dalam menganalisis kondisi keuangan Anda.";
  }
}

export async function analyzeInvestmentOpportunity(
  amount: number,
  riskProfile: string,
  timeHorizon: string
): Promise<string> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return "Layanan analisis investasi tidak tersedia.";
    }

    const prompt = `Sebagai advisor keuangan, berikan rekomendasi investasi dalam bahasa Indonesia untuk:
- Jumlah investasi: Rp ${amount.toLocaleString('id-ID')}
- Profil risiko: ${riskProfile}
- Jangka waktu: ${timeHorizon}

Berikan 2-3 opsi investasi yang cocok untuk pasar Indonesia dengan penjelasan singkat.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Tidak dapat memberikan rekomendasi investasi saat ini.";
  } catch (error) {
    console.error('Error analyzing investment opportunity:', error);
    return "Terjadi kesalahan dalam analisis investasi.";
  }
}

export async function analyzeSmartPurchaseDecision(
  item: string,
  price: number,
  description: string,
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
  psychologicalFactors?: string;
  longTermImpact?: string;
  necessityLevel?: 'need' | 'want' | 'luxury';
}> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return {
        recommendation: 'wait',
        reasoning: 'Layanan AI tidak tersedia untuk analisis pembelian.',
        necessityLevel: 'want'
      };
    }

    const disposableIncome = userProfile.monthlyIncome - userProfile.monthlyExpenses;
    const priceToIncomeRatio = (price / userProfile.monthlyIncome) * 100;

    const systemPrompt = `Anda adalah seorang konsultan keuangan dan psikolog konsumen yang memberikan analisis holistik tentang keputusan pembelian. 

Analisis harus mencakup:
1. Aspek keuangan (dampak pada cash flow, tabungan, dll)
2. Aspek psikologis (motivasi, kepuasan, stress relief, dll)
3. Aspek utilitas (seberapa berguna, frekuensi penggunaan)
4. Dampak jangka panjang (value retention, maintenance cost, dll)
5. Tingkat kebutuhan (need/want/luxury)

Berikan respons dalam format JSON dengan penjelasan yang empati dan tidak judgmental.`;

    const prompt = `Analisis keputusan pembelian secara komprehensif:

📱 ITEM: ${item}
💰 HARGA: Rp ${price.toLocaleString('id-ID')}
📝 DESKRIPSI/ALASAN: ${description || 'Tidak ada deskripsi'}

👤 PROFIL KEUANGAN:
- Pendapatan bulanan: Rp ${userProfile.monthlyIncome.toLocaleString('id-ID')}
- Pengeluaran bulanan: Rp ${userProfile.monthlyExpenses.toLocaleString('id-ID')}
- Uang disposable: Rp ${disposableIncome.toLocaleString('id-ID')}
- Target tabungan: ${userProfile.savingsGoals}
- Tabungan saat ini: Rp ${userProfile.currentSavings.toLocaleString('id-ID')}
- Rasio harga vs pendapatan: ${priceToIncomeRatio.toFixed(1)}%

Berikan analisis dalam format JSON:
{
  "recommendation": "buy" | "wait" | "skip",
  "reasoning": "penjelasan komprehensif mengapa memberikan rekomendasi ini (aspek keuangan + psikologis + utilitas)",
  "alternatives": "saran alternatif yang lebih bijak jika ada",
  "psychologicalFactors": "analisis motivasi psikologis di balik keinginan membeli item ini",
  "longTermImpact": "dampak jangka panjang dari keputusan ini (finansial, kepuasan, utility)",
  "necessityLevel": "need" | "want" | "luxury"
}

Pertimbangan analisis:
🔍 ASPEK KEUANGAN:
- Dampak pada cash flow dan tabungan
- Opportunity cost (apa yang harus dikorbankan)
- ROI atau value for money

🧠 ASPEK PSIKOLOGIS:
- Motivasi di balik pembelian (status, kepuasan, kebutuhan emosional)
- Apakah ini impulse buying atau keputusan terencana
- Dampak psikologis jika tidak membeli vs jika membeli

⚡ ASPEK UTILITAS:
- Seberapa sering akan digunakan
- Apakah menggantikan sesuatu yang sudah ada
- Apakah meningkatkan produktivitas/kualitas hidup

⏰ ASPEK JANGKA PANJANG:
- Value retention (akan tetap berguna dalam 1-2 tahun?)
- Maintenance cost atau biaya tambahan
- Apakah teknologi/tren yang akan outdated

Berikan feedback yang empati, tidak menghakimi, dan membantu user memahami motivasi mereka sendiri.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: `${systemPrompt}\n\n${prompt}`,
    });

    let rawJson = response.text?.trim() || '';

    // Clean JSON response
    if (rawJson.startsWith('```json')) {
      rawJson = rawJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (rawJson.startsWith('```')) {
      rawJson = rawJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    if (rawJson) {
      const analysis = JSON.parse(rawJson);
      return {
        recommendation: analysis.recommendation || 'wait',
        reasoning: analysis.reasoning || 'Tidak dapat menganalisis keputusan pembelian.',
        alternatives: analysis.alternatives,
        psychologicalFactors: analysis.psychologicalFactors,
        longTermImpact: analysis.longTermImpact,
        necessityLevel: analysis.necessityLevel || 'want'
      };
    }

    return {
      recommendation: 'wait',
      reasoning: 'Tidak dapat menganalisis keputusan pembelian saat ini.',
      necessityLevel: 'want'
    };
  } catch (error) {
    console.error('Error analyzing purchase decision:', error);
    return {
      recommendation: 'wait',
      reasoning: 'Terjadi kesalahan dalam analisis pembelian.',
      necessityLevel: 'want'
    };
  }
}