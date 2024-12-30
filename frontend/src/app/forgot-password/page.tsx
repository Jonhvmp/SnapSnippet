"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InputFocusBlur } from "@/components/Input/InputFocus";
import Card from "@/components/Layout/Card";
import { api } from "../../service/apiService";
import BaseForm from "@/components/Form/BaseForm";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import "./forgot-password.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!email.includes("@") || !email.includes(".")) {
    setEmailError("O e-mail é obrigatório e deve ser válido.");
    setSuccessMessage("");
    return;
  } else {
    setEmailError("");
    setSuccessMessage("");
  }

  try {
    const response = await api("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    console.log("Instruções enviadas:", response);
    setSuccessMessage("Se o email existir, as instruções foram enviadas.");
  } catch (error: unknown) {
  if (error instanceof Error) {
    try {
      // Extrair mensagem de erro do JSON
      const errorResponse = JSON.parse(error.message);
      setEmailError(errorResponse.message || "Ocorreu um erro.");
    } catch (parseError) {
      // Caso a mensagem não seja um JSON
      console.error("Erro ao processar a mensagem:", parseError);
      setEmailError("Erro ao enviar as instruções.");
    }
    console.error("Erro ao enviar instruções:", error.message);
  } else {
    console.error("Erro desconhecido:", error);
    setEmailError("Erro desconhecido. Tente novamente.");
    }
    }
  }

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
            Recuperar Senha
          </h1>
          <p className="text-form text-center text-neutral-400 mb-6">
            Insira o e-mail associado à sua conta para redefinir sua senha.
          </p>
          <BaseForm onSubmit={handleSubmit}>
            <p>Email:</p>
            <InputFocusBlur
              placeholder="Digite seu email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              feedbackError={emailError}
              feedbackSuccess={successMessage}
            />
            <PrimaryButton type="submit" label="Enviar Instruções" />
          </BaseForm>

          <p className="mt-4 text-center text-sm text-neutral-400">
            Lembrou sua senha?{" "}
            <a
              href="/login"
              className="font-semibold text-blue-500 hover:underline"
            >
              Entrar
            </a>{" "}
            agora.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
