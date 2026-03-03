import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignupPage from "./page";

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
  useSignupMutation: () => ({
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

describe("SignupPage", () => {
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

  it("renders signup form with title and fields", () => {
    render(<SignupPage />, { wrapper });
    expect(
      screen.getByRole("heading", { name: /yay, new friend!/i })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    render(<SignupPage />, { wrapper });
    await user.type(screen.getByPlaceholderText("Email address"), "a@b.com");
    await user.type(screen.getByPlaceholderText("Password"), "short");
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(
      await screen.findByText(/at least 8 characters/i)
    ).toBeInTheDocument();
  });

  it("has link to login page", () => {
    render(<SignupPage />, { wrapper });
    const link = screen.getByRole("link", { name: /we're already friends!/i });
    expect(link).toHaveAttribute("href", "/login");
  });
});
