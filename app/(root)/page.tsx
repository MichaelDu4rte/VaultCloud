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
import { Skeleton } from "@/components/ui/skeleton";

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
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento

  // Função para salvar dados nos cookies
  const setCookie = (name: string, value: string, days: number) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value}; expires=${date.toUTCString()}; path=/`;
  };

  // Função para buscar dados dos cookies
  const getCookie = (name: string): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  };

  useEffect(() => {
  const fetchLicencas = async () => {
    const today = new Date().toISOString().split("T")[0];
    const cachedData = getCookie("licencasDeferidasHoje");
    const cachedDate = getCookie("licencasDeferidasHojeDate");

    
    const formatDate = (dateString: string): string => {
      if (!dateString) return "N/A";
    
      const [year, month, day] = dateString.split("-");
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      
      const formattedDay = String(date.getDate()).padStart(2, "0");
      const formattedMonth = String(date.getMonth() + 1).padStart(2, "0");
      const formattedYear = date.getFullYear();
    
      return `${formattedDay}/${formattedMonth}/${formattedYear}`;
    };


    if (cachedData && cachedDate === today) {
      const licencas = JSON.parse(cachedData);
      setLiData(licencas);
    } else {
      try {
        const licencas = await getLicencasImportacaoDeferidasHoje();
        const formatadas = licencas.map((item: LicencaImportacao) => ({
          ...item,
          previsaoDeferimento: formatDate(item.previsaoDeferimento || ""), 
          status: item.situacao || "Indefinido",
        }));

        setLiData(formatadas);

        setCookie("licencasDeferidasHoje", JSON.stringify(formatadas), 1);
        setCookie("licencasDeferidasHojeDate", today, 1);
      } catch (error) {
        console.error(
          "Erro ao buscar Licenças de Importação deferidas hoje:",
          error
        );
      }
    }
    setIsLoading(false); // Finaliza o carregamento
  };

  fetchLicencas();
}, []);

  useEffect(() => {
    const fetchQuantidades = async () => {
      try {
        const feitas = await getQuantidadeLicencasImportacaoFeitasNoMes();
        const emAnalise = await getQuantidadeLicencasImportacaoEmAnaliseNoMes();
        const deferidas = await getQuantidadeLicencasImportacaoDeferidasNoMes();

        setQuantidadeLicencas(feitas);
        setQuantidadeLicencasEmAnalise(emAnalise);
        setQuantidadeLicencasDeferidas(deferidas);
      } catch (error) {
        console.error("Erro ao buscar quantidades de Licenças:", error);
      }
    };

    fetchQuantidades();
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
            {isLoading ? (
              <Skeleton className="size-full" />
            ) : (
              <Bar data={salesData} options={options} />
            )}
          </div>
        </motion.div>

        <div className="flex flex-col gap-4">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-2xl" />
              ))
            : [
                {
                  label: "PROCESSOS FEITOS NO MÊS",
                  value: quantidadeLicencas,
                  icon: <FaCheckCircle className="text-3xl text-blue" />,
                },
                {
                  label: "LIS A DEFERIR",
                  value: quantidadeLicencasEmAnalise,
                  icon: <FaClock className="text-3xl text-blue" />,
                },
                {
                  label: "LIS DEFERIDAS",
                  value: quantidadeLicencasDeferidas,
                  icon: <FaThumbsUp className="text-3xl text-blue" />,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeIn}
                  initial="hidden"
                  animate="visible"
                  className="flex items-center justify-between rounded-2xl p-4 shadow-md transition hover:shadow-lg dark:border dark:border-white/20 dark:bg-zinc-900/80 dark:text-white"
                >
                  <div>
                    <p className="text-xs text-gray-500 dark:text-light-200">
                      {item.label}
                    </p>
                    <h3 className="text-xl font-bold">{item.value}</h3>
                  </div>
                  <div>{item.icon}</div>
                </motion.div>
              ))}
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
        </div>
        <div className="overflow-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="mb-2 h-10 w-full rounded-lg" />
            ))
          ) : (
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 dark:border-white/20 dark:text-light-200">
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
                    className="border-b border-gray-100 hover:bg-gray-50 dark:border-white/20 dark:hover:bg-zinc-900"
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
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
