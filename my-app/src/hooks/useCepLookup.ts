import { useState } from "react";

interface CepData {
  street: string;
  city: string;
  state: string;
  complement?: string;
}

interface UseCepLookupReturn {
  loading: boolean;
  error: string | null;
  fetchAddress: (cep: string) => Promise<CepData | null>;
  formatCep: (cep: string) => string;
}

const formatCepValue = (cep: string): string => {
  // Remove caracteres não numéricos
  const cleanCep = cep.replace(/\D/g, "");

  // Limita a 8 dígitos
  const limited = cleanCep.slice(0, 8);

  // Formata como XXXXX-XXX
  if (limited.length <= 5) {
    return limited;
  }
  return `${limited.slice(0, 5)}-${limited.slice(5)}`;
};

export const useCepLookup = (): UseCepLookupReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = async (cep: string): Promise<CepData | null> => {
    // Remove caracteres não numéricos
    const cleanCep = cep.replace(/\D/g, "");

    // Valida tamanho do CEP
    if (cleanCep.length !== 8) {
      setError("CEP deve ter 8 dígitos");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data = await response.json();

      // ViaCEP retorna "erro": true se o CEP não foi encontrado
      if (data.erro) {
        setError("CEP não encontrado");
        return null;
      }

      const addressData: CepData = {
        street: data.logradouro || "",
        city: data.localidade || "",
        state: data.uf || "",
        complement: data.bairro || "",
      };

      return addressData;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar CEP";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, fetchAddress, formatCep: formatCepValue };
};
