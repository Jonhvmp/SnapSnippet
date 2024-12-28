"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InputFocusBlur } from "@/components/Input/InputFocus";
import Card from "@/components/Layout/Card";
import BaseForm from "@/components/Form/BaseForm";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import './login.css'

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);

    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Email inválido");
      return;
    } else {
      setEmailError("");
    }

    if (password.length < 6) {
      setPasswordError("Senha deve ter no mínimo 6 caracteres");
      return;
    } else {
      setPasswordError("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card>
          <h1 className="title-form text-2xl font-semibold text-center mb-4">
            Entrar
          </h1>
          <p className="text-form text-center text-neutral-400 mb-6">
            Entre com suas credenciais para acessar sua conta.
          </p>
          <BaseForm onSubmit={handleSubmit}>

            <p>Email:</p>
            <InputFocusBlur
              placeholder="Digite seu email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              feedbackError={emailError}
            />

            <p>Senha:</p>
            <InputFocusBlur
              placeholder="Senha"
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              feedbackError={passwordError}
            />
            <PrimaryButton type="submit" label="Entrar" />
          </BaseForm>

          <p className="mt-4 text-center text-sm text-neutral-400">
            Você ainda não possui uma conta?{" "}
            <a
              href="/register"
              className="font-semibold text-blue-500 hover:underline"
            >
              Cadastre-se
            </a>{" "}
            grátis.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
