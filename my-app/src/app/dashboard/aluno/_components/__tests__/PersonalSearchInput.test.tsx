import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PersonalSearchInput from "../PersonalSearchInput";

describe("PersonalSearchInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("should render search input", () => {
    render(<PersonalSearchInput value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(
      "Pesquisar por nome, treino ou especialidade",
    );
    expect(input).toBeInTheDocument();
  });

  test("should call onChange when input value changes", async () => {
    const user = userEvent.setup();

    render(<PersonalSearchInput value="" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(
      "Pesquisar por nome, treino ou especialidade",
    ) as HTMLInputElement;
    await user.type(input, "João");

    expect(mockOnChange).toHaveBeenCalled();
    // Verify that keys were typed (J, o, ã, o)
    expect(mockOnChange).toHaveBeenCalledTimes(4);
  });

  test("should display the current value", () => {
    render(<PersonalSearchInput value="Musculação" onChange={mockOnChange} />);

    const input = screen.getByPlaceholderText(
      "Pesquisar por nome, treino ou especialidade",
    ) as HTMLInputElement;
    expect(input.value).toBe("Musculação");
  });

  test("should render label", () => {
    render(<PersonalSearchInput value="" onChange={mockOnChange} />);

    expect(screen.getByText("Pesquisar personal:")).toBeInTheDocument();
  });
});
