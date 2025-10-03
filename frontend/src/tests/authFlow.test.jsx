/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import authReducer from "../features/auth/authSlice";
import AuthPage from "../pages/AuthPage";

const renderWithProviders = (ui, { preloadedState } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe("AuthPage", () => {
  it("renders the login form heading", () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
  });

  it("renders the signup form heading", () => {
    renderWithProviders(<AuthPage />);
    expect(screen.getByRole("heading", { name: /sign up/i })).toBeInTheDocument();
  });
});
