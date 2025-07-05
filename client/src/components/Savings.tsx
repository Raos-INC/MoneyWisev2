import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SavingsGoal } from "@shared/schema";
import { 
  TargetIcon, 
  PiggyBankIcon, 
  CalendarIcon, 
  TrendingUpIcon,
  CheckCircleIcon,
  PlusIcon,
  AlertTriangleIcon,
  InfoIcon,
  ChartBarIcon,
  ClockIcon,
  DollarSignIcon
} from "lucide-react";

const savingsGoalSchema = z.object({
  name: z.string().min(1, "Nama target wajib diisi"),
  description: z.string().optional(),
  targetAmount: z.string().min(1, "Target jumlah wajib diisi"),
  targetDate: z.string().min(1, "Target tanggal wajib diisi"),
  icon: z.string().default("fas fa-piggy-bank"),
  color: z.string().default("#8BD3E6"),
});

type SavingsGoalForm = z.infer<typeof savingsGoalSchema>;

export default function Savings() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [addSavingsGoalId, setAddSavingsGoalId] = useState<number | null>(null);
  const [savingsAmount, setSavingsAmount] = useState("");
  const [showSimulation, setShowSimulation] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SavingsGoalForm>({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues: {
      name: "",
      description: "",
      targetAmount: "",
      targetDate: "",
      icon: "fas fa-piggy-bank",
      color: "#8BD3E6",
    },
  });

  // Fetch savings goals
  const { data: savingsGoals = [], isLoading } = useQuery<SavingsGoal[]>({
    queryKey: ['/api/savings-goals'],
    retry: false,
  });

  // Create savings goal mutation
  const createGoalMutation = useMutation({
    mutationFn: async (data: SavingsGoalForm) => {
      const payload = {
        ...data,
        targetAmount: parseFloat(data.targetAmount.replace(/[^\d]/g, '')),
        currentAmount: 0,
      };
      return apiRequest("POST", "/api/savings-goals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings-goals'] });
      setShowAddModal(false);
      form.reset();
      toast({
        title: "Berhasil!",
        description: "Target tabungan berhasil dibuat",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Gagal membuat target tabungan",
        variant: "destructive",
      });
    },
  });

  // Update savings goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<SavingsGoalForm> }) => {
      const payload = {
        ...data,
        ...(data.targetAmount && { targetAmount: parseFloat(data.targetAmount.replace(/[^\d]/g, '')) }),
      };
      return apiRequest("PUT", `/api/savings-goals/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/savings-goals'] });
      setEditingGoal(null);
      setAddSavingsGoalId(null);
      setSavingsAmount("");
      toast({
        title: "Berhasil!",
        description: "Target tabungan berhasil diperbarui",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Gagal memperbarui target tabungan",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: SavingsGoalForm) => {
    createGoalMutation.mutate(data);
  };

  const handleAddSavings = (goalId: number) => {
    if (!savingsAmount) return;

    const goal = savingsGoals?.find((g: any) => g.id === goalId);
    if (!goal) return;

    const currentAmount = parseFloat(goal.currentAmount);
    const additionalAmount = parseFloat(savingsAmount.replace(/[^\d]/g, ''));
    const newAmount = currentAmount + additionalAmount;

    updateGoalMutation.mutate({
      id: goalId,
      data: { currentAmount: newAmount.toString() }
    });
  };

  const calculateSimulation = (targetAmount: string, targetDate: string) => {
    if (!targetAmount || !targetDate) return null;

    const amount = parseFloat(targetAmount.replace(/[^\d]/g, ''));
    const target = new Date(targetDate);
    const now = new Date();

    const totalDays = Math.max(1, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const totalWeeks = Math.ceil(totalDays / 7);
    const totalMonths = Math.max(1, (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()));

    const dailyAmount = amount / totalDays;
    const weeklyAmount = amount / totalWeeks;
    const monthlyAmount = amount / totalMonths;

    return {
      totalDays,
      totalWeeks,
      totalMonths,
      dailyAmount,
      weeklyAmount,
      monthlyAmount,
      targetAmount: amount,
      targetDate: target,
    };
  };

  const handleSimulateTarget = () => {
    const targetAmount = form.watch("targetAmount");
    const targetDate = form.watch("targetDate");

    const simulation = calculateSimulation(targetAmount, targetDate);
    if (simulation) {
      setSimulationData(simulation);
      setShowSimulation(true);
    }
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return new Intl.NumberFormat('id-ID').format(parseInt(number) || 0);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    form.setValue("targetAmount", formatted);
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="skeleton h-4 w-20 mb-2"></div>
                <div className="skeleton h-8 w-32 mb-4"></div>
                <div className="skeleton h-2 w-full mb-2"></div>
                <div className="skeleton h-4 w-24"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalTargetAmount = savingsGoals?.reduce((sum: number, goal: any) => 
    sum + parseFloat(goal.targetAmount), 0) || 0;
  const totalCurrentAmount = savingsGoals?.reduce((sum: number, goal: any) => 
    sum + parseFloat(goal.currentAmount), 0) || 0;
  const totalRemainingAmount = totalTargetAmount - totalCurrentAmount;
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

  return (
    <div className="space-y-8 fade-in">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold flex items-center">
            <TargetIcon className="h-8 w-8 mr-3 text-primary" />
            Target Menabung
          </h2>
          <p className="text-muted-foreground text-lg">
            Wujudkan impian finansial Anda dengan perencanaan yang tepat
          </p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <PlusIcon className="h-4 w-4 mr-2" />
              Tambah Target Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <TargetIcon className="h-5 w-5 mr-2" />
                {editingGoal ? 'Edit Target Tabungan' : 'Buat Target Tabungan Baru'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Judul Target</Label>
                <Input
                  id="name"
                  placeholder="e.g. Laptop Gaming Impian"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                <Textarea
                  id="description"
                  placeholder="Ceritakan mengapa target ini penting untuk Anda..."
                  {...form.register("description")}
                />
              </div>

              <div>
                <Label htmlFor="targetAmount">Target Jumlah</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input
                    id="targetAmount"
                    placeholder="0"
                    className="pl-10"
                    {...form.register("targetAmount", {
                      onChange: (e) => {
                        const formatted = formatCurrency(e.target.value);
                        form.setValue("targetAmount", formatted);
                      }
                    })}
                  />
                </div>
                {form.formState.errors.targetAmount && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.targetAmount.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="targetDate">Target Tanggal</Label>
                <Input
                  id="targetDate"
                  type="date"
                  {...form.register("targetDate")}
                />
                {form.formState.errors.targetDate && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.targetDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="icon">Icon & Warna</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select onValueChange={(value) => form.setValue("icon", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fas fa-piggy-bank">🐷 Piggy Bank</SelectItem>
                      <SelectItem value="fas fa-laptop">💻 Laptop</SelectItem>
                      <SelectItem value="fas fa-car">🚗 Mobil</SelectItem>
                      <SelectItem value="fas fa-home">🏠 Rumah</SelectItem>
                      <SelectItem value="fas fa-plane">✈️ Liburan</SelectItem>
                      <SelectItem value="fas fa-graduation-cap">🎓 Pendidikan</SelectItem>
                      <SelectItem value="fas fa-ring">💍 Pernikahan</SelectItem>
                      <SelectItem value="fas fa-baby">👶 Anak</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select onValueChange={(value) => form.setValue("color", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Warna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#3B82F6">🔵 Biru</SelectItem>
                      <SelectItem value="#10B981">🟢 Hijau</SelectItem>
                      <SelectItem value="#F59E0B">🟡 Kuning</SelectItem>
                      <SelectItem value="#EF4444">🔴 Merah</SelectItem>
                      <SelectItem value="#8B5CF6">🟣 Ungu</SelectItem>
                      <SelectItem value="#F97316">🟠 Orange</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleSimulateTarget}
                  disabled={!form.watch("targetAmount") || !form.watch("targetDate")}
                >
                  <ChartBarIcon className="h-4 w-4 mr-2" />
                  Simulasi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingGoal(null);
                    form.reset();
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                >
                  {createGoalMutation.isPending || updateGoalMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Savings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Target</p>
                <p className="text-2xl font-bold currency text-blue-600">Rp {totalTargetAmount.toLocaleString('id-ID')}</p>
                <p className="text-sm text-muted-foreground">{savingsGoals?.length || 0} target aktif</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <TargetIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sudah Terkumpul</p>
                <p className="text-2xl font-bold text-green-600 currency">Rp {totalCurrentAmount.toLocaleString('id-ID')}</p>
                <p className="text-sm text-muted-foreground">{Math.round(overallProgress)}% tercapai</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <PiggyBankIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sisa Target</p>
                <p className="text-2xl font-bold text-orange-600 currency">Rp {totalRemainingAmount.toLocaleString('id-ID')}</p>
                <p className="text-sm text-muted-foreground">{Math.round(100 - overallProgress)}% tersisa</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                <TrendingUpIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress Keseluruhan</p>
                <p className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</p>
                <div className="w-full bg-purple-200 dark:bg-purple-900/30 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, overallProgress)}%` }}
                  ></div>
                </div>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Goals Details */}
      {savingsGoals && savingsGoals.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savingsGoals.map((goal: any) => {
            const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
            const targetDate = new Date(goal.targetDate);
            const now = new Date();
            const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            const monthsRemaining = Math.max(0, 
              (targetDate.getFullYear() - now.getFullYear()) * 12 + 
              (targetDate.getMonth() - now.getMonth())
            );
            const remainingAmount = parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount);
            const requiredMonthlySavings = monthsRemaining > 0 ? remainingAmount / monthsRemaining : 0;
            const requiredDailySavings = daysRemaining > 0 ? remainingAmount / daysRemaining : 0;

            const isOverdue = daysRemaining === 0 && progress < 100;
            const isNearDeadline = daysRemaining <= 30 && daysRemaining > 0;
            const isCompleted = progress >= 100;

            return (
              <Card key={goal.id} className={`hover:shadow-lg transition-shadow ${
                isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/10' :
                isOverdue ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                isNearDeadline ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{backgroundColor: `${goal.color}20`}}>
                        <i className={`${goal.icon} text-2xl`} style={{color: goal.color}}></i>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-semibold flex items-center">
                          {goal.title}
                          {isCompleted && <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />}
                        </h3>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Target: {targetDate.toLocaleDateString('id-ID')}
                          {isOverdue && <AlertTriangleIcon className="h-4 w-4 text-red-500 ml-2" />}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {isNearDeadline && !isCompleted && (
                        <Badge variant="destructive" className="text-xs">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          Mendesak
                        </Badge>
                      )}
                      {isCompleted && (
                        <Badge variant="default" className="bg-green-600 text-xs">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Selesai
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <i className="fas fa-ellipsis-h"></i>
                      </Button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted rounded-lg">
                      {goal.description}
                    </p>
                  )}

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={Math.min(100, progress)} className="h-4" />
                    <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                      <span className="currency">Rp {parseFloat(goal.currentAmount).toLocaleString('id-ID')}</span>
                      <span className="currency">Rp {parseFloat(goal.targetAmount).toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                      <DollarSignIcon className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                      <p className="text-xs text-muted-foreground">Per Bulan</p>
                      <p className="font-semibold currency text-blue-600">Rp {Math.ceil(requiredMonthlySavings).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <CalendarIcon className="h-5 w-5 mx-auto mb-2 text-green-600" />
                      <p className="text-xs text-muted-foreground">Per Hari</p>
                      <p className="font-semibold currency text-green-600">Rp {Math.ceil(requiredDailySavings).toLocaleString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="text-center p-3 bg-muted rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground">Sisa Waktu</p>
                    <p className="font-semibold">
                      {daysRemaining > 0 ? `${daysRemaining} hari (${monthsRemaining} bulan)` : 
                       isCompleted ? 'Target Tercapai!' : 'Overdue'}
                    </p>
                  </div>

                  {progress < 100 && (
                    <div className="mb-4">
                      {addSavingsGoalId === goal.id ? (
                        <div className="space-y-3">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                            <Input
                              placeholder="Jumlah tabungan"
                              value={savingsAmount}
                              onChange={(e) => setSavingsAmount(formatCurrency(e.target.value))}
                              className="pl-10"
                            />
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddSavings(goal.id)}
                              disabled={!savingsAmount || updateGoalMutation.isPending}
                              className="flex-1"
                            >
                              <PiggyBankIcon className="h-4 w-4 mr-2" />
                              Simpan
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAddSavingsGoalId(null);
                                setSavingsAmount("");
                              }}
                              className="flex-1"
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => setAddSavingsGoalId(goal.id)}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Tambah Tabungan
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingGoal(goal);
                              form.reset({
                                name: goal.name || goal.title, // Support both name and title
                                description: goal.description || "",
                                targetAmount: parseFloat(goal.targetAmount).toLocaleString('id-ID'),
                                targetDate: goal.targetDate,
                                icon: goal.icon || "fas fa-piggy-bank",
                                color: goal.color || "#8BD3E6",
                              });
                              setShowAddModal(true);
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {progress >= 100 && (
                    <div className="flex items-center justify-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-700 dark:text-green-300 font-medium">
                        🎉 Selamat! Target Tercapai!
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <PiggyBankIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold mb-4">Mulai Perjalanan Menabung Anda</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Buat target tabungan pertama Anda dan mulai merencanakan masa depan finansial yang lebih cerah.
            </p>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Buat Target Pertama
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Simulation Modal */}
      <Dialog open={showSimulation} onOpenChange={setShowSimulation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Simulasi Target Tabungan
            </DialogTitle>
          </DialogHeader>
          {simulationData && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                <h4 className="font-semibold text-lg mb-2">Target: Rp {simulationData.targetAmount.toLocaleString('id-ID')}</h4>
                <p className="text-sm text-muted-foreground">
                  Dalam {simulationData.totalDays} hari ({simulationData.totalMonths} bulan)
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tabungan Harian</p>
                      <p className="text-xl font-bold currency text-green-600">
                        Rp {Math.ceil(simulationData.dailyAmount).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tabungan Mingguan</p>
                      <p className="text-xl font-bold currency text-blue-600">
                        Rp {Math.ceil(simulationData.weeklyAmount).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tabungan Bulanan</p>
                      <p className="text-xl font-bold currency text-purple-600">
                        Rp {Math.ceil(simulationData.monthlyAmount).toLocaleString('id-ID')}
                      </p>
                    </div>
                    <CalendarIcon className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start">
                  <InfoIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5"                  />
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Tips Mencapai Target:</p>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                      <li>• Sisihkan uang setiap hari secara konsisten</li>
                      <li>• Gunakan fitur reminder untuk mengingatkan jadwal menabung</li>
                      <li>• Pantau progress secara berkala</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => setShowSimulation(false)}
                className="w-full"
              >
                Tutup
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}