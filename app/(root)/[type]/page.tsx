import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { Models } from "node-appwrite";
import React from "react";

const page = async ({ params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";

  const files = await getFiles();

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h5">0MB</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort By: </p>
            <Sort />
          </div>
        </div>
      </section>
      {files.total > 0 ? (
        // Se houver arquivos retornados (total > 0), renderiza a lista de arquivos
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        // Caso contrário, exibe uma mensagem indicando que nenhum arquivo foi encontrado
        <p className="empty-list">Nenhum arquivo encontrado</p>
      )}
    </div>
  );
};

export default page;
