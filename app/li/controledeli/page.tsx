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

const formatarDataBrasileira = (data: string) => {
  if (!data) return "";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
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
    numeroOrquestra: "",
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
        setData(formatadas); // Atualiza o estado com os dados mais recentes do DB
      } catch (error) {
        console.error("Erro ao buscar Licenças de Importação:", error);
      }
    };
    fetchLicencas();
  }, []); // A dependência vazia garante que a chamada ocorra apenas no carregamento inicial

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
    updatedData[index] = { ...updatedData[index], [field]: value };
    setData(updatedData);

    const id = updatedData[index].$id;

    const {
      $id,
      $databaseId,
      $collectionId,
      $createdAt,
      $updatedAt,
      ...dataToUpdate
    } = updatedData[index];

    updateLicencaImportacao(id, dataToUpdate)
      .then((updated) => {
        console.log("Licença de Importação atualizada:", updated);
      })
      .catch((err) => {
        console.error("Erro ao atualizar Licença de Importação:", err);
      });
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
        numeroOrquestra: "",
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
            className="mb-5 mt-4 w-full md:w-96"
          />
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
                value={form.numeroOrquestra}
                onChange={(e) =>
                  setForm({ ...form, numeroOrquestra: e.target.value })
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
              <TableHead>IMP</TableHead>
              <TableHead>Importador</TableHead>
              <TableHead>Referência</TableHead>
              <TableHead>Nº Orquestra</TableHead>
              <TableHead>Numero LI</TableHead>
              <TableHead>NCM</TableHead>
              <TableHead>Registro LI</TableHead>
              <TableHead>Data Pagamento</TableHead>
              <TableHead>Previsão Deferimento</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead>Observações</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Input
                    value={item.imp}
                    onChange={(e) => handleChange("imp", e.target.value, index)}
                    className="w-full sm:w-[120px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.importador}
                    onChange={(e) =>
                      handleChange("importador", e.target.value, index)
                    }
                    className="w-full sm:w-[120px]"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.referenciaDoCliente}
                    onChange={(e) =>
                      handleChange("referenciaDoCliente", e.target.value, index)
                    }
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.numeroOrquestra}
                    onChange={(e) =>
                      handleChange("numeroOrquestra", e.target.value, index)
                    }
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.numeroLi}
                    onChange={(e) =>
                      handleChange("numeroLi", e.target.value, index)
                    }
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.ncm}
                    onChange={(e) => handleChange("ncm", e.target.value, index)}
                    className="w-full"
                  />
                </TableCell>
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
                <TableCell>
                  <Input
                    type="text"
                    value={item.previsaoDeferimento}
                    readOnly
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    value={item.situacao}
                    onChange={(e) =>
                      handleChange("situacao", e.target.value, index)
                    }
                    className="w-full"
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    value={item.observacoes}
                    onChange={(e) =>
                      handleChange("observacoes", e.target.value, index)
                    }
                    className="w-full"
                  />
                </TableCell>
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
