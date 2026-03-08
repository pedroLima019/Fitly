import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "next-auth/react";
import StudentDashboard from "../../../app/dashboard/aluno/page";

jest.mock("next-auth/react");
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

global.fetch = jest.fn();

describe("StudentDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  test("should render loading state when session is loading", () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: "loading",
    });

    render(<StudentDashboard />);
    expect(screen.getByText("Carregando...")).toBeInTheDocument();
  });

  test("should fetch and display personals on mount", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "1" } },
      status: "authenticated",
    });

    const mockPersonals = [
      {
        id: "1",
        name: "João Silva",
        specialties: "Musculação",
        trainings: [{ name: "CREF" }],
        requestStatus: "none",
        location: null,
        bio: null,
        hourlyRate: null,
        pricePerSession: null,
        image: null,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ personals: mockPersonals }),
    });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText("João Silva")).toBeInTheDocument();
    });
  });

  test("should filter personals by search query", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "1" } },
      status: "authenticated",
    });

    const mockPersonals = [
      {
        id: "1",
        name: "João Silva",
        specialties: "Musculação",
        trainings: [{ name: "CREF" }],
        requestStatus: "none",
        location: null,
        bio: null,
        hourlyRate: null,
        pricePerSession: null,
        image: null,
      },
      {
        id: "2",
        name: "Maria Santos",
        specialties: "Pilates",
        trainings: [{ name: "Mat" }],
        requestStatus: "none",
        location: null,
        bio: null,
        hourlyRate: null,
        pricePerSession: null,
        image: null,
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ personals: mockPersonals }),
    });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText("João Silva")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "Pesquisar por nome, treino ou especialidade",
    ) as HTMLInputElement;
    await userEvent.type(searchInput, "Maria");

    await waitFor(() => {
      expect(screen.getByText("Maria Santos")).toBeInTheDocument();
      expect(screen.queryByText("João Silva")).not.toBeInTheDocument();
    });
  });

  test("should show error message on fetch failure", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "1" } },
      status: "authenticated",
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      text: async () => JSON.stringify({ error: "Erro ao carregar personals" }),
    });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Erro ao carregar personals"),
      ).toBeInTheDocument();
    });
  });

  test("should show empty state when no personals found", async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: "1" } },
      status: "authenticated",
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ personals: [] }),
    });

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Nenhum personal encontrado para essa pesquisa."),
      ).toBeInTheDocument();
    });
  });
});
