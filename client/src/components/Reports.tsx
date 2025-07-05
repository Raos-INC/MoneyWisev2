import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Mail,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function Reports() {
  const [reportConfig, setReportConfig] = useState({
    type: "monthly",
    format: "pdf",
    periodStart: "",
    periodEnd: "",
  });
  const [exportConfig, setExportConfig] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    email: "",
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing reports
  const { data: reports = [], isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
    retry: false,
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (config) => {
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || '';

      const response = await fetch(`${apiUrl}/api/reports/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "✅ Berhasil",
        description: "Laporan berhasil dibuat",
      });

      // Auto-download the report data as JSON for now
      const reportData = {
        ...data.report,
        data: data.data,
        generatedAt: new Date().toISOString(),
      };

      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(reportData, null, 2));
      const downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute(
        "download",
        `laporan-${reportConfig.type}-${reportConfig.periodStart}-${reportConfig.periodEnd}.json`,
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    onError: (error) => {
      toast({
        title: "❌ Error",
        description: "Gagal membuat laporan",
        variant: "destructive",
      });
    },
  });

  const handleExportPDF = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      const token = localStorage.getItem("token");

      const response = await fetch("/api/reports/export-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        credentials: "include",
        body: JSON.stringify(exportConfig),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          toast({
            title: "🔒 Sesi Login Berakhir",
            description: "Silakan login kembali untuk melanjutkan",
            variant: "destructive",
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 2000);
          return;
        }

        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      if (exportConfig.email) {
        const result = await response.json();

        if (result.success === false) {
          throw new Error(result.message || "Export email gagal");
        }

        toast({
          title: "📧 Email Terkirim",
          description:
            result.message || "Laporan PDF berhasil dikirim ke email Anda",
        });
      } else {
        const blob = await response.blob();

        if (blob.size === 0) {
          throw new Error("File PDF kosong dari server");
        }

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `financial-report-${exportConfig.startDate}-${exportConfig.endDate}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: "✅ Export Berhasil",
          description: "Laporan PDF berhasil diunduh",
        });
      }

      setShowExportModal(false);
    } catch (error) {
      console.error("Export error:", error);

      let errorMessage = "Terjadi kesalahan saat mengekspor laporan";
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Koneksi ke server gagal - periksa koneksi internet";
      } else {
        errorMessage = error.message;
      }

      toast({
        title: "❌ Export Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateReport = () => {
    if (!reportConfig.periodStart || !reportConfig.periodEnd) {
      toast({
        title: "⚠️ Peringatan",
        description: "Periode laporan wajib diisi",
        variant: "destructive",
      });
      return;
    }

    if (new Date(reportConfig.periodStart) > new Date(reportConfig.periodEnd)) {
      toast({
        title: "⚠️ Peringatan",
        description: "Tanggal mulai tidak boleh lebih besar dari tanggal akhir",
        variant: "destructive",
      });
      return;
    }

    generateReportMutation.mutate(reportConfig);
  };

  const handleQuickPeriod = (period) => {
    const now = new Date();
    let startDate;
    let endDate = now;

    switch (period) {
      case "thisMonth":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "lastMonth":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "last3Months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case "last6Months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        return;
    }

    setReportConfig((prev) => ({
      ...prev,
      periodStart: startDate.toISOString().split("T")[0],
      periodEnd: endDate.toISOString().split("T")[0],
    }));
  };

  const getReportIcon = (format) => {
    switch (format) {
      case "pdf":
        return <FileText className="h-8 w-8 text-red-500" />;
      case "excel":
        return <FileText className="h-8 w-8 text-green-500" />;
      case "csv":
        return <FileText className="h-8 w-8 text-blue-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const getReportSize = (report) => {
    const baseSize = Math.random() * 3 + 0.5;
    return `${baseSize.toFixed(1)} MB`;
  };

  if (reportsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        <div className="h-3 w-32 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                    <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Laporan Keuangan
        </h2>
        <p className="text-gray-600 mt-2">
          Unduh dan analisis laporan keuangan lengkap dengan format profesional
        </p>
      </div>

      {/* Report Generation */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-blue-600" />
            Generate Laporan Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Jenis Laporan
              </Label>
              <Select
                value={reportConfig.type}
                onValueChange={(value) =>
                  setReportConfig((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">📊 Laporan Lengkap</SelectItem>
                  <SelectItem value="transactions">
                    💳 Laporan Transaksi
                  </SelectItem>
                  <SelectItem value="budget">💰 Laporan Anggaran</SelectItem>
                  <SelectItem value="savings">🏦 Laporan Tabungan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Format
              </Label>
              <Select
                value={reportConfig.format}
                onValueChange={(value) =>
                  setReportConfig((prev) => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pilih format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">📄 PDF</SelectItem>
                  <SelectItem value="excel">📊 Excel</SelectItem>
                  <SelectItem value="csv">📈 CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Tanggal Mulai
              </Label>
              <Input
                type="date"
                value={reportConfig.periodStart}
                onChange={(e) =>
                  setReportConfig((prev) => ({
                    ...prev,
                    periodStart: e.target.value,
                  }))
                }
                className="h-11"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                Tanggal Akhir
              </Label>
              <Input
                type="date"
                value={reportConfig.periodEnd}
                onChange={(e) =>
                  setReportConfig((prev) => ({
                    ...prev,
                    periodEnd: e.target.value,
                  }))
                }
                className="h-11"
              />
            </div>

            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={generateReportMutation.isPending}
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                {generateReportMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Quick Period Buttons */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: "thisMonth", label: "📅 Bulan Ini" },
              { key: "lastMonth", label: "📅 Bulan Lalu" },
              { key: "last3Months", label: "📅 3 Bulan Terakhir" },
              { key: "last6Months", label: "📅 6 Bulan Terakhir" },
              { key: "thisYear", label: "📅 Tahun Ini" },
            ].map(({ key, label }) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => handleQuickPeriod(key)}
                className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PDF Export & Email */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-orange-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-orange-600" />
            Export PDF Profesional
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Export laporan dalam format PDF berkualitas tinggi atau kirim
            langsung ke email
          </p>
        </CardHeader>
        <CardContent>
          <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg">
                <Download className="h-4 w-4 mr-2" />
                Export PDF Premium
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-gradient-to-br from-white to-gray-50">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="h-6 w-6 text-orange-600" />
                  Export Laporan PDF
                </DialogTitle>
                <p className="text-gray-600 text-sm mt-2">
                  Konfigurasi laporan PDF dengan format profesional dan lengkap
                </p>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="startDate"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Tanggal Mulai
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={exportConfig.startDate}
                      onChange={(e) =>
                        setExportConfig((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="endDate"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Tanggal Akhir
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={exportConfig.endDate}
                      onChange={(e) =>
                        setExportConfig((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email (Opsional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com - kosongkan untuk download langsung"
                    value={exportConfig.email}
                    onChange={(e) =>
                      setExportConfig((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Jika email diisi, laporan akan dikirim ke email. Jika
                    tidak, akan langsung didownload.
                  </p>
                </div>

                {/* Preview Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Preview Laporan
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      📊 <strong>Periode:</strong> {exportConfig.startDate} s/d{" "}
                      {exportConfig.endDate}
                    </p>
                    <p>
                      📧 <strong>Pengiriman:</strong>{" "}
                      {exportConfig.email
                        ? `Email ke ${exportConfig.email}`
                        : "Download langsung"}
                    </p>
                    <p>
                      📄 <strong>Format:</strong> PDF Profesional dengan grafik
                      dan analisis
                    </p>
                  </div>
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowExportModal(false)}
                    disabled={isExporting}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    disabled={
                      isExporting ||
                      !exportConfig.startDate ||
                      !exportConfig.endDate
                    }
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : exportConfig.email ? (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Kirim Email
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>

                {(!exportConfig.startDate || !exportConfig.endDate) && (
                  <div className="flex items-center gap-2 text-red-600 text-sm justify-center">
                    <AlertCircle className="h-4 w-4" />
                    Silakan pilih tanggal mulai dan akhir
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="h-6 w-6 text-green-600" />
            Laporan Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reports && Array.isArray(reports) && reports.length > 0 ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-5 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 hover:border-gray-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                      {getReportIcon(report.format)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">
                        {report.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.createdAt).toLocaleDateString(
                            "id-ID",
                          )}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          {report.type}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {report.format.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 font-medium">
                      {getReportSize(report)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-green-50 hover:text-green-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-red-50 hover:text-red-700"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                Belum Ada Laporan
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Mulai buat laporan pertama Anda untuk analisis keuangan yang
                lebih mendalam dan insights yang berguna.
              </p>
              <Button
                onClick={handleGenerateReport}
                disabled={!reportConfig.periodStart || !reportConfig.periodEnd}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                <FileText className="h-4 w-4 mr-2" />
                Buat Laporan Pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Information */}
      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-purple-50">
        <CardHeader>
          <CardTitle className="text-xl">
            📈 Jenis Laporan yang Tersedia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: "📊",
                title: "Laporan Lengkap",
                description:
                  "Ringkasan komprehensif termasuk pendapatan, pengeluaran, budget, dan insight AI.",
                color: "border-blue-200 bg-blue-50",
              },
              {
                icon: "💳",
                title: "Laporan Transaksi",
                description:
                  "Detail semua transaksi dengan kategorisasi dan analisis pola pengeluaran.",
                color: "border-green-200 bg-green-50",
              },
              {
                icon: "💰",
                title: "Laporan Anggaran",
                description:
                  "Analisis penggunaan budget dengan rekomendasi optimalisasi pengeluaran.",
                color: "border-yellow-200 bg-yellow-50",
              },
              {
                icon: "🏦",
                title: "Laporan Tabungan",
                description:
                  "Progress target tabungan dan proyeksi pencapaian tujuan finansial.",
                color: "border-purple-200 bg-purple-50",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-5 border rounded-xl ${item.color} hover:shadow-md transition-all duration-200`}
              >
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-lg">
                  <span className="text-2xl">{item.icon}</span>
                  {item.title}
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
