/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrquestrasFinalizadas } from "@/lib/actions/orquestra.actions";

function parseBrazilianDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
}

const Page = () => {
  const [orquestras, setOrquestras] = useState<any[]>([]);
  const [filteredOrquestras, setFilteredOrquestras] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"recebimento" | "chegada">(
    "recebimento"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isLoading, setIsLoading] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const data = await getOrquestrasFinalizadas();
      const sorted = [...data].sort((a, b) => {
        const dateA = parseBrazilianDate(a.recebimento);
        const dateB = parseBrazilianDate(b.recebimento);
        return dateB.getTime() - dateA.getTime();
      });

      setOrquestras(sorted);
      setFilteredOrquestras(sorted);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawTerm = event.target.value;
    const term = rawTerm.toLowerCase().replace(/\s+/g, "");

    setSearchTerm(rawTerm);

    const normalize = (str?: string) =>
      (str || "").toLowerCase().replace(/\s+/g, "");

    const filtered = orquestras.filter((item) => {
      return (
        normalize(item.imp).includes(term) ||
        normalize(item.referencia).includes(term) ||
        normalize(item.importador).includes(term) ||
        normalize(item.exportador).includes(term)
      );
    });

    setFilteredOrquestras(filtered);
  };

  const handleSort = (field: "recebimento" | "chegada") => {
    const direction =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...filteredOrquestras].sort((a, b) => {
      const dateA = parseBrazilianDate(a[field]);
      const dateB = parseBrazilianDate(b[field]);
      return direction === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
    });

    setFilteredOrquestras(sorted);
  };

  const getArrow = (field: string) => {
    if (sortField === field) {
      return sortDirection === "asc" ? " ▲" : " ▼";
    }
    return " ▲▼";
  };

  return (
    <div className="w-[90vw] rounded-sm bg-white p-8 dark:bg-zinc-900">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          Processos Finalizados
        </h1>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              theme === "dark"
                ? "text-white shadow-sm dark:bg-zinc-800 dark:text-white"
                : "bg-zinc-100 text-muted-foreground shadow-lg hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]"
            }`}
            title={`Trocar para o modo ${theme === "dark" ? "claro" : "escuro"}`}
          >
            {theme === "dark" ? "☀️ Tema Claro" : "🌙 Tema Escuro"}
          </button>
        )}
      </div>

      {/* Descrição + Input */}
      <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
        Acompanhe todos os processos que a Apoema finalizou.
      </p>

      <Input
        placeholder="Buscar..."
        disabled={isLoading}
        value={searchTerm}
        onChange={handleSearch}
        className="mb-5 mt-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96"
      />

      {/* Tabela */}
      <div className="max-h-[90vh] overflow-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imp</TableHead>
              <TableHead>Ref. Cliente</TableHead>
              <TableHead>Exportador</TableHead>
              <TableHead>Importador</TableHead>
              <TableHead
                onClick={() => handleSort("recebimento")}
                className="cursor-pointer"
              >
                Recebimento{getArrow("recebimento")}
              </TableHead>
              <TableHead
                onClick={() => handleSort("chegada")}
                className="cursor-pointer"
              >
                Prev. Chegada{getArrow("chegada")}
              </TableHead>
              <TableHead>Destino</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <TableRow key={i}>
                  {Array(7)
                    .fill(0)
                    .map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full rounded" />
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : filteredOrquestras.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  Nenhuma IMP pendente encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrquestras.map((item, index) => (
                <TableRow key={index} className="font-sans">
                  <TableCell>{item.imp || "-"}</TableCell>
                  <TableCell>
                    <span
                      className="block max-w-[100px] truncate"
                      title={item.referencia}
                    >
                      {item.referencia || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="block max-w-[150px] truncate"
                      title={item.exportador}
                    >
                      {item.exportador?.split(" ").slice(0, 8).join(" ") || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="block max-w-[150px] truncate"
                      title={item.importador}
                    >
                      {item.importador?.split(" ").slice(0, 8).join(" ") || "-"}
                    </span>
                  </TableCell>
                  <TableCell>{item.recebimento || "-"}</TableCell>
                  <TableCell>{item.chegada || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      className={`rounded-lg px-3 py-1 text-sm text-white ${
                        ["navegantes", "itajai - sc"].includes(
                          item.destino?.toLowerCase()
                        )
                          ? "bg-[#2ecc71]"
                          : ["sao francisco", "itapoa - sc"].includes(
                                item.destino?.toLowerCase()
                              )
                            ? "bg-[#e91e63]"
                            : item.destino?.toLowerCase() === "santos"
                              ? "bg-[#333333]"
                              : "bg-[#7f8c8d]"
                      }`}
                    >
                      {item.destino || "-"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
