

import PDFKit from "pdfkit";
import { storage } from "../storage";

export async function generatePDFReport(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Buffer> {
  try {
    // Get data
    const transactions = await storage.getTransactionsByDateRange(userId, startDate, endDate);
    const savingsGoals = await storage.getSavingsGoals(userId);
    const categories = await storage.getCategories(userId);
    const user = await storage.getUser(userId);
    
    // Create PDF document
    const doc = new PDFKit({ margin: 50 });
    const buffers: Buffer[] = [];
    
    doc.on('data', (chunk) => {
      buffers.push(chunk);
    });
    
    // Colors
    const primaryColor = '#2563eb';
    const successColor = '#059669';
    const dangerColor = '#DC2626';
    const grayColor = '#6b7280';
    const lightGray = '#f3f4f6';
    
    // Header with logo area
    doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
    
    // Title
    doc.fillColor('white')
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('MONEYWISE', 50, 30);
    
    doc.fontSize(16)
       .font('Helvetica')
       .text('Laporan Keuangan Pribadi', 50, 65);
    
    // Period and user info
    doc.fontSize(12)
       .text(`Periode: ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`, 50, 85);
    doc.text(`Pemilik: ${user?.name || user?.email || 'User'}`, 400, 85);
    
    let yPos = 150;
    
    // Financial Summary Card
    doc.rect(50, yPos, 500, 120).fill(lightGray).stroke(grayColor);
    
    const totalIncome = transactions
      .filter((t: any) => t.type === 'income')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
      .filter((t: any) => t.type === 'expense')
      .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

    const netBalance = totalIncome - totalExpenses;

    doc.fillColor(primaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('💰 RINGKASAN KEUANGAN', 70, yPos + 20);

    // Income
    doc.fillColor(successColor)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Pemasukan', 70, yPos + 50);
    doc.fillColor('#000000')
       .font('Helvetica')
       .text(`Rp ${totalIncome.toLocaleString('id-ID')}`, 70, yPos + 65);

    // Expenses  
    doc.fillColor(dangerColor)
       .font('Helvetica-Bold')
       .text('Pengeluaran', 200, yPos + 50);
    doc.fillColor('#000000')
       .font('Helvetica')
       .text(`Rp ${totalExpenses.toLocaleString('id-ID')}`, 200, yPos + 65);

    // Net Balance
    doc.fillColor(netBalance >= 0 ? successColor : dangerColor)
       .font('Helvetica-Bold')
       .text('Saldo Bersih', 350, yPos + 50);
    doc.fillColor(netBalance >= 0 ? successColor : dangerColor)
       .font('Helvetica-Bold')
       .text(`Rp ${netBalance.toLocaleString('id-ID')}`, 350, yPos + 65);

    // Transaction count
    doc.fillColor(grayColor)
       .fontSize(10)
       .font('Helvetica')
       .text(`Total ${transactions.length} transaksi dalam periode ini`, 70, yPos + 90);

    yPos += 150;

    // Category Analysis
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }

    doc.fillColor(primaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('📊 ANALISIS KATEGORI', 50, yPos);
    yPos += 30;

    const categoryTotals = categories.map(category => {
      const categoryTransactions = transactions.filter((t: any) => t.categoryId === category.id);
      const total = categoryTransactions.reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);
      return { ...category, total, count: categoryTransactions.length };
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

    // Top 5 categories
    const topCategories = categoryTotals.slice(0, 5);
    
    topCategories.forEach((category, index) => {
      if (yPos > 720) {
        doc.addPage();
        yPos = 50;
      }
      
      // Category bar
      const barWidth = (category.total / topCategories[0].total) * 300;
      const barColor = category.type === 'income' ? successColor : dangerColor;
      
      doc.fillColor('#e5e7eb')
         .rect(50, yPos, 300, 20)
         .fill();
      
      doc.fillColor(barColor)
         .rect(50, yPos, barWidth, 20)
         .fill();
         
      doc.fillColor('#000000')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text(`${index + 1}. ${category.name}`, 50, yPos + 25);
         
      doc.font('Helvetica')
         .text(`Rp ${category.total.toLocaleString('id-ID')} (${category.count} transaksi)`, 250, yPos + 25);
      
      yPos += 50;
    });

    // Savings Goals Progress
    if (savingsGoals.length > 0) {
      if (yPos > 600) {
        doc.addPage();
        yPos = 50;
      }

      doc.fillColor(primaryColor)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text('🎯 PROGRESS TARGET TABUNGAN', 50, yPos);
      yPos += 30;

      savingsGoals.slice(0, 5).forEach(goal => {
        if (yPos > 720) {
          doc.addPage();
          yPos = 50;
        }

        const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
        const progressBarWidth = (progress / 100) * 300;
        
        // Progress bar background
        doc.fillColor('#e5e7eb')
           .rect(50, yPos, 300, 15)
           .fill();
           
        // Progress bar fill
        doc.fillColor(progress >= 100 ? successColor : primaryColor)
           .rect(50, yPos, progressBarWidth, 15)
           .fill();
           
        doc.fillColor('#000000')
           .fontSize(11)
           .font('Helvetica-Bold')
           .text(`${goal.name}`, 50, yPos + 20);
           
        doc.font('Helvetica')
           .text(`${progress.toFixed(1)}% - Rp ${parseFloat(goal.currentAmount).toLocaleString('id-ID')} / Rp ${parseFloat(goal.targetAmount).toLocaleString('id-ID')}`, 50, yPos + 35);
           
        const targetDate = new Date(goal.targetDate);
        const daysLeft = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        doc.fillColor(grayColor)
           .fontSize(9)
           .text(`Target: ${targetDate.toLocaleDateString('id-ID')} (${daysLeft > 0 ? daysLeft + ' hari lagi' : 'Overdue'})`, 50, yPos + 50);

        yPos += 75;
      });
    }

    // Recent Transactions Table
    if (yPos > 500) {
      doc.addPage();
      yPos = 50;
    }

    doc.fillColor(primaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('💳 TRANSAKSI TERBARU', 50, yPos);
    yPos += 30;

    // Table header
    doc.fillColor(lightGray)
       .rect(50, yPos, 500, 25)
       .fill()
       .stroke(grayColor);
       
    doc.fillColor('#000000')
       .fontSize(10)
       .font('Helvetica-Bold')
       .text('Tanggal', 60, yPos + 8)
       .text('Deskripsi', 120, yPos + 8)
       .text('Kategori', 280, yPos + 8)
       .text('Jumlah', 450, yPos + 8);

    yPos += 25;

    const recentTransactions = transactions.slice(0, 15);
    recentTransactions.forEach((transaction, index) => {
      if (yPos > 750) {
        doc.addPage();
        yPos = 50;
      }

      const category = categories.find(c => c.id === transaction.categoryId);
      const amount = parseFloat(transaction.amount);
      const isIncome = transaction.type === 'income';
      
      // Alternate row colors
      if (index % 2 === 0) {
        doc.fillColor('#f9fafb')
           .rect(50, yPos, 500, 20)
           .fill();
      }
      
      doc.fillColor('#000000')
         .fontSize(9)
         .font('Helvetica')
         .text(new Date(transaction.date).toLocaleDateString('id-ID'), 60, yPos + 5)
         .text(transaction.description.substring(0, 25) + (transaction.description.length > 25 ? '...' : ''), 120, yPos + 5)
         .text(category?.name || 'Unknown', 280, yPos + 5);
         
      doc.fillColor(isIncome ? successColor : dangerColor)
         .font('Helvetica-Bold')
         .text(`${isIncome ? '+' : '-'} Rp ${amount.toLocaleString('id-ID')}`, 450, yPos + 5);

      yPos += 20;
    });

    // Financial Tips
    if (yPos > 650) {
      doc.addPage();
      yPos = 50;
    }
    
    doc.fillColor(primaryColor)
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('💡 REKOMENDASI FINANSIAL', 50, yPos);
    yPos += 30;
    
    const tips = [
      '🎯 Alokasikan 50% untuk kebutuhan, 30% untuk keinginan, 20% untuk tabungan',
      '📊 Review dan analisis pengeluaran setiap bulan secara rutin',
      '💰 Buat dana darurat minimal 6x pengeluaran bulanan',
      '📈 Diversifikasi investasi untuk pertumbuhan jangka panjang',
      '🚫 Hindari hutang konsumtif dan kartu kredit berbunga tinggi'
    ];
    
    tips.forEach(tip => {
      if (yPos > 750) {
        doc.addPage();
        yPos = 50;
      }
      
      doc.fillColor('#000000')
         .fontSize(11)
         .font('Helvetica')
         .text(tip, 70, yPos);
      yPos += 25;
    });
    
    // Footer
    doc.fillColor(grayColor)
       .fontSize(8)
       .font('Helvetica')
       .text(`Laporan dibuat pada ${new Date().toLocaleDateString('id-ID')} • MoneyWise Financial Management`, 50, 780, { align: 'center' });
    
    doc.end();
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });
      
      doc.on('error', reject);
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
}

