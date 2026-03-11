import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonalCard from "../PersonalCard";

describe("PersonalCard", () => {
  const mockPersonal = {
    id: "1",
    name: "João Silva",
    specialties: "Musculação e Hipertrofia",
    trainings: [{ name: "CREF" }, { name: "ACE" }],
    requestStatus: "none" as const,
    location: "São Paulo, SP",
    bio: "Personal trainer experiente",
    hourlyRate: 150,
    pricePerSession: 100,
    image: null,
  };

  const mockOnRequestPersonal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render personal information", () => {
    render(
      <PersonalCard
        personal={mockPersonal}
        requestingId={null}
        onRequestPersonal={mockOnRequestPersonal}
      />,
    );

    expect(screen.getByText("João Silva")).toBeInTheDocument();
    expect(screen.getByText(/Musculação e Hipertrofia/)).toBeInTheDocument();
  });

  test("should display specialties", () => {
    render(
      <PersonalCard
        personal={mockPersonal}
        requestingId={null}
        onRequestPersonal={mockOnRequestPersonal}
      />,
    );

    expect(screen.getByText(/Musculação/)).toBeInTheDocument();
    expect(screen.getByText(/Hipertrofia/)).toBeInTheDocument();
  });

  test("should display location and bio", () => {
    render(
      <PersonalCard
        personal={mockPersonal}
        requestingId={null}
        onRequestPersonal={mockOnRequestPersonal}
      />,
    );

    expect(screen.getByText("São Paulo, SP")).toBeInTheDocument();
    expect(screen.getByText("Personal trainer experiente")).toBeInTheDocument();
  });

  test("should call onRequestPersonal when button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <PersonalCard
        personal={mockPersonal}
        requestingId={null}
        onRequestPersonal={mockOnRequestPersonal}
      />,
    );

    const button = screen.getByRole("button", {
      name: /Solicitar acompanhamento/,
    });
    await user.click(button);

    expect(mockOnRequestPersonal).toHaveBeenCalledWith("1");
  });

  test("should show loading state when requesting", () => {
    render(
      <PersonalCard
        personal={mockPersonal}
        requestingId="1"
        onRequestPersonal={mockOnRequestPersonal}
      />,
    );

    expect(screen.getByText(/Enviando/)).toBeInTheDocument();
  });

  test("should show pending status when request is pending", () => {
    const pendingPersonal = {
      ...mockPersonal,
      requestStatus: "pending" as const,
    };

    render(
      <PersonalCard
        personal={pendingPersonal}
        requestingId={null}
        onRequestPersonal={mockOnRequestPersonal}
      />,
    );

    expect(screen.getByText(/Solicitação pendente/)).toBeInTheDocument();
  });
});
