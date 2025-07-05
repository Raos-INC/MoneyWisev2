import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import logo from "../assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  PiggyBankIcon,
  TrendingUpIcon,
  ShieldIcon,
  BrainIcon,
  ChartBarIcon,
  CreditCardIcon,
  BellIcon,
  FileTextIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  StarIcon,
} from "lucide-react";

export default function Landing() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // If user is already authenticated, redirect to home
  if (user) {
    window.location.href = "/";
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#8BD3E6]"></div>
      </div>
    );
  }

  const features = [
    {
      icon: <PiggyBankIcon className="h-8 w-8 text-[#8BD3E6]" />,
      title: "Target Nabung Cerdas",
      description:
        "Tentukan target keuangan dengan simulasi otomatis dan reminder harian",
    },
    {
      icon: <TrendingUpIcon className="h-8 w-8 text-[#8BD3E6]" />,
      title: "Analisis Transaksi",
      description:
        "Pantau pemasukan dan pengeluaran dengan grafik dan statistik real-time",
    },
    {
      icon: <BrainIcon className="h-8 w-8 text-[#8BD3E6]" />,
      title: "AI Financial Advisor",
      description:
        "Dapatkan insight dan rekomendasi keuangan berdasarkan pola spending Anda",
    },
    {
      icon: <ChartBarIcon className="h-8 w-8 text-[#8BD3E6]" />,
      title: "Laporan Otomatis",
      description:
        "Download laporan bulanan dalam format PDF/Excel secara otomatis",
    },
    {
      icon: <ShieldIcon className="h-8 w-8 text-[#8BD3E6]" />,
      title: "Keamanan Terjamin",
      description: "Data keuangan Anda dilindungi dengan enkripsi tingkat bank",
    },
    {
      icon: <BellIcon className="h-8 w-8 text-[#8BD3E6]" />,
      title: "Smart Notifications",
      description: "Reminder pintar untuk menabung dan alert budget overflow",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      console.log('Login API URL:', apiUrl); // Debug log
      const fullUrl = `${apiUrl}/api/auth/login`;
      console.log('Login Full URL:', fullUrl); // Debug log
      
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
      });

      if (response.ok) {
        const data = await response.json();
        // Save token to localStorage
        localStorage.setItem("token", data.token);

        // Show success notification
        toast({
          title: "Login Berhasil! 🎉",
          description: `Selamat datang kembali, ${data.user?.name || "User"}!`,
        });

        // Small delay before redirect for user to see the notification
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        const errorData = await response.json();
        toast({
          title: "Login Gagal",
          description: errorData.message || "Email atau password salah",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Terjadi kesalahan saat login";
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Tidak dapat menghubungi server. Pastikan backend Railway sudah berjalan.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      if (registerForm.password !== registerForm.confirmPassword) {
        toast({
          title: "Error",
          description: "Password tidak cocok",
          variant: "destructive",
        });
        setIsLoggingIn(false);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || '';
      console.log('API URL:', apiUrl); // Debug log
      const fullUrl = `${apiUrl}/api/auth/register`;
      console.log('Full URL:', fullUrl); // Debug log
      
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Show success notification but don't auto-login
        toast({
          title: "Daftar Berhasil! 🎉",
          description:
            "Akun Anda telah dibuat. Silakan login untuk melanjutkan.",
        });

        // Clear registration form and switch to login tab
        setRegisterForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setActiveTab("login");

        // Pre-fill login form with registered email
        setLoginForm((prev) => ({ ...prev, email: registerForm.email }));
      } else {
        const errorData = await response.json();
        toast({
          title: "Registrasi Gagal",
          description: errorData.message || "Gagal membuat akun",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = "Terjadi kesalahan saat registrasi";
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          errorMessage = "Tidak dapat menghubungi server. Pastikan backend Railway sudah berjalan.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#feecc8] to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="Logo"
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement?.appendChild(
                    Object.assign(document.createElement("div"), {
                      innerHTML:
                        '<svg class="h-16 w-16 text-[#8BD3E6]" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"></path></svg>',
                    }),
                  );
                }}
              />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-black">MoneyWise</span>
                <span className="text-xs text-gray-600">
                  Smart Financial Management
                </span>
              </div>
            </div>
            <Button
              onClick={() =>
                document
                  .getElementById("auth-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-[#8BD3E6] hover:bg-[#7BC5D8] text-white border-0 shadow-lg"
            >
              Masuk / Daftar
            </Button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-[#feecc8] rounded-full text-black text-sm font-medium mb-6 shadow-sm">
                  <StarIcon className="h-4 w-4 mr-2 text-[#8BD3E6]" />
                  Platform Manajemen Keuangan #1 di Indonesia
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-black mb-6">
                  Kelola Keuangan
                  <span className="text-[#8BD3E6]"> Lebih Cerdas</span>
                </h1>
                <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                  Wujudkan impian finansial Anda dengan AI-powered financial
                  advisor, target nabung otomatis, dan analisis transaksi
                  real-time.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button
                    onClick={() =>
                      document
                        .getElementById("auth-form")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    size="lg"
                    className="bg-[#8BD3E6] hover:bg-[#7BC5D8] text-white px-8 py-3 text-lg shadow-lg border-0"
                  >
                    Mulai Gratis Sekarang
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-3 text-lg border-[#8BD3E6] text-[#8BD3E6] hover:bg-[#8BD3E6] hover:text-white"
                  >
                    Lihat Demo
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-black">5+</div>
                    <div className="text-sm text-gray-600">Pengguna Aktif</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-black">Rp 50k+</div>
                    <div className="text-sm text-gray-600">Uang Dikelola</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-black">98%</div>
                    <div className="text-sm text-gray-600">Kepuasan User</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div
                  id="auth-form"
                  className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 relative"
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8BD3E6] rounded-full mb-4">
                      <ShieldIcon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-2">
                      Mulai Perjalanan Finansial Anda
                    </h3>
                    <p className="text-gray-600">
                      Masuk atau daftar untuk mengakses semua fitur
                    </p>
                  </div>

                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="grid w-full grid-cols-2 bg-[#feecc8]">
                      <TabsTrigger
                        value="login"
                        className="data-[state=active]:bg-[#8BD3E6] data-[state=active]:text-white"
                      >
                        Masuk
                      </TabsTrigger>
                      <TabsTrigger
                        value="register"
                        className="data-[state=active]:bg-[#8BD3E6] data-[state=active]:text-white"
                      >
                        Daftar
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="login" className="space-y-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <Label htmlFor="email" className="text-black">
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Masukkan email Anda"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                email: e.target.value,
                              })
                            }
                            required
                            className="border-gray-200 focus:border-[#8BD3E6] focus:ring-[#8BD3E6]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password" className="text-black">
                            Password
                          </Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Masukkan password Anda"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({
                                ...loginForm,
                                password: e.target.value,
                              })
                            }
                            required
                            className="border-gray-200 focus:border-[#8BD3E6] focus:ring-[#8BD3E6]"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-[#8BD3E6] hover:bg-[#7BC5D8] text-white py-3 border-0"
                          disabled={isLoggingIn}
                        >
                          {isLoggingIn ? "Memproses..." : "Masuk"}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-black">
                            Nama Lengkap
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Masukkan nama lengkap Anda"
                            value={registerForm.name}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                name: e.target.value,
                              })
                            }
                            required
                            className="border-gray-200 focus:border-[#8BD3E6] focus:ring-[#8BD3E6]"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="register-email"
                            className="text-black"
                          >
                            Email
                          </Label>
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="Masukkan email Anda"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                email: e.target.value,
                              })
                            }
                            required
                            className="border-gray-200 focus:border-[#8BD3E6] focus:ring-[#8BD3E6]"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="register-password"
                            className="text-black"
                          >
                            Password
                          </Label>
                          <Input
                            id="register-password"
                            type="password"
                            placeholder="Masukkan password (min. 6 karakter)"
                            value={registerForm.password}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                password: e.target.value,
                              })
                            }
                            required
                            minLength={6}
                            className="border-gray-200 focus:border-[#8BD3E6] focus:ring-[#8BD3E6]"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="confirm-password"
                            className="text-black"
                          >
                            Konfirmasi Password
                          </Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="Ulangi password Anda"
                            value={registerForm.confirmPassword}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                            className="border-gray-200 focus:border-[#8BD3E6] focus:ring-[#8BD3E6]"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-[#8BD3E6] hover:bg-[#7BC5D8] text-white py-3 border-0"
                          disabled={isLoggingIn}
                        >
                          {isLoggingIn ? "Memproses..." : "Daftar"}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="mt-6 text-center text-sm text-gray-500">
                    Gratis • Tanpa Biaya Tersembunyi • Keamanan Terjamin
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-[#8BD3E6]/20 rounded-full animate-pulse"></div>
                  <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#feecc8]/50 rounded-full animate-pulse delay-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#8BD3E6]/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#feecc8]/30 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">
              Fitur Unggulan MoneyWise
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Solusi lengkap untuk mengelola keuangan pribadi dengan teknologi
              AI terdepan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow duration-300 border-gray-100 bg-white hover:border-[#8BD3E6]/30"
              >
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold text-black ml-3">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-[#feecc8]/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">
              Cara Kerja MoneyWise
            </h2>
            <p className="text-xl text-gray-600">
              Langkah mudah menuju kebebasan finansial
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Daftar & Login",
                description: "Buat akun dan masuk ke dashboard personal Anda",
              },
              {
                step: "2",
                title: "Set Target Nabung",
                description:
                  "Tentukan tujuan finansial dengan deadline yang realistis",
              },
              {
                step: "3",
                title: "Track Transaksi",
                description: "Catat pemasukan dan pengeluaran secara otomatis",
              },
              {
                step: "4",
                title: "Analisis & Laporan",
                description: "Dapatkan insight dan download laporan bulanan",
              },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-[#8BD3E6] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#8BD3E6] rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Siap Mengubah Hidup Finansial Anda?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Bergabung dengan pengguna yang telah merasakan manfaat MoneyWise
            </p>
            <Button
              onClick={() =>
                document
                  .getElementById("auth-form")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              size="lg"
              className="bg-white text-[#8BD3E6] hover:bg-gray-100 px-8 py-3 text-lg font-semibold border-0"
            >
              Mulai Sekarang - Gratis!
            </Button>
            <p className="text-sm mt-4 opacity-75">
              Tidak perlu kartu kredit • Setup dalam 2 menit • Dukungan 24/7
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentElement?.appendChild(
                  Object.assign(document.createElement("div"), {
                    innerHTML:
                      '<svg class="h-12 w-12 text-[#8BD3E6]" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"></path></svg>',
                  }),
                );
              }}
            />
            <div className="flex flex-col items-start">
              <span className="text-xl font-bold">MoneyWise</span>
              <span className="text-xs text-gray-400">
                Smart Financial Management
              </span>
            </div>
          </div>
          <p className="text-gray-400 mb-6">
            Platform manajemen keuangan pribadi terdepan di Indonesia
          </p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500 text-sm">
              © 2024 MoneyWise. Semua hak dilindungi. Dibuat dengan ❤️ di
              Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
