import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  LoginData,
  loginSchema,
  RegisterData,
  registerSchema,
  VerifyRegistrationCodeData,
  verifyRegistrationCodeSchema,
} from "@/app/lib/validation/auth.schema";
import LoginForm from "@/app/shared/components/modal/auth/login";
import RegisterForm from "@/app/shared/components/modal/auth/register";
import VerifyEmailCodeForm from "@/app/shared/components/modal/auth/verify";
import { useLoginMutation } from "@/app/shared/components/modal/auth/mutations/use-login-mutation";
import { useRegisterMutation } from "@/app/shared/components/modal/auth/mutations/use-register-mutation";
import { useVerifyRegistrationMutation } from "@/app/shared/components/modal/auth/mutations/use-verify-registration-mutation";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode: "login" | "register";
}

const AuthModal = ({ open, onOpenChange, initialMode }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(() => initialMode);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [pendingRegistration, setPendingRegistration] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const verifyRegistrationMutation = useVerifyRegistrationMutation();

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const verifyRegistrationForm = useForm<VerifyRegistrationCodeData>({
    resolver: zodResolver(verifyRegistrationCodeSchema),
    defaultValues: { email: "", code: "" },
  });

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setShowLoginPassword(false);
    setShowRegisterPassword(false);
    setShowRegisterConfirmPassword(false);
    setPendingRegistration(null);
    verifyRegistrationForm.reset();
    if (mode === "login") {
      registerForm.reset();
    } else {
      loginForm.reset();
    }
  };

  const router = useRouter();
  const loading =
    loginMutation.isPending || registerMutation.isPending || verifyRegistrationMutation.isPending;

  const handleLogin = async (data: LoginData) => {
    const result = await loginMutation.mutateAsync(data);

    if (result?.error) {
      toast.error("Неверный email или пароль");
      return;
    }

    toast.success("Добро пожаловать");

    onOpenChange(false);
    router.push("/dashboard");
  };

  const handleRegister = async (data: RegisterData) => {
    const res = await registerMutation.mutateAsync(data);
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Ошибка регистрации");
      return;
    }

    const email = data.email.trim().toLowerCase();
    setPendingRegistration({
      email,
      password: data.password,
    });
    verifyRegistrationForm.reset({ email, code: "" });
    toast.success("Код подтверждения отправлен на email");
  };

  const handleVerifyRegistration = async (data: VerifyRegistrationCodeData) => {
    if (!pendingRegistration) {
      toast.error("Сначала заполните форму регистрации");
      return;
    }

    const res = await verifyRegistrationMutation.mutateAsync({
      email: pendingRegistration.email,
      code: data.code,
    });
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Ошибка подтверждения кода");
      return;
    }

    const loginResult = await loginMutation.mutateAsync({
      email: pendingRegistration.email,
      password: pendingRegistration.password,
    });

    if (loginResult?.error) {
      toast.error("Email подтверждён, но не удалось войти");
      return;
    }

    toast.success("Аккаунт создан");
    setPendingRegistration(null);
    verifyRegistrationForm.reset();
    registerForm.reset();
    onOpenChange(false);
    router.push("/dashboard");
  };

  return (
    <Modal
      isOpen={open}
      onOpenChange={onOpenChange}
      placement="center"
      backdrop="blur"
      hideCloseButton
      classNames={{
        base: "max-w-md",
        backdrop: "bg-black/50",
      }}
    >
      <ModalContent className="overflow-hidden rounded-2xl">
        {(onClose) => (
          <>
            <div
              className="h-1 w-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, var(--primary), var(--primary-highlight))",
              }}
            />

            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="absolute right-3 top-3 z-10 min-w-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>

            <ModalHeader className="flex flex-col items-center gap-1 px-6 pb-2 pt-6 text-center">
              <h2 className="text-xl font-semibold">
                {mode === "login" ? "Вход в аккаунт" : "Создать аккаунт"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {mode === "login"
                  ? "Войдите, чтобы продолжить работу в Taska"
                  : "Зарегистрируйтесь, чтобы начать работу"}
              </p>
            </ModalHeader>

            <ModalBody className="px-6 pb-6 pt-2">
              <div className="space-y-4">
                {mode === "login" ? (
                  <LoginForm
                    form={loginForm}
                    loading={loading}
                    showPassword={showLoginPassword}
                    onTogglePassword={() => setShowLoginPassword((current) => !current)}
                    onSubmit={handleLogin}
                  />
                ) : pendingRegistration ? (
                  <VerifyEmailCodeForm
                    form={verifyRegistrationForm}
                    loading={loading}
                    email={pendingRegistration.email}
                    onSubmit={handleVerifyRegistration}
                    onResetEmail={() => {
                      setPendingRegistration(null);
                      verifyRegistrationForm.reset();
                    }}
                  />
                ) : (
                  <RegisterForm
                    form={registerForm}
                    loading={loading}
                    showPassword={showRegisterPassword}
                    showConfirmPassword={showRegisterConfirmPassword}
                    onTogglePassword={() => setShowRegisterPassword((current) => !current)}
                    onToggleConfirmPassword={() =>
                      setShowRegisterConfirmPassword((current) => !current)
                    }
                    onSubmit={handleRegister}
                  />
                )}

                <p className="text-center text-sm text-muted-foreground">
                  {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="h-auto min-w-0 px-1 align-baseline font-medium text-primary cursor-pointer"
                  >
                    {mode === "login" ? "Зарегистрироваться" : "Войти"}
                  </button>
                </p>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default AuthModal;