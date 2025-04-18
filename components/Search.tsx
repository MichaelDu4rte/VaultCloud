import React, { useEffect, useState, useRef } from "react";
import { Input } from "./ui/input";
import { useSearchParams, useRouter } from "next/navigation";
import { Models } from "node-appwrite";
import { getFiles } from "@/lib/actions/file.actions";
import Thumbnail from "./Thumbnail";
import { useDebounce } from "use-debounce";

const Search = ({ closeModal }: { closeModal: () => void }) => {
  const [query, setQuery] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [results, setResults] = useState<Models.Document[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [debounceQuery] = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement | null>(null); // Criação da referência

  useEffect(() => {
    const fetchFiles = async () => {
      const trimmedQuery = debounceQuery.trim();

      if (trimmedQuery === "") {
        setResults([]);
        setOpen(false);
        return;
      }

      try {
        const files = await getFiles({ types: [], searchText: trimmedQuery });

        if (files.documents.length === 0) {
          setResults([]);
          setOpen(false);
        } else {
          setResults(files.documents);
          setOpen(true);
        }
      } catch (error) {
        console.error("Erro ao buscar arquivos:", error);
        setResults([]);
        setOpen(false);
      }
    };

    fetchFiles();
  }, [debounceQuery]);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleClickItem = (file: Models.Document) => {
    setOpen(false);
    setResults([]);
    const typePath =
      file.type === "video" || file.type === "audio"
        ? "media"
        : `${file.type}s`;
    router.push(`/${typePath}?query=${query}`);

    closeModal();
  };

  return (
    <div className="flex flex-col items-center">
      <Input
        ref={inputRef}
        value={query}
        placeholder="Pesquisar..."
        className="w-full rounded-md border p-4 focus:ring-2"
        onChange={(e) => setQuery(e.target.value)}
      />
      {open && (
        <ul className="mt-4 max-h-60 w-full overflow-auto">
          {results.length > 0 ? (
            results.map((file) => (
              <li
                key={file.$id}
                className="flex cursor-pointer items-center justify-between p-2 hover:bg-light-400"
                onClick={() => handleClickItem(file)}
              >
                <div className="flex items-center gap-4">
                  <Thumbnail
                    type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="size-9 min-w-9"
                  />
                  <p className="text-sm text-light-100">{file.name}</p>
                </div>
              </li>
            ))
          ) : (
            <p className="empty-result">Sem resultados.</p>
          )}
        </ul>
      )}
      <button onClick={closeModal} className="mt-4 text-black">
        Fechar
      </button>
    </div>
  );
};

export default Search;
