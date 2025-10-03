/**
 * @vitest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import customerReducer from "../features/customer/customerSlice";
import ParcelForm from "../components/customer/ParcelForm";

// helper to wrap component with store + router
const renderWithProviders = (ui, { preloadedState } = {}) => {
  const store = configureStore({
    reducer: { customer: customerReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  );
};

describe("ParcelForm", () => {
  it("renders the form heading", () => {
    renderWithProviders(<ParcelForm />);
    expect(screen.getByRole("heading", { name: /new parcel/i })).toBeInTheDocument();
  });

  it("navigates between steps", () => {
    renderWithProviders(<ParcelForm />);
    expect(screen.getByPlaceholderText(/sender street/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByPlaceholderText(/receiver street/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByPlaceholderText(/sender street/i)).toBeInTheDocument();
  });
});
