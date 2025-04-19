"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID } from "node-appwrite";

export const createLicencaImportacao = async (data: {
  imp: string;
  importador: string;
  referenciaDoCliente: string;
  numeroOrquestra: string;
  numeroLi: string;
  ncm: string;
  dataRegistroLI: string;
  dataInclusaoOrquestra: string;
  previsaoDeferimento: string;
  situacao: string;
  observacoes: string;
}) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      ID.unique(),
      data
    );

    return result;
  } catch (error) {
    console.error("Erro ao criar Licença de Importação", error);
    throw error;
  }
};

// Atualiza uma Licença de Importação existente no banco de dados
export const updateLicencaImportacao = async (
  id: string,
  data: {
    imp: string;
    importador: string;
    referenciaDoCliente: string;
    numeroOrquestra: string;
    numeroLi: string;
    ncm: string;
    dataRegistroLI: string;
    dataInclusaoOrquestra: string;
    previsaoDeferimento: string;
    situacao: string;
    observacoes: string;
  }
) => {
  try {
    const { databases } = await createAdminClient();

    // Atualiza um documento existente usando o ID da Licença de Importação
    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      id, // ID do documento a ser atualizado
      data // Novos dados a serem salvos
    );

    return result; // Retorna o documento atualizado
  } catch (error) {
    console.error("Erro ao atualizar Licença de Importação", error);
    throw error;
  }
};

// Retorna a lista de todas as Licenças de Importação
export const getLicencasImportacao = async () => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId
    );

    return result.documents;
  } catch (error) {
    console.error("Erro ao listar Licenças de Importação", error);
    throw error;
  }
};

// Exclui uma Licença de Importação com base no ID
export const deleteLicencaImportacao = async (id: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      id
    );

    return result;
  } catch (error) {
    console.error("Erro ao excluir Licença de Importação", error);
    throw error;
  }
};
