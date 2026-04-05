import { useState, useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@heroui/react";
import { getProviders } from "next-auth/react";
import { YandexLogo } from "../../icons/common";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  LoginData,
  loginSchema,
  RegisterData,
  registerSchema,
} from "@/app/lib/validation/auth.schema";
import {
  login,
  register,
  socialLogin,
  type SocialAuthProvider,
} from "@/app/shared/services/auth";

const socialProviderMeta: Record<
  SocialAuthProvider,
  { label: string; icon: ReactNode }
> = {
  vk: {
    label: "Продолжить через VK ID",
    icon: (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#0077FF] text-xs font-semibold text-white">
        VK
      </span>
    ),
  },
  yandex: {
    label: "Продолжить через Яндекс ID",
    icon: <YandexLogo size={24} />,
  },
  mailru: {
    label: "Продолжить через Mail.ru",
    icon: (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#005FF9] text-xs font-semibold text-white">
        @
      </span>
    ),
  },
};

const socialProviderOrder: SocialAuthProvider[] = ["vk", "yandex", "mailru"];

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode: "login" | "register";
}

const AuthModal = ({ open, onOpenChange, initialMode }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(() => initialMode);
  const [loading, setLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] =
    useState<SocialAuthProvider | null>(null);
  const [availableSocialProviders, setAvailableSocialProviders] = useState<
    SocialAuthProvider[]
  >([]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const loadProviders = async () => {
      const providers = await getProviders();

      if (!isMounted || !providers) {
        return;
      }

      const enabledSocialProviders = socialProviderOrder.filter(
        (providerId) => providerId in providers,
      );

      setAvailableSocialProviders(enabledSocialProviders);
    };

    void loadProviders();

    return () => {
      isMounted = false;
    };
  }, [open]);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    if (mode === "login") {
      registerForm.reset();
    } else {
      loginForm.reset();
    }
  };

  const router = useRouter();

  const handleSocialAuth = async (provider: SocialAuthProvider) => {
    try {
      setSocialLoadingProvider(provider);
      await socialLogin(provider);
    } catch {
      setSocialLoadingProvider(null);
      toast.error("Не удалось начать вход через соцсеть");
    }
  };

  const handleLogin = async (data: LoginData) => {
    setLoading(true);

    const result = await login(data);

    setLoading(false);

    if (result?.error) {
      toast.error("Неверный email или пароль");
      return;
    }

    toast.success("Добро пожаловать 👋");

    onOpenChange(false);
    router.push("/dashboard");
  };

  const handleRegister = async (data: RegisterData) => {
    setLoading(true);

    const res = await register(data);
    const result = await res.json();

    if (!res.ok) {
      toast.error(result.error || "Ошибка регистрации");
      setLoading(false);
      return;
    }

    const loginResult = await login({
      email: data.email,
      password: data.password,
    });

    setLoading(false);

    if (loginResult?.error) {
      toast.error("Аккаунт создан, но не удалось войти");
      return;
    }

    toast.success("Аккаунт создан 🎉");
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
              aria-label="Закрыть модальное окно"
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
                  <form
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4"
                  >
                    <Input
                      id="login-email"
                      type="email"
                      label="Email"
                      labelPlacement="inside"
                      placeholder="you@example.com"
                      variant="flat"
                      radius="md"
                      {...loginForm.register("email")}
                      isInvalid={!!loginForm.formState.errors.email}
                      errorMessage={loginForm.formState.errors.email?.message}
                    />

                    <Input
                      id="login-password"
                      type="password"
                      label="Пароль"
                      labelPlacement="inside"
                      placeholder="••••••"
                      variant="flat"
                      radius="md"
                      {...loginForm.register("password")}
                      isInvalid={!!loginForm.formState.errors.password}
                      errorMessage={loginForm.formState.errors.password?.message}
                    />

                    <Button
                      type="submit"
                      color="primary"
                      fullWidth
                      isLoading={loading}
                      className="font-medium"
                    >
                      Войти
                    </Button>
                  </form>
                ) : (
                  <form
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-4"
                  >
                    <Input
                      id="reg-name"
                      label="Имя"
                      labelPlacement="inside"
                      placeholder="Ваше имя"
                      variant="flat"
                      radius="md"
                      {...registerForm.register("name")}
                      isInvalid={!!registerForm.formState.errors.name}
                      errorMessage={registerForm.formState.errors.name?.message}
                    />

                    <Input
                      id="reg-email"
                      type="email"
                      label="Email"
                      labelPlacement="inside"
                      placeholder="you@example.com"
                      variant="flat"
                      radius="md"
                      {...registerForm.register("email")}
                      isInvalid={!!registerForm.formState.errors.email}
                      errorMessage={registerForm.formState.errors.email?.message}
                    />

                    <Input
                      id="reg-password"
                      type="password"
                      label="Пароль"
                      labelPlacement="inside"
                      placeholder="••••••"
                      variant="flat"
                      radius="md"
                      {...registerForm.register("password")}
                      isInvalid={!!registerForm.formState.errors.password}
                      errorMessage={registerForm.formState.errors.password?.message}
                    />

                    <Input
                      id="reg-confirm"
                      type="password"
                      label="Повторите пароль"
                      labelPlacement="inside"
                      placeholder="••••••"
                      variant="flat"
                      radius="md"
                      {...registerForm.register("confirmPassword")}
                      isInvalid={!!registerForm.formState.errors.confirmPassword}
                      errorMessage={
                        registerForm.formState.errors.confirmPassword?.message
                      }
                    />

                    <Button
                      type="submit"
                      color="primary"
                      fullWidth
                      isLoading={loading}
                      className="font-medium"
                    >
                      Создать аккаунт
                    </Button>
                  </form>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-divider" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-content1 px-2 text-muted-foreground">
                      или
                    </span>
                  </div>
                </div>

                {availableSocialProviders.length > 0 ? (
                  <div className="space-y-2">
                    {availableSocialProviders.map((provider) => (
                      <Button
                        key={provider}
                        fullWidth
                        variant="light"
                        className="justify-start font-medium"
                        startContent={socialProviderMeta[provider].icon}
                        isLoading={socialLoadingProvider === provider}
                        isDisabled={loading || socialLoadingProvider !== null}
                        onPress={() => handleSocialAuth(provider)}
                      >
                        {socialProviderMeta[provider].label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-divider px-4 py-3 text-sm text-muted-foreground">
                    Сейчас доступен вход по email и паролю. Кнопки VK, Яндекс и
                    Mail.ru появятся автоматически после настройки OAuth-ключей
                    на сервере.
                  </div>
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
