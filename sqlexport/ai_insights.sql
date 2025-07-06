-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 06, 2025 at 03:39 PM
-- Server version: 10.11.10-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u415928144_MoneyWise`
--

-- --------------------------------------------------------

--
-- Table structure for table `ai_insights`
--

CREATE TABLE `ai_insights` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL,
  `priority` enum('high','medium','low') DEFAULT 'medium',
  `actionable` tinyint(1) DEFAULT 0,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_insights`
--

INSERT INTO `ai_insights` (`id`, `user_id`, `title`, `message`, `type`, `priority`, `actionable`, `is_read`, `created_at`) VALUES
(1, '1', 'Komitmen Utama: Cicilan Rumah', 'Cicilan rumah sebesar Rp 93.753.534 mendominasi pengeluaran Anda. Ini menunjukkan komitmen finansial besar yang perlu diatur dengan cermat agar tidak mengganggu arus kas untuk kebutuhan lainnya.', 'spending_pattern', 'medium', 1, 0, '2025-07-04 15:42:21'),
(2, '1', 'Optimalisasi Pengeluaran \'Makan & Mainan\'', 'Pengeluaran \'Beli Makan dan Mainan\' sebesar Rp 5.361.361 cukup signifikan. Coba pecah detailnya (makan vs. mainan) dan tetapkan anggaran spesifik. Mungkin ada ruang untuk menghemat di kategori diskresioner ini.', 'saving_tip', 'medium', 1, 0, '2025-07-04 15:42:21'),
(3, '1', 'Diversifikasi Sumber Penghasilan Pasif', 'Anda memiliki pemasukan besar dari dividen BBCA dan penjualan BREN. Ini menunjukkan potensi investasi yang baik. Pertimbangkan diversifikasi portofolio ke instrumen lain seperti obligasi atau properti sewa untuk pertumbuhan jangka panjang.', 'investment_suggestion', 'high', 1, 0, '2025-07-04 15:42:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ai_insights`
--
ALTER TABLE `ai_insights`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ai_insights`
--
ALTER TABLE `ai_insights`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_insights`
--
ALTER TABLE `ai_insights`
  ADD CONSTRAINT `ai_insights_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
