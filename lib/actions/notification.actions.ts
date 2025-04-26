/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";

// Marca todas as notificações como lidas
export const markAllAsRead = async (ownerId: string) => {
  try {
    const { databases } = await createAdminClient();

    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal("owner", ownerId), Query.equal("lida", false)]
    );

    const updates = notifications.documents.map((notification) =>
      databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notification.$id,
        { lida: true }
      )
    );

    await Promise.all(updates);

    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas", error);
    throw error;
  }
};

// Limpa todas as notificações de um usuário
export const clearAll = async (ownerId: string) => {
  try {
    const { databases } = await createAdminClient();

    const notifications = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal("owner", ownerId)]
    );

    const deletions = notifications.documents.map((notification) =>
      databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notification.$id
      )
    );

    await Promise.all(deletions);

    return { success: true };
  } catch (error) {
    console.error("Erro ao limpar todas as notificações", error);
    throw error;
  }
};

// Marca uma única notificação como lida
export const markAsRead = async (notificationId: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId,
      { lida: true }
    );

    return result;
  } catch (error) {
    console.error("Erro ao marcar notificação como lida", error);
    throw error;
  }
};

// Exclui uma notificação
export const deleteNotification = async (notificationId: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      notificationId
    );

    return result;
  } catch (error) {
    console.error("Erro ao deletar notificação", error);
    throw error;
  }
};

// Lista todas as notificações de um usuário
export const listNotifications = async (ownerId: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [Query.equal("owner", ownerId), Query.limit(100)]
    );

    return result.documents;
  } catch (error) {
    console.error("Erro ao listar notificações", error);
    throw error;
  }
};

// Cria uma nova notificação
export const createNotification = async (data: {
  importador: string;
  imp: string;
  owner: string;
  lida?: boolean;
}) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      { ...data, lida: data.lida ?? false }
    );

    return result;
  } catch (error) {
    console.error("Erro ao criar notificação", error);
    throw error;
  }
};
