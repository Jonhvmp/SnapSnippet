"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { InputFocusBlur } from "@/components/Input/InputFocus";
import Card from "@/components/Layout/Card";
import { api } from "../../service/apiService";
import BaseForm from "@/components/Form/BaseForm";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [successMessage, setFeedbackSucess] = useState("");
  const [erroMessage, setErroMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações no frontend
    if (username.length < 3 || username.length > 50) {
      setUsernameError("O nome de usuário deve ter entre 3 e 50 caracteres.");
      setFeedbackSucess("");
      return;
    } else {
      setUsernameError("");
      setFeedbackSucess("");
    }

    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("O e-mail é obrigatório e deve ser válido.");
      setFeedbackSucess("");
      return;
    } else {
      setEmailError("");
      setFeedbackSucess("");
    }

    if (password.length < 8 || password.length > 128) {
      setPasswordError("A senha deve ter entre 8 e 128 caracteres.");
      setFeedbackSucess("");
      return;
    } else {
      setPasswordError("");
      setFeedbackSucess("");
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("As senhas não coincidem.");
      setFeedbackSucess("");
      return;
    } else {
      setConfirmPasswordError("");
      setFeedbackSucess("");
    }

    try {
      // Enviar requisição ao backend
      const response = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      console.log("Registro bem-sucedido:", response);
      setFeedbackSucess("Conta criada com sucesso!");

      // Redirecionar para a página de login
      window.location.href = "/login";
    } catch (error: unknown) {
      try {
        const errorResponse = JSON.parse((error as Error).message);

        // Exibir mensagens de erro específicas do backend
        if (errorResponse.message.includes("Nome de usuário")) {
          setUsernameError(errorResponse.message);
        } else if (errorResponse.message.includes("e-mail")) {
          setEmailError(errorResponse.message);
        } else if (errorResponse.message.includes("senha")) {
          setPasswordError(errorResponse.message);
        } else {
          setErroMessage(errorResponse.message);
        }
      } catch {
        console.error("Erro desconhecido ao criar conta:", error);
        setErroMessage("Erro desconhecido. Tente novamente mais tarde.");
      }
    }
  };

  return (
    <div
      style={{ padding: "20px 0px" }}
      className="flex min-h-screen items-center justify-center bg-black"
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card>
          <h1 className="title-form text-2xl font-semibold text-center mb-4">
            Cadastrar Conta
          </h1>
          <p className="text-form text-center text-neutral-400 mb-6">
            Crie uma conta para acessar todos os recursos do sistema!
          </p>
          <BaseForm onSubmit={handleSubmit}>
            <p>Nome de usuário</p>
            <InputFocusBlur
              placeholder="Digite seu nome de usuário"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              feedbackError={usernameError}
            />

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
              onChange={(e) => setPassword(e.target.value)}
              feedbackError={passwordError}
            />

            <p>Confirme sua Senha:</p>
            <InputFocusBlur
              placeholder="Confirme sua senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              feedbackError={confirmPasswordError || erroMessage}
              feedbackSuccess={successMessage}
            />

            <PrimaryButton type="submit" label="Cadastrar" />
          </BaseForm>

          <p className="mt-4 text-center text-sm text-neutral-400">
            Você já possui uma conta?{" "}
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
