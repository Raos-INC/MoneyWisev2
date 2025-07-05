import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AddTransactionModal from "./AddTransactionModal";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { 
  PlusIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  DollarSignIcon,
  TagIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  WalletIcon,
  EditIcon,
  TrashIcon,
  MoreVerticalIcon
} from "lucide-react";

export default function Transactions() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    retry: false,
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest("PUT", `/api/transactions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      setShowEditModal(false);
      setEditingTransaction(null);
      toast({
        title: "Berhasil!",
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

  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Berhasil!",
        description: "Transaksi berhasil dihapus",
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
        description: "Gagal menghapus transaksi",
        variant: "destructive",
      });
    },
  });

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };

  const handleDeleteTransaction = (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      deleteTransactionMutation.mutate(id);
    }
  };

  const handleUpdateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    updateTransactionMutation.mutate({
      id: editingTransaction.id,
      data: editingTransaction
    });
  };

  const formatCurrency = (value: string) => {
    const number = value.replace(/[^\d]/g, '');
    return new Intl.NumberFormat('id-ID').format(parseInt(number) || 0);
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Filter transactions
  const filteredTransactions = transactions?.filter((transaction: any) => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || transaction.categoryId.toString() === filterCategory;
    const matchesType = filterType === "all" || transaction.type === filterType;

    return matchesSearch && matchesCategory && matchesType;
  }) || [];

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Manajemen Transaksi</h2>
          <p className="text-muted-foreground">Kelola semua pemasukan dan pengeluaran Anda</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Tambah Transaksi
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Cari Transaksi</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Cari transaksi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Kategori</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Jenis</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="period">Periode</Label>
              <Select defaultValue="all">
                <SelectTrigger id="period">
                  <SelectValue placeholder="Semua Waktu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Waktu</SelectItem>
                  <SelectItem value="today">Hari Ini</SelectItem>
                  <SelectItem value="week">Minggu Ini</SelectItem>
                  <SelectItem value="month">Bulan Ini</SelectItem>
                  <SelectItem value="year">Tahun Ini</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Transaksi</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredTransactions.map((transaction: any) => {
                const category = categories?.find((c: any) => c.id === transaction.categoryId);

                return (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{backgroundColor: `${category?.color}20`}}
                          >
                            <i className={`${category?.icon} text-lg`} style={{color: category?.color}}></i>
                          </div>
                          <div>
                            <h4 className="font-semibold">{transaction.description}</h4>
                            <p className="text-sm text-muted-foreground flex items-center">
                              <TagIcon className="h-3 w-3 mr-1" />
                              {category?.name || 'Unknown Category'}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex flex-col items-end">
                            <div className={`text-lg font-bold flex items-center ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? <ArrowUpIcon className="h-4 w-4 mr-1" /> : <ArrowDownIcon className="h-4 w-4 mr-1" />}
                              {transaction.type === 'income' ? '+' : '-'} Rp {Math.abs(parseFloat(transaction.amount)).toLocaleString('id-ID')}
                            </div>
                            <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className="text-xs">
                              {transaction.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                            </Badge>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-1 h-8 w-8"
                            >
                              <EditIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                              className="p-1 h-8 w-8 text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <WalletIcon className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Belum ada transaksi</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterCategory !== "all" || filterType !== "all"
                  ? "Tidak ada transaksi yang sesuai dengan filter Anda"
                  : "Mulai dengan menambahkan transaksi pertama Anda"
                }
              </p>
              <Button onClick={() => setShowAddModal(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Tambah Transaksi
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <AddTransactionModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <form onSubmit={handleUpdateTransaction} className="space-y-4">
              <div>
                <Label htmlFor="edit-description">Deskripsi</Label>
                <Input
                  id="edit-description"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    description: e.target.value
                  })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-amount">Jumlah</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">Rp</span>
                  <Input
                    id="edit-amount"
                    placeholder="0"
                    className="pl-10"
                    value={formatCurrency(editingTransaction.amount.toString())}
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      setEditingTransaction({
                        ...editingTransaction,
                        amount: formatted.replace(/[^\d]/g, '')
                      });
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-type">Tipe</Label>
                <Select 
                  value={editingTransaction.type} 
                  onValueChange={(value) => setEditingTransaction({
                    ...editingTransaction,
                    type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-category">Kategori</Label>
                <Select 
                  value={editingTransaction.categoryId?.toString()} 
                  onValueChange={(value) => setEditingTransaction({
                    ...editingTransaction,
                    categoryId: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((cat: any) => cat.type === editingTransaction.type)
                      .map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center">
                            <i className={`${category.icon} mr-2`} style={{color: category.color}}></i>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-date">Tanggal</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingTransaction.date}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    date: e.target.value
                  })}
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingTransaction(null);
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateTransactionMutation.isPending}
                >
                  {updateTransactionMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}