import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";

const profileSchema = z.object({
  firstName: z.string().min(1, "Nama depan wajib diisi"),
  lastName: z.string().min(1, "Nama belakang wajib diisi"),
  email: z.string().email("Email tidak valid"),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    savingsReminders: true,
    weeklyReports: false,
    emailNotifications: true,
  });

  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  // Update profile mutation (mock - would need backend implementation)
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      // Mock API call - in real implementation this would update user profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Berhasil",
        description: "Profil berhasil diperbarui",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Gagal memperbarui profil",
        variant: "destructive",
      });
    },
  });

  const onSubmitProfile = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Berhasil",
      description: "Pengaturan notifikasi diperbarui",
    });
  };

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await fetch('/api/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always remove token and redirect regardless of API response
      localStorage.removeItem('token');
      window.location.href = "/";
    }
  };

  const handleDataExport = () => {
    // Mock data export
    const exportData = {
      user: user,
      exportedAt: new Date().toISOString(),
      message: "Data keuangan Anda akan diekspor dalam format JSON"
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `moneywise-data-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    toast({
      title: "Berhasil",
      description: "Data berhasil diekspor",
    });
  };

  const tabs = [
    { id: "profile", label: "Profil", icon: "fas fa-user" },
    { id: "notifications", label: "Notifikasi", icon: "fas fa-bell" },
    { id: "preferences", label: "Preferensi", icon: "fas fa-cog" },
    { id: "security", label: "Keamanan", icon: "fas fa-shield-alt" },
  ];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Pengaturan</h2>
        <p className="text-muted-foreground">Kelola preferensi dan konfigurasi aplikasi</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Profile Settings */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle>Profil Pengguna</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Nama Depan</Label>
                    <Input
                      id="firstName"
                      {...form.register("firstName")}
                    />
                    {form.formState.errors.firstName && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nama Belakang</Label>
                    <Input
                      id="lastName"
                      {...form.register("lastName")}
                    />
                    {form.formState.errors.lastName && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateProfileMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Notifikasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Peringatan Anggaran</p>
                  <p className="text-sm text-muted-foreground">Notifikasi saat mendekati batas anggaran</p>
                </div>
                <Switch
                  checked={notifications.budgetAlerts}
                  onCheckedChange={(value) => handleNotificationChange('budgetAlerts', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Reminder Tabungan</p>
                  <p className="text-sm text-muted-foreground">Pengingat untuk menabung sesuai target</p>
                </div>
                <Switch
                  checked={notifications.savingsReminders}
                  onCheckedChange={(value) => handleNotificationChange('savingsReminders', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Laporan Mingguan</p>
                  <p className="text-sm text-muted-foreground">Ringkasan keuangan mingguan via email</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(value) => handleNotificationChange('weeklyReports', value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifikasi Email</p>
                  <p className="text-sm text-muted-foreground">Terima notifikasi melalui email</p>
                </div>
                <Switch
                  checked={notifications.emailNotifications}
                  onCheckedChange={(value) => handleNotificationChange('emailNotifications', value)}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preferences */}
        {activeTab === "preferences" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tampilan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="theme">Tema Aplikasi</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Terang</SelectItem>
                      <SelectItem value="dark">Gelap</SelectItem>
                      <SelectItem value="system">Sistem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mata Uang & Bahasa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currency">Mata Uang</Label>
                  <Select defaultValue="IDR">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih mata uang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDR">IDR (Rupiah)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Bahasa</Label>
                  <Select defaultValue="id">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bahasa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Zona Waktu</Label>
                  <Select defaultValue="WIB">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih zona waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WIB">WIB (UTC+7)</SelectItem>
                      <SelectItem value="WITA">WITA (UTC+8)</SelectItem>
                      <SelectItem value="WIT">WIT (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle>Keamanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  toast({
                    title: "Info",
                    description: "Fitur ubah password akan segera tersedia",
                  });
                }}
              >
                <div className="text-left">
                  <p className="font-medium">Ubah Password</p>
                  <p className="text-sm text-muted-foreground">Terakhir diubah 3 bulan lalu</p>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => {
                  toast({
                    title: "Info",
                    description: "Autentikasi 2 faktor sudah aktif",
                  });
                }}
              >
                <div className="text-left">
                  <p className="font-medium">Autentikasi 2 Faktor</p>
                  <p className="text-sm text-green-500">Aktif</p>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={handleDataExport}
              >
                <div className="text-left">
                  <p className="font-medium">Backup Data</p>
                  <p className="text-sm text-muted-foreground">Export semua data Anda</p>
                </div>
                <i className="fas fa-chevron-right text-muted-foreground"></i>
              </Button>

              <div className="pt-6 border-t border-border">
                <h4 className="font-semibold mb-4 text-destructive">Zona Bahaya</h4>
                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Keluar dari Akun
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}