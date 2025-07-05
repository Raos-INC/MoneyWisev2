import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Jumlah wajib diisi"),
  categoryId: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().min(1, "Deskripsi wajib diisi"),
  date: z.string().min(1, "Tanggal wajib diisi"),
});

type TransactionForm = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: any;
}

export default function AddTransactionModal({ 
  open, 
  onOpenChange, 
  transaction 
}: AddTransactionModalProps) {
  const [selectedType, setSelectedType] = useState<"income" | "expense">("expense");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      categoryId: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  // Fetch categories
  const { data: allCategories } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Filter categories by type
  const categories = allCategories?.filter((cat: any) => cat.type === selectedType) || [];

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      const payload = {
        type: data.type,
        amount: data.amount.replace(/[^\d]/g, ''),
        categoryId: parseInt(data.categoryId),
        description: data.description,
        date: data.date,
      };
      return apiRequest("POST", "/api/transactions", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/summary'] });
      onOpenChange(false);
      form.reset();
      setSelectedType("expense");
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil ditambahkan",
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
        description: "Gagal menambahkan transaksi",
        variant: "destructive",
      });
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async (data: TransactionForm) => {
      const payload = {
        type: data.type,
        amount: data.amount.replace(/[^\d]/g, ''),
        categoryId: parseInt(data.categoryId),
        description: data.description,
        date: data.date,
      };
      return apiRequest("PUT", `/api/transactions/${transaction?.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/summary'] });
      onOpenChange(false);
      form.reset();
      setSelectedType("expense");
      toast({
        title: "Berhasil",
        description: "Transaksi berhasil diperbarui",
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
        description: "Gagal memperbarui transaksi",
        variant: "destructive",
      });
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      if (transaction) {
        // Edit mode
        setSelectedType(transaction.type);
        form.reset({
          type: transaction.type,
          amount: parseFloat(transaction.amount).toLocaleString('id-ID'),
          categoryId: transaction.categoryId.toString(),
          description: transaction.description,
          date: transaction.date,
        });
      } else {
        // Add mode
        form.reset({
          type: "expense",
          amount: "",
          categoryId: "",
          description: "",
          date: new Date().toISOString().split('T')[0],
        });
        setSelectedType("expense");
      }
    }
  }, [open, transaction, form]);

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return new Intl.NumberFormat('id-ID').format(parseInt(number) || 0);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrency(e.target.value);
    form.setValue("amount", formatted);
  };

  const handleTypeChange = (type: "income" | "expense") => {
    setSelectedType(type);
    form.setValue("type", type);
    form.setValue("categoryId", ""); // Reset category when type changes
  };

  const onSubmit = (data: TransactionForm) => {
    if (transaction) {
      updateTransactionMutation.mutate(data);
    } else {
      createTransactionMutation.mutate(data);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    form.reset();
    setSelectedType("expense");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Transaction Type */}
          <div>
            <Label>Jenis Transaksi</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button
                type="button"
                variant={selectedType === "income" ? "default" : "outline"}
                className={selectedType === "income" ? "btn-income" : ""}
                onClick={() => handleTypeChange("income")}
              >
                <i className="fas fa-arrow-up mr-2"></i>
                Pemasukan
              </Button>
              <Button
                type="button"
                variant={selectedType === "expense" ? "default" : "outline"}
                className={selectedType === "expense" ? "btn-expense" : ""}
                onClick={() => handleTypeChange("expense")}
              >
                <i className="fas fa-arrow-down mr-2"></i>
                Pengeluaran
              </Button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Jumlah</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
              <Input
                id="amount"
                placeholder="0"
                className="pl-10"
                {...form.register("amount")}
                onChange={handleAmountChange}
              />
            </div>
            {form.formState.errors.amount && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.amount.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Kategori</Label>
            <Select
              value={form.watch("categoryId")}
              onValueChange={(value) => form.setValue("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center">
                      <i className={`${category.icon} mr-2`} style={{ color: category.color }}></i>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.categoryId && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.categoryId.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Deskripsi</Label>
            <Input
              id="description"
              placeholder="Deskripsi transaksi..."
              {...form.register("description")}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date")}
            />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.date.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createTransactionMutation.isPending || updateTransactionMutation.isPending}
            >
              {createTransactionMutation.isPending || updateTransactionMutation.isPending 
                ? "Menyimpan..." 
                : transaction 
                  ? "Perbarui" 
                  : "Simpan"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}