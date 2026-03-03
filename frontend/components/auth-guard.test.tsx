import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { usePathname, useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthGuard } from "./auth-guard";
import * as authStore from "@/lib/auth-store";

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

vi.mock("@/lib/auth-store", () => ({
  getAccessToken: vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}

describe("AuthGuard", () => {
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.mocked(useRouter).mockReturnValue({
      replace: mockReplace,
      push: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    } as ReturnType<typeof useRouter>);
    vi.mocked(usePathname).mockReturnValue("/login");
    vi.mocked(authStore.getAccessToken).mockReturnValue(null);
    mockReplace.mockClear();
  });

  it("renders children when mode is auth and no token", async () => {
    render(
      <AuthGuard mode="auth">
        <span>Auth content</span>
      </AuthGuard>,
      { wrapper }
    );
    expect(await screen.findByText("Auth content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects to /app when mode is auth and token exists", async () => {
    vi.mocked(authStore.getAccessToken).mockReturnValue("token");
    render(
      <AuthGuard mode="auth">
        <span>Auth content</span>
      </AuthGuard>,
      { wrapper }
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/app");
    });
  });

  it("renders children when mode is protected and token exists", async () => {
    vi.mocked(authStore.getAccessToken).mockReturnValue("token");
    vi.mocked(usePathname).mockReturnValue("/app");
    render(
      <AuthGuard mode="protected">
        <span>Protected content</span>
      </AuthGuard>,
      { wrapper }
    );
    expect(await screen.findByText("Protected content")).toBeInTheDocument();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects to /login when mode is protected and no token", async () => {
    vi.mocked(usePathname).mockReturnValue("/app");
    render(
      <AuthGuard mode="protected">
        <span>Protected content</span>
      </AuthGuard>,
      { wrapper }
    );
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });
});
