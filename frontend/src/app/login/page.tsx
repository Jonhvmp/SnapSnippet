"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { InputFocusBlur } from "@/components/Input/InputFocus";
import Card from "@/components/Layout/Card";
import BaseForm from "@/components/Form/BaseForm";
import { api } from "../../service/apiService";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import "./login.css";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Carregar o email do localStorage ao montar o componente
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Email inválido");
      setSuccessMessage("");
      return;
    } else {
      setEmailError("");
      setSuccessMessage("");
    }

    if (password.length < 6) {
      setPasswordError("Senha deve ter no mínimo 6 caracteres");
      setSuccessMessage("");
      return;
    } else {
      setPasswordError("");
      setSuccessMessage("");
    }

    try {
      const response = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      console.log("Login bem-sucedido:", response);
      setSuccessMessage("Login realizado com sucesso!");

      // Salvar ou remover o email do localStorage
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Redirecionar para a página principal, por exemplo:
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Erro ao fazer login:", error.message);
      } else {
        console.error("Erro ao fazer login:", error);
      }
      setEmailError("Email ou senha incorretos");
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
              feedbackSuccess={successMessage}
            />

            {/* "Lembrar de mim" e "Esqueceu a senha?" */}
            <div className="flex items-center justify-between mt-4">
              <label className="flex items-center text-neutral-400 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  className="form-checkbox text-blue-500 border-neutral-700 rounded"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="ml-2">Lembrar de mim</span>
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-blue-500 hover:underline"
              >
                Esqueceu a senha?
              </a>
            </div>

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
