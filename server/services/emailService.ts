
import nodemailer from 'nodemailer';

// Create a transporter (you'll need to configure this with your email provider)
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com', // or your email provider's SMTP
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendReportEmail(
  to: string,
  pdfBuffer: Buffer,
  reportPeriod: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: `MoneyWise - Laporan Keuangan ${reportPeriod}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">MoneyWise - Laporan Keuangan</h2>
          <p>Halo,</p>
          <p>Berikut adalah laporan keuangan Anda untuk periode <strong>${reportPeriod}</strong>.</p>
          <p>Laporan terlampir dalam format PDF.</p>
          <br>
          <p>Terima kasih telah menggunakan MoneyWise!</p>
          <hr>
          <p style="color: #6b7280; font-size: 12px;">
            Email ini dikirim secara otomatis dari sistem MoneyWise.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: `laporan-keuangan-${reportPeriod}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
