/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import * as XLSX from "xlsx";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { FaCopy, FaTrashAlt } from "react-icons/fa";
import {
  createLicencaImportacao,
  deleteLicencaImportacao,
  getLicencasImportacao,
  updateLicencaImportacao,
} from "@/lib/actions/li.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatarDataBrasileira = (data: string) => {
  if (!data) return "";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const setCookie = (name: string, value: string, days: number) => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const formatarDataInternacional = (data: string) => {
  if (!data) return "";
  const partes = data.split("/");
  if (partes.length !== 3) return data;
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
};

const Page = () => {
  const [data, setData] = useState<any[] | null>(null);

  const [form, setForm] = useState({
    imp: "",
    importador: "",
    referenciaDoCliente: "",
    numeroOrquestra: 0,
    numeroLi: "",
    ncm: "",
    dataRegistroLI: "",
    dataInclusaoOrquestra: "",
    previsaoDeferimento: "",
    situacao: "em análise",
    observacoes: "",
  });

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const calcularPrevisaoDeferimento = (dataInclusao: string): string => {
    const data = new Date(dataInclusao);
    data.setDate(data.getDate() + 11);
    const iso = data.toISOString().split("T")[0];
    return formatarDataBrasileira(iso);
  };

  useEffect(() => {
    const fetchLicencas = async () => {
      try {
        const licencas = await getLicencasImportacao();
        const formatadas = licencas.map((item: any) => ({
          ...item,
          dataRegistroLI: formatarDataBrasileira(item.dataRegistroLI),
          dataInclusaoOrquestra: formatarDataBrasileira(
            item.dataInclusaoOrquestra
          ),
          previsaoDeferimento: formatarDataBrasileira(item.previsaoDeferimento),
        }));
        setData(formatadas);
      } catch (error) {
        console.error("Erro ao buscar Licenças de Importação:", error);
      }
    };
    fetchLicencas();
  }, []);

  const handleDuplicate = (index: number) => {
    const original = data![index];

    const {
      $id,
      $databaseId,
      $collectionId,
      $createdAt,
      $updatedAt,
      ...cleaned
    } = original;

    const novoItem = {
      ...cleaned,
      dataRegistroLI: formatarDataInternacional(cleaned.dataRegistroLI),
      dataInclusaoOrquestra: formatarDataInternacional(
        cleaned.dataInclusaoOrquestra
      ),
      previsaoDeferimento: formatarDataInternacional(
        cleaned.previsaoDeferimento
      ),
    };

    createLicencaImportacao(novoItem)
      .then((res) => {
        const novo = {
          ...res,
          dataRegistroLI: formatarDataBrasileira(res.dataRegistroLI),
          dataInclusaoOrquestra: formatarDataBrasileira(
            res.dataInclusaoOrquestra
          ),
          previsaoDeferimento: formatarDataBrasileira(res.previsaoDeferimento),
        };

        setData((prev) => [...(prev || []), novo]);
      })
      .catch((err) => {
        console.error("Erro ao duplicar LI:", err);
      });
  };

 const handleChange = (field: string, value: string, index: number) => {
  const updatedData = [...(data || [])];
  const targetIMP = updatedData[index].imp; // Identificar a IMP que está sendo alterada

  if (field === "situacao" && targetIMP) {
    // Atualizar todas as ocorrências da mesma IMP
    updatedData.forEach((item, i) => {
      if (item.imp === targetIMP) {
        updatedData[i] = { ...item, [field]: value };
      }
    });
  } else {
    // Atualizar apenas o item específico
    updatedData[index] = { ...updatedData[index], [field]: value };
  }

  setData(updatedData);

  // Atualizar o backend para todas as ocorrências (se necessário)
  const idsToUpdate = updatedData
    .filter((item) => item.imp === targetIMP)
    .map((item) => item.$id);

  Promise.all(
    idsToUpdate.map((id) => {
      const {
        $id,
        $databaseId,
        $collectionId,
        $createdAt,
        $updatedAt,
        ...dataToUpdate
      } = updatedData.find((item) => item.$id === id)!;

      return updateLicencaImportacao(id, dataToUpdate);
    })
  )
    .then(() => console.log("Todas as ocorrências atualizadas com sucesso"))
    .catch((err) => console.error("Erro ao atualizar as ocorrências:", err));
};

  const handleAdd = async () => {
    try {
      const dataInclusao = formatarDataInternacional(
        form.dataInclusaoOrquestra
      );
      const dataRegistro = formatarDataInternacional(form.dataRegistroLI);
      const previsaoDeferimento = calcularPrevisaoDeferimento(dataInclusao);

      const result = await createLicencaImportacao({
        ...form,
        dataRegistroLI: dataRegistro,
        dataInclusaoOrquestra: dataInclusao,
        previsaoDeferimento: formatarDataInternacional(previsaoDeferimento),
      });

      const novaLI = {
        ...result,
        dataRegistroLI: formatarDataBrasileira(result.dataRegistroLI),
        dataInclusaoOrquestra: formatarDataBrasileira(
          result.dataInclusaoOrquestra
        ),
        previsaoDeferimento: formatarDataBrasileira(result.previsaoDeferimento),
      };

      setData([...(data || []), novaLI]);
      setOpen(false);
      setForm({
        imp: "",
        importador: "",
        referenciaDoCliente: "",
        numeroOrquestra: 0,
        numeroLi: "",
        ncm: "",
        dataRegistroLI: "",
        dataInclusaoOrquestra: "",
        previsaoDeferimento: "",
        situacao: "em análise",
        observacoes: "",
      });
    } catch (error) {
      console.error("Erro ao adicionar Licença de Importação", error);
    }
  };

  const handleRemove = async (index: number) => {
    const id = data![index].$id;
    try {
      await deleteLicencaImportacao(id);
      const updatedData = data!.filter((_, i) => i !== index);
      setData(updatedData);
    } catch (error) {
      console.error("Erro ao excluir Licença de Importação", error);
    }
  };

  const filteredData = (data || []).filter((item) => {
    const termo = search.toLowerCase();
    return (
      item.imp?.toLowerCase().includes(termo) ||
      item.importador?.toLowerCase().includes(termo) ||
      item.referenciaDoCliente?.toLowerCase().includes(termo)
    );
  });

  const exportarParaExcel = () => {
    if (!data || data.length === 0) return;

    const dadosParaExportar = data.map((item) => ({
      IMP: item.imp,
      Importador: item.importador,
      "Referência do Cliente": item.referenciaDoCliente,
      "Número do Orquestra": item.numeroOrquestra,
      "Número da LI": item.numeroLi,
      NCM: item.ncm,
      "Data Registro LI": item.dataRegistroLI,
      "Data Inclusão Orquestra": item.dataInclusaoOrquestra,
      "Previsão Deferimento": item.previsaoDeferimento,
      Situação: item.situacao,
      Observações: item.observacoes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dadosParaExportar);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Licenças de Importação");

    XLSX.writeFile(workbook, "licencas-importacao.xlsx");
  };

  const getSituacaoColor = (situacao: string) => {
    const normalized = situacao.toLowerCase();
    if (normalized === "deferida") return "text-green font-semibold";
    if (normalized === "indeferida" || normalized === "cancelada")
      return "text-red font-semibold";
    return "text-gray dark:text-white";
  };

  const [colunasVisiveis, setColunasVisiveis] = useState(() => {
    const savedColumns = getCookie("colunasVisiveis");
    if (savedColumns) {
      return JSON.parse(savedColumns);
    } else {
      return {
        imp: true,
        importador: true,
        referenciaDoCliente: true,
        numeroOrquestra: true,
        numeroLi: true,
        ncm: true,
        dataRegistroLI: true,
        dataInclusaoOrquestra: true,
        previsaoDeferimento: true,
        situacao: true,
        observacoes: true,
      };
    }
  });

  const handleColumnToggle = (coluna: string) => {
    setColunasVisiveis((prev: typeof colunasVisiveis) => {
      const updatedColunas = {
        ...prev,
        [coluna]: !prev[coluna],
      };

      // Salvar no cookie
      setCookie("colunasVisiveis", JSON.stringify(updatedColunas), 365);

      return updatedColunas;
    });
  };

  return (
    <div className="space-y-10 rounded-2xl bg-white p-8 shadow-md dark:border dark:border-white/20 dark:bg-zinc-900/80">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:gap-0">
        <div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Controle de Licenças de Importação
          </h1>
          <p className="text-sm text-muted-foreground">
            Visualize e gerencie as LIs registradas.
          </p>

          <Input
            placeholder="Buscar por IMP, importador ou referência"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-5 mt-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96"
          />

          <div className="mb-5">
            <Select
              value=""
              onValueChange={(selectedOption) => {
                handleColumnToggle(selectedOption);
              }}
            >
              <SelectTrigger className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-primary dark:border-white/30 dark:bg-zinc-900 md:w-96">
                <SelectValue placeholder="Colunas:" />
              </SelectTrigger>
              <SelectContent className="">
                {Object.keys(colunasVisiveis).map((coluna) => (
                  <SelectItem key={coluna} value={coluna}>
                    <div className="flex w-full items-center justify-between capitalize">
                      <input
                        type="checkbox"
                        checked={colunasVisiveis[coluna]}
                        onChange={() => handleColumnToggle(coluna)}
                        className="mr-5 size-5"
                      />
                      <span className="capitalize">
                        {coluna.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={exportarParaExcel}>Exportar para Excel</Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Adicionar LI</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nova Licença de Importação</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                placeholder="Informe a IMP"
                value={form.imp}
                onChange={(e) => setForm({ ...form, imp: e.target.value })}
                className="w-full"
              />
              <Input
                placeholder="Importador"
                value={form.importador}
                onChange={(e) =>
                  setForm({ ...form, importador: e.target.value })
                }
                className="w-full"
              />
              <Input
                placeholder="Referência do Cliente"
                value={form.referenciaDoCliente}
                onChange={(e) =>
                  setForm({ ...form, referenciaDoCliente: e.target.value })
                }
                className="w-full"
              />
              <Input
                placeholder="Número do Orquestra"
                value={form.numeroOrquestra.toString()}
                onChange={(e) =>
                  setForm({
                    ...form,
                    numeroOrquestra: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full"
              />
              <Input
                placeholder="Número da Li"
                value={form.numeroLi}
                onChange={(e) => setForm({ ...form, numeroLi: e.target.value })}
                className="w-full"
              />
              <Input
                placeholder="NCM"
                value={form.ncm}
                onChange={(e) => setForm({ ...form, ncm: e.target.value })}
                className="w-full"
              />
              <Input
                placeholder="Data Registro LI (dd/mm/yyyy)"
                value={form.dataRegistroLI}
                onChange={(e) =>
                  setForm({ ...form, dataRegistroLI: e.target.value })
                }
                className="w-full"
              />
              <Input
                placeholder="Data Pagamento Orquestra (dd/mm/yyyy)"
                value={form.dataInclusaoOrquestra}
                onChange={(e) =>
                  setForm({ ...form, dataInclusaoOrquestra: e.target.value })
                }
                className="w-full"
              />
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Previsão de Deferimento (automático)
                </label>
                <Input
                  type="text"
                  value={form.previsaoDeferimento}
                  readOnly
                  className="w-full"
                />
              </div>
              <Textarea
                placeholder="Observações"
                className="min-h-[80px] w-full"
                value={form.observacoes}
                onChange={(e) =>
                  setForm({ ...form, observacoes: e.target.value })
                }
              />
            </div>

            <DialogFooter className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button onClick={handleAdd} className="w-full sm:w-auto">
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-auto rounded-2xl border">
        <Table>
          <TableHeader>
            <TableRow>
              {colunasVisiveis.imp && <TableHead>IMP</TableHead>}
              {colunasVisiveis.importador && <TableHead>Importador</TableHead>}
              {colunasVisiveis.referenciaDoCliente && (
                <TableHead>Referência</TableHead>
              )}
              {colunasVisiveis.numeroOrquestra && (
                <TableHead>Nº Orquestra</TableHead>
              )}
              {colunasVisiveis.numeroLi && <TableHead>Numero LI</TableHead>}
              {colunasVisiveis.ncm && <TableHead>NCM</TableHead>}
              {colunasVisiveis.dataRegistroLI && (
                <TableHead>Registro LI</TableHead>
              )}
              {colunasVisiveis.dataInclusaoOrquestra && (
                <TableHead>Data Pagamento</TableHead>
              )}
              {colunasVisiveis.previsaoDeferimento && (
                <TableHead>Previsão Deferimento</TableHead>
              )}
              {colunasVisiveis.situacao && <TableHead>Situação</TableHead>}
              {colunasVisiveis.observacoes && (
                <TableHead>Observações</TableHead>
              )}
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={index}>
                {colunasVisiveis.imp && (
                  <TableCell>
                    <Input
                      value={item.imp}
                      onChange={(e) =>
                        handleChange("imp", e.target.value, index)
                      }
                      className="w-full sm:w-[120px]"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.importador && (
                  <TableCell>
                    <Input
                      value={item.importador}
                      onChange={(e) =>
                        handleChange("importador", e.target.value, index)
                      }
                      className="w-full sm:w-[120px]"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.referenciaDoCliente && (
                  <TableCell>
                    <Input
                      value={item.referenciaDoCliente}
                      onChange={(e) =>
                        handleChange(
                          "referenciaDoCliente",
                          e.target.value,
                          index
                        )
                      }
                      className="w-full"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.numeroOrquestra && (
                  <TableCell>
                    <Input
                      value={item.numeroOrquestra}
                      onChange={(e) =>
                        handleChange("numeroOrquestra", e.target.value, index)
                      }
                      className="w-full"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.numeroLi && (
                  <TableCell>
                    <Input
                      value={item.numeroLi}
                      onChange={(e) =>
                        handleChange("numeroLi", e.target.value, index)
                      }
                      className="w-full"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.ncm && (
                  <TableCell>
                    <Input
                      value={item.ncm}
                      onChange={(e) =>
                        handleChange("ncm", e.target.value, index)
                      }
                      className="w-full"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.dataRegistroLI && (
                  <TableCell>
                    <Input
                      type="text"
                      value={item.dataRegistroLI}
                      onChange={(e) =>
                        handleChange("dataRegistroLI", e.target.value, index)
                      }
                      className="w-full"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.dataInclusaoOrquestra && (
                  <TableCell>
                    <Input
                      type="text"
                      value={item.dataInclusaoOrquestra}
                      onChange={(e) =>
                        handleChange(
                          "dataInclusaoOrquestra",
                          e.target.value,
                          index
                        )
                      }
                      className="w-full"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.previsaoDeferimento && (
                  <TableCell>
                    <Input
                      type="text"
                      value={item.previsaoDeferimento}
                      readOnly
                      className="w-full"
                    />
                  </TableCell>
                )}
                {colunasVisiveis.situacao && (
                  <TableCell>
                    <select
                      className={`${getSituacaoColor(item.situacao)} rounded border border-gray-300 bg-transparent px-2 py-1 dark:border-white/20 dark:bg-zinc-900`}
                      value={item.situacao}
                      onChange={(e) =>
                        handleChange("situacao", e.target.value, index)
                      }
                    >
                      <option value="em análise">Em análise</option>
                      <option value="cancelada">Cancelada</option>
                      <option value="deferida">Deferida</option>
                      <option value="indeferida">Indeferida</option>
                    </select>
                  </TableCell>
                )}
                {colunasVisiveis.observacoes && (
                  <TableCell>
                    <Textarea
                      value={item.observacoes}
                      onChange={(e) =>
                        handleChange("observacoes", e.target.value, index)
                      }
                      className="w-full"
                    />
                  </TableCell>
                )}
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDuplicate(index)}
                      className="w-[40px] dark:bg-zinc-800 dark:text-white"
                    >
                      <FaCopy />
                    </Button>
                    <Button
                      onClick={() => handleRemove(index)}
                      className="w-[40px] dark:bg-zinc-800 dark:text-white"
                    >
                      <FaTrashAlt />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
