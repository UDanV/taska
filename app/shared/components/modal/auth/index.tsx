import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { Input } from "../../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { YandexLogo } from "../../icons/common";
import {
  LoginData,
  loginSchema,
  RegisterData,
  registerSchema,
} from "@/app/lib/validation/auth.schema";
import { login, register } from "@/app/shared/services/auth";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthModal = ({ open, onOpenChange }: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => {
      clearTimeout(timer);
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleLogin = async (data: LoginData) => {
    setLoading(true);
    const result = await login(data);
    setLoading(false);

    if (!result?.error) onOpenChange(false);
  };

  const handleRegister = async (data: RegisterData) => {
    setLoading(true);
    const res = await register(data);
    setLoading(false);

    if (res.ok) setMode("login");
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            className="relative w-full max-w-md bg-background rounded-lg shadow-xl overflow-hidden"
          >
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-[#ff7af0]"
            />

            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-6">
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center text-xl font-semibold mb-6"
              >
                {mode === "login" ? "Вход в аккаунт" : "Создать аккаунт"}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-3"
              >
                <button
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors disabled:opacity-50 group"
                >
                  <YandexLogo />
                  <span>Войти через ЯID</span>
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="bg-background px-2 text-muted-foreground"
                    >
                      или
                    </motion.span>
                  </div>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {mode === "login" && (
                  <motion.form
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={loginForm.handleSubmit(handleLogin)}
                    className="space-y-4 mt-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="login-email"
                        className="text-sm font-medium"
                      >
                        Email
                      </label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        {...loginForm.register("email")}
                      />
                      <AnimatePresence>
                        {loginForm.formState.errors.email && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-destructive overflow-hidden"
                          >
                            {loginForm.formState.errors.email.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="login-password"
                        className="text-sm font-medium"
                      >
                        Пароль
                      </label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••"
                        {...loginForm.register("password")}
                      />
                      <AnimatePresence>
                        {loginForm.formState.errors.password && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-destructive overflow-hidden"
                          >
                            {loginForm.formState.errors.password.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 relative overflow-hidden group"
                    >
                      <motion.span
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Войти
                    </motion.button>
                  </motion.form>
                )}

                {mode === "register" && (
                  <motion.form
                    key="register"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={registerForm.handleSubmit(handleRegister)}
                    className="space-y-4 mt-4"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <label htmlFor="reg-name" className="text-sm font-medium">
                        Имя
                      </label>
                      <Input
                        id="reg-name"
                        placeholder="Ваше имя"
                        {...registerForm.register("name")}
                      />
                      <AnimatePresence>
                        {registerForm.formState.errors.name && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-destructive overflow-hidden"
                          >
                            {registerForm.formState.errors.name.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="reg-email"
                        className="text-sm font-medium"
                      >
                        Email
                      </label>
                      <Input
                        id="reg-email"
                        type="email"
                        placeholder="you@example.com"
                        {...registerForm.register("email")}
                      />
                      <AnimatePresence>
                        {registerForm.formState.errors.email && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-destructive overflow-hidden"
                          >
                            {registerForm.formState.errors.email.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="reg-password"
                        className="text-sm font-medium"
                      >
                        Пароль
                      </label>
                      <Input
                        id="reg-password"
                        type="password"
                        placeholder="••••••"
                        {...registerForm.register("password")}
                      />
                      <AnimatePresence>
                        {registerForm.formState.errors.password && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-destructive overflow-hidden"
                          >
                            {registerForm.formState.errors.password.message}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                      className="space-y-2"
                    >
                      <label
                        htmlFor="reg-confirm"
                        className="text-sm font-medium"
                      >
                        Повторите пароль
                      </label>
                      <Input
                        id="reg-confirm"
                        type="password"
                        placeholder="••••••"
                        {...registerForm.register("confirmPassword")}
                      />
                      <AnimatePresence>
                        {registerForm.formState.errors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="text-sm text-destructive overflow-hidden"
                          >
                            {
                              registerForm.formState.errors.confirmPassword
                                .message
                            }
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 relative overflow-hidden group"
                    >
                      <motion.span
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      />
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Создать аккаунт
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center text-sm text-muted-foreground mt-4"
              >
                {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={switchMode}
                  className="text-primary hover:underline font-medium"
                >
                  {mode === "login" ? "Зарегистрироваться" : "Войти"}
                </motion.button>
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default AuthModal;
