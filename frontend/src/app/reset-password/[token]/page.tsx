"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { InputFocusBlur } from "@/components/Input/InputFocus";
import Card from "@/components/Layout/Card";
import { api } from "@/service/apiService";
import BaseForm from "@/components/Form/BaseForm";
import PrimaryButton from "@/components/Buttons/PrimaryButton";
import { useRouter } from "next/navigation";

export default function ResetPasswordForm({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  useEffect(() => {
    // Aguarde até que `params` esteja resolvido
    const fetchToken = async () => {
      const resolvedParams = await params;
      setToken(resolvedParams.token);
    };

    fetchToken();
  }, [params]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setPasswordError("A senha deve ter no mínimo 6 caracteres.");
      setSuccessMessage("");
      return;
    } else {
      setPasswordError("");
      setSuccessMessage("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem.");
      return;
    } else {
      setConfirmPasswordError("");
    }

    // Enviar requisição para redefinir senha
    try {
      if (!token) {
        setPasswordError("Token inválido ou não encontrado.");
        return;
      }

      const response = await api(`/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      console.log("Senha redefinida:", response);
      setSuccessMessage("Senha redefinida com sucesso.");

      // Redirecionar usuário
      router.push("/dashboard");
    } catch (error: unknown) {
      try {
        // Verificar se a mensagem de erro está em JSON
        if (error instanceof Error) {
          const errorResponse = JSON.parse(error.message);
          setPasswordError(errorResponse.message || "Erro ao redefinir senha.");
        } else {
          setPasswordError("Erro desconhecido ao redefinir senha.");
        }
      } catch (parseError) {
        console.error("Erro ao processar a mensagem:", parseError);
        setPasswordError("Erro ao redefinir senha.");
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
            Redefinir Senha
          </h1>
          <p className="text-form text-center text-neutral-400 mb-6">
            Insira sua nova senha e confirme para redefinir.
          </p>
          <BaseForm onSubmit={handleSubmit}>
            <p>Nova Senha:</p>
            <InputFocusBlur
              placeholder="Digite sua nova senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              feedbackError={passwordError}
              feedbackSuccess={successMessage}
            />
            <p>Confirmar Senha:</p>
            <InputFocusBlur
              placeholder="Confirme sua nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              feedbackError={confirmPasswordError}
            />
            <PrimaryButton type="submit" label="Redefinir Senha" />
          </BaseForm>
        </Card>
      </motion.div>
    </div>
  );
}
