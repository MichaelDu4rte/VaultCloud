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
import { Badge } from "@/components/ui/badge";
import {
  createOrquestra,
  getOrquestras,
  updateOrquestraStatus,
} from "@/lib/actions/orquestra.actions";

const Page = () => {
  const [processos, setProcessos] = useState<any[]>([]);
  const [orquestra, setOrquestra] = useState<any[]>([]);
  const [filteredProcessos, setFilteredProcessos] = useState<any[]>([]);
  const [filteredOrquestra, setFilteredOrquestra] = useState<any[]>([]);
  const [viewType, setViewType] = useState<"table" | "list">("table");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"lis" | "orquestra">("lis");
  const [sortField, setSortField] = useState("status");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  type Processo = {
    Processo?: string;
    Fatura?: string;
    Cliente?: string;
    Importador?: string;
    DataCadastro?: string;
    DataPrevisaoETA?: string;
    Destino?: string;
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);

    // Filtrar processos
    const filteredProcessos = processos.filter((processo) => {
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

    setFilteredProcessos(filteredProcessos);

    // Filtrar orquestras
    const filteredOrquestras = orquestra.filter((orquestra) => {
      const imp = orquestra.imp?.toLowerCase() || "";
      const importador = orquestra.importador?.toLowerCase() || "";
      const exportador = orquestra.exportador?.toLowerCase() || "";
      const ref = orquestra.referencia?.toLowerCase() || "";
      return (
        imp.includes(term) ||
        importador.includes(term) ||
        exportador.includes(term) ||
        ref.includes(term)
      );
    });

    setFilteredOrquestra(filteredOrquestras);
  };

  const handleStatusChange = async (imp: string, novoStatus: string) => {
    try {
      // Atualizar o status no banco de dados
      await updateOrquestraStatus(imp, novoStatus);

      // Atualizar o estado localmente
      setOrquestra((prevOrquestras) =>
        prevOrquestras.map((orquestra) =>
          orquestra.imp === imp
            ? { ...orquestra, status: novoStatus } // Atualiza o status
            : orquestra
        )
      );

      // Se necessário, também atualize o `filteredOrquestra`
      setFilteredOrquestra((prevFiltered) =>
        prevFiltered.map((orquestra) =>
          orquestra.imp === imp
            ? { ...orquestra, status: novoStatus }
            : orquestra
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const statusOrder = [
    "Em andamento",
    "Pendente",
    "Aguardando informação",
    "Finalizado",
  ];

  const sortedOrquestra = [...filteredOrquestra].sort((a, b) => {
    if (sortField === "status") {
      const indexA = statusOrder.indexOf(a.status || "Pendente");
      const indexB = statusOrder.indexOf(b.status || "Pendente");
      return sortDirection === "asc" ? indexA - indexB : indexB - indexA;
    }

    return 0; // default, pode adicionar outros campos depois se quiser
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Função para lidar com api processos
  useEffect(() => {
    const fetchProcessos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/processos", {
          method: "POST",
          headers: {
            Authorization: "U1F7m!2x@Xq$Pz9eN#4vA%6tG^cL*bKq",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar dados.");
        }

        const data = await response.json();
        const processosData = data.dados || [];
        setProcessos(processosData);
        setFilteredProcessos(processosData);

        await Promise.all(
          processosData.map(async (processo: Processo) => {
            const orquestraData = {
              imp: processo.Processo || "",
              referencia: processo.Fatura || "",
              exportador: processo.Cliente || "",
              importador: processo.Importador || "",
              recebimento: processo.DataCadastro || "",
              chegada: processo.DataPrevisaoETA || "",
              destino: processo.Destino || "",
            };
            await createOrquestra(orquestraData);
          })
        );
      } catch (err: any) {
        console.error("Erro ao buscar processos:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProcessos();
  }, []);

  // Função para lidar db orquestra
  useEffect(() => {
    const fetchOrquestras = async () => {
      try {
        setIsLoading(true);
        const orquestras = await getOrquestras();
        setOrquestra(orquestras);
        setFilteredOrquestra(orquestras);
      } catch (err: any) {
        console.error("Erro ao buscar orquestras:", err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrquestras();
  }, []);

  return (
    <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">Processos</h1>
          <p className="mb-4 text-lg text-gray-600 dark:text-gray-300">
            Acompanhe seus processos e filtre com facilidade.
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

      {/* Abas estilo ClickUp */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab("lis")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            activeTab === "lis"
              ? "bg-primary text-white shadow-sm dark:text-black"
              : "text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]"
          }`}
        >
          LIS a fazer
        </button>
        <button
          onClick={() => setActiveTab("orquestra")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
            activeTab === "orquestra"
              ? "bg-primary text-white shadow-sm dark:text-black"
              : "text-muted-foreground hover:bg-muted dark:text-[#aaaaaa] dark:hover:bg-[#2a2a2a]"
          }`}
        >
          Orquestra
        </button>
      </div>

      {/* Conteúdo das abas */}
      {activeTab === "lis" ? (
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
                  <TableHead>Recebimento</TableHead>
                  <TableHead>Prev. Chegada</TableHead>
                  <TableHead>Destino</TableHead>
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
                        {item.Importador?.split(" ").slice(0, 8).join(" ") ||
                          "-"}
                      </span>
                    </TableCell>

                    <TableCell>{item.DataCadastro || "-"}</TableCell>
                    <TableCell>{item.DataPrevisaoETA || "-"}</TableCell>
                    <TableCell>
                      <Badge
                        className={`rounded-lg px-3 py-1 text-sm text-white ${
                          item.Destino?.toLowerCase() === "navegantes"
                            ? "bg-[#2ecc71]"
                            : ["sao francisco", "itapoa - sc"].includes(
                                  item.Destino?.toLowerCase()
                                )
                              ? "bg-[#e91e63]"
                              : item.Destino?.toLowerCase() === "santos"
                                ? "bg-[#333333]"
                                : "bg-[#7f8c8d]"
                        }`}
                      >
                        {item.Destino}
                      </Badge>
                    </TableCell>
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
                className="mb-5 flex flex-col gap-2 rounded-lg bg-gray-50 p-4 shadow-sm dark:bg-zinc-800 dark:text-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 font-semibold">
                    <h3> {item.Processo || "Processo não encontrado"}</h3>
                    <h3>Ref. Cliente: {item.Fatura || "N/A"}</h3>
                  </div>

                  <Badge
                    className={`rounded-lg px-3 py-1 text-sm text-white ${
                      item.Destino?.toLowerCase() === "navegantes"
                        ? "bg-[#2ecc71]"
                        : ["sao francisco", "itapoa - sc"].includes(
                              item.Destino?.toLowerCase()
                            )
                          ? "bg-[#e91e63]"
                          : item.Destino?.toLowerCase() === "santos"
                            ? "bg-[#333333]"
                            : "bg-[#7f8c8d]"
                    }`}
                  >
                    {item.Destino || "Destino indefinido"}
                  </Badge>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Exportador: {item.Cliente || "N/A"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Importador: {item.Importador || "N/A"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Recebimento: {item.DataCadastro || "N/A"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Prev. Chegada: {item.DataPrevisaoETA || "N/A"}
                </p>
              </div>
            ))
          )}
        </div>
      ) : (
        <div>
          {isLoading ? (
            <p>Carregando...</p>
          ) : filteredOrquestra.length === 0 ? (
            <div className="rounded-xl border border-dashed border-muted p-8 text-center text-muted-foreground">
              <p className="text-sm">
                Ainda não há conteúdo para a aba <strong>Orquestra</strong>.
              </p>
            </div>
          ) : (
            <div className="max-h-[550px] overflow-auto rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imp</TableHead>
                    <TableHead>Ref. Cliente</TableHead>
                    <TableHead>Exportador</TableHead>
                    <TableHead>Importador</TableHead>
                    <TableHead>Prev. Chegada</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead onClick={() => handleSort("status")}>
                      Status {sortDirection === "asc" ? "▲" : "▼"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrquestra.map((orquestra: any, index) => (
                    <TableRow key={index}>
                      <TableCell>{orquestra.imp || "-"}</TableCell>
                      <TableCell>{orquestra.referencia || "-"}</TableCell>
                      <TableCell>
                        <span
                          className="block max-w-[150px] truncate"
                          title={orquestra.exportador}
                        >
                          {orquestra.exportador
                            ?.split(" ")
                            .slice(0, 8)
                            .join(" ") || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className="block max-w-[150px] truncate"
                          title={orquestra.importador}
                        >
                          {orquestra.importador
                            ?.split(" ")
                            .slice(0, 8)
                            .join(" ") || "-"}
                        </span>
                      </TableCell>
                      <TableCell>{orquestra.chegada || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={`rounded-lg px-3 py-1 text-sm text-white ${
                            orquestra.destino?.toLowerCase() === "navegantes"
                              ? "bg-[#2ecc71]"
                              : ["sao francisco", "itapoa - sc"].includes(
                                    orquestra.destino?.toLowerCase()
                                  )
                                ? "bg-[#e91e63]"
                                : orquestra.destino?.toLowerCase() === "santos"
                                  ? "bg-[#333333]"
                                  : "bg-[#7f8c8d]"
                          }`}
                        >
                          {orquestra.destino}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={orquestra.status || "Pendente"}
                          onValueChange={(value) =>
                            handleStatusChange(orquestra.imp, value)
                          }
                        >
                          <SelectTrigger className="w-[180px] text-sm">
                            <SelectValue placeholder="Selecionar status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pendente">Pendente</SelectItem>
                            <SelectItem value="Em andamento">
                              Em andamento
                            </SelectItem>
                            <SelectItem value="Finalizado">
                              Finalizado
                            </SelectItem>
                            <SelectItem value="Aguardando informação">
                              Aguardando informação
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
