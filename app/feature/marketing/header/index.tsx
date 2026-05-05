"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Moon,
  Sun,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LogoIcon } from "@/app/shared/components/icons/common";
import { useTheme } from "@/app/shared/hooks/useTheme";
import AuthModal from "@/app/shared/components/modal/auth";
import { Divider } from '@heroui/react';
import { useSession } from "next-auth/react";
import { Button } from "@heroui/button";
import { CustomDropdown } from "@/app/shared/components/dropdown";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const { theme, toggleTheme, mounted } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">(
    "register",
  );

  const { data: session } = useSession();

  const links = [
    { label: "Возможности", href: "#features" },
    { label: "Как это работает", href: "#how" },
    { label: "Отзывы", href: "#testimonials" },
  ];

  const headerVariants = {
    hidden: { y: -70, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.header
      variants={headerVariants}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
        : "md:bg-transparent bg-background "
        }`}
    >
      <div className="container mx-auto flex md:flex lg:grid lg:grid-cols-3 items-center justify-between h-16 px-4 md:px-6">
        <Link href="#" className="text-xl font-bold tracking-tight">
          <LogoIcon />
        </Link>

        <nav className="hidden md:flex items-center gap-8 md:gap-4 justify-between">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 justify-end">
          <Button
            onPress={toggleTheme}
            variant="light"
            className="min-w-0 rounded-xl"
          >
            <span className="inline-flex h-[18px] w-[18px] items-center justify-center">
              {mounted ? (
                theme === "dark" ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )
              ) : (
                <span className="h-[18px] w-[18px]" aria-hidden="true" />
              )}
            </span>
          </Button>
          <Divider orientation="vertical" className="h-4" />
          {session?.user ? (
            <CustomDropdown />
          ) : (
            <>
              <Button
                className="hidden md:inline-flex items-center px-5 py-2 gap-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                onPress={() => {
                  setAuthModalMode("register");
                  setIsAuthModalOpen(true);
                }}
              >
                Регистрация
                <ArrowRight size={15} />
              </Button>
              <Button
                className="hidden md:inline-flex items-center px-5 py-2 rounded-xl bg-background text-primary-background border text-sm font-semibold hover:opacity-90 transition-opacity"
                onPress={() => {
                  setAuthModalMode("login");
                  setIsAuthModalOpen(true);
                }}
              >
                Вход
              </Button>
            </>
          )}

          <button
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="py-3 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  {l.label}
                </a>
              ))}
              {!session?.user ? (
                <>
                  <button
                    onClick={() => {
                      setAuthModalMode("register");
                      setIsAuthModalOpen(true);
                      setMobileOpen(false);
                    }}
                    className="mt-2 text-center py-3 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                  >
                    Регистрация
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalMode("login");
                      setIsAuthModalOpen(true);
                      setMobileOpen(false);
                    }}
                    className="mt-2 text-center py-3 px-4 rounded-xl border bg-background text-foreground text-sm font-semibold"
                  >
                    Вход
                  </button>
                </>
              ) : null}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <AuthModal
        open={isAuthModalOpen}
        onOpenChange={setIsAuthModalOpen}
        initialMode={authModalMode}
      />
    </motion.header>
  );
};

export default Header;
