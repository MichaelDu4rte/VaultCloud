/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const Page = () => {
  const [processos, setProcessos] = useState<any[]>([]);
  const [filteredProcessos, setFilteredProcessos] = useState<any[]>([]);
  const [viewType, setViewType] = useState<"table" | "list">("list");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchProcessos = async () => {
      const AUTH_TOKEN = "U1F7m!2x@Xq$Pz9eN#4vA%6tG^cL*bKq";

      try {
        setIsLoading(true);
        const response = await fetch("/api/processos", {
          method: "POST",
          headers: {
            Authorization: AUTH_TOKEN,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar dados.");
        }

        const data = await response.json();
        setProcessos(data.dados || []);
        setFilteredProcessos(data.dados || []);
      } catch (err: any) {
        console.error("Erro ao buscar processos:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcessos();
  }, []);

  // Filtra os processos com base no termo de busca
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    const filtered = processos.filter((processo) => {
      const imp = processo.Processo?.toLowerCase() || "";
      const importador = processo.Importador?.toLowerCase() || "";
      const exportador = processo.Cliente?.toLowerCase() || "";
      const ref = processo.Fatura?.toLowerCase() || "";
      return (
        imp.includes(term) ||
        importador.includes(term) ||
        exportador.includes(term) ||
        ref.includes(term)
      );
    });

    setFilteredProcessos(filtered);
  };

  return (
    <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Processos a fazer
          </h1>
          <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
            Aqui você encontra todos os processos pendentes relacionados à
            criação de Licenças de Importação para o INMETRO. Use a busca para
            localizar rapidamente processos específicos.
          </p>

          <Input
            placeholder="Buscar..."
            className="mb-5 mt-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96"
            value={searchTerm}
            onChange={handleSearch}
          />

          <Select
            value={viewType}
            onValueChange={(value) => setViewType(value as "table" | "list")}
          >
            <SelectTrigger className="max-w-[180px] text-primary">
              <SelectValue
                placeholder={
                  viewType === "table" ? "Ver como lista" : "Ver como tabela"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Ver como tabela</SelectItem>
              <SelectItem value="list">Ver como lista</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Exibição dos processos */}
      <div className="max-h-[550px] overflow-auto rounded-2xl border">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : viewType === "table" ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imp</TableHead>
                <TableHead>Ref. Cliente</TableHead>
                <TableHead>Exportador</TableHead>
                <TableHead>Importador</TableHead>
                <TableHead>Anuencia</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProcessos.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.Processo || "-"}</TableCell>
                  <TableCell>{item.Fatura || "-"}</TableCell>
                  <TableCell>
                    <span
                      className="block max-w-[150px] truncate"
                      title={item.Cliente}
                    >
                      {item.Cliente?.split(" ").slice(0, 8).join(" ") || "-"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="block max-w-[150px] truncate"
                      title={item.Importador}
                    >
                      {item.Importador?.split(" ").slice(0, 8).join(" ") || "-"}
                    </span>
                  </TableCell>
                  <TableCell>{item.ObsAnuencia || "-"}</TableCell>
                  <TableCell>{item.status || "Pendente"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : filteredProcessos.length === 0 ? (
          <div className="py-10 text-center text-xl text-gray-500">
            Nenhum processo encontrado.
          </div>
        ) : (
          filteredProcessos.map((item, index) => (
            <div
              key={index}
              className="mb-5 flex items-center justify-between rounded-lg bg-gray-50 p-4 shadow-sm dark:bg-zinc-800 dark:text-white"
            >
              <div className="flex grow flex-col">
                <h3 className="font-semibold">
                  {item.Processo || "Processo não encontrado"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Ref. Cliente: {item.Fatura || "N/A"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Exportador: {item.Cliente || "N/A"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Importador: {item.Importador || "N/A"}
                </p>
              </div>
              <span className={"rounded-lg px-3 py-1 text-sm text-white"}>
                {item.Status || "Pendente"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;
