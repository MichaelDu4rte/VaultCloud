"use client";
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/solid";
import { motion } from "framer-motion";
import {
  getLicencasImportacaoDeferidasHoje,
  getQuantidadeLicencasImportacaoDeferidasNoMes,
  getQuantidadeLicencasImportacaoEmAnaliseNoMes,
  getQuantidadeLicencasImportacaoFeitasNoMes,
} from "@/lib/actions/li.actions";
import { FaCheckCircle, FaClock, FaThumbsUp } from "react-icons/fa";

ChartJS.register(BarElement, CategoryScale, LinearScale);

const salesData = {
  labels: [
    "16/08",
    "17/08",
    "18/08",
    "19/08",
    "20/08",
    "21/08",
    "22/08",
    "23/08",
  ],
  datasets: [
    {
      label: "2022",
      data: [340, 390, 320, 350, 390, 230, 340, 390],
      backgroundColor: "#C084FC",
      barThickness: 12,
      borderRadius: 4,
    },
    {
      label: "2023",
      data: [280, 260, 300, 220, 260, 310, 290, 270],
      backgroundColor: "#7C3AED",
      barThickness: 12,
      borderRadius: 4,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      ticks: { stepSize: 100 },
      grid: { color: "#f3f4f6" },
    },
    x: {
      grid: { display: false },
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

type LicencaImportacao = {
  imp: string;
  importador: string;
  numeroLi: string;
  situacao: string;
  previsaoDeferimento: string;
};

const Home = () => {
  const [liData, setLiData] = useState<LicencaImportacao[]>([]);
  const [quantidadeLicencas, setQuantidadeLicencas] = useState<number>(0);
  const [quantidadeLicencasEmAnalise, setQuantidadeLicencasEmAnalise] =
    useState<number>(0);
  const [quantidadeLicencasDeferidas, setQuantidadeLicencasDeferidas] =
    useState<number>(0);

  useEffect(() => {
    const fetchLicencas = async () => {
      try {
        const licencas = await getLicencasImportacaoDeferidasHoje();
        const formatadas = licencas.map((item: LicencaImportacao) => ({
          ...item,
          previsaoDeferimento: item.previsaoDeferimento || "N/A",
          status: item.situacao || "Indefinido",
        }));
        setLiData(formatadas);
      } catch (error) {
        console.error(
          "Erro ao buscar Licenças de Importação deferidas hoje:",
          error
        );
      }
    };

    fetchLicencas();
  }, []);

  useEffect(() => {
    const fetchLicencas = async () => {
      try {
        const quantidade = await getQuantidadeLicencasImportacaoFeitasNoMes();
        setQuantidadeLicencas(quantidade);
      } catch (error) {
        console.error(
          "Erro ao buscar quantidade de Licenças de Importação no mês atual:",
          error
        );
      }
    };

    fetchLicencas();
  }, []);

  useEffect(() => {
    const fetchLicencas = async () => {
      try {
        const quantidade =
          await getQuantidadeLicencasImportacaoEmAnaliseNoMes();
        setQuantidadeLicencasEmAnalise(quantidade);
      } catch (error) {
        console.error(
          "Erro ao buscar quantidade de Licenças de Importação em análise no mês atual:",
          error
        );
      }
    };

    fetchLicencas();
  }, []);

  useEffect(() => {
    const fetchLicencas = async () => {
      try {
        const quantidade =
          await getQuantidadeLicencasImportacaoDeferidasNoMes();
        setQuantidadeLicencasDeferidas(quantidade);
      } catch (error) {
        console.error(
          "Erro ao buscar quantidade de Licenças de Importação em análise no mês atual:",
          error
        );
      }
    };

    fetchLicencas();
  }, []);

  const statusBadge = (status: string) => {
    let style = "";
    let icon = null;

    switch (status) {
      case "Deferida":
        style = "bg-green/30 text-green-700";
        icon = <CheckCircleIcon className="size-4 text-green" />;
        break;
      case "Em Análise":
        style = "bg-yellow-100 text-yellow-700";
        icon = <ClockIcon className="size-4 text-yellow-600" />;
        break;
      case "Cancelada":
        style = "bg-red/30 text-red-600";
        icon = <XCircleIcon className="size-4 text-red" />;
        break;
      default:
        style = "bg-gray-100 text-gray-600";
        icon = <DocumentTextIcon className="size-4 text-gray-500" />;
    }

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${style}`}
      >
        {icon}
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen space-y-6 bg-gradient-to-br p-6 text-sm dark:bg-zinc-900">
      {/* Top Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="col-span-2 rounded-2xl p-5 shadow-lg transition-all hover:shadow-xl dark:border dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
              📈 Sales Overview
            </h2>
          </div>
          <div className="h-64 w-full">
            {" "}
            <Bar data={salesData} options={options} />
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between rounded-2xl p-4 shadow-md transition hover:shadow-lg dark:border dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
          >
            <div>
              <p className="text-xs text-gray-500 dark:text-light-200">
                Lis FEITAS NO MÊS
              </p>
              <h3 className="text-xl font-bold">{quantidadeLicencas}</h3>
            </div>
            <div className="text-3xl text-blue">
              <FaCheckCircle />
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between rounded-2xl p-4 shadow-md transition hover:shadow-lg dark:border dark:border-white/20 dark:bg-zinc-900/80"
          >
            <div>
              <p className="text-xs text-gray-500 dark:text-light-200">
                LIS A DEFERIR
              </p>
              <h3 className="text-xl font-bold">
                {quantidadeLicencasEmAnalise}
              </h3>
            </div>
            <div className="text-3xl text-blue">
              <FaClock />
            </div>
          </motion.div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            className="flex items-center justify-between rounded-2xl p-4 shadow-md transition hover:shadow-lg dark:border dark:border-white/20 dark:bg-zinc-900/80"
          >
            <div>
              <p className="text-xs text-gray-500 dark:text-light-200">
                LIS DEFERIDAS
              </p>
              <h3 className="text-xl font-bold">
                {quantidadeLicencasDeferidas}
              </h3>
            </div>
            <div className="text-3xl text-blue">
              <FaThumbsUp />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white p-6 shadow-lg transition hover:shadow-2xl dark:border dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
      >
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
            <DocumentTextIcon className="size-6 text-indigo-500" />
            Licenças de Importação Próximas de Deferimento
          </h2>
          <p className="text-sm text-gray-600 dark:text-light-200">
            Abaixo estão listadas as Licenças de Importação que estão previstas
            para deferimento hoje ou em breve.
          </p>
        </div>
        <div className="overflow-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 dark:text-light-200">
                <th className="pb-3">IMP</th>
                <th>Importador</th>
                <th>Número da LI</th>
                <th>Status</th>
                <th>Data de Deferimento</th>
              </tr>
            </thead>
            <tbody>
              {liData.map((item, i) => (
                <motion.tr
                  key={i}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  className="border-b border-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-900"
                >
                  <td className="py-3 font-medium text-gray-800 dark:text-light-300">
                    {item.imp}
                  </td>
                  <td className="py-3 text-gray-700 dark:text-light-300">
                    {item.importador}
                  </td>
                  <td className="py-3 text-gray-700 dark:text-light-300">
                    {item.numeroLi}
                  </td>
                  <td className="py-3 uppercase">
                    {statusBadge(item.situacao)}
                  </td>
                  <td className="py-3 text-gray-500 dark:text-light-300">
                    {item.previsaoDeferimento}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
