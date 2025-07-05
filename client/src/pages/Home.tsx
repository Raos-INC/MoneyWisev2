import { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";

export default function Home() {
  const [location] = useLocation();

  return <Layout initialSection={location} />;
}