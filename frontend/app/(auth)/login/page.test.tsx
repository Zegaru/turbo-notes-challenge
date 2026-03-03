import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "./page";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={props.src} alt={props.alt} />
  ),
}));

vi.mock("@/lib/auth-queries", () => ({
  useLoginMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
  });

  it("renders login form with title and fields", () => {
    render(<LoginPage />, { wrapper });
    expect(
      screen.getByRole("heading", { name: /yay, you're back!/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("shows validation error for empty password", async () => {
    const user = userEvent.setup();
    render(<LoginPage />, { wrapper });
    await user.type(screen.getByPlaceholderText("Email address"), "a@b.com");
    await user.click(screen.getByRole("button", { name: /login/i }));
    expect(await screen.findByText(/required|at least/i)).toBeInTheDocument();
  });

  it("has link to signup page", () => {
    render(<LoginPage />, { wrapper });
    const link = screen.getByRole("link", {
      name: /oops! i've never been here before/i,
    });
    expect(link).toHaveAttribute("href", "/signup");
  });

  it("has link to forgot password", () => {
    render(<LoginPage />, { wrapper });
    const link = screen.getByRole("link", { name: /forgot/i });
    expect(link).toHaveAttribute("href", "/forgot-password");
  });
});
