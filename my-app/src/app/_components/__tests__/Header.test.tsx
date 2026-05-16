import React from "react";
import { render, screen } from "@testing-library/react";
import { useSession, signOut } from "next-auth/react";
import Header from "../Header";

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/image
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock("next/link", () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock notification bells
jest.mock("../RequestNotificationBell", () => {
  return function MockRequestNotificationBell() {
    return <div data-testid="request-notification-bell">Request Bell</div>;
  };
});

jest.mock("../StudentNotificationBell", () => {
  return function MockStudentNotificationBell() {
    return <div data-testid="student-notification-bell">Student Bell</div>;
  };
});

describe("Header Component", () => {
  const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render user name when session exists", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "João Silva",
          email: "joao@example.com",
          userType: "student",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    } as any);

    render(<Header />);

    expect(screen.getByText("João Silva")).toBeInTheDocument();
  });

  it("should show initial letter when no profile image", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Maria",
          email: "maria@example.com",
          userType: "student",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    } as any);

    render(<Header />);

    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("should display profile image when available", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "João",
          email: "joao@example.com",
          image: "https://example.com/avatar.jpg",
          userType: "student",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    } as any);

    render(<Header />);

    const img = screen.getByAltText("João");
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("should show RequestNotificationBell for personal users", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Personal Trainer",
          email: "trainer@example.com",
          userType: "personal",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    } as any);

    render(<Header />);

    expect(screen.getByTestId("request-notification-bell")).toBeInTheDocument();
    expect(
      screen.queryByTestId("student-notification-bell"),
    ).not.toBeInTheDocument();
  });

  it("should show StudentNotificationBell for student users", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Student",
          email: "student@example.com",
          userType: "student",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    } as any);

    render(<Header />);

    expect(screen.getByTestId("student-notification-bell")).toBeInTheDocument();
    expect(
      screen.queryByTestId("request-notification-bell"),
    ).not.toBeInTheDocument();
  });

  it("should have correct profile edit link for personal", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Trainer",
          email: "trainer@example.com",
          userType: "personal",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    } as any);

    render(<Header />);

    const profileLink = screen.getByText("Editar Perfil");
    expect(profileLink).toHaveAttribute(
      "href",
      "/dashboard/personal/complete-perfil",
    );
  });

  it("should have correct profile edit link for student", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Student",
          email: "student@example.com",
          userType: "student",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    } as any);

    render(<Header />);

    const profileLink = screen.getByText("Editar Perfil");
    expect(profileLink).toHaveAttribute(
      "href",
      "/dashboard/aluno/complete-perfil",
    );
  });

  it("should render settings button", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "User",
          email: "user@example.com",
          userType: "student",
        },
      },
      status: "authenticated",
      update: jest.fn(),
    } as any);

    render(<Header />);

    const settingsButton = screen.getByRole("button", { hidden: true });
    expect(settingsButton).toBeInTheDocument();
  });
});
