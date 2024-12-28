"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { InputFocusBlur } from "@/components/Input/InputFocus";
import Card from "@/components/Layout/Card";
import BaseForm from "@/components/Form/BaseForm";
import PrimaryButton from "@/components/Buttons/PrimaryButton";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("username:", username, "Email:", email, "Password:", password);

    if (username.length < 3 || password.length > 50) {
      setUsernameError("O nome de usuário é obrigatório e deve ter entre 3 e 50 caracteres.");
    }

    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("O e-mail é obrigatório e deve ser válido.");
      return;
    } else {
      setEmailError("");
    }

    if (password.length < 6) {
      setPasswordError("A senha é obrigatória e deve ter entre 8 e 128 caracteres.");
      return;
    } else {
      setPasswordError("");
    }
  };

  return (
    <div
      style={{padding: "20px 0px"}}
      className="flex min-h-screen items-center justify-center bg-black">
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
              type="username"
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
              autoComplete="current-password"
              onChange={(e) => setPassword(e.target.value)}
              feedbackError={passwordError}
            />
            <PrimaryButton type="submit" label="Entrar" />
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
  )
}
