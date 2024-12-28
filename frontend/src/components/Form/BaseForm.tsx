"use client";

import React from "react";
import './BaseForm.css'

// src/components/Form/BaseForm.tsx
interface BaseFormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
}

export default function BaseForm({ children, onSubmit }: BaseFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="card-form flex flex-col space-y-4 w-full max-w-md mx-auto p-4 rounded-lg text-gray-800"
    >
      {children}
    </form>
  );
}
