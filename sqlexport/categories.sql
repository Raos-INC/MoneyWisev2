-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 06, 2025 at 03:40 PM
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
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `icon` varchar(50) DEFAULT 'Wallet',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `user_id`, `name`, `type`, `color`, `icon`, `created_at`, `updated_at`) VALUES
(27, '1', 'Gaji', 'income', '#10B981', 'fas fa-briefcase', '2025-07-04 15:23:07', '2025-07-04 15:23:07'),
(28, '1', 'Bonus', 'income', '#059669', 'fas fa-gift', '2025-07-04 15:23:07', '2025-07-04 15:23:07'),
(29, '1', 'Investasi', 'income', '#047857', 'fas fa-chart-line', '2025-07-04 15:23:07', '2025-07-04 15:23:07'),
(30, '1', 'Freelance', 'income', '#065F46', 'fas fa-laptop', '2025-07-04 15:23:07', '2025-07-04 15:23:07'),
(31, '1', 'Lainnya', 'income', '#064E3B', 'fas fa-plus', '2025-07-04 15:23:08', '2025-07-04 15:23:08'),
(32, '1', 'Makanan', 'expense', '#EF4444', 'fas fa-utensils', '2025-07-04 15:23:08', '2025-07-04 15:23:08'),
(33, '1', 'Transportasi', 'expense', '#3B82F6', 'fas fa-car', '2025-07-04 15:23:08', '2025-07-04 15:23:08'),
(34, '1', 'Hiburan', 'expense', '#F59E0B', 'fas fa-gamepad', '2025-07-04 15:23:08', '2025-07-04 15:23:08'),
(35, '1', 'Kesehatan', 'expense', '#10B981', 'fas fa-heart', '2025-07-04 15:23:08', '2025-07-04 15:23:08'),
(36, '1', 'Belanja', 'expense', '#8B5CF6', 'fas fa-shopping-bag', '2025-07-04 15:23:08', '2025-07-04 15:23:08'),
(37, '1', 'Tagihan', 'expense', '#DC2626', 'fas fa-file-invoice', '2025-07-04 15:23:08', '2025-07-04 15:23:08'),
(38, '1', 'Pendidikan', 'expense', '#7C3AED', 'fas fa-graduation-cap', '2025-07-04 15:23:08', '2025-07-04 15:23:08'),
(39, '1', 'Lainnya', 'expense', '#6B7280', 'fas fa-ellipsis-h', '2025-07-04 15:23:08', '2025-07-04 15:23:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
